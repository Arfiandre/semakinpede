"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { EventItem } from "@/types/event";
import {
  getStoredEvents,
  EVENT_UPDATE_EVENT,
  DEFAULT_EVENTS,
} from "@/lib/eventStorage";
import { getSiteSettings } from "@/lib/siteSettingsStorage";
import EventRegistrationModal from "@/components/EventRegistrationModal";

const POPUP_DISMISSED_KEY = "kfi_latest_event_popup_dismissed_v2";

export default function LatestEventPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Helper untuk memilih event terkini (prioritas: ongoing, lalu upcoming, lalu pertama)
  const selectLatestEvent = useCallback(() => {
    const list = getStoredEvents();
    if (!list || list.length === 0) return null;
    const ongoing = list.find((e) => e.status === "ongoing");
    if (ongoing) return ongoing;
    const upcoming = list.find((e) => e.status === "upcoming");
    if (upcoming) return upcoming;
    return list[0] || null;
  }, []);

  useEffect(() => {
    // Ambil event terkini
    const current = selectLatestEvent();
    setEvent(current);

    // Pasang timer 5 detik (5000ms) setelah landing page selesai mendarat
    const timer = setTimeout(() => {
      try {
        const isDismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
        if (!isDismissed) {
          const latestEvent = selectLatestEvent();
          if (latestEvent) {
            setEvent(latestEvent);
            setIsOpen(true);
          }
        }
      } catch {
        // Fallback jika sessionStorage dinonaktifkan
        setIsOpen(true);
      }
    }, 5000);

    // Listener jika ada pembaruan event dari superadmin
    const handleUpdate = () => {
      const updated = selectLatestEvent();
      setEvent(updated);
    };

    window.addEventListener(EVENT_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(EVENT_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [selectLatestEvent]);

  // Tutup modal dan simpan status dismiss ke sessionStorage
  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(POPUP_DISMISSED_KEY, "true");
    } catch {
      // Ignore storage error
    }
  };

  // Navigasi keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if ((!isOpen && !isRegistrationOpen) || !event) return null;

  const handleAction = () => {
    handleClose();
    if (event.actionType === "join-live" && event.meetingUrl) {
      window.open(event.meetingUrl, "_blank");
      return;
    }
    setIsRegistrationOpen(true);
  };

  const handleScrollToEvents = () => {
    handleClose();
    const el = document.getElementById("event");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isOngoing = event.status === "ongoing";

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Modal Event Terkini Semakin Pede"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300"
        >
          {/* Backdrop click to skip */}
          <div
            className="fixed inset-0 transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Tombol EXIT di Bagian Atas Kanan Modal (Sesuai Permintaan User) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-950 text-white hover:text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg border border-slate-700/60 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 group"
          title="Tutup & Lewati Modal (Esc)"
          aria-label="Tutup & Lewati Modal"
        >
          <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span className="text-[11px] font-medium tracking-wide">
            Lewati / Exit
          </span>
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto">
          {/* Poster Header */}
          <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden border-b border-slate-100">
            {event.posterImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.posterImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 bg-slate-900">
                <Trophy className="w-12 h-12 text-amber-500 mb-2" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Agenda Komunitas
                </span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

            {/* Badges Over Poster */}
            <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm backdrop-blur-xs ${
                  isOngoing
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500 text-slate-950"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {isOngoing ? "SESI BERLANGSUNG" : "EVENT TERKINI"}
              </span>

              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-slate-200 backdrop-blur-xs">
                {event.category}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 text-slate-800">
            {/* Title */}
            <h2 className="font-[var(--font-heading)] font-extrabold text-lg sm:text-xl text-slate-950 leading-snug mb-3">
              {event.title}
            </h2>

            {/* Event Specific Badges */}
            {(event.prizePool || event.targetInstrument) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {event.prizePool && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                    <Trophy className="w-3.5 h-3.5 text-amber-700" />
                    Pool Hadiah: {event.prizePool}
                  </span>
                )}
                {event.targetInstrument && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                    Fokus: {event.targetInstrument}
                  </span>
                )}
              </div>
            )}

            {/* Date, Time & Location Info Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 space-y-2 mb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="font-bold text-slate-900">{event.date}</span>
              </div>
              {event.time && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
              {event.description}
            </p>

            {/* Key Takeaways */}
            {event.keyTakeaways && event.keyTakeaways.length > 0 && (
              <div className="mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Sorotan Agenda:
                </span>
                <ul className="space-y-1.5">
                  {event.keyTakeaways.slice(0, 3).map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleScrollToEvents}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline underline-offset-4 order-2 sm:order-1"
          >
            Lihat Semua Jadwal di Bagan Event
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Lewati
            </button>
            <button
              type="button"
              onClick={handleAction}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md hover:shadow-lg"
            >
              <span>{event.actionText || "Daftar Sekarang"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
      )}

      {/* Modal Pendaftaran Event Multi-Step & Verifikasi Akun */}
      <EventRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        event={event}
      />
    </>
  );
}
