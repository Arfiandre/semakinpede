import {
  BookOpen,
  BarChart2,
  Brain,
  ArrowRight,
  Newspaper,
  Calculator,
  TrendingUp,
  Calendar,
} from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const tools = [
  {
    icon: BarChart2,
    title: "Chart Komoditas",
    badge: "Gratis",
    badgeColor: "bg-green-500",
    description:
      "Chart lengkap XAUUSD, XBRUSD (Oil), CPO. 180+ indikator, 15+ alat gambar, replay lintas timeframe.",
    features: ["180+ indikator teknikal", "Replay lintas timeframe", "Sampai 4 panel sekaligus"],
    link: "#market",
  },
  {
    icon: Newspaper,
    title: "Terminal Berita",
    badge: "Gratis",
    badgeColor: "bg-green-500",
    description:
      "Kalender ekonomi, berita pasar real-time, dan kekuatan mata uang — streaming dari sumber resmi.",
    features: ["Kalender ekonomi live", "Impact filter otomatis", "Notifikasi high-impact"],
    link: "#market",
  },
  {
    icon: BookOpen,
    title: "Jurnal Trading",
    badge: "Baru",
    badgeColor: "bg-blue-500",
    description:
      "Catat sekali, otomatis selamanya. Tiap trade dipetakan ke kalender heatmap tanpa kamu mengetik apa pun.",
    features: ["Sync manual trade", "Heatmap visual", "Analisis performa"],
    link: "#edukasi",
  },
  {
    icon: Brain,
    title: "Edukasi Gratis",
    badge: "Gratis",
    badgeColor: "bg-green-500",
    description:
      "Jalur belajar dari nol: Margin & Leverage, Support Resistance, Risk Management, Psikologi Trading.",
    features: ["50+ video edukasi", "Live trading 3x/minggu", "Mentor BAPPEBTI"],
    link: "#edukasi",
  },
  {
    icon: Calculator,
    title: "Kalkulator Trading",
    badge: "Gratis",
    badgeColor: "bg-green-500",
    description:
      "Position size calculator, compounding calculator, dan risk-reward calculator. Hitung sebelum entry.",
    features: ["Position sizing", "Compounding projeksi", "Risk-reward ratio"],
    link: "#",
  },
  {
    icon: Calendar,
    title: "Jam Sesi Forex",
    badge: "Gratis",
    badgeColor: "bg-green-500",
    description:
      "Waktu pasar Asia, Eropa, dan Amerika. Ketahui kapan likuiditas dan volatilitas tertinggi.",
    features: ["Sesi Asia/Eropa/US", "Overlap detection", "Waktu lokal WIB"],
    link: "#",
  },
];

export default function LearningPaths() {
  return (
    <section id="edukasi" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <AnimateOnScroll animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-navy-900/5 rounded-full px-4 py-1.5 mb-4">
              <TrendingUp className="w-4 h-4 text-gold-500" />
              <span className="text-navy-700 text-xs font-semibold uppercase tracking-wider">
                Alat & Program
              </span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100}>
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-900 mb-4">
              Alat edukasi untuk komunitas.
              <br />
              <span className="text-gold-500">Enam di antaranya gratis.</span>
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl">
              Semua alat yang dibutuhkan komunitas trader — Chart, Terminal,
              Jurnal, Kalkulator, dan Edukasi — gratis. Cocok untuk pemula
              yang baru mulai belajar trading futures.
            </p>
          </AnimateOnScroll>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <AnimateOnScroll
                key={tool.title}
                animation="fade-up"
                delay={index * 80}
              >
                <a
                  href={tool.link}
                  className="group block bg-white rounded-2xl border border-gray-200 hover:border-gold-300 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 h-full"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center group-hover:bg-navy-800 transition-colors">
                      <Icon className="w-6 h-6 text-gold-400" />
                    </div>
                    <span
                      className={`${tool.badgeColor} text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full`}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-[var(--font-heading)] text-lg font-bold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-4">
                    {tool.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span className="w-1 h-1 bg-gold-400 rounded-full flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <div className="flex items-center gap-1.5 text-gold-500 font-semibold text-sm group-hover:gap-2.5 transition-all">
                    Buka {tool.title}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </a>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
