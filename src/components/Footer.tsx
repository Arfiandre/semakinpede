import {
  TrendingUp,
  Mail,
  MessageCircle,
  Send,
  ExternalLink,
} from "lucide-react";
import LeadForm from "./LeadForm";

const footerLinks = [
  {
    title: "Edukasi",
    links: [
      { label: "Pemula", href: "#edukasi" },
      { label: "Teknikal", href: "#edukasi" },
      { label: "Psikologi", href: "#edukasi" },
      { label: "Video Tutorial", href: "#" },
    ],
  },
  {
    title: "Komunitas Pede",
    links: [
      { label: "Grup WhatsApp", href: "#" },
      { label: "Grup Telegram", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Tentang Kami", href: "#" },
      { label: "Disclaimer", href: "#" },
      { label: "Kebijakan Privasi", href: "#" },
      { label: "Kontak", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950">
      {/* Final CTA Form Section */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Siap Mulai?
                <br />
                <span className="text-gold-400">Gabung Sekarang Gratis</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base mb-6">
                Isi data kamu di bawah dan langsung gabung komunitas trader Semakin Pede.
                Gratis, tanpa syarat.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400 text-sm">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Telegram</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gold-400" />
                  <span className="text-gray-400 text-sm">Email</span>
                </div>
              </div>
            </div>
            <LeadForm dark source="footer" />
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-navy-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-[var(--font-heading)] font-bold text-sm leading-tight">
                  SEMAKIN
                </span>
                <span className="text-gold-400 font-[var(--font-heading)] font-bold text-[10px] leading-tight tracking-widest">
                  PEDE
                </span>
              </div>
            </a>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              Komunitas trader futures Indonesia. Tempat berkumpul, belajar,
              dan tumbuh bareng para trader Gold, Oil, CPO. Edukasi gratis bersama mentor BAPPEBTI.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: "💬", label: "WhatsApp", href: "#" },
                { icon: "✈️", label: "Telegram", href: "#" },
                { icon: "📷", label: "Instagram", href: "#" },
                { icon: "▶️", label: "YouTube", href: "#" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/5 hover:bg-gold-400/10 rounded-xl flex items-center justify-center text-lg transition-colors hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-[var(--font-heading)] font-bold text-sm mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-gold-400 text-sm transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs text-center md:text-left">
              © 2026 Semakin Pede. Lembaga Edukasi.
              Bukan Penyedia Jasa Keuangan.
            </p>
            <div className="flex items-center gap-4 text-gray-600 text-xs">
              <a href="#" className="hover:text-gold-400 transition-colors">
                Syarat & Ketentuan
              </a>
              <span>·</span>
              <a href="#" className="hover:text-gold-400 transition-colors">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
