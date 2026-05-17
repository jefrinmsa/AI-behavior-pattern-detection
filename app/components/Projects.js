"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { projects } from "./LedgerData";
import PaperTexture from "./PaperTexture";

/* ── helpers ─────────────────────────────────────────── */
function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return m;
}

function Typewriter({ text, speed = 45, onDone }) {
  const [display, setDisplay] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    idx.current = 0;
    setDisplay("");
    const iv = setInterval(() => {
      idx.current++;
      setDisplay(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(iv);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, onDone]);
  return display;
}

/* ── decorative SVGs ─────────────────────────────────── */
function WavyUnderline() {
  return (
    <motion.svg viewBox="0 0 240 6" className="w-48 mt-1 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <motion.path
        d="M0 3Q6 0,12 3T24 3T36 3T48 3T60 3T72 3T84 3T96 3T108 3T120 3T132 3T144 3T156 3T168 3T180 3T192 3T204 3T216 3T228 3T240 3"
        fill="none" stroke="rgba(40,25,10,0.25)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.15 }}
      />
    </motion.svg>
  );
}

function PaperClip() {
  return (
    <svg className="absolute -top-2 right-4 w-6 h-14 opacity-20 pointer-events-none" viewBox="0 0 24 56" fill="none">
      <path d="M8 2v42a6 6 0 0012 0V10a4 4 0 00-8 0v30a2 2 0 004 0V14" stroke="#3b2f2f" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function QuillPen() {
  return (
    <svg className="w-12 h-12 opacity-15 mt-3" viewBox="0 0 48 48" fill="none">
      <path d="M38 4C28 10 20 22 16 32l-4 10 6-6c4-4 12-10 22-18" stroke="#3b2f2f" strokeWidth="1.2" fill="rgba(40,25,10,0.04)" />
      <path d="M12 42l2-6 4 4z" fill="rgba(40,25,10,0.15)" />
    </svg>
  );
}

/* ── index double-underline SVG ──────────────────────── */
function DoubleUnderline() {
  return (
    <svg viewBox="0 0 120 8" className="w-20 mx-auto mt-1 mb-1 opacity-30">
      <path d="M0 2Q4 0,8 2T16 2T24 2T32 2T40 2T48 2T56 2T64 2T72 2T80 2T88 2T96 2T104 2T112 2T120 2" fill="none" stroke="#28190a" strokeWidth="0.7" />
      <path d="M0 6Q4 4,8 6T16 6T24 6T32 6T40 6T48 6T56 6T64 6T72 6T80 6T88 6T96 6T104 6T112 6T120 6" fill="none" stroke="#28190a" strokeWidth="0.5" />
    </svg>
  );
}

/* ── LEFT PAGE ───────────────────────────────────────── */
function LeftPage({ selected, onSelect }) {
  return (
    <div
      className="relative h-full overflow-hidden"
      style={{
        background: "#f5edd8",
        backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 17px,rgba(40,25,10,0.04) 17px,rgba(40,25,10,0.04) 18px)",
        boxShadow: "inset -12px 0 20px rgba(0,0,0,0.08)",
        borderRadius: "4px 0 0 4px",
      }}
    >
      {/* page curl bottom-left */}
      <div className="absolute bottom-0 left-0 w-5 h-5 z-10" style={{ background: "linear-gradient(315deg, #f5edd8 45%, #ddd5c0 50%, transparent 55%)" }} />

      <div className="px-4 md:px-5 pt-5 pb-6 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-3">
          <p className="text-[10px] tracking-[4px] uppercase" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.4)" }}>INDEX</p>
          <DoubleUnderline />
          <p className="text-[9px] tracking-[1px]" style={{ fontFamily: "'Courier Prime',monospace", color: "rgba(40,25,10,0.3)" }}>~/jefrin/case-files</p>
        </div>

        {/* Entries */}
        <div className="flex-1">
          {projects.map((p, i) => {
            const isActive = selected === i;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(i)}
                className="w-full text-left flex items-center gap-2 transition-all duration-150 cursor-pointer group"
                style={{
                  padding: "12px 12px 12px 10px",
                  borderBottom: "1px dotted rgba(40,25,10,0.12)",
                  background: isActive ? "rgba(40,25,10,0.06)" : "transparent",
                  borderLeft: isActive ? "3px solid rgba(40,25,10,0.4)" : "3px solid transparent",
                }}
                aria-selected={isActive}
              >
                {/* ink dot */}
                <span className="w-2 text-[8px] flex-shrink-0" style={{ color: "rgba(40,25,10,0.5)" }}>
                  {isActive ? "●" : ""}
                </span>
                {/* number */}
                <span className="text-[10px] flex-shrink-0 w-6" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.4)" }}>
                  {p.num}
                </span>
                {/* name */}
                <span
                  className="flex-1 text-[13px] md:text-[14px] truncate group-hover:underline decoration-wavy decoration-[0.5px] underline-offset-2"
                  style={{
                    fontFamily: "'IM Fell English',serif",
                    color: isActive ? "#1a0f05" : "#2a1a0a",
                  }}
                >
                  {p.title}
                </span>
                {/* roman numeral */}
                <span className="text-[10px] flex-shrink-0 text-right w-5" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.4)" }}>
                  {p.roman}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] italic mt-3" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.25)" }}>
          — {projects.length} entries recorded —
        </p>
      </div>
    </div>
  );
}

/* ── RIGHT PAGE CONTENT ──────────────────────────────── */
function ProjectDetail({ project, index }) {
  const [titleDone, setTitleDone] = useState(false);
  const handleTitleDone = useCallback(() => setTitleDone(true), []);

  const metaLines = [
    { label: "type:", value: project.type },
    { label: "stack:", value: project.stack.join(" · ") },
    { label: "status:", value: project.status },
    { label: "filed:", value: project.filed },
  ];

  return (
    <div className="px-5 md:px-7 pt-5 pb-8 h-full flex flex-col relative overflow-hidden">
      <PaperClip />

      {/* Ink splatters */}
      <div className="absolute top-12 left-16 w-1 h-1 rounded-full bg-[rgba(40,25,10,0.06)]" />
      <div className="absolute top-14 left-20 w-0.5 h-0.5 rounded-full bg-[rgba(40,25,10,0.05)]" />
      <div className="absolute top-11 left-24 w-[3px] h-[3px] rounded-full bg-[rgba(40,25,10,0.04)]" />

      {/* CONFIDENTIAL watermark */}
      <div className="absolute bottom-12 left-4 text-[32px] font-bold tracking-[6px] pointer-events-none select-none" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(160,30,20,0.06)", transform: "rotate(-15deg)" }}>
        CONFIDENTIAL
      </div>

      {/* Case file header */}
      <p className="text-[10px] tracking-[3px] uppercase mb-1" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.4)" }}>
        CASE FILE #{project.num}
      </p>

      {/* Title — typewriter */}
      <h3 className="text-[20px] md:text-[22px] font-bold min-h-[30px]" style={{ fontFamily: "'IM Fell English',serif", color: "#1a0f05" }}>
        <Typewriter text={project.title} speed={45} onDone={handleTitleDone} />
      </h3>
      {titleDone && <WavyUnderline />}

      {/* Metadata block */}
      <AnimatePresence>
        {titleDone && (
          <motion.div className="mt-2 mb-4 space-y-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {metaLines.map((m, i) => (
              <motion.p
                key={m.label}
                className="text-[12px] leading-relaxed"
                style={{ fontFamily: "'Courier Prime',monospace" }}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <span style={{ color: "rgba(120,40,20,0.6)" }}>{"> "}</span>
                <span style={{ color: "#2a1a0a" }}>{m.label}</span>{" "}
                <span style={{ color: "rgba(40,25,10,0.7)" }}>{m.value}</span>
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
      <AnimatePresence>
        {titleDone && (
          <motion.p
            className="text-[13px] leading-[1.9] mt-1 flex-1"
            style={{ fontFamily: "'Courier Prime',monospace", color: "#2a1a0a" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {project.description}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tech badges */}
      <AnimatePresence>
        {titleDone && (
          <motion.div className="flex flex-wrap gap-2 mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            {project.stack.map((t, i) => (
              <motion.span
                key={t}
                className="text-[10px] px-2 py-0.5 border border-[rgba(40,25,10,0.25)] text-[#2a1a0a] uppercase tracking-[1px]"
                style={{ fontFamily: "'Special Elite',monospace", borderRadius: "2px 3px 2px 4px", opacity: 0.8 }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ delay: 0.75 + i * 0.07 }}
              >
                {t}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom action row */}
      <AnimatePresence>
        {titleDone && (
          <motion.div
            className="flex items-center justify-between mt-4 pt-3 border-t border-dotted border-[rgba(40,25,10,0.1)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {/* REVIEWED stamp */}
            <span className="text-[11px] tracking-[2px] uppercase" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,100,20,0.2)" }}>
              REVIEWED ✓
            </span>

            {/* GitHub / coming soon */}
            {project.github ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] px-3 py-1 uppercase tracking-[2px] border-2 border-[rgba(40,25,10,0.35)] hover:border-[rgba(40,25,10,0.6)] transition-all duration-200 hover:scale-95"
                style={{ fontFamily: "'Special Elite',monospace", color: "#2a1a0a", borderRadius: "2px", boxShadow: "inset 0 0 0 1px rgba(40,25,10,0.08)" }}
              >
                VIEW CODE ↗
              </a>
            ) : (
              <span className="text-[11px] tracking-[2px] uppercase italic" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.25)" }}>
                UPLOADING SOON
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page number bottom-right */}
      <div className="absolute bottom-3 right-5 text-[10px]" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.3)" }}>
        {project.roman}
      </div>

      {/* Dog ear bottom-right */}
      <div className="absolute bottom-0 right-0 w-5 h-5" style={{ background: "linear-gradient(135deg, transparent 45%, #e8e0cc 50%, #ddd5c0 55%)" }} />
    </div>
  );
}

/* ── RIGHT PAGE WRAPPER (with page flip) ─────────────── */
function RightPage({ selected }) {
  const project = selected >= 0 ? projects[selected] : null;

  return (
    <div
      className="relative h-full overflow-hidden"
      style={{
        background: "#faf5e8",
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(40,25,10,0.05) 27px,rgba(40,25,10,0.05) 28px)",
        boxShadow: "inset 12px 0 20px rgba(0,0,0,0.06)",
        borderRadius: "0 4px 4px 0",
        perspective: "1200px",
      }}
    >
      <AnimatePresence mode="wait">
        {project ? (
          <motion.div
            key={project.id}
            className="absolute inset-0"
            style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="h-full" style={{ background: "#faf5e8", backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(40,25,10,0.05) 27px,rgba(40,25,10,0.05) 28px)" }}>
              <ProjectDetail project={project} index={selected} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="h-full flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Diagonal watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[48px] font-bold tracking-[8px]" style={{ fontFamily: "'IM Fell English',serif", color: "rgba(40,25,10,0.04)", transform: "rotate(-20deg)" }}>CASE FILES</span>
            </div>
            <p className="text-[14px] italic relative z-10" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.25)" }}>← Select a case file</p>
            <QuillPen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── MOBILE VIEW ─────────────────────────────────────── */
function MobileView({ selected, onSelect }) {
  const project = selected >= 0 ? projects[selected] : null;
  return (
    <div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 pb-3 mb-4 border-b border-dotted border-[rgba(40,25,10,0.15)]" style={{ scrollbarWidth: "none" }}>
        {projects.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelect(i)}
            className="flex-shrink-0 px-3 py-2 text-[12px] transition-all duration-150 whitespace-nowrap"
            style={{
              fontFamily: "'Special Elite',monospace",
              background: selected === i ? "rgba(40,25,10,0.08)" : "transparent",
              borderBottom: selected === i ? "2px solid rgba(40,25,10,0.4)" : "2px solid transparent",
              color: selected === i ? "#1a0f05" : "rgba(40,25,10,0.5)",
            }}
          >
            {p.num} {p.title.split(" ").slice(0, 2).join(" ")}…
          </button>
        ))}
      </div>

      {/* Detail */}
      <div
        className="min-h-[400px] relative rounded"
        style={{
          background: "#faf5e8",
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(40,25,10,0.05) 27px,rgba(40,25,10,0.05) 28px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          perspective: "1200px",
        }}
      >
        <AnimatePresence mode="wait">
          {project && (
            <motion.div
              key={project.id}
              style={{ transformOrigin: "left center" }}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ProjectDetail project={project} index={selected} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── MAIN EXPORT ─────────────────────────────────────── */
export default function Projects() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [bookOpen, setBookOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const isMobile = useIsMobile();

  // Book open animation + auto-select first project
  useEffect(() => {
    if (isInView && !bookOpen) {
      const t = setTimeout(() => {
        setBookOpen(true);
        setTimeout(() => setSelected(0), 850);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [isInView, bookOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, projects.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      else if (e.key === "Escape") { setSelected(-1); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <section id="projects" className="relative py-20 md:py-28 px-4 md:px-6" ref={sectionRef}>
      <PaperTexture className="absolute inset-0 paper-bg" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl text-ink" style={{ fontFamily: "'IM Fell English',serif" }}>Case Files</h2>
          <p className="text-[12px] mt-2 italic" style={{ fontFamily: "'Special Elite',monospace", color: "rgba(40,25,10,0.35)" }}>— an open ledger of my work —</p>
        </motion.div>

        {/* ── MOBILE ── */}
        {isMobile && (
          <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}>
            <MobileView selected={selected < 0 ? 0 : selected} onSelect={setSelected} />
          </motion.div>
        )}

        {/* ── DESKTOP BOOK ── */}
        {!isMobile && (
          <div className="flex justify-center" style={{ perspective: "1200px" }}>
            {/* Desk shadow */}
            <div className="relative" style={{ filter: bookOpen ? "none" : "blur(0)" }}>
              {bookOpen && <div className="absolute -bottom-6 left-4 right-4 h-8 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.1) 0%, transparent 70%)" }} />}

              <div
                className="flex items-stretch"
                style={{
                  width: "min(860px, 90vw)",
                  height: "520px",
                  boxShadow: bookOpen
                    ? "-8px 8px 24px rgba(0,0,0,0.25), 8px 8px 24px rgba(0,0,0,0.2), 0 16px 48px rgba(0,0,0,0.15)"
                    : "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "box-shadow 0.8s",
                }}
              >
                {/* LEFT PAGE */}
                <motion.div
                  className="overflow-hidden"
                  style={{
                    width: "calc(50% - 10px)",
                    transformOrigin: "right center",
                    border: "10px solid #3a2208",
                    borderRight: "none",
                    borderRadius: "4px 0 0 4px",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%233a2208'/%3E%3Crect x='1' y='1' width='2' height='2' fill='%23432a10' opacity='0.3'/%3E%3C/svg%3E\")",
                    backgroundSize: "4px 4px",
                  }}
                  initial={{ rotateY: 90 }}
                  animate={bookOpen ? { rotateY: 0 } : { rotateY: 90 }}
                  transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <LeftPage selected={selected} onSelect={setSelected} />
                </motion.div>

                {/* SPINE */}
                <div
                  className="w-5 flex-shrink-0"
                  style={{
                    background: "linear-gradient(to right, #2a1a0a, #4a2e10, #3a2208, #2a1a0a)",
                    boxShadow: "0 0 12px rgba(0,0,0,0.4)",
                  }}
                />

                {/* RIGHT PAGE */}
                <motion.div
                  className="overflow-hidden"
                  style={{
                    width: "calc(50% - 10px)",
                    transformOrigin: "left center",
                    border: "10px solid #3a2208",
                    borderLeft: "none",
                    borderRadius: "0 4px 4px 0",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%233a2208'/%3E%3Crect x='1' y='1' width='2' height='2' fill='%23432a10' opacity='0.3'/%3E%3C/svg%3E\")",
                    backgroundSize: "4px 4px",
                  }}
                  initial={{ rotateY: -90 }}
                  animate={bookOpen ? { rotateY: 0 } : { rotateY: -90 }}
                  transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <RightPage selected={selected} />
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
