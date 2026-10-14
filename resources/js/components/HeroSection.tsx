import { Play, MessageCircle, ShieldCheck } from "lucide-react";
import LeadForm from "./LeadForm";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center bg-navy-950 pt-24 pb-16 overflow-hidden border-b border-navy-800"
    >
      {/* Background Architectural Accent (Intentional depth without generic blur orbs or blueprint grids) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-navy-900/60 to-transparent" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Context meta label */}
            <div className="flex items-center gap-2 text-gold-400 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Portal Edukasi Berjangka Komoditi Indonesia</span>
            </div>

            <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Belajar trading komoditas dengan rasional,{" "}
              <span className="text-gold-400">berbasis data nyata.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Komunitas independen trader Gold (XAUUSD), Minyak Mentah (Oil), dan CPO.
              Pelajari manajemen risiko terukur bersama mentor berlisensi BAPPEBTI tanpa iming-iming profit instan.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <a
                href="#komunitas"
                className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-gold-400/20 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-400"
              >
                <MessageCircle className="w-4 h-4" />
                Gabung Diskusi Komunitas
              </a>
              <a
                href="#alat-trading"
                className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white border border-navy-700 font-semibold px-6 py-3.5 rounded-xl transition-all text-sm focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <Play className="w-4 h-4 text-gold-400" />
                Kalkulator & Alat Trading
              </a>
            </div>

            {/* Pillar highlights */}
            <div className="pt-6 border-t border-navy-800/90 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-800">
                <span className="text-gold-400 font-bold block mb-0.5">Komoditas Utama</span>
                <span className="text-slate-300">Gold (XAU), Oil, & CPO</span>
              </div>
              <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-800">
                <span className="text-gold-400 font-bold block mb-0.5">Pilar Edukasi</span>
                <span className="text-slate-300">Risk, Margin & Psikologi</span>
              </div>
              <div className="p-3 bg-navy-900/60 rounded-lg border border-navy-800 col-span-2 sm:col-span-1">
                <span className="text-gold-400 font-bold block mb-0.5">Fasilitas Komunitas</span>
                <span className="text-slate-300">100% Akses Edukasi Gratis</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-5" id="lead-section">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
