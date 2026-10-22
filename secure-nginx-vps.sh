#!/usr/bin/env bash
set -euo pipefail
umask 077

if [ "$EUID" -ne 0 ]; then
    echo "Jalankan dengan sudo bash secure-nginx-vps.sh."
    exit 1
fi

for cmd in nginx php8.3 curl; do command -v "$cmd" >/dev/null; done
vhost="$(readlink -f /etc/nginx/sites-enabled/semakinpede)"
test "$vhost" = /etc/nginx/sites-available/semakinpede
nginx -t
backup="$(mktemp -d /root/semakinpede-nginx-XXXXXX)"
cp -a -- "$vhost" "$backup/original"
echo "Backup: $backup/original"
php8.3 -- "$vhost" "$backup/candidate" <<'PHP'
<?php
$source = file_get_contents($argv[1]);
$old = <<<'NGINX'
    location ~ \.php$ {
NGINX;
$new = <<<'NGINX'
    if ($http_content_type ~* "multipart/") {
        return 415;
    }

    if ($uri ~ "^/(?!index[.]php$).*[.](?i:php[0-9]*|phtml|phar)(/|$)") {
        return 403;
    }

    location = /index.php {
NGINX;
if ($source === false || substr_count($source, $old) !== 1
    || str_contains($source, 'location = /index.php')
    || str_contains($source, '$http_content_type')) {
    fwrite(STDERR, "Konfigurasi berbeda atau sudah diperketat. Tidak diubah.\n");
    exit(1);
}
$updated = str_replace($old, $new, $source);
if (file_put_contents($argv[2], $updated) !== strlen($updated)) {
    fwrite(STDERR, "Gagal menyiapkan konfigurasi baru.\n");
    exit(1);
}
echo "Konfigurasi baru berhasil disiapkan.\n";
PHP
check_http() {
    curl --noproxy '*' --max-time 5 -sS -o /dev/null -w '%{http_code}' \
        -H 'Host: semakinpede.site' "$@"
}
before="$(check_http http://127.0.0.1:8081/)"
case "$before" in
    2??|3??) ;;
    *) echo "Beranda belum sehat: HTTP $before. Konfigurasi tidak diubah."; exit 1 ;;
esac
restore_nginx() {
    status=$?
    trap - ERR
    if cp -a -- "$backup/original" "$vhost" && nginx -t && systemctl reload nginx; then
        echo "Penerapan gagal; konfigurasi awal dipulihkan."
    else
        echo "Pemulihan perlu diperiksa. Backup: $backup/original"
    fi
    exit "$status"
}
trap restore_nginx ERR
cp -- "$backup/candidate" "$vhost"
nginx -t
systemctl reload nginx
for attempt in 1 2 3 4 5; do
    storage="$(check_http http://127.0.0.1:8081/storage/security-check.php)"
    multipart="$(check_http -H 'Content-Type: multipart/form-data; boundary=security-check' http://127.0.0.1:8081/)"
    if [ "$storage" = 403 ] && [ "$multipart" = 415 ]; then break; fi
    sleep 1
done
after="$(check_http http://127.0.0.1:8081/)"
printf 'Beranda: %s\nSkrip dalam storage: %s\nMultipart: %s\n' "$after" "$storage" "$multipart"
test "$storage" = 403
test "$multipart" = 415
case "$after" in 2??|3??) ;; *) false ;; esac
trap - ERR
echo "BERHASIL: pengamanan Nginx aktif."
echo "Backup: $backup/original"
