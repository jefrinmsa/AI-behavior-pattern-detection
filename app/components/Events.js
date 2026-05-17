"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PaperTexture from "./PaperTexture";
import StackedFlipDeck from "./StackedFlipDeck";

const events = [
  {
    date: "2024",
    title: "Event Coordinator — College Symposium",
    description:
      "Coordinated and managed events at the college technical symposium, overseeing logistics and ensuring smooth execution across multiple rounds.",
    tag: "Leadership",
  },
  {
    date: "2025",
    title: "Smart India Hackathon 2025",
    description:
      "Participated in India's biggest hackathon at the inter-college level — building solutions for real-world government problem statements under intense time pressure.",
    tag: "Hackathon",
  },
  {
    date: "2025",
    title: "CTRL ALT Hack 2.0",
    description:
      "A high-energy hackathon where we tackled technical challenges across domains, building innovative solutions within a limited timeframe.",
    tag: "Hackathon",
  },
  {
    date: "2025",
    title: "Literex 1.0",
    description:
      "Took part in Literex 1.0, a competitive hackathon focused on building impactful tech solutions with real-world applications.",
    tag: "Hackathon",
  },
  {
    date: "2025",
    title: "Codeverse",
    description:
      "Participated in Codeverse — a coding and innovation challenge that tested algorithmic thinking, development speed, and creativity.",
    tag: "Hackathon",
  },
  {
    date: "2026",
    title: "Hackcelerate '26",
    description:
      "Competed in Hackcelerate 2026, pushing boundaries with rapid prototyping and creative problem solving alongside top engineering minds.",
    tag: "Hackathon",
  },
];

/* Wax seal divider */
function WaxSeal() {
  return (
    <div className="flex justify-center my-14">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, #a83a10, #8b2500 50%, #6b1d00)",
          boxShadow:
            "0 2px 8px rgba(139,37,0,0.3), inset 0 1px 3px rgba(255,255,255,0.15)",
        }}
      >
        <span
          className="text-sm font-bold text-parchment"
          style={{ fontFamily: "'IM Fell English', serif" }}
        >
          ✦
        </span>
      </div>
    </div>
  );
}

/* Event card renderer */
function EventCard({ event }) {
  return (
    <div
      className="relative"
      style={{
        background: "linear-gradient(135deg, #e8e2cc 0%, #e0d8c0 100%)",
        boxShadow:
          "2px 3px 12px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.45)",
        clipPath:
          "polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)",
      }}
    >
      {/* Dog ear fold */}
      <div
        className="absolute top-0 right-0 w-7 h-7 z-10"
        style={{
          background: "linear-gradient(135deg, transparent 50%, #cec6ab 50%)",
          boxShadow: "-1px 1px 3px rgba(0,0,0,0.08)",
        }}
      />

      <div style={{ padding: "40px", minHeight: "320px" }}>
        {/* Top row: date stamp + tag badge */}
        <div className="flex items-start justify-between mb-5">
          {/* Date stamp */}
          <span
            className="text-sepia/40 uppercase tracking-[3px]"
            style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: "13px",
            }}
          >
            {event.date}
          </span>

          {/* Tag badge — rubber ink stamp */}
          <span
            className="text-sepia/50 uppercase tracking-[2px] px-2.5 py-0.5 border border-sepia/20"
            style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: "10px",
              borderRadius: "2px 4px 3px 5px",
              transform: "rotate(1.5deg)",
              display: "inline-block",
            }}
          >
            {event.tag}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-ink mb-4"
          style={{ fontFamily: "'IM Fell English', serif", fontSize: "24px" }}
        >
          {event.title}
        </h3>

        {/* Description */}
        <p
          className="text-sepia leading-relaxed mb-6"
          style={{ fontFamily: "'Courier Prime', monospace", fontSize: "14px" }}
        >
          {event.description}
        </p>

        {/* Faded ink divider */}
        <div
          className="mt-auto"
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(59,47,47,0.15) 20%, rgba(59,47,47,0.15) 80%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}

export default function Events() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="events" className="relative py-20 md:py-28 px-6">
      <PaperTexture className="absolute inset-0 paper-bg" />

      <div className="relative z-10 max-w-4xl mx-auto" ref={ref}>
        <WaxSeal />

        <motion.h2
          className="text-3xl md:text-4xl text-ink mb-14 text-center"
          style={{ fontFamily: "'IM Fell English', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Chronicles
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StackedFlipDeck
            items={events}
            renderCard={(event) => <EventCard event={event} />}
          />
        </motion.div>
      </div>
    </section>
  );
}
