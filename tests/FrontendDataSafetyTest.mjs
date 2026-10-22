import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { transformWithOxc } from 'vite';

let moduleSequence = 0;

async function moduleUrl(path, imports = {}) {
    const source = await readFile(new URL(`../resources/js/${path}`, import.meta.url), 'utf8');
    let { code } = await transformWithOxc(source, path);
    for (const [alias, target] of Object.entries(imports)) {
        code = code.replaceAll(JSON.stringify(alias), JSON.stringify(target));
    }
    return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${moduleSequence++}`;
}

function memoryStorage() {
    const items = new Map();
    return {
        getItem: (key) => items.get(key) ?? null,
        setItem: (key, value) => items.set(key, String(value)),
        removeItem: (key) => items.delete(key),
    };
}

function browserStorage() {
    const tables = new Map();
    const database = {
        transaction(name) {
            if (!tables.has(name)) {
                tables.set(name, new Map());
            }
            const table = tables.get(name);
            const transaction = {
                objectStore: () => ({
                    put(value) {
                        table.set(value.id, structuredClone(value));
                    },
                    getAll() {
                        const request = { result: [...table.values()] };
                        queueMicrotask(() => request.onsuccess?.());
                        return request;
                    },
                    get(id) {
                        const request = { result: table.get(id) };
                        queueMicrotask(() => request.onsuccess?.());
                        return request;
                    },
                }),
            };
            setImmediate(() => transaction.oncomplete?.());
            return transaction;
        },
    };
    globalThis.localStorage = memoryStorage();
    globalThis.sessionStorage = memoryStorage();
    globalThis.window = {
        indexedDB: {
            open() {
                const request = { result: database };
                queueMicrotask(() => request.onsuccess());
                return request;
            },
        },
        dispatchEvent() {},
    };
    return tables;
}

const lead = {
    id: 'lead-original',
    name: 'Peserta',
    contactType: 'wa',
    contact: '081234567890',
    level: 'Pemula',
    source: 'event',
    eventId: 'event-a',
    timestamp: '2026-10-22T01:00:00Z',
};

test('a rejected server submission never creates a local successful lead', async () => {
    const tables = browserStorage();
    window.axios = { post: async () => { throw new Error('server unavailable'); } };
    const database = await import(await moduleUrl('lib/db.ts'));

    await assert.rejects(database.insertLeadDB(lead), /server unavailable/);
    assert.equal(tables.has('leads'), false);
});

test('a saved submission caches the canonical server id', async () => {
    const tables = browserStorage();
    window.axios = { post: async () => ({ data: { lead: { id: 'lead-server' } } }) };
    const database = await import(await moduleUrl('lib/db.ts'));

    await database.insertLeadDB(lead);
    assert.equal(tables.get('leads').has('lead-server'), true);
    assert.equal(tables.get('leads').has('lead-original'), false);
});

test('migrating browser storage and importing a local snapshot never replay leads to the server', async () => {
    const tables = browserStorage();
    let posts = 0;
    window.axios = { post: async () => { posts++; } };
    localStorage.setItem('kfi_leads', JSON.stringify([lead]));
    const database = await import(await moduleUrl('lib/db.ts'));

    await database.syncStorageWithIndexedDB();
    assert.equal(await database.importFullDatabase({ tables: { leads: [lead] } }), true);
    assert.equal(posts, 0);
    assert.equal(tables.get('leads').size, 1);
});

test('deduplication preserves distinct full contacts and participants sharing a demo account', async () => {
    const database = await import(await moduleUrl('lib/db.ts'));
    const leads = [
        { ...lead, id: 'a', contact: '081234567890', demoAccountNumber: '123456' },
        { ...lead, id: 'b', contact: '089234567890', demoAccountNumber: '123456' },
        { ...lead, id: 'c', eventId: 'event-b', demoAccountNumber: '123456' },
    ];
    assert.equal(database.deduplicateDBLeads(leads).length, 3);
    assert.equal(database.deduplicateDBLeads([lead, { ...lead, id: 'other', contact: '+62 812 3456 7890' }]).length, 1);
});

test('an authoritative empty event cache stays empty and legacy event data is preserved', async () => {
    browserStorage();
    const databaseUrl = await moduleUrl('lib/db.ts');
    const events = await import(await moduleUrl('lib/eventStorage.ts', { '@/lib/db': databaseUrl }));
    const legacy = JSON.stringify([{ id: 'legacy-event', title: 'Existing event' }]);
    localStorage.setItem('kfi_events_v3', legacy);
    localStorage.setItem(events.EVENT_STORAGE_KEY, '[]');

    assert.deepEqual(events.getStoredEvents(), []);
    assert.equal(localStorage.getItem('kfi_events_v3'), legacy);
    localStorage.removeItem(events.EVENT_STORAGE_KEY);
    assert.equal(events.getStoredEvents()[0].id, 'legacy-event');
});

test('network failures cannot authenticate from cached browser credentials', async () => {
    browserStorage();
    window.axios = { post: async () => { throw new Error('offline'); } };
    const auth = await import(await moduleUrl('lib/authStorage.ts'));
    localStorage.setItem(auth.AUTH_SECURITY_KEY, JSON.stringify({ username: 'cached-user', passwordHash: 'cached-hash' }));

    assert.equal((await auth.authenticateSuperadmin('cached-user', 'anything', false)).success, false);
    assert.equal(auth.getActiveSession(), null);
});

test('server-confirmed login creates only a session hint and no password hash', async () => {
    browserStorage();
    window.axios = { post: async () => ({ data: { success: true, user: { username: 'server-user' } } }) };
    const auth = await import(await moduleUrl('lib/authStorage.ts'));

    assert.equal((await auth.authenticateSuperadmin('server-user', 'private-password', false)).success, true);
    assert.equal(auth.getActiveSession().username, 'server-user');
    const stored = localStorage.getItem(auth.AUTH_SECURITY_KEY);
    assert.equal(stored.includes('private-password'), false);
    assert.equal(JSON.parse(stored).passwordHash, '');
});

test('password change failures preserve the existing session username', async () => {
    browserStorage();
    const auth = await import(await moduleUrl('lib/authStorage.ts'));
    auth.createAdminSession('existing-user');
    window.axios = { post: async () => { throw new Error('rejected'); } };

    const result = await auth.changeSuperadminPassword('old-password', 'new-password', 'new-user');
    assert.equal(result.success, false);
    assert.equal(auth.getActiveSession().username, 'existing-user');
});

test('an authoritative empty server list never reads stale browser or initial data', async (context) => {
    context.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => [] }));
    const database = await import(await moduleUrl('lib/db.ts'));

    const loaded = await database.loadAuthoritativeLeads('/api/leads', async () => {
        assert.fail('A successful server response must not read fallback data.');
    });
    assert.deepEqual(loaded, []);
});

test('server participant records replace stale data and preserve authenticated evidence URLs', async (context) => {
    context.mock.method(globalThis, 'fetch', async () => ({
        ok: true,
        json: async () => [{
            ...lead,
            id: 'server-record',
            screenshot_real_account: '/api/participants/server-record/evidence/real-account',
        }],
    }));
    const database = await import(await moduleUrl('lib/db.ts'));

    const loaded = await database.loadAuthoritativeLeads('/api/participants', async () => {
        assert.fail('Stale cached participants must not merge into server data.');
    });
    assert.deepEqual(loaded.map((participant) => participant.id), ['server-record']);
    assert.equal(loaded[0].screenshotRealAccount, '/api/participants/server-record/evidence/real-account');
});

test('offline refresh can preserve an already resolved empty list', async (context) => {
    context.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
    const database = await import(await moduleUrl('lib/db.ts'));

    const loaded = await database.loadAuthoritativeLeads('/api/participants', async () => []);
    assert.deepEqual(loaded, []);
});

test('rejected deletion leaves the browser cache intact', async (context) => {
    const tables = browserStorage();
    window.axios = { post: async () => ({ data: { lead: { id: lead.id } } }) };
    const database = await import(await moduleUrl('lib/db.ts'));
    await database.insertLeadDB(lead);
    window.axios = undefined;
    globalThis.document = { querySelector: () => null };
    context.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 500 }));

    await assert.rejects(database.deleteServerLeads(lead.id), /belum menghapus/);
    assert.equal(tables.get('leads').has(lead.id), true);
});
