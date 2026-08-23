"use client";

import {
  Shield,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const brokers = [
  {
    name: " Broker A",
    tagline: "Spread Rendah & Eksekusi Cepat",
    features: [
      "Spread mulai 0.1 pip",
      "Deposit minimal Rp 500rb",
      "Platform: MT4 & MT5",
      "Support 24/7 Bahasa Indonesia",
    ],
    badge: "Most Popular",
    badgeColor: "bg-gold-400 text-navy-900",
    link: "#",
  },
  {
    name: "Broker B",
    tagline: "Terbaik untuk Pemula",
    features: [
      "Deposit minimal Rp 250rb",
      "Akun Demo Gratis",
      "Edukasi Lengkap",
      "Customer Service Ramah",
    ],
    badge: "Best for Beginners",
    badgeColor: "bg-green-500 text-white",
    link: "#",
  },
  {
    name: "Broker C",
    tagline: "Pro Choice: Komoditas Lengkap",
    features: [
      "Akses 20+ Komoditas",
      "Leverage hingga 1:100",
      "Research & Analytics",
      "Institutional Grade",
    ],
    badge: "Professional",
    badgeColor: "bg-purple-500 text-white",
    link: "#",
  },
];

export default function BrokerRecommendation() {
  return (
    <section id="broker" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <AnimateOnScroll animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-navy-900/5 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-gold-500" />
              <span className="text-navy-700 text-xs font-semibold uppercase tracking-wider">
                Rekomendasi Broker
              </span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100}>
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-900 mb-4">
              Bingung pilih broker?
              <br />
              <span className="text-gold-500">Kami sudah filter.</span>
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl">
              Semua broker yang kami rekomendasikan sudah terdaftar dan diawasi
              oleh BAPPEBTI.
            </p>
          </AnimateOnScroll>
        </div>

        {/* Broker Cards */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mb-8">
          {brokers.map((broker, index) => (
            <AnimateOnScroll
              key={broker.name}
              animation="fade-up"
              delay={index * 100}
            >
              <div className="relative bg-white rounded-2xl border border-gray-200 hover:border-gold-300 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group h-full">
                {/* Badge */}
                <div
                  className={`absolute -top-3 right-6 ${broker.badgeColor} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide`}
                >
                  {broker.badge}
                </div>

                {/* Logo placeholder */}
                <div className="w-14 h-14 bg-navy-900 rounded-xl flex items-center justify-center mb-5 group-hover:bg-navy-800 transition-colors">
                  <span className="text-gold-400 font-[var(--font-heading)] font-bold text-lg">
                    {broker.name.trim().split(" ").map((w) => w[0]).join("")}
                  </span>
                </div>

                <h3 className="font-[var(--font-heading)] text-lg font-bold text-navy-900 mb-1">
                  {broker.name.trim()}
                </h3>
                <p className="text-gold-500 text-sm font-semibold mb-4">
                  {broker.tagline}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {broker.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Regulation */}
                <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 mb-5">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 text-xs font-semibold">
                    Regulasi BAPPEBTI
                  </span>
                </div>

                {/* CTA */}
                <a
                  href={broker.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl transition-all group-hover:bg-gold-400 group-hover:text-navy-900 text-sm"
                >
                  Daftar via Link Kami
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Disclaimer + Consult CTA */}
        <AnimateOnScroll animation="fade-up">
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-xs italic">
              ⓘ Kami dapat komisi tanpa biaya tambahan untuk anda. Komisi dari
              broker membantu kami terus menyediakan edukasi gratis.
            </p>
            <a
              href="#hero"
              className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-navy-900 font-semibold px-6 py-3 rounded-full border border-gray-200 hover:border-gold-300 transition-all text-sm"
            >
              <HelpCircle className="w-4 h-4 text-gold-500" />
              Bingung? Konsultasi Broker Gratis
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
