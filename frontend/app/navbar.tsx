"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function LuxuryHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isChat = pathname === "/chat";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isChat
          ? "bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[rgba(36,35,33,0.08)] py-4 text-[#242321]"
          : "bg-gradient-to-b from-black/50 via-black/20 to-transparent py-6 text-white"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 tracking-[0.28em] uppercase text-sm sm:text-base font-serif font-light">
          <span>É T A P E</span>
          <span className="text-[10px] tracking-[0.35em] text-[#C6A878] font-sans font-normal opacity-90 hidden sm:inline">
            ATELIER
          </span>
        </Link>

        {/* Center Editorial Nav (Desktop) */}
        {!isChat && (
          <nav className="hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-[0.22em] font-sans">
            <a
              href="#destinations"
              className={`transition-colors duration-300 ${scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
                }`}
            >
              Destinations
            </a>
            <a
              href="#journeys"
              className={`transition-colors duration-300 ${scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
                }`}
            >
              Journeys
            </a>
            <a
              href="#experiences"
              className={`transition-colors duration-300 ${scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
                }`}
            >
              Experiences
            </a>
            <a
              href="#concierge"
              className={`transition-colors duration-300 ${scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
                }`}
            >
              Concierge
            </a>
          </nav>
        )}

        {/* Right Nav */}
        <div className="flex items-center gap-6 sm:gap-8 text-[11px] uppercase tracking-[0.2em] font-sans">
          {isChat ? (
            <Link
              href="/"
              className="text-[#524F4A] hover:text-[#151412] transition-colors"
            >
              Overview
            </Link>
          ) : (
            <a
              href="#inquire"
              className={`hidden sm:inline transition-colors ${scrolled ? "text-[#524F4A] hover:text-[#151412]" : "text-white/80 hover:text-white"
                }`}
            >
              Inquire
            </a>
          )}

          <Link
            href="/chat"
            className={`px-5 py-2.5 transition-all duration-300 text-[11px] uppercase tracking-[0.18em] flex items-center gap-2 ${scrolled || isChat
                ? "bg-[#242321] text-[#F7F4EE] hover:bg-[#151412]"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/25"
              }`}
          >
            <span>{isChat ? "New Journey" : "Begin Journey"}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
