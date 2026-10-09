"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

export default function LuxuryHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isChat = pathname === "/chat";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || isChat || mobileMenuOpen
          ? "bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[rgba(36,35,33,0.08)] py-3 sm:py-4 text-[#242321]"
          : "bg-gradient-to-b from-black/60 via-black/25 to-transparent py-4 sm:py-6 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 sm:gap-3 tracking-[0.24em] sm:tracking-[0.28em] uppercase text-sm sm:text-base font-serif font-light z-50 shrink-0"
        >
          <span>É T A P E</span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] text-[#C6A878] font-sans font-normal opacity-90 hidden sm:inline">
            ATELIER
          </span>
        </Link>

        {/* Center Editorial Nav (Desktop) */}
        {!isChat && (
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[11px] uppercase tracking-[0.22em] font-sans">
            <a
              href="#destinations"
              className={`transition-colors duration-300 ${
                scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
              }`}
            >
              Destinations
            </a>
            <a
              href="#journeys"
              className={`transition-colors duration-300 ${
                scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
              }`}
            >
              Journeys
            </a>
            <a
              href="#experiences"
              className={`transition-colors duration-300 ${
                scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
              }`}
            >
              Experiences
            </a>
            <a
              href="#concierge"
              className={`transition-colors duration-300 ${
                scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
              }`}
            >
              Concierge
            </a>
          </nav>
        )}

        {/* Right Nav */}
        <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] font-sans">
          {isChat ? (
            <Link
              href="/"
              className={`transition-colors hidden sm:inline ${
                scrolled || isChat || mobileMenuOpen ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
              }`}
            >
              Overview
            </Link>
          ) : (
            <a
              href="#inquire"
              className={`hidden md:inline transition-colors ${
                scrolled || mobileMenuOpen ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
              }`}
            >
              Inquire
            </a>
          )}

          <Link
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all duration-300 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.18em] flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              scrolled || isChat || mobileMenuOpen
                ? "bg-[#242321] text-[#F7F4EE] hover:bg-[#151412]"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/25"
            }`}
          >
            <span>{isChat ? "New Journey" : "Begin Journey"}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Mobile Menu Hamburger Button */}
          {!isChat && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 lg:hidden transition-colors cursor-pointer z-50 ${
                scrolled || mobileMenuOpen
                  ? "text-[#242321] hover:text-black"
                  : "text-white hover:text-white/80"
              }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {!isChat && (
        <div
          className={`lg:hidden fixed inset-x-0 top-full transition-all duration-300 ease-in-out border-b border-[rgba(36,35,33,0.12)] bg-[#F7F4EE]/98 backdrop-blur-xl shadow-xl ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto visible max-h-[85vh] overflow-y-auto"
              : "opacity-0 -translate-y-4 pointer-events-none invisible max-h-0"
          }`}
        >
          <div className="px-6 py-8 space-y-6 text-[#242321]">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C877D] block font-sans">
              Navigation
            </span>
            <nav className="flex flex-col space-y-4 text-xs uppercase tracking-[0.2em] font-sans">
              <a
                href="#destinations"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#C6A878] transition-colors py-2 flex items-center justify-between border-b border-[rgba(36,35,33,0.06)]"
              >
                <span>Destinations</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </a>
              <a
                href="#journeys"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#C6A878] transition-colors py-2 flex items-center justify-between border-b border-[rgba(36,35,33,0.06)]"
              >
                <span>Journeys</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </a>
              <a
                href="#experiences"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#C6A878] transition-colors py-2 flex items-center justify-between border-b border-[rgba(36,35,33,0.06)]"
              >
                <span>Experiences</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </a>
              <a
                href="#concierge"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#C6A878] transition-colors py-2 flex items-center justify-between border-b border-[rgba(36,35,33,0.06)]"
              >
                <span>Concierge Advisory</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </a>
              <a
                href="#inquire"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#C6A878] transition-colors py-2 flex items-center justify-between"
              >
                <span>Inquire</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </a>
            </nav>

            <div className="pt-2 border-t border-[rgba(36,35,33,0.08)]">
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn-primary py-3 px-6 text-center text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                <span>Launch Digital Atelier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

