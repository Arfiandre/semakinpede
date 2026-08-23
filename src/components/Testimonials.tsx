"use client";

import { MessageCircle, Send, Quote, Star, ExternalLink } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const testimonials = [
  {
    name: "Rizky A.",
    role: "Pemula → Konsisten 6 Bulan",
    text: "Dari gak tau apa itu futures, sekarang sudah bisa analisa sendiri. Live trading bareng mentor beneran ngebantu banget — langsung applicable ilmunya.",
    rating: 5,
  },
  {
    name: "Diana P.",
    role: "Trader Gold & Oil",
    text: "Jurnal otomatisnya game changer. Gak perlu catat manual lagi, tinggal review performa di heatmap. Win rate naik dari 48% ke 68% dalam 3 bulan.",
    rating: 5,
  },
  {
    name: "Ahmad F.",
    role: "Part-time Trader",
    text: "Grup diskusinya aktif banget. Bisa tanya kapan aja. Yang paling berguna adalah review jurnal dari mentor — langsung tahu kesalahan di mana.",
    rating: 5,
  },
  {
    name: "Sari M.",
    role: "Ibu Rumah Tangga",
    text: "Awalnya ragu trading bisa dilakukan sambil urus anak. Ternyata dengan edukasi yang benar dan jurnal yang rapi, bisa konsisten profit part-time.",
    rating: 5,
  },
  {
    name: "Budi K.",
    role: "Trader CPO",
    text: "Terminal beritanya real-time, kalender ekonomi lengkap. Cocok banget buat yang trade komoditas Indonesia. CPO analysis-nya jarang ada di tempat lain.",
    rating: 5,
  },
  {
    name: "Maya L.",
    role: "Pemula Total",
    text: "Baru mulai dari nol, tapi karena ada jalur belajar yang jelas, sekarang sudah bisa baca chart sendiri. Mentor-nya sabar banget ngejelasin.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="komunitas" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <AnimateOnScroll animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-gold-400/10 rounded-full px-4 py-1.5 mb-4">
              <Star className="w-4 h-4 text-gold-500" />
              <span className="text-gold-600 text-xs font-semibold uppercase tracking-wider">
                Testimoni Member
              </span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100}>
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-900 mb-4">
              Bukti, bukan janji.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl">
              Cerita nyata dari member. Bukan kami yang bilang — mereka.
            </p>
          </AnimateOnScroll>
        </div>

        {/* Testimonial Cards - setra-style clean layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-16">
          {testimonials.map((testi, i) => (
            <AnimateOnScroll key={i} animation="fade-up" delay={i * 80}>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testi.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-gold-400 text-gold-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-4 flex-1">
                  <Quote className="w-5 h-5 text-gold-400/20 absolute -top-1 -left-0.5" />
                  <p className="text-gray-600 text-sm leading-relaxed pl-4 italic">
                    &ldquo;{testi.text}&rdquo;
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-sm flex-shrink-0">
                    {testi.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">
                      {testi.name}
                    </div>
                    <div className="text-gray-400 text-xs">{testi.role}</div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Community Section - setra Discord style */}
        <AnimateOnScroll animation="scale-up">
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="font-[var(--font-heading)] text-2xl md:text-3xl font-bold text-white mb-3">
              Komunitas trader di{" "}
              <span className="text-gold-400">WhatsApp & Telegram</span>
            </h3>
            <p className="text-gray-400 text-sm md:text-base mb-8 max-w-lg mx-auto">
              5.000+ trader aktif. Tempat bertemu, diskusi market, belajar
              bareng mentor. Gratis, tanpa syarat.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { value: "5.000+", label: "Trader aktif" },
                { value: "50+", label: "Video edukasi" },
                { value: "3x/minggu", label: "Live trading" },
                { value: "24/7", label: "Grup diskusi" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                >
                  <div className="text-gold-400 font-[var(--font-heading)] font-bold text-xl">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20bergabung%20Semakin%20Pede"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Gabung Grup WA
              </a>
              <a
                href="https://t.me/semakinpede"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <Send className="w-4 h-4" />
                Gabung Grup Telegram
              </a>
            </div>
          </div>
        </AnimateOnScroll>

        <p className="text-center text-gray-400 text-xs mt-6">
          Hasil individual, bukan jaminan profit — trading berisiko, konten
          Semakin Pede murni edukasi.
        </p>
      </div>
    </section>
  );
}
