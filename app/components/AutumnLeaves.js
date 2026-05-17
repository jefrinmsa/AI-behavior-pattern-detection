"use client";

import { useEffect, useRef, useMemo, useState } from "react";

/* ── 6 SVG leaf shapes — delicate botanical style ── */
const leafShapes = [
  // 1 — Oval / Simple
  (c) => (
    <svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,1 C30,8 35,22 30,40 C26,52 20,59 20,59 C20,59 14,52 10,40 C5,22 10,8 20,1 Z"
        fill={c} fillOpacity="0.7" stroke={c} strokeWidth="0.5" />
      <path d="M20,4 Q20,30 20,57" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" fill="none" />
      <path d="M20,18 Q14,22 10,28" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none" />
      <path d="M20,25 Q26,28 30,35" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none" />
    </svg>
  ),
  // 2 — Maple-style
  (c) => (
    <svg viewBox="0 0 50 55" xmlns="http://www.w3.org/2000/svg">
      <path d="M25,1 C28,6 34,7 39,11 C35,13 36,18 34,21 C38,26 36,32 30,36 L27,52 C26,54 24,54 23,52 L20,36 C14,32 12,26 16,21 C14,18 15,13 11,11 C16,7 22,6 25,1 Z"
        fill={c} fillOpacity="0.7" stroke={c} strokeWidth="0.5" />
      <path d="M25,4 L25,52" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
    </svg>
  ),
  // 3 — Long narrow
  (c) => (
    <svg viewBox="0 0 20 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,1 C16,12 18,30 14,50 C12,60 10,69 10,69 C10,69 8,60 6,50 C2,30 4,12 10,1 Z"
        fill={c} fillOpacity="0.7" stroke={c} strokeWidth="0.5" />
      <path d="M10,3 L10,67" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
      <path d="M10,20 Q7,24 5,30" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
      <path d="M10,30 Q13,34 15,40" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
    </svg>
  ),
  // 4 — Pointed tip
  (c) => (
    <svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,1 C32,14 36,30 28,48 C24,56 20,59 20,59 C20,59 16,56 12,48 C4,30 8,14 20,1 Z"
        fill={c} fillOpacity="0.7" stroke={c} strokeWidth="0.5" />
      <path d="M20,4 C18,25 17,40 20,57" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
      <path d="M20,15 Q13,20 9,28" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" fill="none" />
      <path d="M20,22 Q27,26 31,34" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" fill="none" />
    </svg>
  ),
  // 5 — Asymmetric
  (c) => (
    <svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,58 C6,44 3,24 12,8 C18,2 32,4 36,18 C40,32 30,52 12,58 Z"
        fill={c} fillOpacity="0.7" stroke={c} strokeWidth="0.5" />
      <path d="M12,56 C14,40 16,24 18,8" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none" />
    </svg>
  ),
  // 6 — Small serrated
  (c) => (
    <svg viewBox="0 0 36 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M18,1 C24,8 28,16 26,28 C24,38 20,46 18,49 C16,46 12,38 10,28 C8,16 12,8 18,1 Z"
        fill={c} fillOpacity="0.7" stroke={c} strokeWidth="0.5" />
      <path d="M18,3 L18,47" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
      <path d="M18,12 Q13,16 10,22" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
      <path d="M18,18 Q23,22 26,28" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
    </svg>
  ),
];

const leafColors = [
  "rgba(139, 105, 20, 0.8)",
  "rgba(120, 80, 30, 0.8)",
  "rgba(90, 100, 50, 0.8)",
  "rgba(110, 70, 20, 0.8)",
  "rgba(100, 90, 40, 0.8)",
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function generateLeaves(count) {
  return Array.from({ length: count }, (_, i) => {
    // Size distribution: 60% small, 30% medium, 10% large
    const roll = Math.random();
    let size;
    if (roll < 0.6) size = rand(12, 18);
    else if (roll < 0.9) size = rand(18, 24);
    else size = rand(24, 28);

    return {
      id: i,
      leafType: Math.floor(Math.random() * 6),
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      size,
      startX: rand(2, 92),
      driftX: rand(-100, 100),
      duration: rand(10, 18),
      delay: rand(0, 20),
      startRotation: rand(-180, 180),
      endRotation: rand(-360, 360),
      opacity: rand(0.12, 0.32),
      swayAmount: rand(15, 40),
      swayDuration: rand(2.5, 4.5),
    };
  });
}

export default function AutumnLeaves({ heroRef }) {
  const [isMobile, setIsMobile] = useState(false);
  const leafRefs = useRef([]);
  const mousePos = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const leaves = useMemo(
    () => generateLeaves(isMobile ? 6 : 10),
    [isMobile]
  );

  /* Mouse repulsion — desktop only */
  useEffect(() => {
    if (isMobile) return;
    const hero = heroRef?.current;
    if (!hero) return;

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      leafRefs.current.forEach((leaf) => {
        if (!leaf) return;
        const lr = leaf.getBoundingClientRect();
        const cx = lr.left + lr.width / 2 - rect.left;
        const cy = lr.top + lr.height / 2 - rect.top;
        const dx = cx - mousePos.current.x;
        const dy = cy - mousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 120;

        if (dist < radius && dist > 0) {
          const force = (radius - dist) / radius;
          const rx = (dx / dist) * force * 60;
          const ry = (dy / dist) * force * 60;
          leaf.style.transform = `translate(${rx}px, ${ry}px) rotate(${force * 30}deg)`;
          leaf.style.transition = "transform 0.3s ease-out";
        } else {
          leaf.style.transform = "";
          leaf.style.transition = "transform 0.8s ease-out";
        }
      });
    };

    hero.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => hero.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, heroRef]);

  /* CSS keyframes */
  const keyframeCSS = useMemo(() => {
    return leaves.map((l) => `
      @keyframes leafFall${l.id} {
        0%   { transform: translateY(0) translateX(0px) rotate(${l.startRotation}deg); opacity: 0; }
        5%   { opacity: ${l.opacity}; }
        90%  { opacity: ${l.opacity}; }
        100% { transform: translateY(110vh) translateX(${l.driftX}px) rotate(${l.endRotation}deg); opacity: 0; }
      }
      @keyframes leafSway${l.id} {
        0%, 100% { transform: translateX(0px); }
        50%      { transform: translateX(${l.swayAmount}px); }
      }
    `).join("\n");
  }, [leaves]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <style>{keyframeCSS}</style>

      {leaves.map((l, i) => (
        <div
          key={l.id}
          style={{
            position: "absolute",
            left: `${l.startX}%`,
            top: "-100px",
            width: `${l.size}px`,
            height: `${l.size}px`,
            willChange: "transform",
            animation: `leafFall${l.id} ${l.duration}s ${l.delay}s linear infinite`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              animation: `leafSway${l.id} ${l.swayDuration}s ease-in-out infinite alternate`,
            }}
          >
            <div
              ref={(el) => { leafRefs.current[i] = el; }}
              style={{ width: "100%", height: "100%" }}
            >
              {leafShapes[l.leafType](l.color)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
