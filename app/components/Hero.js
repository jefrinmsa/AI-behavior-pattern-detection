"use client";

// Place your pencil sketch at /public/sketch.png
// Recommended: portrait orientation, white/light background,
// high resolution (min 800px wide)

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AutumnLeaves from "./AutumnLeaves";

const heroName = "JEFRIN M S A";
const heroLetters = heroName.split("");

/* ── Enhancement 1: Floating Ink Elements ── */
const inkElements = [
  { id: "quill", x: "72%", y: "15%", delay: 0, dur: 4.2, hideMobile: true },
  { id: "drop1", x: "12%", y: "25%", delay: 0.8, dur: 3.6, hideMobile: false },
  { id: "drop2", x: "8%", y: "72%", delay: 1.5, dur: 4.8, hideMobile: true },
  { id: "star1", x: "85%", y: "20%", delay: 2.1, dur: 3.2, hideMobile: true },
  { id: "star2", x: "18%", y: "45%", delay: 0, dur: 3.9, hideMobile: false },
  { id: "star3", x: "78%", y: "78%", delay: 2.7, dur: 4.5, hideMobile: true },
  { id: "wax", x: "48%", y: "78%", delay: 1.5, dur: 4.0, hideMobile: false },
];

function FloatingInkElements({ show }) {
  return (
    <>
      {/* Quill Pen */}
      <motion.div
        className="absolute pointer-events-none hidden md:block"
        style={{ left: "72%", top: "15%", zIndex: 2, transform: "rotate(-35deg)" }}
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 3.5 }}
      >
        <div style={{ animation: "inkFloat0 4.2s ease-in-out infinite" }}>
          <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
            <path d="M16 2 C22 8 28 18 24 30 L16 46 L8 30 C4 18 10 8 16 2Z" fill="rgba(40,25,10,0.18)" />
            <path d="M16 46 L14 36 L16 32 L18 36Z" fill="rgba(40,25,10,0.28)" />
            <path d="M16 2 C16 2 20 10 18 20" stroke="rgba(40,25,10,0.12)" strokeWidth="1" />
          </svg>
        </div>
      </motion.div>

      {/* Ink Drop 1 */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: "12%", top: "25%", zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 3.5 }}
      >
        <div style={{ animation: "inkFloat1 3.6s ease-in-out infinite" }}>
          <svg width="10" height="14" viewBox="0 0 10 14">
            <path d="M5 0 C5 0 10 6 10 9 A5 5 0 0 1 0 9 C0 6 5 0 5 0Z" fill="rgba(26,26,46,0.15)" />
          </svg>
        </div>
      </motion.div>

      {/* Ink Drop 2 */}
      <motion.div
        className="absolute pointer-events-none hidden md:block"
        style={{ left: "8%", top: "72%", zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 3.5 }}
      >
        <div style={{ animation: "inkFloat2 4.8s ease-in-out infinite" }}>
          <svg width="14" height="18" viewBox="0 0 14 18">
            <path d="M7 0 C7 0 14 8 14 12 A7 7 0 0 1 0 12 C0 8 7 0 7 0Z" fill="rgba(26,26,46,0.12)" />
          </svg>
        </div>
      </motion.div>

      {/* Stars */}
      {[["85%","20%","inkFloat3 3.2s"],["18%","45%","inkFloat0 3.9s"],["78%","78%","inkFloat1 4.5s"]].map(([x,y,anim],i) => (
        <motion.div
          key={`star-${i}`}
          className={`absolute pointer-events-none ${i!==1?"hidden md:block":""}`}
          style={{ left: x, top: y, zIndex: 2 }}
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 3.5 }}
        >
          <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:"10px", color:"rgba(40,25,10,0.2)", animation:`${anim} ease-in-out infinite`, display:"block" }}>✳</span>
        </motion.div>
      ))}

      {/* Wax Seal */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: "48%", top: "78%", zIndex: 2, transform: "rotate(12deg)" }}
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 3.5 }}
      >
        <div style={{ animation: "inkFloat2 4.0s ease-in-out infinite" }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="13" stroke="rgba(120,40,20,0.2)" strokeWidth="1.5" fill="rgba(120,40,20,0.08)" />
            <circle cx="14" cy="14" r="9" stroke="rgba(120,40,20,0.15)" strokeWidth="1" fill="none" />
            <text x="14" y="19" textAnchor="middle" fontSize="11" fontWeight="bold" fill="rgba(120,40,20,0.3)" style={{fontFamily:"serif"}}>J</text>
          </svg>
        </div>
      </motion.div>
    </>
  );
}

/* ── Enhancement 4: Postage Stamp Social Links ── */
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(40,25,10,0.75)">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(40,25,10,0.75)">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(40,25,10,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const stamps = [
  { href: "https://github.com/jefrinmsa", Icon: GitHubIcon, label: "GITHUB", rot: "-2deg", delay: 3.6 },
  { href: "https://www.linkedin.com/in/jefrin-m-s-a-632807328/", Icon: LinkedInIcon, label: "LINKEDIN", rot: "1deg", delay: 3.75 },
  { href: "mailto:jefrin.28csa@licet.ac.in", Icon: EmailIcon, label: "EMAIL", rot: "-1deg", delay: 3.9 },
];

function PostageStamps({ show }) {
  return (
    <div
      className="absolute flex gap-3 md:bottom-12 bottom-16 md:left-[6%] left-1/2"
      style={{ transform: "translateX(-50%)", zIndex: 20 }}
    >
      <style>{`
        @media(min-width:768px){.stamps-wrap{left:6%;transform:none;}}
        .stamp-link:hover .stamp-inner{transform:scale(1.1) rotate(0deg)!important;box-shadow:4px 4px 14px rgba(0,0,0,0.22)!important;}
      `}</style>
      {stamps.map(({ href, Icon, label, rot, delay }, i) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="stamp-link"
          style={{ display: "block" }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={show ? { scaleY: 1, opacity: 1 } : {}}
          transition={{ duration: 0.35, delay, ease: "easeOut" }}
        >
          <div
            className="stamp-inner"
            style={{
              width: "52px", height: "62px",
              background: "#faf6ed",
              border: "2px solid rgba(40,25,10,0.5)",
              outline: "1px dashed rgba(40,25,10,0.3)",
              outlineOffset: "-5px",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.12)",
              transform: `rotate(${rot})`,
              transition: "transform 200ms ease, box-shadow 200ms ease",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "4px", position: "relative", overflow: "hidden",
            }}
          >
            <svg style={{position:"absolute",inset:0,opacity:0.08}} viewBox="0 0 52 62">
              <circle cx="26" cy="28" r="22" stroke="rgba(40,25,10,1)" strokeWidth="18" fill="none" />
            </svg>
            <Icon />
            <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:"7px", color:"rgba(40,25,10,0.7)", letterSpacing:"1px", fontWeight:700 }}>{label}</span>
          </div>
        </motion.a>
      ))}
    </div>
  );
}

/* ── Pencil scratch line data (Phase 1) ── */
const scratchLines = [
  { x1: "15%", y1: "20%", x2: "35%", y2: "30%", delay: 0 },
  { x1: "60%", y1: "15%", x2: "80%", y2: "25%", delay: 0.08 },
  { x1: "25%", y1: "70%", x2: "50%", y2: "60%", delay: 0.16 },
  { x1: "70%", y1: "65%", x2: "90%", y2: "55%", delay: 0.24 },
];

/* ── Postmark Stamp ── */
function PostmarkStamp({ show }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none hidden md:block"
      style={{ top: "35%", left: "38%", zIndex: 15 }}
      initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
      animate={show ? { opacity: 0.25, scale: 1, rotate: -5 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <svg width="140" height="140" viewBox="0 0 160 160" fill="none">
        <circle cx="80" cy="80" r="65" stroke="#3b2f2f" strokeWidth="3" strokeDasharray="6 3" />
        <circle cx="80" cy="80" r="50" stroke="#3b2f2f" strokeWidth="1.5" />
        <line x1="20" y1="80" x2="140" y2="80" stroke="#3b2f2f" strokeWidth="1.5" />
        <text x="80" y="68" textAnchor="middle" fill="#3b2f2f" fontSize="11"
          style={{ fontFamily: "'Special Elite', monospace" }}>FIRST CLASS</text>
        <text x="80" y="100" textAnchor="middle" fill="#3b2f2f" fontSize="9"
          style={{ fontFamily: "'Special Elite', monospace" }}>2025 · PORTFOLIO</text>
      </svg>
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);
  // 0=idle, 1=scratches, 2=diagonal wipe, 3=hatching, 4=grain settle, 5=text
  const [textReady, setTextReady] = useState(false);
  const [nameComplete, setNameComplete] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [inkReady, setInkReady] = useState(false);     // Enhancement 1 & 2
  const [showUnderline, setShowUnderline] = useState(false); // Enhancement 3
  const [stampsReady, setStampsReady] = useState(false);     // Enhancement 4
  const [particles, setParticles] = useState([]);            // Enhancement 5

  // Suppress hydration: only run phase animations after mount
  useEffect(() => setMounted(true), []);

  /* Phase sequencing — only after mount */
  useEffect(() => {
    if (!mounted) return;
    const timers = [];
    const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); };

    t(() => setPhase(1), 50);        // scratches
    t(() => setPhase(2), 400);       // diagonal wipe
    t(() => setPhase(3), 900);       // hatching layers
    t(() => setPhase(4), 2200);      // grain settle
    t(() => { setPhase(5); setTextReady(true); }, 2600); // text

    return () => timers.forEach(clearTimeout);
  }, [mounted]);

  /* Name stamp-down: mark complete after all letters land */
  useEffect(() => {
    if (!textReady) return;
    const delay = 300 + heroLetters.length * 60 + 200;
    const t = setTimeout(() => setNameComplete(true), delay);
    return () => clearTimeout(t);
  }, [textReady]);

  /* All done: after role + tagline + stamp */
  useEffect(() => {
    if (!nameComplete) return;
    const t = setTimeout(() => setAllDone(true), 1200);
    return () => clearTimeout(t);
  }, [nameComplete]);

  /* Enhancement 3: name underline — fires after name lands */
  useEffect(() => {
    if (!nameComplete) return;
    const t = setTimeout(() => setShowUnderline(true), 100);
    return () => clearTimeout(t);
  }, [nameComplete]);

  /* Enhancements 1 & 2: ink elements + stamps at 3500ms after mount */
  useEffect(() => {
    if (!mounted) return;
    const t1 = setTimeout(() => setInkReady(true), 3500);
    const t2 = setTimeout(() => setStampsReady(true), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [mounted]);

  /* Enhancement 5: pencil dust particles at 2200ms */
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      const count = 14;
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 1 + Math.random() * 2,
        x: 55 + Math.random() * 30,
        y: 60 + Math.random() * 20,
        dy: -(60 + Math.random() * 60),
        dx: -20 + Math.random() * 40,
        opacity: 0.1 + Math.random() * 0.2,
        dur: 1.2 + Math.random() * 1.2,
        delay: Math.random() * 400,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 4800);
    }, 2200);
    return () => clearTimeout(t);
  }, [mounted]);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "600px" }}
    >
      {/* ── CSS keyframes for floating ink elements ── */}
      <style>{`
        @keyframes inkFloat0 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes inkFloat1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-2deg)} }
        @keyframes inkFloat2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes inkFloat3 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-2deg)} }
        @keyframes dateLineGrow { from{width:0} to{width:180px} }
        @keyframes dustRise { from{opacity:var(--op);transform:translate(0,0)} to{opacity:0;transform:translate(var(--dx),var(--dy))} }
      `}</style>

      {/* Parchment base */}
      <div className="absolute inset-0 paper-bg" style={{ zIndex: 0 }} />

      {/* ── Enhancement 2: Date / Location Header ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: "24px", right: "48px", zIndex: 20, textAlign: "right" }}
        initial={{ opacity: 0 }}
        animate={inkReady ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0 }}
      >
        <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:"11px", letterSpacing:"3px", color:"rgba(40,25,10,0.45)", textTransform:"uppercase", margin:0 }}>
          Chennai, Tamil Nadu &mdash; May 2026
        </p>
        {inkReady && (
          <div style={{ height:"1px", background:"rgba(40,25,10,0.15)", marginTop:"4px", marginLeft:"auto", animation:"dateLineGrow 600ms ease-out forwards" }} />
        )}
      </motion.div>

      {/* ── Enhancement 5: Pencil Dust Particles ── */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: "50%",
            background: `rgba(40,25,10,${p.opacity})`,
            zIndex: 5,
            "--op": p.opacity,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            animation: `dustRise ${p.dur}s ease-out ${p.delay}ms forwards`,
          }}
        />
      ))}

      {/* ── Autumn Leaves ── */}
      <AutumnLeaves heroRef={heroRef} />

      {/* ── Enhancement 1: Floating Ink Elements ── */}
      <FloatingInkElements show={inkReady} />

      {/* ══ Phase 1: Pencil scratch flickers ══ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 6 }}
      >
        {scratchLines.map((l, i) => (
          <motion.line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgba(40, 25, 10, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={
              phase >= 1
                ? { opacity: [0, 0.4, 0], transition: { delay: l.delay, duration: 0.08, times: [0, 0.5, 1] } }
                : {}
            }
          />
        ))}
      </svg>

      {/* ══ Sketch image — right side with left fade mask ══ */}
      <motion.img
        src="/sketch.png"
        alt=""
        loading="eager"
        fetchPriority="high"
        className="absolute pointer-events-none select-none hidden md:block"
        style={{
          right: "6%",
          bottom: 0,
          height: "78vh",
          maxHeight: "100vh",
          width: "auto",
          maxWidth: "min(40vw, 480px)",
          minWidth: 0,
          objectFit: "contain",
          objectPosition: "center center",
          filter: "grayscale(100%)",
          mixBlendMode: "multiply",
          zIndex: 2,
          /* Left edge fade mask for artistic text overlap */
          maskImage: "linear-gradient(to right, transparent 0%, black 15%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%)",
          /* Phase 2: diagonal clip-path wipe */
          clipPath: phase >= 2
            ? "polygon(0 0, 110% 0, 110% 100%, 0 100%)"
            : "polygon(0 0, 0 0, 0 100%, 0 100%)",
          transition: "clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        /* Phase 3: hatching opacity/blur layers */
        initial={{ opacity: 0, filter: "grayscale(100%) blur(8px)" }}
        animate={
          phase >= 3
            ? {
                opacity: [0.2, 0.5, 0.8, 1],
                filter: [
                  "grayscale(100%) blur(8px)",
                  "grayscale(100%) blur(4px)",
                  "grayscale(100%) blur(1px) brightness(1.15)",
                  "grayscale(100%) blur(0px) brightness(1)",
                ],
              }
            : phase >= 2
            ? { opacity: 0.15, filter: "grayscale(100%) blur(8px)" }
            : {}
        }
        transition={
          phase >= 3
            ? {
                opacity: { duration: 1.1, times: [0, 0.3, 0.6, 1], ease: "easeIn" },
                filter: { duration: 1.1, times: [0, 0.3, 0.6, 1], ease: "easeIn" },
              }
            : { duration: 0.3 }
        }
      />

      {/* Mobile sketch */}
      <motion.img
        src="/sketch.png"
        alt=""
        loading="eager"
        className="absolute inset-0 w-full h-full pointer-events-none select-none block md:hidden"
        style={{
          objectFit: "contain",
          objectPosition: "center center",
          filter: "grayscale(100%)",
          mixBlendMode: "multiply",
          zIndex: 2,
        }}
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 0.3 } : {}}
        transition={{ duration: 1.5, ease: "easeIn" }}
      />

      {/* Idle breathing pulse on sketch (after phase 5) */}
      {allDone && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 3, mixBlendMode: "soft-light" }}
          animate={{ opacity: [0, 0.04, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full" style={{ background: "rgba(245,240,232,0.5)" }} />
        </motion.div>
      )}

      {/* ══ Phase 2: Pencil tip gleam (travels with diagonal wipe) ══ */}
      {phase === 2 && (
        <motion.div
          className="absolute pointer-events-none hidden md:block"
          style={{
            top: 0,
            height: "100%",
            width: "3px",
            background: "linear-gradient(to bottom, rgba(245,240,232,0.9) 0%, rgba(245,240,232,0.3) 50%, rgba(245,240,232,0.9) 100%)",
            zIndex: 4,
          }}
          initial={{ left: "55%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      )}

      {/* ══ Phase 4: Paper grain settle ══ */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: [0, 0.06, 0.03] } : {}}
        transition={{ duration: 0.4, times: [0, 0.5, 1] }}
      />

      {/* Vignette — darkens after sketch settles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: `radial-gradient(ellipse at center,
            rgba(245,240,232,0) 40%,
            rgba(245,240,232,0.5) 75%,
            rgba(245,240,232,0.8) 100%)`,
        }}
        initial={{ opacity: 0.5 }}
        animate={phase >= 4 ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
      />

      {/* ══ Phase 5: Text content — left side ══ */}
      <div
        className="absolute px-6 md:px-0"
        style={{
          left: "6%",
          top: "42%",
          transform: "translateY(-50%)",
          zIndex: 20,
          maxWidth: "600px",
        }}
      >
        {/* "Hello, I'm" — fade in */}
        <motion.p
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: "14px",
            letterSpacing: "4px",
            color: "#1a1a2e",
            marginBottom: "8px",
          }}
          initial={{ opacity: 0 }}
          animate={textReady ? { opacity: 0.85 } : {}}
          transition={{ duration: 0.3 }}
        >
          Hello, I&apos;m
        </motion.p>

        {/* Name — each letter stamps down from above */}
        <h1
          style={{
            fontFamily: "'Playfair Display', 'IM Fell English', serif",
            fontSize: "clamp(42px, 6vw, 80px)",
            fontWeight: 900,
            color: "#1a1a2e",
            lineHeight: 1.05,
            textShadow:
              "1px 1px 0 rgba(245,240,232,0.9), 2px 2px 8px rgba(245,240,232,0.7)",
            minHeight: "clamp(46px, 6vw, 84px)",
            letterSpacing: "0.03em",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {heroLetters.map((letter, i) => (
            <motion.span
              key={i}
              style={{ display: "inline-block", whiteSpace: "pre" }}
              initial={{ opacity: 0, y: -8 }}
              animate={textReady ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.3 + i * 0.06,
                duration: 0.12,
                ease: "easeOut",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        {/* ── Enhancement 3: Hand-drawn wavy underline on name ── */}
        <motion.div
          style={{ marginTop: "4px", marginBottom: "4px", overflow: "hidden" }}
          initial={{ opacity: 0 }}
          animate={nameComplete ? { opacity: 1 } : {}}
          transition={{ duration: 0.2 }}
        >
          <svg width="100%" height="12" viewBox="0 0 580 12" preserveAspectRatio="none">
            <motion.path
              d="M0,6 C30,2 60,10 90,6 C120,2 150,10 180,6 C210,2 240,10 270,6 C300,2 330,10 360,6 C390,2 420,10 450,6 C480,2 510,10 540,6 C555,4 568,7 580,6"
              stroke="rgba(26,26,46,0.7)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={showUnderline ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
        </motion.div>

        {/* Role — slides in from left */}
        <motion.p
          style={{
            fontFamily: "'Special Elite', monospace",
            fontSize: "16px",
            color: "#2a1a0a",
            letterSpacing: "2px",
            marginTop: "12px",
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={nameComplete ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Web3 Enthusiast &amp; Aspiring Data Analyst
        </motion.p>

        {/* Tagline — fades up */}
        <motion.p
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: "13px",
            fontStyle: "italic",
            color: "#3b2f2f",
            marginTop: "8px",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={nameComplete ? { opacity: 0.8, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          — turning raw data into meaningful stories, one commit at a time.
        </motion.p>

        {/* Download CV — stamped document button */}
        {/* Place your CV as /public/cv.pdf to enable download */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={nameComplete ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.6 }}
          style={{ marginTop: "24px" }}
        >
          <a
            href="/cv.pdf"
            download
            className="inline-flex items-center gap-2 relative group"
            style={{
              padding: "10px 28px",
              border: "2px solid rgba(40,25,10,0.55)",
              borderRadius: "2px",
              fontFamily: "'Courier Prime', monospace",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#2a1a0a",
              background: "transparent",
              textDecoration: "none",
              transition: "all 250ms ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(40,25,10,0.05)";
              el.style.boxShadow = "0 0 8px rgba(40,25,10,0.15)";
              el.style.transform = "scale(0.96)";
              setTimeout(() => { el.style.transform = "scale(1.02)"; }, 100);
              setTimeout(() => { el.style.transform = "scale(1)"; }, 200);
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "transparent";
              el.style.boxShadow = "none";
              el.style.transform = "scale(1)";
            }}
          >
            {/* Inner dashed border */}
            <span
              className="absolute inset-[4px] pointer-events-none"
              style={{ border: "1px dashed rgba(40,25,10,0.25)", borderRadius: "1px" }}
            />
            {/* Document icon */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 1h6l4 4v10H4V1z" stroke="rgba(40,25,10,0.7)" strokeWidth="1" fill="none" />
              <path d="M10 1v4h4" stroke="rgba(40,25,10,0.5)" strokeWidth="1" fill="none" />
              <path d="M6 8h6M6 10.5h6M6 13h3" stroke="rgba(40,25,10,0.4)" strokeWidth="0.8" />
            </svg>
            DOWNLOAD CV&ensp;↓
          </a>
        </motion.div>

        {/* Decorative ink divider ————◆———— */}
        <motion.div
          style={{ margin: "20px 0" }}
          initial={{ opacity: 0 }}
          animate={nameComplete ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <svg width="120" height="10" viewBox="0 0 120 10">
            <motion.path
              d="M60 5 L0 5"
              stroke="rgba(40,25,10,0.2)" strokeWidth="1" fill="none"
              initial={{ pathLength: 0 }}
              animate={nameComplete ? { pathLength: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            />
            <motion.path
              d="M60 5 L120 5"
              stroke="rgba(40,25,10,0.2)" strokeWidth="1" fill="none"
              initial={{ pathLength: 0 }}
              animate={nameComplete ? { pathLength: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            />
            <motion.polygon
              points="60,1 64,5 60,9 56,5"
              fill="rgba(40,25,10,0.2)"
              initial={{ opacity: 0 }}
              animate={nameComplete ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.4 }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Postmark stamp — rotates in */}
      <PostmarkStamp show={nameComplete} />

      {/* ── Enhancement 4: Postage Stamp Social Links ── */}
      <PostageStamps show={stampsReady} />

      {/* ══ Scroll indicator ══ */}
      {allDone && (
        <motion.p
          className="absolute left-1/2"
          style={{
            bottom: "36px",
            transform: "translateX(-50%)",
            fontFamily: "'Courier Prime', monospace",
            fontStyle: "italic",
            fontSize: "12px",
            color: "#1a1a2e",
            zIndex: 20,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 0.55,
            y: [0, 8, 0],
          }}
          transition={{
            opacity: { duration: 0.4 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          scroll to read more ↓
        </motion.p>
      )}
    </section>
  );
}
