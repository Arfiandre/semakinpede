"use client";

import { useState, useEffect } from "react";
import { Menu, X, TrendingUp } from "lucide-react";

const navLinks = [
  { label: "Komunitas", href: "#komunitas" },
  { label: "Edukasi", href: "#edukasi" },
  { label: "Market", href: "#market" },
  { label: "Broker", href: "#broker" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-900/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-navy-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center group-hover:bg-gold-300 transition-colors">
              <TrendingUp className="w-5 h-5 text-navy-900" />
            </div>
            <div className="flex flex-col">              <span className="text-white font-[var(--font-heading)] font-bold text-sm leading-tight tracking-tight">
                  SEMAKIN
                </span>
                <span className="text-gold-400 font-[var(--font-heading)] font-bold text-[10px] leading-tight tracking-widest">
                  PEDE
                </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <a
            href="#hero"
            className="hidden md:inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Gabung Grup Gratis
          </a>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-1 bg-navy-800 border-t border-white/10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-gray-300 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#hero"
            onClick={() => setIsOpen(false)}
            className="block text-center bg-gold-400 hover:bg-gold-300 text-navy-900 font-semibold px-4 py-3 rounded-full mt-2 transition-colors"
          >
            Gabung Grup Gratis
          </a>
        </div>
      </div>
    </nav>
  );
}
