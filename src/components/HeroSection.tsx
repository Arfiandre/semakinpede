import { ArrowRight, Play, Users, MessageCircle } from "lucide-react";
import LeadForm from "./LeadForm";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center bg-navy-950 overflow-hidden pt-20"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-400/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 rounded-full px-5 py-2">
            <Users className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 text-sm font-semibold">
              Komunitas Gratis · Edukasi Bersama
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              <span className="text-white">Tempat berkumpul</span>
              <br />
              <span className="text-white">trader</span>{" "}
              <span className="text-gold-400">futures komoditas</span>
              <br />
              <span className="text-gold-400">Indonesia.</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
              Komunitas trader Gold, Oil, dan CPO. Belajar bareng mentor
              BAPPEBTI, diskusi market real-time, edukasi gratis — tanpa janji
              profit.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#hero"
                className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-navy-900 font-bold px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
              >
                <MessageCircle className="w-4 h-4" />
                Gabung Komunitas Gratis
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#edukasi"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-semibold px-8 py-4 rounded-full transition-all text-sm md:text-base"
              >
                <Play className="w-4 h-4 text-gold-400" />
                Lihat Alat & Edukasi
              </a>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-5">
            <LeadForm />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 md:mt-24 border-t border-white/10 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: "5.000+", label: "Trader aktif" },
              { value: "12 tahun", label: "Pengalaman mentor" },
              { value: "50+", label: "Video edukasi" },
              { value: "3x/minggu", label: "Live trading bareng" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-gold-400 font-[var(--font-heading)] font-bold text-2xl md:text-3xl">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-gray-600 text-xs text-center mt-8">
          Komunitas edukasi · bukan rekomendasi investasi · trading berisiko
          rugi
        </p>
      </div>
    </section>
  );
}
