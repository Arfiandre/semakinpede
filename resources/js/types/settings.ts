export interface SocialMediaLinks {
  whatsapp: string; // Nomor atau link WhatsApp
  telegram: string; // Link Telegram
  instagram: string; // Link Instagram
  youtube: string; // Link YouTube
}

export interface SiteSettings {
  logoUrl: string; // Upload logo komunitas (Data URL atau Image URL)
  projectTitle: string; // Title project (e.g. "Semakin Pede")
  projectTagline: string; // Subtitle / Tagline project (e.g. "Komunitas Trader Futures Indonesia")
  projectDescription: string; // Keterangan project
  socialMedia: SocialMediaLinks; // Button media sosial
  updatedAt?: string;
}
