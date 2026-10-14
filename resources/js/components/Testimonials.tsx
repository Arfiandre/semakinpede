"use client";

import { MessageCircle, Send, Users, ShieldCheck, CheckCircle } from "lucide-react";

const communityHighlights = [
  {
    topic: "Review Jurnal Bersama Mentor",
    quote: "Setiap pekan jurnal transaksi kita dibedah bersama mentor berlisensi BAPPEBTI. Jadi tahu persis kesalahan teknis bukan karena tebak-tebakan, melainkan ketidakdisiplinan mematuhi Stop Loss.",
    author: "Rizky A.",
    focus: "Trader Gold & Minyak",
  },
  {
    topic: "Kultur Diskusi Tanpa Hype & Pamer Saldo",
    quote: "Grup ini melarang pamer screenshot profit tanpa alasan teknikal. Yang dibahas adalah rencana trading (trading plan), kalkulasi margin, dan mitigasi risiko sebelum membuka posisi.",
    author: "Diana P.",
    focus: "Trader Part-Time",
  },
  {
    topic: "Edukasi Komoditas Terfokus (CPO & Oil)",
    quote: "Jarang ada komunitas yang konsisten membahas komoditas unggulan Indonesia seperti CPO dan korelasi energi global. Analisis fundamentalnya sangat membuka wawasan.",
    author: "Budi K.",
    focus: "Trader Komoditas",
  },
];

const communityRules = [
  "Bebas dari promosi skema titip dana atau robot trading ilegal",
  "Fokus murni pada analisis mandiri, edukasi teknikal, dan manajemen modal",
  "Sesi Live Trading & QnA rutin 3 kali seminggu via Google Meet / Zoom",
  "Grup interaktif di WhatsApp dan Telegram aktif 24 jam",
];

export default function Testimonials() {
  return (
    <section id="komunitas" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Budaya Komunitas & Pengalaman Member</span>
          </div>
          <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Lingkungan belajar trading yang{" "}
            <span className="text-amber-700">objektif & saling mendukung</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Bergabunglah dengan ratusan trader komoditas yang mengutamakan kelangsungan modal jangka panjang daripada mengejar ilusi kekayaan instan.
          </p>
        </div>

        {/* Member Feedback Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {communityHighlights.map((item) => (
            <div
              key={item.topic}
              className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-2">
                  {item.topic}
                </span>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {item.author}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {item.focus}
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Community Action Card */}
        <div className="bg-navy-950 text-white rounded-2xl p-8 sm:p-12 border border-navy-800">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block">
                Akses Komunitas Gratis
              </span>
              <h3 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-bold text-white">
                Siap berdiskusi dengan trader komoditas lainnya?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dapatkan akses langsung ke grup WhatsApp dan channel Telegram Semakin Pede.
                Ruang tanya jawab terbuka untuk pemula dan trader aktif.
              </p>

              <div className="space-y-2 pt-2">
                {communityRules.map((rule) => (
                  <div key={rule} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3.5 bg-navy-900 p-6 rounded-xl border border-navy-800">
              <span className="text-xs text-slate-400 font-medium text-center">
                Pilih Platform Komunitas Pilihan Anda:
              </span>

              <a
                href="https://wa.me/6281211119999?text=Halo%20Admin%20Semakin%20Pede,%20saya%20ingin%20bergabung%20dengan%20grup%20WhatsApp%20komunitas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Gabung Grup WhatsApp
              </a>

              <a
                href="https://t.me/semakinpede"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                Gabung Saluran Telegram
              </a>

              <p className="text-[11px] text-slate-400 text-center mt-1">
                Moderasi aktif: Komunitas bebas biaya dan bebas spam komersial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
