import { Shield, Users, Star, Clock, AlertTriangle } from "lucide-react";

const stats = [
  {
    icon: Shield,
    label: "BAPPEBTI",
    sublabel: "Regulasi Resmi",
  },
  {
    icon: Users,
    label: "5.000+",
    sublabel: "Member Aktif",
  },
  {
    icon: Star,
    label: "4.9/5",
    sublabel: "Rating Member",
  },
  {
    icon: Clock,
    label: "12 Tahun",
    sublabel: "Pengalaman Mentor",
  },
];

export default function TrustBar() {
  return (
    <section className="relative -mt-1">
      {/* Stats Bar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 md:gap-4 justify-center md:justify-start"
                >
                  <div className="w-11 h-11 rounded-xl bg-navy-900 flex items-center justify-center text-gold-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-[var(--font-heading)] font-bold text-navy-900 text-lg md:text-xl">
                      {stat.label}
                    </div>
                    <div className="text-gray-500 text-xs md:text-sm">
                      {stat.sublabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Warning Banner */}
      <div className="bg-gold-400 border-y border-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-center gap-2 text-center">
            <AlertTriangle className="w-4 h-4 text-navy-900 flex-shrink-0" />
            <p className="text-navy-900 text-xs font-semibold">
              Trading Berjangka Berisiko Tinggi. Ini Bukan Saran Keuangan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
