export interface BrokerItem {
  id: string;
  name: string; // Nama lengkap perusahaan pialang
  shortName: string; // Inisial/singkatan pialang (e.g. TPFX)
  logoUrl?: string; // Upload logo pialang (Data URL atau link gambar)
  licenseNumber: string; // Nomor Izin Usaha BAPPEBTI
  statusBadge: string; // Label status (e.g. "Mitra Utama Resmi", "Pialang Terdaftar")
  tagline: string; // Sub-judul singkat
  description: string; // Keterangan profil pialang
  highlights: string[]; // Poin keunggulan dan fasilitas transaksi
  actionText: string; // Label tombol pendaftaran/konsultasi
  actionUrl: string; // Tautan WhatsApp atau form registrasi
  officialSiteUrl: string; // Tautan verifikasi situs resmi BAPPEBTI
  isFeatured?: boolean; // Pialang unggulan yang ditampilkan utama
  order: number; // Urutan tampilan
  createdAt: string;
  updatedAt: string;
}
