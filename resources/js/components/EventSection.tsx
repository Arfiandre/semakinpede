"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  FileText,
  ImageIcon,
  Maximize2,
  X,
} from "lucide-react";
import { EventItem, EventStatus } from "@/types/event";
import {
  getStoredEvents,
  saveStoredEvents,
  EVENT_UPDATE_EVENT,
  DEFAULT_EVENTS,
  normalizeEventItem,
} from "@/lib/eventStorage";
import { getSiteSettings } from "@/lib/siteSettingsStorage";
import EventRegistrationModal from "@/components/EventRegistrationModal";

interface EventSectionProps {
  initialEvents?: any[];
}

export default function EventSection({ initialEvents = [] }: EventSectionProps) {
  const [events, setEvents] = useState<EventItem[]>(() => {
    if (Array.isArray(initialEvents) && initialEvents.length > 0) {
      return initialEvents.map(normalizeEventItem);
    }
    return getStoredEvents();
  });
  const [filter, setFilter] = useState<EventStatus | "all">("all");
  const [selectedRecap, setSelectedRecap] = useState<EventItem | null>(null);
  const [previewPoster, setPreviewPoster] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [registrationEvent, setRegistrationEvent] = useState<EventItem | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    // 1. Jika ada initialEvents dari server Laravel, gunakan dan sinkronkan ke cache
    if (Array.isArray(initialEvents) && initialEvents.length > 0) {
      const mapped = initialEvents.map(normalizeEventItem);
      setEvents(mapped);
      saveStoredEvents(mapped);
    } else {
      setEvents(getStoredEvents());
    }

    // 2. Fetch realtime data terkini dari endpoint publik /api/events
    const fetchFreshEvents = async () => {
      try {
        const res = await fetch("/api/events", {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const serverData = await res.json();
          if (Array.isArray(serverData) && serverData.length > 0) {
            const mapped = serverData.map(normalizeEventItem);
            setEvents(mapped);
            saveStoredEvents(mapped);
          }
        }
      } catch {
        // Fallback ke cache lokal
      }
    };
    fetchFreshEvents();

    // 3. Listen for updates from superadmin CRUD
    const handleUpdate = () => {
      setEvents(getStoredEvents());
    };

    window.addEventListener(EVENT_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(EVENT_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [initialEvents]);

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    return ev.status === filter;
  });

  const countOngoing = events.filter((e) => e.status === "ongoing").length;
  const countUpcoming = events.filter((e) => e.status === "upcoming").length;
  const countPast = events.filter((e) => e.status === "past").length;

  const handleAction = (event: EventItem) => {
    if (event.actionType === "recap") {
      setSelectedRecap(event);
      return;
    }

    if (event.actionType === "join-live" && event.meetingUrl) {
      window.open(event.meetingUrl, "_blank");
      return;
    }

    setRegistrationEvent(event);
    setIsRegistrationOpen(true);
  };

  return (
    <section
      id="event"
      className="py-16 md:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-slate-200 gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Agenda & Rekam Jejak Komunitas</span>
            </div>
            <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bagan kegiatan & event{" "}
              <span className="text-amber-700">Semakin Pede</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Ikuti sesi interaktif terkini, pantau jadwal seminar yang akan
              datang, atau jelajahi arsip edukasi publik yang telah berhasil kami
              selenggarakan bersama para mentor.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl self-start md:self-auto border border-slate-300/80">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-navy-950 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-300/60"
              }`}
            >
              Semua ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("ongoing")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "ongoing"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-300/60"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Terkini ({countOngoing})
            </button>
            <button
              type="button"
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "upcoming"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-300/60"
              }`}
            >
              Akan Datang ({countUpcoming})
            </button>
            <button
              type="button"
              onClick={() => setFilter("past")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "past"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-300/60"
              }`}
            >
              Telah Selesai ({countPast})
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Belum Ada Event di Kategori Ini
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-4">
              Daftar kegiatan untuk filter ini sedang disiapkan oleh superadmin.
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="px-4 py-2 bg-navy-950 text-white rounded-xl text-xs font-semibold hover:bg-navy-900 transition-colors"
            >
              Lihat Semua Event
            </button>
          </div>
        )}

        {/* Event Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isOngoing = event.status === "ongoing";
            const isUpcoming = event.status === "upcoming";
            const isPast = event.status === "past";

            return (
              <div
                key={event.id}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden bg-white group ${
                  isOngoing
                    ? "border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30"
                    : "border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Field Gambar Poster */}
                  <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden border-b border-slate-100">
                    {event.posterImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.posterImage}
                        alt={`Poster ${event.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4">
                        <ImageIcon className="w-8 h-8 mb-1 text-slate-600" />
                        <span className="text-[11px] font-medium">
                          Poster Event
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay & Zoom Action */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                    {event.posterImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPoster({
                            url: event.posterImage,
                            title: event.title,
                          })
                        }
                        className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg text-xs backdrop-blur-xs transition-colors flex items-center gap-1 shadow-xs"
                        title="Lihat Poster Penuh"
                        aria-label="Lihat Poster Penuh"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium hidden sm:inline">
                          Zoom
                        </span>
                      </button>
                    )}

                    {/* Status Pill Badge over Poster */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm backdrop-blur-xs ${
                          isOngoing
                            ? "bg-emerald-600 text-white"
                            : isUpcoming
                              ? "bg-amber-500 text-navy-950"
                              : "bg-slate-800/90 text-slate-200"
                        }`}
                      >
                        {isOngoing && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                        {isOngoing
                          ? "SESI PEKAN INI"
                          : isUpcoming
                            ? "AKAN DATANG"
                            : "TELAH SELESAI"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-slate-200 backdrop-blur-xs">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    {/* Nama Event */}
                    <h3 className="font-[var(--font-heading)] font-bold text-base sm:text-lg text-slate-900 leading-snug mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Keterangan */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Tanggal Pelaksanaan & Waktu */}
                    <div className="space-y-2 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {event.date}
                        </span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Contextual Badges (Kompetisi, Sesi Trading, Kuota) */}
                    {(event.prizePool || event.targetInstrument || event.seatQuota) && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {event.prizePool && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                            Pool: {event.prizePool}
                          </span>
                        )}
                        {event.targetInstrument && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                            Fokus: {event.targetInstrument}
                          </span>
                        )}
                        {event.seatQuota && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Kuota: {event.seatQuota} Kursi
                          </span>
                        )}
                      </div>
                    )}

                    {/* Poin Pembahasan jika ada */}
                    {event.keyTakeaways && event.keyTakeaways.length > 0 && (
                      <div className="mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                          Poin Pembahasan:
                        </span>
                        <ul className="space-y-1.5">
                          {event.keyTakeaways.slice(0, 3).map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleAction(event)}
                      className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isOngoing
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : isUpcoming
                            ? "bg-navy-950 hover:bg-navy-900 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                      }`}
                    >
                      {isOngoing && <PlayCircle className="w-3.5 h-3.5" />}
                      {isPast && (
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                      )}
                      <span>{event.actionText || "Lihat Detail"}</span>
                      {!isPast && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note / Guarantee */}
        <div className="mt-10 p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 font-bold">
              ✓
            </div>
            <p className="text-slate-600 leading-relaxed">
              Semua agenda webinar dan review jurnal harian diselenggarakan tanpa
              biaya untuk anggota komunitas. Jadwal di atas diperbarui secara
              berkala oleh superadmin.
            </p>
          </div>

          <a
            href="https://wa.me/628176792110?text=Halo%20Admin%20Semakin%20Pede,%20saya%20ingin%20mengusulkan%20topik%20webinar%20atau%20tanya%20jadwal%20event"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-semibold whitespace-nowrap transition-colors"
          >
            Usulkan Topik Webinar
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Poster Image Preview Modal */}
      {previewPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 text-white">
              <span className="text-xs font-bold text-amber-400 truncate max-w-md">
                Poster: {previewPoster.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPoster(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 sm:p-4 flex items-center justify-center bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPoster.url}
                alt={previewPoster.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Recap Modal for Past Events */}
      {selectedRecap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-900 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Rangkuman Arsip Kegiatan
              </span>
              <button
                type="button"
                onClick={() => setSelectedRecap(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <h3 className="font-[var(--font-heading)] font-bold text-lg text-slate-900 mb-2">
              {selectedRecap.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Diselenggarakan pada: {selectedRecap.date} ·{" "}
              {selectedRecap.location}
            </p>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed mb-4">
              {selectedRecap.recapNote || selectedRecap.description}
            </div>

            {selectedRecap.keyTakeaways &&
              selectedRecap.keyTakeaways.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Dokumentasi & Modul Terkait:
                  </span>
                  <ul className="space-y-1.5">
                    {selectedRecap.keyTakeaways.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRecap(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
              <a
                href="https://t.me/semakinpede"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                Akses Materi di Telegram
                <ExternalLink className="w-3 h-3 text-gold-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pendaftaran Event Multi-Step & Verifikasi Akun */}
      <EventRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setRegistrationEvent(null);
        }}
        event={registrationEvent}
      />
    </section>
  );
}
