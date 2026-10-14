"use client";

import { useState, useEffect } from "react";
import { Menu, X, TrendingUp } from "lucide-react";
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/siteSettingsStorage";
import { SiteSettings } from "@/types/settings";

const navLinks = [
  { label: "Market Live", href: "#market" },
  { label: "Alat & Kalkulator", href: "#alat-trading" },
  { label: "Agenda Event", href: "#event" },
  { label: "Broker Resmi", href: "#broker" },
  { label: "Komunitas", href: "#komunitas" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSettings(getSiteSettings());

    const handleUpdate = () => {
      setSettings(getSiteSettings());
    };

    window.addEventListener("kfi_settings_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("kfi_settings_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const titleWords = (settings.projectTitle || "Semakin Pede").trim().split(" ");
  const firstWord = titleWords[0] || "SEMAKIN";
  const restWords = titleWords.length > 1 ? titleWords.slice(1).join(" ") : "PEDE";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-950/95 backdrop-blur-md shadow-md border-b border-navy-800/80"
          : "bg-navy-950 border-b border-navy-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a
            href="#hero"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg p-1"
          >
            {settings.logoUrl ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={settings.logoUrl}
                  alt={settings.projectTitle || "Logo Komunitas"}
                  className="h-9 max-w-[150px] object-contain rounded-md"
                />
                <span className="text-white font-[var(--font-heading)] font-extrabold text-sm leading-tight tracking-tight hidden sm:inline-block">
                  {settings.projectTitle}
                </span>
              </div>
            ) : (
              <>
                <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center group-hover:bg-gold-300 transition-colors shadow-xs">
                  <TrendingUp className="w-5 h-5 text-navy-950" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-[var(--font-heading)] font-extrabold text-sm leading-tight tracking-tight uppercase">
                    {firstWord}
                  </span>
                  <span className="text-gold-400 font-[var(--font-heading)] font-bold text-[10px] leading-tight tracking-widest uppercase">
                    {restWords}
                  </span>
                </div>
              </>
            )}
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <a
            href="#komunitas"
            className="hidden md:inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
            Gabung Komunitas
          </a>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-200 p-2 hover:bg-white/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        role="menu"
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-navy-900 border-t border-navy-800">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3.5 py-2.5 text-slate-200 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-colors font-medium text-sm"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#komunitas"
            onClick={() => setIsOpen(false)}
            className="block text-center bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold px-4 py-2.5 rounded-xl mt-3 transition-colors text-sm uppercase tracking-wide"
          >
            Gabung Komunitas
          </a>
        </div>
      </div>
    </nav>
  );
}
