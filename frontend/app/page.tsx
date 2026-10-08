"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import LuxuryHeader from "./navbar";
import {
  ArrowRight,
  Compass,
  Calendar,
  Users,
  Sparkles,
  MapPin,
  ChevronDown,
} from "lucide-react";

const DESTINATIONS = [
  {
    name: "Amalfi Coast",
    region: "Italy · Mediterranean",
    description: "A coastline of impossible beauty, where cliffside lemon groves plunge into the turquoise Tyrrhenian Sea.",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000&auto=format&fit=crop",
    size: "large",
    prompt: "Plan a 7-day luxury journey across Amalfi Coast, Positano and Ravello for 2 travelers",
  },
  {
    name: "Kyoto",
    region: "Japan · Kansai",
    description: "Ancient wooden temples, secluded zen moss gardens, and private kaiseki dining along hidden alleys.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop",
    size: "small",
    prompt: "7-day cultural immersion in Kyoto and Tokyo with boutique ryokans and private guides",
  },
  {
    name: "Maldives",
    region: "South Asia · Indian Ocean",
    description: "Private overwater residences floating above translucent lagoons with barefoot butler service.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1600&auto=format&fit=crop",
    size: "small",
    prompt: "5-day tranquil retreat in the Maldives at a luxury private atoll sanctuary",
  },
  {
    name: "Swiss Alps",
    region: "Switzerland · Engadin",
    description: "Glacier vistas, private alpine chalets, and quiet evenings by the cedar fire after scenic train journeys.",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1600&auto=format&fit=crop",
    size: "small",
    prompt: "6-day alpine retreat in Zermatt and St. Moritz with scenic glacier express travel",
  },
  {
    name: "Bali & Ubud",
    region: "Indonesia · Southeast Asia",
    description: "Terraced sanctuaries, sacred jungle springs, and clifftop sunsets high above Uluwatu.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop",
    size: "small",
    prompt: "5-day trip to Bali and Ubud from Dhaka under $1500 with serene stays and cultural sights",
  },
  {
    name: "Paris Rive Gauche",
    region: "France · Europe",
    description: "Private museum salon viewings, quiet courtyards in Saint-Germain, and world-renowned gastronomy.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop",
    size: "large",
    prompt: "5-day refined culinary and art escape to Paris staying in Saint-Germain",
  },
];

const SIGNATURE_JOURNEYS = [
  {
    title: "A Week in the Amalfi Coast",
    nights: "7 nights",
    country: "Italy",
    price: "From $4,800",
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1600&auto=format&fit=crop",
    prompt: "Plan a 7-day journey to Amalfi Coast including private boat charter to Capri and Ravello",
  },
  {
    title: "Imperial Japan in Autumn",
    nights: "10 nights",
    country: "Kyoto & Tokyo",
    price: "From $7,200",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop",
    prompt: "10-day luxury itinerary in Kyoto and Tokyo exploring autumn foliage and private tea masters",
  },
  {
    title: "Private Atoll Sanctuary",
    nights: "5 nights",
    country: "Maldives",
    price: "From $6,400",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    prompt: "5 nights luxury Maldives private villa retreat with sunset dolphin cruise and spa therapy",
  },
];

const EXPERIENCES = [
  {
    title: "Private Yacht Charters",
    subtitle: "Secluded coves & coastal stillness",
    image: "https://images.unsplash.com/photo-1559385301-0187cb6eff46?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHlhdGNofGVufDB8fDB8fHww",
  },
  {
    title: "Michelin-Starred Dining",
    subtitle: "Reserved cellar tables & chef tastings",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Alpine Hideaways",
    subtitle: "Private ski chalets & thermal springs",
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Private Cultural Access",
    subtitle: "Behind closed doors with resident curators",
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1600&auto=format&fit=crop",
  },
];

const PLANNER_STYLES = [
  "Romantic escape",
  "Family retreat",
  "Adventure & Nature",
  "Wellness Sanctuary",
  "Food & Wine",
  "Quiet luxury getaway",
];

export default function QuietLuxuryHomePage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  // Search Inquiry States
  const [destination, setDestination] = useState("");
  const [season, setSeason] = useState("Autumn 2026");
  const [travelers, setTravelers] = useState("2 Travelers");
  const [style, setStyle] = useState("Quiet luxury getaway");

  // Parallax subtle camera zoom & vertical drift
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroImageY = useTransform(heroProgress, [0, 1], [0, 140]);
  const heroTextY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0.2]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = destination.trim()
      ? `A ${style.toLowerCase()} to ${destination} for ${travelers} in ${season}`
      : `A ${style.toLowerCase()} for ${travelers} in ${season}`;
    router.push(`/chat?prompt=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-[var(--surface-warm)] selection:text-[var(--espresso)] transition-colors duration-400">
      {/* Luxury Minimal Header */}
      <LuxuryHeader />

      {/* 1. HERO SECTION WITH CINEMATIC PARALLAX */}
      <section
        ref={heroRef}
        className="relative h-[92vh] min-h-[640px] w-full flex items-center justify-center overflow-hidden"
      >
        {/* Parallax Background Cinematic Video */}
        <motion.div
          style={{ y: heroImageY }}
          className="absolute inset-0 w-full h-[115%] -top-[7.5%] will-change-transform"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2200&auto=format&fit=crop"
            className="w-full h-full object-cover object-center"
          >
            <source
              src="https://assets.mixkit.co/videos/42495/42495-720.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/25266/25266-720.mp4"
              type="video/mp4"
            />
          </video>
          {/* Subtle dark cinematic film overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-brightness-[0.88]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </motion.div>

        {/* Hero Editorial Content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-6 pt-12"
        >
          <span className="text-[11px] uppercase tracking-[0.35em] text-white/80 font-sans block">
            Bespoke Private Journeys
          </span>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-normal tracking-tight text-white leading-[1.05]">
            Travel beautifully.
          </h1>

          <p className="text-sm sm:text-base font-light text-white/85 max-w-xl mx-auto leading-relaxed tracking-wide font-sans">
            Exceptional journeys, thoughtfully designed around you.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs tracking-[0.18em] uppercase font-sans">
            <Link
              href="/chat"
              className="px-8 py-3.5 bg-[#F7F4EE] text-[#151412] hover:bg-white transition-all duration-300 w-full sm:w-auto font-medium"
            >
              Begin your journey
            </Link>
            <a
              href="#destinations"
              className="px-8 py-3.5 text-white border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto font-medium"
            >
              Explore destinations
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. REFINED CONCIERGE INQUIRY PANEL */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-5xl mx-auto px-6 w-full">
        <form
          onSubmit={handleInquirySubmit}
          className="bg-[#FAF8F4] border border-[rgba(36,35,33,0.1)] shadow-[0_25px_50px_-12px_rgba(20,20,19,0.08)] p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[rgba(36,35,33,0.08)]">
            {/* Field 1 */}
            <div className="space-y-1.5 lg:pr-6">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-sans font-medium block">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where would you like to go?"
                className="w-full bg-transparent text-sm sm:text-base text-[#151412] placeholder:text-[#8C877D]/70 focus:outline-none font-serif"
              />
            </div>

            {/* Field 2 */}
            <div className="space-y-1.5 pt-4 lg:pt-0 lg:px-6">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-sans font-medium block">
                When
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-transparent text-sm text-[#151412] focus:outline-none cursor-pointer"
              >
                <option value="Spring 2026">Spring 2026</option>
                <option value="Summer 2026">Summer 2026</option>
                <option value="Autumn 2026">Autumn 2026</option>
                <option value="Winter 2026">Winter 2026</option>
                <option value="Flexible Dates">Flexible Dates</option>
              </select>
            </div>

            {/* Field 3 */}
            <div className="space-y-1.5 pt-4 lg:pt-0 lg:px-6">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-sans font-medium block">
                Travelers
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full bg-transparent text-sm text-[#151412] focus:outline-none cursor-pointer"
              >
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="2 Travelers">2 Travelers (Couple)</option>
                <option value="Family of 4">Family (3–5)</option>
                <option value="Private Group">Private Group (6+)</option>
              </select>
            </div>

            {/* Field 4 */}
            <div className="space-y-1.5 pt-4 lg:pt-0 lg:pl-6">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-sans font-medium block">
                Journey Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-transparent text-sm text-[#151412] focus:outline-none cursor-pointer"
              >
                {PLANNER_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[rgba(36,35,33,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#8C877D] font-light">
              Tailored itineraries synthesized with live airline radars & boutique stays
            </span>

            <button
              type="submit"
              className="btn-primary px-8 py-3 text-xs uppercase tracking-[0.18em] font-sans w-full sm:w-auto"
            >
              Plan my journey
            </button>
          </div>
        </form>
      </section>

      {/* 3. CURATED DESTINATIONS (ASYMMETRICAL EDITORIAL LAYOUT) */}
      <section id="destinations" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-16">
        <div className="space-y-3 max-w-xl">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#8C877D] font-sans block">
            Portfolio of Escapes
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#151412] font-normal tracking-tight">
            Curated Destinations
          </h2>
          <p className="text-sm text-[#8C877D] font-light leading-relaxed">
            Quiet havens and cultural capitals chosen for their character, seclusion, and uncompromising standards of hospitality.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Large Feature */}
          <div className="lg:col-span-7 space-y-4 group">
            <Link
              href={`/chat?prompt=${encodeURIComponent(DESTINATIONS[0].prompt)}`}
              className="block editorial-image-container relative h-[440px] sm:h-[580px] w-full"
            >
              <Image
                src={DESTINATIONS[0].image}
                alt={DESTINATIONS[0].name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 right-8 text-white space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/80 block">
                  {DESTINATIONS[0].region}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal">
                  {DESTINATIONS[0].name}
                </h3>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#8C877D] font-light leading-relaxed max-w-lg">
              {DESTINATIONS[0].description}
            </p>
          </div>

          {/* Secondary Stack */}
          <div className="lg:col-span-5 space-y-12">
            {DESTINATIONS.slice(1, 3).map((item) => (
              <div key={item.name} className="space-y-3 group">
                <Link
                  href={`/chat?prompt=${encodeURIComponent(item.prompt)}`}
                  className="block editorial-image-container relative h-[280px] sm:h-[320px] w-full"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
                  <div className="absolute bottom-6 left-6 text-white space-y-0.5">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/80 block">
                      {item.region}
                    </span>
                    <h3 className="font-serif text-2xl font-normal">
                      {item.name}
                    </h3>
                  </div>
                </Link>
                <p className="text-xs text-[#8C877D] font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Three Smaller Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-[rgba(36,35,33,0.08)]">
          {DESTINATIONS.slice(3, 6).map((item) => (
            <div key={item.name} className="space-y-3 group">
              <Link
                href={`/chat?prompt=${encodeURIComponent(item.prompt)}`}
                className="block editorial-image-container relative h-[260px] w-full"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 text-white space-y-0.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 block">
                    {item.region}
                  </span>
                  <h3 className="font-serif text-xl font-normal">
                    {item.name}
                  </h3>
                </div>
              </Link>
              <p className="text-xs text-[#8C877D] font-light leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SIGNATURE JOURNEYS */}
      <section id="journeys" className="py-24 bg-[#EFEBE4] px-6 sm:px-12 w-full">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[rgba(36,35,33,0.08)] pb-8">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#8C877D] font-sans block">
                Thoughtfully Planned
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#151412] font-normal tracking-tight">
                Signature Journeys
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8C877D] font-light max-w-sm">
              Complete itineraries calibrated with private guides, preferred hotel privileges, and unhurried pacing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SIGNATURE_JOURNEYS.map((journey) => (
              <Link
                key={journey.title}
                href={`/chat?prompt=${encodeURIComponent(journey.prompt)}`}
                className="group block space-y-4"
              >
                <div className="editorial-image-container relative h-[420px] w-full">
                  <Image
                    src={journey.image}
                    alt={journey.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                </div>

                <div className="space-y-1.5 transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="flex items-center justify-between text-xs text-[#8C877D] tracking-wide">
                    <span>{journey.nights} · {journey.country}</span>
                    <span className="font-medium text-[#151412]">{journey.price}</span>
                  </div>

                  <h3 className="font-serif text-2xl text-[#151412] group-hover:text-[#C6A878] transition-colors">
                    {journey.title}
                  </h3>

                  <div className="pt-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#242321] opacity-70 group-hover:opacity-100 transition-opacity">
                    <span>Explore Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LUXURY EXPERIENCES */}
      <section id="experiences" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#8C877D] font-sans block">
            Bespoke Inclusions
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#151412] font-normal tracking-tight">
            Luxury Experiences
          </h2>
          <p className="text-sm text-[#8C877D] font-light">
            Moments that cannot be reserved on booking engines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCES.map((exp) => (
            <div key={exp.title} className="space-y-3 group">
              <div className="editorial-image-container relative h-[360px] w-full">
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="space-y-1 pt-1">
                <h3 className="font-serif text-xl text-[#151412] font-normal">
                  {exp.title}
                </h3>
                <p className="text-xs text-[#8C877D] font-light">
                  {exp.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. THE CONCIERGE (TRAVEL SPECIALIST SECTION) */}
      <section id="concierge" className="py-24 bg-[#FAF8F4] border-y border-[rgba(36,35,33,0.08)] px-6 sm:px-12 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#8C877D] font-sans block">
              Private Travel Advisory
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl text-[#151412] font-normal tracking-tight leading-[1.1]">
              Travel should feel effortless.
            </h2>
            <p className="text-sm sm:text-base text-[#524F4A] font-light leading-relaxed max-w-xl">
              From the first spark of inspiration to the final flight home, our travel specialists coordinate air transit routes, negotiate suite privileges, and handcraft daily itineraries tailored precisely to how you like to move.
            </p>

            <div className="pt-2">
              <Link
                href="/chat"
                className="btn-primary inline-flex items-center gap-3 px-8 py-3.5 text-xs uppercase tracking-[0.18em]"
              >
                <span>Speak with a travel specialist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="editorial-image-container relative h-[460px] w-full shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop"
                alt="Luxury Concierge Service"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI DIGITAL TRAVEL CONCIERGE PREVIEW */}
      <section id="inquire" className="py-28 px-6 sm:px-12 max-w-4xl mx-auto w-full text-center space-y-10">
        <div className="space-y-4">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#8C877D] font-sans block">
            Digital Travel Atelier
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl text-[#151412] font-normal tracking-tight">
            Where will we take you?
          </h2>
          <p className="text-sm text-[#8C877D] font-light max-w-md mx-auto">
            Tell our multi-agent scouts what your perfect journey looks like, and receive a refined day-by-day travel journal in moments.
          </p>
        </div>

        {/* Input area */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-[#FAF8F4] border border-[rgba(36,35,33,0.12)] p-2 sm:p-2.5 flex items-center gap-3">
            <input
              type="text"
              placeholder="Tell us what your perfect journey looks like..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/chat?prompt=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                }
              }}
              className="flex-1 bg-transparent px-4 py-3 text-sm sm:text-base text-[#151412] placeholder:text-[#8C877D]/70 focus:outline-none font-serif"
            />
            <Link
              href="/chat"
              className="btn-primary px-6 py-3 text-xs uppercase tracking-[0.18em] font-sans shrink-0 flex items-center gap-1.5"
            >
              <span>Compose</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Style Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {PLANNER_STYLES.map((pill) => (
              <Link
                key={pill}
                href={`/chat?prompt=${encodeURIComponent(`Plan a ${pill.toLowerCase()} for 2 travelers`)}`}
                className="text-xs px-3.5 py-1.5 border border-[rgba(36,35,33,0.12)] text-[#524F4A] hover:text-[#151412] hover:border-[#151412] transition-colors"
              >
                {pill}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(36,35,33,0.08)] py-14 px-6 sm:px-12 bg-[#FAF8F4] w-full text-xs text-[#8C877D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-1">
            <div className="font-serif tracking-[0.25em] text-sm text-[#151412] uppercase">
              É T A P E
            </div>
            <p className="text-[11px] font-light">
              Private Travel Concierge & Curated Journeys Worldwide
            </p>
          </div>

          <div className="flex flex-wrap gap-8 tracking-[0.15em] uppercase text-[10px]">
            <a href="#destinations" className="hover:text-[#151412] transition">
              Destinations
            </a>
            <a href="#journeys" className="hover:text-[#151412] transition">
              Journeys
            </a>
            <a href="#experiences" className="hover:text-[#151412] transition">
              Experiences
            </a>
            <Link href="/chat" className="hover:text-[#151412] transition">
              Concierge Chat
            </Link>
          </div>

          <div className="text-[11px] font-light">
            &copy; 2026 ÉTAPE Atelier. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
