"use client";

import { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import PaperTexture from "./PaperTexture";

const skillGroups = [
  {
    category: "Languages",
    skills: ["C", "Python", "Java", "HTML", "CSS"],
  },
  {
    category: "Tools & Databases",
    skills: ["Git", "MySQL", "MongoDB", "Canva"],
  },
  {
    category: "Concepts",
    skills: ["Data Structures & Algorithms", "Web3 Fundamentals"],
  },
];

/* Seeded pseudo-random from string */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

function rand(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

/* Wax seal divider */
function WaxSeal() {
  return (
    <div className="flex justify-center mb-14">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at 40% 35%, #a83a10, #8b2500 50%, #6b1d00)",
          boxShadow: "0 2px 8px rgba(139,37,0,0.3), inset 0 1px 3px rgba(255,255,255,0.15)",
        }}
      >
        <span className="text-sm font-bold text-parchment" style={{ fontFamily: "'IM Fell English', serif" }}>§</span>
      </div>
    </div>
  );
}

/* Torn edge clip-path — irregular left/right, clean top/bottom */
const tornClip = `polygon(
  0% 0%, 3% 8%, 0% 18%, 2% 30%, 0% 42%, 1% 55%, 0% 68%, 2% 78%, 0% 88%, 1% 100%,
  99% 100%, 100% 90%, 98% 80%, 100% 68%, 99% 55%, 100% 44%, 98% 32%, 100% 20%, 99% 10%, 100% 0%
)`;

/* Paper slip badge */
function StampBadge({ text, groupDelay, badgeIndex, isInView }) {
  const seed = hashStr(text + badgeIndex);

  const randoms = useMemo(
    () => ({
      startX: rand(seed, -400, 400),
      startY: rand(seed + 1, -300, 300),
      startRotate: rand(seed + 2, -45, 45),
      restTilt: rand(seed + 3, -2, 2),
      tapeOffset: rand(seed + 5, -6, 6),
    }),
    [seed]
  );

  const delay = groupDelay + badgeIndex * 0.08;

  const restShadow =
    "2px 2px 0px #e8dfc8, 4px 4px 0px #ddd5bc, 2px 4px 8px rgba(0,0,0,0.15), 4px 6px 16px rgba(0,0,0,0.08)";
  const stampShadow =
    "2px 2px 0px #e8dfc8, 4px 4px 0px #ddd5bc, 2px 4px 12px rgba(0,0,0,0.25), 4px 6px 20px rgba(0,0,0,0.12)";
  const hoverShadow =
    "2px 2px 0px #e8dfc8, 4px 4px 0px #ddd5bc, 3px 6px 14px rgba(0,0,0,0.22), 6px 10px 24px rgba(0,0,0,0.12)";

  return (
    <motion.span
      className="inline-block cursor-default select-none relative"
      style={{
        padding: "10px 20px",
        border: "none",
        borderRadius: "2px",
        clipPath: tornClip,
        fontFamily: "'Special Elite', monospace",
        fontSize: "11px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "#2a1a0a",
        textShadow: "0 0 1px rgba(0,0,0,0.3)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"), linear-gradient(135deg, #faf6ed 0%, #f2ead8 100%)`,
        backgroundSize: "200px 200px, 100% 100%",
      }}
      initial={{
        x: randoms.startX,
        y: randoms.startY,
        rotate: randoms.startRotate,
        opacity: 0,
        scale: 0.3,
        boxShadow: restShadow,
      }}
      animate={
        isInView
          ? {
              x: 0,
              y: 0,
              rotate: randoms.restTilt,
              opacity: 1,
              scale: [1, 1.15, 0.95, 1],
              boxShadow: [restShadow, stampShadow, restShadow],
            }
          : {
              x: randoms.startX,
              y: randoms.startY,
              rotate: randoms.startRotate,
              opacity: 0,
              scale: 0.3,
            }
      }
      transition={{
        x: { delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
        y: { delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
        rotate: { delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
        opacity: { delay, duration: 0.4 },
        scale: {
          delay: delay + 0.55,
          duration: 0.18,
          ease: "easeInOut",
          times: [0, 0.4, 0.75, 1],
        },
        boxShadow: {
          delay: delay + 0.55,
          duration: 0.18,
          times: [0, 0.5, 1],
        },
      }}
      whileHover={{
        y: -3,
        scale: [1, 1.12, 0.97, 1],
        boxShadow: [restShadow, hoverShadow, restShadow],
        transition: { duration: 0.15, ease: "easeOut" },
      }}
    >
      {/* Tape strip */}
      <span
        className="absolute pointer-events-none"
        style={{
          top: "-4px",
          left: `calc(50% + ${randoms.tapeOffset}px - 20px)`,
          width: "40px",
          height: "8px",
          background: "rgba(200, 190, 160, 0.4)",
          backdropFilter: "blur(1px)",
          borderRadius: "1px",
        }}
      />
      {text}
    </motion.span>
  );
}

/* Wavy hand-drawn underline SVG */
function WavyUnderline({ isInView, delay }) {
  return (
    <motion.svg
      viewBox="0 0 120 6"
      className="mx-auto mt-1"
      style={{ width: "100%", maxWidth: "120px", height: "6px", overflow: "visible" }}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 0.35 } : { opacity: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <motion.path
        d="M0 3 Q6 0.5, 12 3 T24 3 T36 3 T48 3 T60 3 T72 3 T84 3 T96 3 T108 3 T120 3"
        fill="none"
        stroke="#3b2f2f"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ delay: delay + 0.05, duration: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

/* Category group with header + wavy underline */
function CategoryGroup({ group, groupIndex, isInView }) {
  const groupDelay = groupIndex * 0.3;

  return (
    <div className="text-center" style={{ marginBottom: "60px" }}>
      {/* Category header */}
      <motion.div
        className="inline-block mb-5"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: groupDelay, duration: 0.3 }}
      >
        <h3
          className="text-sepia uppercase tracking-[4px] pb-1 text-sm"
          style={{ fontFamily: "'Special Elite', monospace" }}
        >
          {group.category}
        </h3>

        {/* Hand-drawn wavy underline */}
        <WavyUnderline isInView={isInView} delay={groupDelay + 0.15} />
      </motion.div>

      {/* Paper slip badges */}
      <div className="flex flex-wrap justify-center gap-4">
        {group.skills.map((skill, si) => (
          <StampBadge
            key={skill}
            text={skill}
            groupDelay={groupDelay + 0.2}
            badgeIndex={si}
            isInView={isInView}
          />
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  /* Total badges for tagline delay calculation */
  const totalBadges = skillGroups.reduce((sum, g) => sum + g.skills.length, 0);
  const taglineDelay = (skillGroups.length - 1) * 0.3 + totalBadges * 0.08 + 0.8;

  return (
    <section id="skills" className="relative px-6" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <PaperTexture className="absolute inset-0 paper-bg" />

      <div className="relative z-10 max-w-4xl mx-auto" ref={ref}>
        <WaxSeal />

        <motion.h2
          className="text-3xl md:text-4xl text-ink mb-14 text-center"
          style={{ fontFamily: "'IM Fell English', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Areas of Expertise
        </motion.h2>

        {/* Skill groups */}
        {skillGroups.map((group, gi) => (
          <CategoryGroup
            key={group.category}
            group={group}
            groupIndex={gi}
            isInView={isInView}
          />
        ))}

        {/* Tagline */}
        <motion.p
          className="text-center italic mt-4"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: "13px",
            color: "rgba(59, 47, 47, 0.4)",
          }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.4 } : { opacity: 0 }}
          transition={{ delay: taglineDelay, duration: 0.6 }}
        >
          — crafted with ink & intention —
        </motion.p>
      </div>
    </section>
  );
}
