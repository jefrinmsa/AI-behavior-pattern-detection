"use client";

import { useState, useCallback, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";

/*
 * Jagged torn-paper edge SVG path.
 * This path draws an irregular ripped edge on the LEFT side of a 60×1000 viewBox.
 * The right side, top, and bottom are straight edges so the overlay fills the screen.
 */
const tornEdgeSVG = (
  <svg
    className="absolute top-0 left-0 h-full"
    style={{ width: "60px", transform: "translateX(-59px)" }}
    viewBox="0 0 60 1000"
    preserveAspectRatio="none"
    fill="#f5f0e8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d={`
        M60 0
        L60 1000
        L0 1000
        L8 985 L2 970 L10 958 L4 942 L12 928 L3 912 L9 898
        L1 882 L11 868 L5 852 L13 838 L2 822 L8 808 L0 792
        L10 778 L4 762 L14 748 L6 732 L12 718 L1 702 L9 688
        L3 672 L11 658 L5 642 L13 628 L2 612 L8 598 L0 582
        L10 568 L4 552 L14 538 L6 522 L12 508 L1 492 L9 478
        L3 462 L11 448 L5 432 L13 418 L2 402 L8 388 L0 372
        L10 358 L4 342 L14 328 L6 312 L12 298 L1 282 L9 268
        L3 252 L11 238 L5 222 L13 208 L2 192 L8 178 L0 162
        L10 148 L4 132 L14 118 L6 102 L12 88 L1 72 L9 58
        L3 42 L11 28 L5 14 L8 0
        Z
      `}
    />
  </svg>
);

export default function useTransitionOverlay() {
  const controls = useAnimationControls();
  const isAnimating = useRef(false);

  const trigger = useCallback(
    (targetHref) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      // Start the sweep animation: left → center → right
      controls.start({
        x: ["-100%", "0%", "0%", "100%"],
        transition: {
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.4, 0.5, 1], // pause briefly at center
        },
      });

      // At the midpoint (~0.3s), jump to target section instantly
      setTimeout(() => {
        const el = document.querySelector(targetHref);
        if (el) {
          // Temporarily disable smooth scroll for instant jump
          document.documentElement.style.scrollBehavior = "auto";
          el.scrollIntoView({ behavior: "auto", block: "start" });
          // Restore smooth scroll after the jump
          requestAnimationFrame(() => {
            document.documentElement.style.scrollBehavior = "";
          });
        }
      }, 250);

      // Reset after animation completes
      setTimeout(() => {
        controls.set({ x: "-100%" });
        isAnimating.current = false;
      }, 650);
    },
    [controls]
  );

  const Overlay = useCallback(
    () => (
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9999,
          backgroundColor: "#f5f0e8",
        }}
        initial={{ x: "-100%" }}
        animate={controls}
      >
        {/* Torn paper edge on the left side */}
        {tornEdgeSVG}
      </motion.div>
    ),
    [controls]
  );

  return { trigger, Overlay };
}
