import { AlertTriangle } from "lucide-react";

export default function TrustBar() {
  return (
    <section className="relative z-10 border-b border-slate-200">
      {/* Peringatan Risiko Edukasi Komunitas */}
      <div className="bg-amber-500 text-navy-950 border-y border-amber-600/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-center gap-2 text-center text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-navy-950 flex-shrink-0" />
            <span>
              Peringatan Risiko: Perdagangan Berjangka Komoditi berisiko tinggi. Seluruh konten Semakin Pede bersifat edukasi komunitas independen dan bukan rekomendasi investasi.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
