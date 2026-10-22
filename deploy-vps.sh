#!/usr/bin/env bash
set -Eeuo pipefail
umask 0022

project_directory="${PROJECT_DIRECTORY:-/var/www/semakinpede}"
cd "$project_directory"
project_directory="$(pwd -P)"

for required_command in php git composer npm flock tar mktemp realpath; do
    if ! command -v "$required_command" >/dev/null 2>&1; then
        echo "Perintah wajib belum tersedia: $required_command"
        exit 1
    fi
done

for required_file in .env artisan composer.lock package-lock.json vendor/autoload.php; do
    if [ ! -r "$required_file" ]; then
        echo "File wajib belum tersedia atau tidak dapat dibaca: $required_file"
        exit 1
    fi
done

if [ ! -w storage/framework ] || [ ! -w bootstrap/cache ]; then
    echo "Folder storage/framework dan bootstrap/cache harus dapat ditulis pengguna deployment."
    exit 1
fi

exec 9>storage/framework/deploy.lock
if ! flock -n 9; then
    echo "Deployment lain masih berjalan."
    exit 1
fi

if [ -f storage/framework/down ]; then
    echo "Aplikasi sudah dalam maintenance. Periksa deployment sebelumnya sebelum melanjutkan."
    exit 1
fi

if [ "$(git branch --show-current)" != "main" ] || [ -n "$(git status --porcelain)" ]; then
    echo "Deployment memerlukan branch main yang bersih. Simpan perubahan lokal secara terpisah sebelum melanjutkan."
    exit 1
fi

echo "Memeriksa update Git sebelum maintenance..."
git fetch origin main
if ! git merge-base --is-ancestor HEAD origin/main; then
    echo "Branch lokal tidak dapat diperbarui dengan fast-forward. Periksa Git sebelum melanjutkan."
    exit 1
fi

umask 0077
backup_root="${BACKUP_DIRECTORY:-${HOME:?}/.semakinpede-backups}"
mkdir -p "$backup_root"
backup_root="$(realpath "$backup_root")"
case "$backup_root/" in
    "$project_directory/"*)
        echo "Folder backup harus berada di luar direktori project."
        exit 1
        ;;
esac
if [ ! -w "$backup_root" ]; then
    echo "Folder backup tidak dapat ditulis: $backup_root"
    exit 1
fi
backup_directory="$(mktemp -d "$backup_root/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
chmod 700 "$backup_directory"
umask 0022

trap 'status=$?; echo "Deployment gagal. Aplikasi tetap dalam maintenance; periksa error dan backup sebelum menjalankan php artisan up." >&2; exit "$status"' ERR

php artisan down --retry=60 --no-interaction
previous_commit="$(git rev-parse HEAD)"
echo "Memasang update yang telah diperiksa..."
git merge --ff-only origin/main

composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
npm ci
npm run build

php artisan config:clear --no-interaction

echo "Membuat backup database, konfigurasi, dan berkas upload..."
umask 0077
php artisan database:backup --path="$backup_directory/database.snapshot" --no-interaction
tar -czf "$backup_directory/application-files.tar.gz" .env storage/app
git rev-parse HEAD > "$backup_directory/deployment-commit.txt"
printf '%s\n' "$previous_commit" > "$backup_directory/previous-commit.txt"
umask 0022

echo "Menjalankan migrasi tambahan tanpa seeder atau reset akun..."
php artisan migrate --force --no-interaction

php artisan route:clear --no-interaction
php artisan view:clear --no-interaction
php artisan event:clear --no-interaction
php artisan optimize --no-interaction
php artisan queue:restart --no-interaction
php artisan up --no-interaction

echo "Deployment selesai. Backup tersimpan di $backup_directory"
