"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Berapa modal minimal untuk mulai belajar trading futures?",
    answer:
      "Tergantung pada pialang berjangka resmi yang Anda pilih, deposit awal umumnya dimulai dari rentang terjangkau (misalnya Rp 500.000 hingga Rp 1.000.000). Namun di komunitas Semakin Pede, kami menyarankan Anda mempelajari manajemen risiko dan berlatih menggunakan akun demo terlebih dahulu sebelum menempatkan dana riil.",
  },
  {
    question: "Apakah memungkinkan trading komoditas sambil bekerja purna waktu (part-time)?",
    answer:
      "Sangat memungkinkan. Pasar komoditas berjangka global (seperti Emas dan Minyak Mentah) memiliki jam likuiditas tertinggi pada Sesi New York (pukul 19.00 hingga 23.00 WIB). Sesi live review kami pun diadakan pada malam hari sehingga mudah diikuti setelah jam kerja.",
  },
  {
    question: "Bagaimana cara memastikan pialang futures yang saya gunakan aman dan legal?",
    answer:
      "Pastikan pialang tersebut memiliki izin resmi yang masih berlaku dari BAPPEBTI (Badan Pengawas Perdagangan Berjangka Komoditi), merupakan anggota bursa resmi (JFX atau ICDX), dan menyalurkan deposit hanya ke rekening terpisah (Segregated Account) yang diawasi lembaga kliring KBI atau ICH.",
  },
  {
    question: "Apakah komunitas Semakin Pede menyediakan sinyal instan atau jasa titip dana?",
    answer:
      "Sama sekali tidak. Kami adalah wadah edukasi murni yang menolak segala bentuk skema titip dana, investasi bodong, atau janji keuntungan pasti. Kami melatih member agar mampu menganalisis pasar secara mandiri dan disiplin melindungi modal.",
  },
  {
    question: "Apakah bergabung dengan komunitas ini benar-benar tanpa biaya?",
    answer:
      "Benar. Akses ke ruang diskusi WhatsApp, channel Telegram, webinar mingguan, dan alat bantu hitung risiko disediakan tanpa pungutan biaya keanggotaan apa pun.",
  },
  {
    question: "Mengapa fokus utama komunitas ini pada komoditas (Gold, Oil, CPO)?",
    answer:
      "Komoditas berjangka memiliki likuiditas global yang masif, pergerakan tren yang sangat dipengaruhi data makroekonomi riil, serta relevansi langsung dengan pasar ekspor Indonesia (khususnya CPO). Hal ini membuat analisis berbasis data lebih objektif dibandingkan instrumen spekulatif murni.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Pertanyaan Umum & Jawaban Terbuka</span>
          </div>
          <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang sering diajukan
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2">
            Transparansi mengenai kurikulum, legalitas regulasi, dan kegiatan komunitas kami.
          </p>
        </div>

        {/* FAQ Accordion Items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-expanded={openIndex === i}
              >
                <span className="font-semibold text-slate-900 text-sm sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180 text-amber-700" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-60" : "max-h-0"
                }`}
              >
                <p className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
