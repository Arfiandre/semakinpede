# Segmen yang disembunyikan

## Lingkungan belajar trading yang objektif & saling mendukung

- Status: disembunyikan dari halaman utama sejak 22 Oktober 2026.
- Alasan: belum tersedia data asli untuk mendukung testimoni dan klaim pada segmen ini.
- Komponen: `resources/js/components/Testimonials.tsx`.
- Lokasi penayangan sebelumnya: `resources/js/Pages/Home.tsx`, setelah FAQ dan sebelum footer.

Seluruh segmen tidak dirender, termasuk kartu pengalaman member, klaim jumlah anggota, aturan dan jadwal aktivitas komunitas, serta tombol WhatsApp dan Telegram di dalamnya. Komponen tetap disimpan sebagai referensi; isi yang ada belum boleh dianggap sebagai data terverifikasi.

Import dan pemanggilan `<Testimonials />` dilepas dari halaman utama. Anchor `#komunitas` dipindahkan ke bagian formulir pada footer agar tautan navigasi dan tombol bergabung yang sudah ada tetap memiliki tujuan.

### Syarat untuk ditampilkan kembali

1. Sediakan testimoni asli beserta identitas yang boleh dipublikasikan dan persetujuan pemiliknya.
2. Verifikasi jumlah anggota, keterangan mentor, aturan komunitas, jadwal sesi, dan klaim aktivitas grup.
3. Konfirmasi tautan WhatsApp dan Telegram yang resmi dan aktif.
4. Ganti seluruh konten contoh dengan data yang telah diverifikasi; hapus klaim yang belum dapat dibuktikan.
5. Kembalikan import dan pemanggilan `<Testimonials />` pada halaman utama, lalu pindahkan kembali anchor `komunitas` dari footer ke segmen tersebut agar tidak ada ID ganda.
6. Periksa tampilan desktop dan seluler serta tujuan semua tautan sebelum publikasi.

## Pentingnya jurnal trading & evaluasi performa objektif

- Status: disembunyikan dari halaman utama sejak 22 Oktober 2026.
- Alasan: belum tersedia data asli untuk jurnal dan performa trader yang ditampilkan.
- Komponen: `resources/js/components/TradingJournal.tsx`.
- Lokasi penayangan sebelumnya: `resources/js/Pages/Home.tsx`, setelah agenda event dan sebelum rekomendasi broker.

Seluruh segmen tidak dirender, termasuk kalender disiplin harian (heatmap), peringkat trader, persentase gain, win rate, jumlah transaksi, dan tombol untuk memperluas daftar. Data di dalam komponen masih berupa contoh statis dan belum boleh dianggap sebagai performa terverifikasi.

Import dan pemanggilan `<TradingJournal />` dilepas dari halaman utama. Komponen tetap disimpan sebagai referensi. Tidak ada tautan anchor yang perlu dialihkan untuk segmen ini.

### Syarat untuk ditampilkan kembali

1. Sediakan data jurnal transaksi dan performa yang asli dengan periode serta metode perhitungan yang jelas.
2. Verifikasi gain, win rate, jumlah transaksi, dan data kalender sebelum dipublikasikan.
3. Pastikan identitas trader boleh dipublikasikan dan telah mendapat persetujuan pemiliknya.
4. Ganti data contoh dalam komponen dengan data yang sudah diverifikasi.
5. Kembalikan import dan pemanggilan `<TradingJournal />` pada halaman utama.
6. Periksa tampilan desktop dan seluler serta fungsi tombol perluasan daftar sebelum publikasi.
