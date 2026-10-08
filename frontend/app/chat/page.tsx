"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LuxuryHeader from "../navbar";
import {
  ArrowRight,
  ArrowUp,
  Sparkles,
  Search,
  Plane,
  Building,
} from "lucide-react";

interface TravelResponse {
  success: boolean;
  thread_id: string;
  answer: string;
  flight_results: string;
  hotel_results: string;
  itinerary: string;
  llm_calls: number;
  error?: string;
}

interface ParsedFlight {
  airline: string;
  flightNumber: string;
  depIata: string;
  depAirport: string;
  depTime: string;
  arrIata: string;
  arrAirport: string;
  arrTime: string;
  status: string;
}

interface ParsedHotel {
  name: string;
  location: string;
  rate: string;
  vibe: string;
  image: string;
}

const INSPIRATION_PILLS = [
  "A secluded coastal escape for 2",
  "A cultural retreat in Kyoto for a week",
  "A family villa in the Swiss Alps",
  "A culinary tour of Tuscany and Florence",
  "An unhurried wellness journey to Bali",
];

const SUGGESTED_PROMPTS = [
  "Add private culinary or wine tasting reservations",
  "Adjust for slower, unhurried morning pacing",
  "Include scenic day trips or private boat charters",
  "Suggest more secluded, quiet boutique stays",
  "Outline luggage transit and VIP airport services",
];

const CURATED_IMAGE_PALETTE = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop",
];

function cleanTimeString(isoStr?: string): string {
  if (!isoStr || isoStr === "Unknown" || isoStr === "N/A") return "Scheduled";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return isoStr;
  }
}

// Parses real AviationStack output dynamically
function parseDynamicFlights(raw: string, query: string): ParsedFlight[] {
  if (!raw) return [];

  const flights: ParsedFlight[] = [];
  const blocks = raw.split(/---+|\n\n(?=Airline:)/g);

  for (const block of blocks) {
    const airlineMatch = block.match(/Airline:\s*([^\n]+)/i);
    const flightMatch = block.match(/Flight:\s*([^\n]+)/i);
    const depIataMatch = block.match(/Departure:[\s\S]*?IATA:\s*([A-Z]{3})/i);
    const depAirportMatch = block.match(/Departure:[\s\S]*?Airport:\s*([^\n]+)/i);
    const depTimeMatch = block.match(/Departure:[\s\S]*?Scheduled:\s*([^\n]+)/i);
    const arrIataMatch = block.match(/Arrival:[\s\S]*?IATA:\s*([A-Z]{3})/i);
    const arrAirportMatch = block.match(/Arrival:[\s\S]*?Airport:\s*([^\n]+)/i);
    const arrTimeMatch = block.match(/Arrival:[\s\S]*?Scheduled:\s*([^\n]+)/i);
    const statusMatch = block.match(/Status:\s*([^\n]+)/i);

    if (airlineMatch || depIataMatch || arrIataMatch) {
      flights.push({
        airline: airlineMatch ? airlineMatch[1].trim() : "Scheduled Air Carrier",
        flightNumber: flightMatch ? flightMatch[1].trim() : "Direct Route",
        depIata: depIataMatch ? depIataMatch[1].trim() : "DEP",
        depAirport: depAirportMatch ? depAirportMatch[1].trim() : "Departure Port",
        depTime: cleanTimeString(depTimeMatch ? depTimeMatch[1].trim() : undefined),
        arrIata: arrIataMatch ? arrIataMatch[1].trim() : "ARR",
        arrAirport: arrAirportMatch ? arrAirportMatch[1].trim() : "Arrival Port",
        arrTime: cleanTimeString(arrTimeMatch ? arrTimeMatch[1].trim() : undefined),
        status: statusMatch ? statusMatch[1].trim().toUpperCase() : "SCHEDULED",
      });
    }
  }

  // If AviationStack returned route text e.g. "Live flights from DEL to DPS" or "No live flight data for route DEL to DPS"
  if (flights.length === 0 && raw) {
    const routeMatch = raw.match(/route\s+([A-Z]{3})\s+to\s+([A-Z]{3})/i) || raw.match(/from\s+([A-Z]{3})\s+to\s+([A-Z]{3})/i);
    if (routeMatch) {
      flights.push({
        airline: "AviationStack Air Route",
        flightNumber: "Verified Flight Corridor",
        depIata: routeMatch[1].toUpperCase(),
        depAirport: "Origin Gateway",
        depTime: "Optimal Departure",
        arrIata: routeMatch[2].toUpperCase(),
        arrAirport: "Destination Gateway",
        arrTime: "Scheduled Arrival",
        status: "ACTIVE ROUTE",
      });
    }
  }

  return flights.slice(0, 3);
}

// Parses real Tavily hotel synthesis dynamically
function parseDynamicHotels(raw: string): ParsedHotel[] {
  if (!raw) return [];

  const hotels: ParsedHotel[] = [];
  const lines = raw.split("\n");
  let currentHotel: Partial<ParsedHotel> | null = null;
  let imgIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match bold hotel name: e.g. **Hotel Name** (Area) or 1. **Hotel Name**
    const nameMatch = trimmed.match(/^\d*\.?\s*[-*•]?\s*\*\*([^*]+)\*\*(?:\s*\(([^)]+)\))?/);
    if (nameMatch) {
      if (currentHotel && currentHotel.name) {
        hotels.push({
          name: currentHotel.name,
          location: currentHotel.location || "Boutique Area",
          rate: currentHotel.rate || "Inquire for seasonal rates",
          vibe: currentHotel.vibe || "Selected for authentic hospitality and secluded ambiance.",
          image: CURATED_IMAGE_PALETTE[imgIndex % CURATED_IMAGE_PALETTE.length],
        });
        imgIndex++;
      }
      currentHotel = {
        name: nameMatch[1].replace(/^[0-9.]+\s*/, "").trim(),
        location: nameMatch[2] ? nameMatch[2].trim() : "Preferred Quarter",
        vibe: "",
      };
      continue;
    }

    if (currentHotel) {
      if (
        trimmed.toLowerCase().includes("rate") ||
        trimmed.toLowerCase().includes("price") ||
        trimmed.includes("€") ||
        trimmed.includes("$")
      ) {
        currentHotel.rate = trimmed
          .replace(/^[-*•]\s*(?:Estimated Nightly Rate|Estimated Rate|Rate|Price):\s*/i, "")
          .trim();
      } else if (
        trimmed.toLowerCase().includes("highlight") ||
        trimmed.toLowerCase().includes("vibe") ||
        trimmed.length > 25
      ) {
        if (!currentHotel.vibe) {
          currentHotel.vibe = trimmed
            .replace(/^[-*•]\s*(?:Vibe & Highlights|Highlights|Vibe):\s*/i, "")
            .trim();
        }
      }
    }
  }

  if (currentHotel && currentHotel.name) {
    hotels.push({
      name: currentHotel.name,
      location: currentHotel.location || "Boutique Area",
      rate: currentHotel.rate || "Inquire for seasonal rates",
      vibe: currentHotel.vibe || "Selected for authentic hospitality and secluded ambiance.",
      image: CURATED_IMAGE_PALETTE[imgIndex % CURATED_IMAGE_PALETTE.length],
    });
  }

  return hotels.slice(0, 3);
}

// Strips out raw flight and hotel text blocks so markdown is purely a clean narrative itinerary
function stripFlightsAndHotels(content: string): string {
  if (!content) return "";

  const sections = content.split(/(?=(?:^|\n)#{1,4}\s+)/g);

  const filtered = sections.filter((sec) => {
    const firstLine = sec.trim().split("\n")[0].toLowerCase();
    const isFlight =
      firstLine.includes("flight") ||
      firstLine.includes("air travel") ||
      firstLine.includes("aviation") ||
      firstLine.includes("air corridor");
    const isHotel =
      firstLine.includes("hotel") ||
      firstLine.includes("lodging") ||
      firstLine.includes("curated stays") ||
      firstLine.includes("accommodation") ||
      firstLine.includes("sanctuaries");
    return !isFlight && !isHotel;
  });

  return filtered.join("").trim();
}

function ConciergeChatContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const [prompt, setPrompt] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TravelResponse | null>(null);
  const [userQuery, setUserQuery] = useState(initialPrompt || "");
  const [hasConversationStarted, setHasConversationStarted] = useState(
    Boolean(initialPrompt)
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  // If user navigated with a prompt parameter from home page, execute it
  useEffect(() => {
    if (initialPrompt) {
      setHasConversationStarted(true);
      setUserQuery(initialPrompt);
      executeInquiry(initialPrompt);
    }
  }, [initialPrompt]);

  const executeInquiry = async (queryText?: string) => {
    const q = (queryText || prompt).trim();
    if (!q || loading) return;

    setLoading(true);
    setHasConversationStarted(true);
    setUserQuery(q);
    setPrompt("");

    try {
      const response = await fetch("http://localhost:8000/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          thread_id: threadId || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result);
        if (result.thread_id) {
          setThreadId(result.thread_id);
        }
      } else {
        alert(result.error || "Our concierge service is briefly unavailable.");
      }
    } catch (err) {
      console.error(err);
      alert(
        "Unable to reach the travel advisory service. Please verify that the backend is running on port 8000."
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };

  const parsedFlights = data ? parseDynamicFlights(data.flight_results, userQuery) : [];
  const parsedHotels = data ? parseDynamicHotels(data.hotel_results) : [];

  return (
    <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 pt-28 sm:pt-32 pb-20">
      {/* Specialist Identity Header */}
      <div className="flex items-center justify-between pb-8 mb-10 border-b border-[#D2CABC]/70">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#C6A878] shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
              alt="Sofia Laurent"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-medium text-[#11100F]">
                Sofia Laurent
              </h2>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D38] font-bold font-sans">
                Travel Specialist
              </span>
            </div>
            <p className="text-xs text-[#555047] leading-relaxed pt-0.5">
              Dedicated Concierge &middot; Powered by live aviation &amp; boutique search
            </p>
          </div>
        </div>

        {data && (
          <button
            onClick={() => {
              setData(null);
              setThreadId(null);
              setUserQuery("");
              setHasConversationStarted(false);
            }}
            className="text-xs uppercase tracking-[0.2em] text-[#6E685E] hover:text-[#11100F] transition-colors cursor-pointer font-sans font-semibold"
          >
            New Inquiry
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* MAIN CONCIERGE CONVERSATION                               */}
      {/* ========================================================= */}
      <main className="space-y-16 min-h-[65vh]">
        {/* STATE A: EMPTY STATE (Before conversation begins) */}
        {!hasConversationStarted && !data && (
          <div className="py-10 sm:py-16 space-y-12 max-w-2xl mx-auto text-center">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.35em] text-[#8A6D38] font-sans font-bold block">
                Your Private Concierge
              </span>

              <h1 className="font-serif text-4xl sm:text-6xl text-[#11100F] font-normal tracking-tight leading-[1.08]">
                Where will we take you?
              </h1>

              <p className="text-base sm:text-lg text-[#3D3A35] font-normal leading-relaxed max-w-lg mx-auto">
                Whether you&apos;re imagining a secluded island sanctuary,
                a cultural capital journey, or something entirely your own,
                begin with a thought.
              </p>
            </div>

            {/* Large Paper-like Text Input */}
            <div className="space-y-6 pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeInquiry();
                }}
                className="bg-[#FFFFFF] border border-[#C8C0B0] shadow-[0_12px_30px_-8px_rgba(20,20,19,0.08)] p-5 text-left space-y-4"
              >
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell us what your perfect journey looks like (destination, dates, pacing)..."
                  className="w-full bg-transparent text-base sm:text-lg text-[#11100F] placeholder:text-[#656056] focus:outline-none font-serif leading-relaxed resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      executeInquiry();
                    }
                  }}
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#D2CABC]/60">
                  <div className="flex items-center gap-4 text-xs text-[#6A655C] font-sans">
                    <button
                      type="button"
                      onClick={() =>
                        setPrompt("Plan an unhurried 5-day escape to Kyoto with ryokan stays and traditional gardens")
                      }
                      className="hover:text-[#11100F] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B89658]" />
                      <span>Inspiration example</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="w-10 h-10 bg-[#1F1E1C] hover:bg-[#0A0A09] text-white disabled:opacity-30 transition-all flex items-center justify-center rounded-[3px] cursor-pointer shadow-sm"
                    title="Send message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Dynamic Inspiration Chips */}
              <div className="pt-4 space-y-3">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#8A6D38] font-bold block">
                  Inspirations
                </span>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[#3D3A35]">
                  {INSPIRATION_PILLS.map((pill, idx) => (
                    <span key={pill} className="inline-flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setPrompt(pill);
                          executeInquiry(pill);
                        }}
                        className="hover:text-[#11100F] font-serif hover:underline underline-offset-4 cursor-pointer transition-colors"
                      >
                        {pill}
                      </button>
                      {idx < INSPIRATION_PILLS.length - 1 && (
                        <span className="text-[#C8C0B0]">&bull;</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE B: ACTIVE CONVERSATION (PURELY DYNAMIC) */}
        {(hasConversationStarted || data) && (
          <div className="space-y-16">
            {/* Conversation Header */}
            <div className="space-y-1 pb-4 border-b border-[#D2CABC]/70">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8A6D38] font-bold block font-sans">
                Your Private Concierge
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#11100F] font-normal">
                Voyage Consultation
              </h1>
            </div>

            {/* CLIENT INQUIRY BLOCK */}
            {userQuery && (
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.25em] text-[#8A6D38] font-sans font-bold">
                  YOUR INQUIRY
                </div>
                <div className="font-serif text-xl sm:text-2xl text-[#11100F] leading-relaxed italic bg-[#FAF8F4] border-l-2 border-[#11100F] pl-6 py-4">
                  &ldquo;{userQuery}&rdquo;
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {loading && (
              <div className="py-20 text-center space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-[#8A6D38] border-t-transparent animate-spin mx-auto" />
                <p className="font-serif text-2xl text-[#11100F]">
                  Sofia Laurent is composing your voyage...
                </p>
                <p className="text-xs text-[#6A655C] max-w-md mx-auto">
                  Cross-referencing live air corridors, vetting boutique hotel availability, and pacing your daily journey.
                </p>
              </div>
            )}

            {/* DYNAMIC RESULTS (When API response returns) */}
            {data && !loading && (
              <>
                {/* 1. DYNAMIC AIR CORRIDORS (FLIGHTS UI) */}
                {parsedFlights.length > 0 && (
                  <div className="space-y-6 pt-2 border-t border-[#D2CABC]/70">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.28em] text-[#8A6D38] font-sans font-bold block">
                          Air Transit Radar
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-[#11100F] font-normal">
                          Curated Flight Corridors
                        </h3>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#6E685E]">
                        <Plane className="w-3.5 h-3.5 text-[#8A6D38]" />
                        <span>AviationStack Intelligence</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {parsedFlights.map((flight, idx) => (
                        <div
                          key={idx}
                          className="border border-[#C8C0B0] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm space-y-4 hover:border-[#11100F] transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs border-b border-[#D2CABC]/60 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D38] font-bold font-sans">
                                Corridor
                              </span>
                              <span className="text-[#D2CABC]">&bull;</span>
                              <span className="font-serif font-medium text-[#11100F] text-sm">
                                {flight.airline} &middot; {flight.flightNumber}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A6D38] font-bold font-sans bg-[#FAF8F4] px-2.5 py-1 border border-[#D2CABC]">
                              {flight.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
                            {/* Departure */}
                            <div className="sm:col-span-4 space-y-0.5">
                              <span className="font-serif text-2xl sm:text-3xl text-[#11100F] block font-normal">
                                {flight.depIata}
                              </span>
                              <p className="text-xs text-[#555047] truncate">
                                {flight.depAirport}
                              </p>
                              <p className="text-xs uppercase tracking-[0.15em] text-[#8A6D38] font-semibold pt-1">
                                {flight.depTime}
                              </p>
                            </div>

                            {/* Middle Arrow */}
                            <div className="sm:col-span-4 flex flex-col items-center justify-center text-center py-2">
                              <div className="w-full flex items-center justify-center gap-3">
                                <div className="h-px bg-[#D2CABC] flex-1" />
                                <Plane className="w-4 h-4 text-[#8A6D38]" />
                                <div className="h-px bg-[#D2CABC] flex-1" />
                              </div>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A7468] pt-1">
                                Direct Transit
                              </span>
                            </div>

                            {/* Arrival */}
                            <div className="sm:col-span-4 sm:text-right space-y-0.5">
                              <span className="font-serif text-2xl sm:text-3xl text-[#11100F] block font-normal">
                                {flight.arrIata}
                              </span>
                              <p className="text-xs text-[#555047] truncate">
                                {flight.arrAirport}
                              </p>
                              <p className="text-xs uppercase tracking-[0.15em] text-[#8A6D38] font-semibold pt-1">
                                {flight.arrTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. DYNAMIC CURATED STAYS (HOTELS UI) */}
                {parsedHotels.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-[#D2CABC]/70">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.28em] text-[#8A6D38] font-sans font-bold block">
                          Lodging Portfolio
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-[#11100F] font-normal">
                          Curated Stays &amp; Sanctuaries
                        </h3>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#6E685E]">
                        <Building className="w-3.5 h-3.5 text-[#8A6D38]" />
                        <span>Tavily Verified Stays</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {parsedHotels.map((hotel, idx) => (
                        <div
                          key={idx}
                          className="border border-[#C8C0B0] bg-[#FFFFFF] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-[#11100F] transition-colors group cursor-pointer"
                          onClick={() =>
                            executeInquiry(`Tell me more about staying at ${hotel.name}`)
                          }
                        >
                          <div className="relative w-full sm:w-36 h-28 sm:h-24 shrink-0 overflow-hidden border border-[#D2CABC]">
                            <Image
                              src={hotel.image}
                              alt={hotel.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-serif text-xl sm:text-2xl text-[#11100F] group-hover:text-[#8A6D38] transition-colors">
                                {hotel.name}
                              </h4>
                              <span className="text-xs uppercase tracking-[0.15em] text-[#11100F] font-bold font-sans">
                                {hotel.rate}
                              </span>
                            </div>

                            <p className="text-xs uppercase tracking-[0.18em] text-[#8A6D38] font-medium font-sans">
                              {hotel.location}
                            </p>

                            <p className="text-xs text-[#3D3A35] font-normal leading-relaxed pt-0.5">
                              {hotel.vibe}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DYNAMIC DAY-BY-DAY ITINERARY JOURNAL (MARKDOWN) */}
                <div className="space-y-8 pt-6 border-t border-[#D2CABC]/70">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[#8A6D38] font-sans font-bold block">
                      Tailored Proposal
                    </span>
                    <h3 className="font-serif text-3xl text-[#11100F] font-normal">
                      Your Bespoke Day-by-Day Itinerary
                    </h3>
                  </div>

                  <article className="max-w-none text-[#11100F]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {stripFlightsAndHotels(data.answer)}
                    </ReactMarkdown>
                  </article>
                </div>
              </>
            )}

            {/* SUGGESTED PROMPTS */}
            <div className="space-y-4 pt-6 border-t border-[#D2CABC]/70">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#8A6D38] font-sans font-bold block">
                Perhaps you&apos;d like to ask...
              </span>

              <div className="space-y-2.5">
                {SUGGESTED_PROMPTS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => executeInquiry(suggestion)}
                    className="group flex items-center justify-between w-full py-2.5 border-b border-[#D2CABC]/40 hover:border-[#11100F] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-base font-serif text-[#11100F] group-hover:text-[#8A6D38] transition-colors">
                      {suggestion}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#11100F] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* COMPOSER: Premium Paper-like Input Area */}
            <div className="pt-6 sticky bottom-6 bg-[#F7F4EE]/95 backdrop-blur-md pb-2 z-20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeInquiry();
                }}
                className="bg-[#FFFFFF] border border-[#C8C0B0] shadow-[0_12px_32px_-8px_rgba(20,20,19,0.1)] p-4 sm:p-5 space-y-3"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask Sofia to refine pace, add private guides, or reserve dining..."
                  className="w-full bg-transparent text-base sm:text-lg text-[#11100F] placeholder:text-[#656056] focus:outline-none font-serif font-medium"
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#D2CABC]/60 text-xs text-[#555047] font-sans">
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      onClick={() =>
                        setPrompt("Recommend private Michelin reservations and scenic terraces")
                      }
                      className="hover:text-[#11100F] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>＋ Add dining</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPrompt("Make the itinerary more unhurried with slower mornings")
                      }
                      className="hover:text-[#11100F] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3 h-3 text-[#B89658]" />
                      <span>Adjust pace</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!prompt.trim() || loading}
                    className="w-9 h-9 bg-[#1F1E1C] hover:bg-[#0A0A09] text-white disabled:opacity-30 transition-all flex items-center justify-center rounded-[3px] cursor-pointer shadow-sm"
                    title="Send inquiry"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>
    </div>
  );
}

export default function ChatConciergePage() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#11100F] flex flex-col selection:bg-[#E9E1D4] selection:text-[#11100F]">
      <LuxuryHeader />

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center p-24 text-xs uppercase tracking-[0.3em] text-[#8A6D38]">
            Opening Concierge Atelier...
          </div>
        }
      >
        <ConciergeChatContent />
      </Suspense>

      <footer className="border-t border-[#D2CABC]/80 py-10 px-6 sm:px-12 text-xs text-[#6A655C] bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif tracking-[0.3em] uppercase text-sm text-[#11100F] font-medium">
            É T A P E
          </span>
          <span className="text-xs">
            Your Private Concierge &middot; Dedicated Travel Advisory
          </span>
        </div>
      </footer>
    </div>
  );
}
