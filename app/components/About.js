"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PaperTexture from "./PaperTexture";

/* Wavy divider SVG */
function WavyDivider() {
  return (
    <svg viewBox="0 0 400 12" className="w-48 mx-auto my-12 opacity-25" preserveAspectRatio="none">
      <path
        d="M0 6 Q10 2, 20 6 T40 6 T60 6 T80 6 T100 6 T120 6 T140 6 T160 6 T180 6 T200 6 T220 6 T240 6 T260 6 T280 6 T300 6 T320 6 T340 6 T360 6 T380 6 T400 6"
        fill="none" stroke="#3b2f2f" strokeWidth="1.2"
      />
    </svg>
  );
}

/* Signature SVG */
function Signature() {
  return (
    <motion.svg
      viewBox="0 0 200 60" className="w-40 mt-8 opacity-40"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.4 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <path
        d="M10 45 C20 20, 35 15, 45 30 S60 50, 75 35 S95 15, 110 25 C120 32, 125 40, 140 35 S165 20, 180 30 L190 28"
        fill="none" stroke="#3b2f2f" strokeWidth="1.5" strokeLinecap="round"
        style={{ fontFamily: "'IM Fell English', serif" }}
      />
    </motion.svg>
  );
}

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="relative py-20 md:py-28 px-6">
      <PaperTexture className="absolute inset-0 paper-bg" />

      <div className="relative z-10 max-w-4xl mx-auto" ref={ref}>
        <WavyDivider />

        <motion.h2
          className="text-3xl md:text-4xl text-ink mb-12 text-center"
          style={{ fontFamily: "'IM Fell English', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          About Me
        </motion.h2>

        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          {/* Text content — like an opening letter paragraph */}
          <motion.div
            className="flex-1 order-2 md:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="drop-cap text-sepia text-base md:text-lg leading-[1.9] indent-8"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              Dear Reader, I am Jefrin M S A — a 2nd-year B.E Computer Science student at
              Loyola ICAM College of Engineering and Technology, batch of 2024–2028. I am
              passionate about Web3 and the decentralized future it promises, while steadily
              working toward my goal of becoming a Data Analyst who builds efficient,
              data-driven solutions.
            </div>

            <p
              className="text-sepia text-base md:text-lg leading-[1.9] mt-6 indent-8"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            >
              Beyond the classroom, I actively participate in hackathons, coordinate events,
              and constantly seek opportunities to grow — because I believe the best code is
              written outside your comfort zone.
            </p>

            <p
              className="text-sepia-light text-sm italic mt-8"
              style={{ fontFamily: "'IM Fell English', serif" }}
            >
              Yours truly,
            </p>
            <Signature />
          </motion.div>

          {/* Polaroid photo placeholder */}
          <motion.div
            className="flex-shrink-0 order-1 md:order-2 mx-auto md:mx-0"
            initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, rotate: 3, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div
              className="bg-white p-2 pb-10 shadow-[3px_4px_12px_rgba(0,0,0,0.15)]"
              style={{ transform: "rotate(3deg)" }}
            >
              {/* Photo area */}
              <div className="w-44 h-52 md:w-52 md:h-60 relative overflow-hidden">
                <img
                  src="/jefrin.png"
                  alt="Jefrin M S A"
                  className="w-full h-full object-cover"
                />
                {/* Tape corners */}
                <div className="absolute -top-1 -left-1 w-8 h-8 bg-[rgba(255,250,230,0.7)] rotate-[-5deg] shadow-sm" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-[rgba(255,250,230,0.7)] rotate-[5deg] shadow-sm" />
              </div>
              {/* Caption */}
              <p
                className="text-center text-sepia-light text-xs mt-2 tracking-wider"
                style={{ fontFamily: "'Special Elite', monospace" }}
              >
                Jefrin M S A, 2025
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
