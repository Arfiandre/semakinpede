#!/usr/bin/env bash
set -e

echo "🚀 Memulai Deployment: Semakin Pede (semakinpede.site)..."

# Masuk ke direktori project
cd /var/www/semakinpede

# 1. Ambil update terbaru dari Git
echo "📦 Mengambil perubahan terbaru dari Git..."
git pull origin main

# 2. Pasang dependensi PHP untuk production
echo "🐘 Memasang dependensi Composer..."
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 3. Compile aset frontend React + Vite
echo "⚡ Melakukan build aset frontend (React + Tailwind)..."
npm ci
npm run build

# 4. Jalankan migrasi & seeder database
echo "🗄️ Menjalankan migrasi & seeder database..."
php artisan migrate --force
php artisan db:seed --force
php artisan admin:setup

# 5. Refresh cache Laravel untuk performa optimal
echo "🚀 Mengoptimasi cache Laravel..."
php artisan optimize:clear
php artisan optimize

# 6. Perbarui permission folder
echo "🔒 Mengatur hak akses folder storage & bootstrap..."
sudo chown -R $USER:www-data /var/www/semakinpede
sudo chmod -R 775 /var/www/semakinpede/storage /var/www/semakinpede/bootstrap/cache
if [ -d "/var/www/semakinpede/database" ]; then
    sudo chmod -R 775 /var/www/semakinpede/database
fi

echo "✅ Deployment selesai dan aplikasi siap diakses di https://semakinpede.site!"
