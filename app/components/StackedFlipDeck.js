"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StackedFlipDeck — Stacked paper card deck with flip, auto-swap, and progress bar.
 *
 * Props:
 *   items        — array of data items
 *   renderCard   — (item, index) => JSX
 *   autoInterval — ms between auto-swaps (default 4000). Set 0 to disable.
 *   resumeDelay  — ms to wait after manual interaction before resuming auto (default 6000)
 */
export default function StackedFlipDeck({
  items,
  renderCard,
  autoInterval = 4000,
  resumeDelay = 6000,
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef(0);
  const lastManualTime = useRef(0);
  const n = items.length;

  /* ── Navigation ── */
  const goNext = useCallback(
    (manual = false) => {
      if (isFlipping) return;
      if (manual) lastManualTime.current = Date.now();
      setDirection(1);
      setIsFlipping(true);
      setProgress(0);
      setCurrent((p) => (p + 1) % n);
    },
    [isFlipping, n]
  );

  const goPrev = useCallback(() => {
    if (isFlipping) return;
    lastManualTime.current = Date.now();
    setDirection(-1);
    setIsFlipping(true);
    setProgress(0);
    setCurrent((p) => (p - 1 + n) % n);
  }, [isFlipping, n]);

  /* ── Touch / swipe ── */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goNext(true);
      else goPrev();
    }
  };

  /* ── Auto-swap timer with progress ── */
  useEffect(() => {
    if (!autoInterval || autoInterval <= 0) return;

    let raf;
    let startTime = Date.now();

    const tick = () => {
      const now = Date.now();
      const timeSinceManual = now - lastManualTime.current;
      const shouldPause = isPaused || timeSinceManual < resumeDelay;

      if (shouldPause) {
        startTime = now; // reset timer while paused
        setProgress(0);
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startTime;
      const pct = Math.min(elapsed / autoInterval, 1);
      setProgress(pct);

      if (pct >= 1) {
        goNext(false);
        startTime = now;
        setProgress(0);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoInterval, resumeDelay, isPaused, goNext]);

  /* ── Stack indices ── */
  const stack = [];
  for (let i = 0; i < Math.min(3, n); i++) {
    stack.push((current + i) % n);
  }

  const bgStyles = [
    null,
    { y: 10, x: 5, scale: 0.97, rotate: 1.2 },
    { y: 20, x: 10, scale: 0.94, rotate: 2 },
  ];

  const flipVariants = {
    enter: (dir) => ({
      rotateX: dir > 0 ? 60 : -60,
      y: dir > 0 ? "-80%" : "80%",
      opacity: 0,
    }),
    center: { rotateX: 0, y: 0, opacity: 1 },
    exit: (dir) => ({
      rotateX: dir > 0 ? -90 : 60,
      y: dir > 0 ? "-120%" : "80%",
      opacity: 0,
    }),
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Card stack */}
      <div
        className="relative w-full mx-auto"
        style={{ maxWidth: "560px", perspective: "1200px" }}
      >
        {/* Back card */}
        {stack.length >= 3 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 10,
              transform: `translateY(${bgStyles[2].y}px) translateX(${bgStyles[2].x}px) scale(${bgStyles[2].scale}) rotate(${bgStyles[2].rotate}deg)`,
            }}
          >
            {renderCard(items[stack[2]], stack[2])}
          </div>
        )}

        {/* Mid card */}
        {stack.length >= 2 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 20,
              transform: `translateY(${bgStyles[1].y}px) translateX(${bgStyles[1].x}px) scale(${bgStyles[1].scale}) rotate(${bgStyles[1].rotate}deg)`,
            }}
          >
            {renderCard(items[stack[1]], stack[1])}
          </div>
        )}

        {/* Top card — animated */}
        <AnimatePresence
          mode="popLayout"
          custom={direction}
          onExitComplete={() => setIsFlipping(false)}
        >
          <motion.div
            key={current}
            custom={direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            style={{
              zIndex: 30,
              position: "relative",
              transformStyle: "preserve-3d",
            }}
          >
            {renderCard(items[stack[0]], stack[0])}
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        {autoInterval > 0 && (
          <div
            className="mt-3 mx-auto rounded-full overflow-hidden"
            style={{
              height: "3px",
              background: "rgba(90, 70, 50, 0.10)",
              maxWidth: "560px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: "rgba(90, 70, 50, 0.40)",
                borderRadius: "999px",
                transition: progress === 0 ? "none" : "width 0.1s linear",
              }}
            />
          </div>
        )}
      </div>

      {/* Navigation: arrows + counter */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={goPrev}
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-sepia/30 text-sepia hover:bg-sepia/10 transition-colors cursor-pointer select-none"
          style={{ fontFamily: "'IM Fell English', serif", fontSize: "18px" }}
          aria-label="Previous"
        >
          ←
        </button>

        <span
          className="text-sepia-light text-sm tracking-[3px]"
          style={{ fontFamily: "'Special Elite', monospace" }}
        >
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(n).padStart(2, "0")}
        </span>

        <button
          onClick={() => goNext(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-sepia/30 text-sepia hover:bg-sepia/10 transition-colors cursor-pointer select-none"
          style={{ fontFamily: "'IM Fell English', serif", fontSize: "18px" }}
          aria-label="Next"
        >
          →
        </button>
      </div>
    </div>
  );
}
