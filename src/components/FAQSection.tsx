"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const faqs = [
  {
    question: "Berapa modal minimal untuk mulai trading futures?",
    answer:
      "Tergantung broker, mulai dari Rp 250rb. Tapi di komunitas kami, kami edukasi dulu — fokus belajar risk management sebelum mulai trading dengan modal nyata.",
  },
  {
    question: "Apakah bisa trading sambil kerja / part-time?",
    answer:
      "Bisa! Banyak member kami yang trading part-time. Dengan edukasi yang benar, kamu bisa trade di waktu luang. Live trading kami diadakan malam hari (19.00-21.00 WIB) supaya bisa diikuti setelah jam kerja.",
  },
  {
    question: "Bagaimana cara daftar broker yang aman?",
    answer:
      "Semua broker yang kami rekomendasikan sudah terdaftar dan diawasi BAPPEBTI. Kami bantu proses pendaftaran via WhatsApp — gratis, tanpa paksaan.",
  },
  {
    question: "Apakah ini jasa signal / titip trading?",
    answer:
      "Tidak. Kami adalah komunitas edukasi. Kami mengajarkan cara trading sendiri, bukan memberi signal. Trading berisiko rugi, tidak ada jaminan profit.",
  },
  {
    question: "Berapa biaya join komunitas?",
    answer:
      "Gratis. Akses grup WhatsApp, Telegram, edukasi dasar, dan market insight — semua gratis. Program mentoring premium tersedia untuk yang ingin bimbingan lebih intensif.",
  },
  {
    question: "Apa bedanya komunitas ini dengan yang lain?",
    answer:
      "Kami fokus komoditas (Gold, Oil, CPO) — bukan forex umum. Mentor berpengalaman 12+ tahun BAPPEBTI. Tidak ada janji profit. Fokus edukasi dan disiplin.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <AnimateOnScroll animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-navy-900/5 rounded-full px-4 py-1.5 mb-4">
              <HelpCircle className="w-4 h-4 text-gold-500" />
              <span className="text-navy-700 text-xs font-semibold uppercase tracking-wider">
                Pertanyaan Umum
              </span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100}>
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl font-extrabold text-navy-900 mb-3">
              Ada pertanyaan?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <p className="text-gray-500 text-base md:text-lg">
              Jawaban atas pertanyaan yang paling sering ditanyakan komunitas.
            </p>
          </AnimateOnScroll>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimateOnScroll key={i} animation="fade-up" delay={i * 60}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === i}
                >
                  <span className="font-semibold text-navy-900 text-sm md:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === i ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
