"use client";

/*
 * PaperTexture — Realistic crumpled letter paper effect
 *
 * Two usage modes:
 *   <PaperTexture className="absolute inset-0 paper-bg" />   — per-section bg (noise + subtle grain)
 *   <PaperCreaseOverlay />                                   — global fixed overlay (crease lines)
 */

/* ─── Per-section background texture (noise grain only) ─── */
export default function PaperTexture({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Paper grain overlay via inline SVG data URI */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Content */}
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

/* ─── Global fixed crease overlay ─── */

/*
 * Each crease has 3 parts for realism:
 *   1. Dark crease line (the fold itself)
 *   2. Shadow line offset 1-2px to one side (depth)
 *   3. Highlight line offset 1-2px to the other side (light catching the ridge)
 */

const creaseColor = "rgba(90, 70, 50, 0.18)";
const shadowColor = "rgba(60, 40, 20, 0.10)";
const highlightColor = "rgba(255, 250, 240, 0.50)";
const cornerCreaseColor = "rgba(90, 70, 50, 0.13)";
const cornerShadowColor = "rgba(60, 40, 20, 0.07)";
const cornerHighlightColor = "rgba(255, 250, 240, 0.35)";

export function PaperCreaseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    >
      {/* Place your photo as /public/watermark.jpg to display as watermark */}
      <img
        src="/watermark.jpg"
        alt=""
        className="fixed pointer-events-none select-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "400px",
          objectFit: "cover",
          borderRadius: "50%",
          opacity: 0.10,
          filter: "grayscale(100%)",
          mixBlendMode: "multiply",
          zIndex: 0,
        }}
      />
      {/* SVG filter definition for crease drop shadows */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="crease-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="rgba(80,60,40,0.15)" />
          </filter>
          {/* Paper noise filter */}
          <filter id="paper-noise" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* ── Main crease lines SVG ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "url(#crease-shadow)" }}
      >
        {/* ═══ HORIZONTAL FOLD LINES (letter folded in thirds) ═══ */}

        {/* Horizontal fold 1 — top third (~33%) */}
        <path d="M 0,330 Q 200,327 400,332 Q 600,336 800,329 Q 1000,325 1200,333 Q 1400,337 1600,331"
          stroke={shadowColor} strokeWidth="1.2" fill="none" transform="translate(0, 1.5)" />
        <path d="M 0,330 Q 200,327 400,332 Q 600,336 800,329 Q 1000,325 1200,333 Q 1400,337 1600,331"
          stroke={creaseColor} strokeWidth="1.3" fill="none" />
        <path d="M 0,330 Q 200,327 400,332 Q 600,336 800,329 Q 1000,325 1200,333 Q 1400,337 1600,331"
          stroke={highlightColor} strokeWidth="0.8" fill="none" transform="translate(0, -1.5)" />

        {/* Horizontal fold 2 — bottom third (~66%) */}
        <path d="M 0,665 Q 250,668 500,662 Q 750,658 1000,666 Q 1250,671 1500,664 Q 1550,662 1600,665"
          stroke={shadowColor} strokeWidth="1.2" fill="none" transform="translate(0, 1.5)" />
        <path d="M 0,665 Q 250,668 500,662 Q 750,658 1000,666 Q 1250,671 1500,664 Q 1550,662 1600,665"
          stroke={creaseColor} strokeWidth="1.3" fill="none" />
        <path d="M 0,665 Q 250,668 500,662 Q 750,658 1000,666 Q 1250,671 1500,664 Q 1550,662 1600,665"
          stroke={highlightColor} strokeWidth="0.8" fill="none" transform="translate(0, -1.5)" />

        {/* ═══ VERTICAL CENTER FOLD (letter folded in half) ═══ */}

        <path d="M 800,0 Q 797,100 802,200 Q 805,300 798,400 Q 795,500 803,600 Q 806,700 799,800 Q 796,900 801,1000"
          stroke={shadowColor} strokeWidth="1.0" fill="none" transform="translate(1.5, 0)" />
        <path d="M 800,0 Q 797,100 802,200 Q 805,300 798,400 Q 795,500 803,600 Q 806,700 799,800 Q 796,900 801,1000"
          stroke={creaseColor} strokeWidth="1.2" fill="none" />
        <path d="M 800,0 Q 797,100 802,200 Q 805,300 798,400 Q 795,500 803,600 Q 806,700 799,800 Q 796,900 801,1000"
          stroke={highlightColor} strokeWidth="0.7" fill="none" transform="translate(-1.5, 0)" />

        {/* ═══ DIAGONAL CREASE LINES (paper crumpled and smoothed) ═══ */}

        {/* Diagonal 1 — top-left to center-right */}
        <path d="M 50,80 Q 300,200 550,350 Q 700,440 900,520 Q 1100,600 1350,680"
          stroke={shadowColor} strokeWidth="1.0" fill="none" transform="translate(1, 1)" />
        <path d="M 50,80 Q 300,200 550,350 Q 700,440 900,520 Q 1100,600 1350,680"
          stroke={creaseColor} strokeWidth="1.1" fill="none" />
        <path d="M 50,80 Q 300,200 550,350 Q 700,440 900,520 Q 1100,600 1350,680"
          stroke={highlightColor} strokeWidth="0.6" fill="none" transform="translate(-1, -1)" />

        {/* Diagonal 2 — top-right area sweeping down-left */}
        <path d="M 1400,50 Q 1200,180 1050,320 Q 900,450 750,580 Q 600,700 400,850"
          stroke={shadowColor} strokeWidth="1.0" fill="none" transform="translate(1, 1)" />
        <path d="M 1400,50 Q 1200,180 1050,320 Q 900,450 750,580 Q 600,700 400,850"
          stroke={creaseColor} strokeWidth="1.1" fill="none" />
        <path d="M 1400,50 Q 1200,180 1050,320 Q 900,450 750,580 Q 600,700 400,850"
          stroke={highlightColor} strokeWidth="0.6" fill="none" transform="translate(-1, -1)" />

        {/* Diagonal 3 — mid-left to bottom-right, shallower angle */}
        <path d="M 100,550 Q 350,580 600,620 Q 850,660 1100,720 Q 1300,770 1550,830"
          stroke={shadowColor} strokeWidth="0.9" fill="none" transform="translate(1, 1)" />
        <path d="M 100,550 Q 350,580 600,620 Q 850,660 1100,720 Q 1300,770 1550,830"
          stroke={creaseColor} strokeWidth="1.0" fill="none" />
        <path d="M 100,550 Q 350,580 600,620 Q 850,660 1100,720 Q 1300,770 1550,830"
          stroke={highlightColor} strokeWidth="0.6" fill="none" transform="translate(-1, -1)" />

        {/* Diagonal 4 — gentle crease across upper area */}
        <path d="M 200,150 Q 500,130 800,170 Q 1100,210 1400,180"
          stroke={shadowColor} strokeWidth="0.8" fill="none" transform="translate(0.8, 0.8)" />
        <path d="M 200,150 Q 500,130 800,170 Q 1100,210 1400,180"
          stroke={creaseColor} strokeWidth="0.9" fill="none" />
        <path d="M 200,150 Q 500,130 800,170 Q 1100,210 1400,180"
          stroke={highlightColor} strokeWidth="0.5" fill="none" transform="translate(-0.8, -0.8)" />

        {/* ═══ CORNER CRUMPLE CLUSTERS ═══ */}

        {/* ── Top-left corner crumples ── */}
        <g>
          <path d="M 0,0 Q 40,35 85,75" stroke={cornerShadowColor} strokeWidth="0.9" fill="none" transform="translate(1,1)" />
          <path d="M 0,0 Q 40,35 85,75" stroke={cornerCreaseColor} strokeWidth="1.0" fill="none" />
          <path d="M 0,0 Q 40,35 85,75" stroke={cornerHighlightColor} strokeWidth="0.5" fill="none" transform="translate(-1,-1)" />

          <path d="M 20,0 Q 50,25 70,60" stroke={cornerShadowColor} strokeWidth="0.8" fill="none" transform="translate(1,1)" />
          <path d="M 20,0 Q 50,25 70,60" stroke={cornerCreaseColor} strokeWidth="0.9" fill="none" />
          <path d="M 20,0 Q 50,25 70,60" stroke={cornerHighlightColor} strokeWidth="0.5" fill="none" transform="translate(-1,-1)" />

          <path d="M 0,30 Q 30,50 60,55" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(1,1)" />
          <path d="M 0,30 Q 30,50 60,55" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 0,30 Q 30,50 60,55" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(-1,-1)" />

          <path d="M 0,60 Q 25,65 45,50" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(1,1)" />
          <path d="M 0,60 Q 25,65 45,50" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 0,60 Q 25,65 45,50" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(-1,-1)" />

          <path d="M 55,0 Q 60,20 50,45" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(1,1)" />
          <path d="M 55,0 Q 60,20 50,45" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 55,0 Q 60,20 50,45" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(-1,-1)" />
        </g>

        {/* ── Bottom-right corner crumples ── */}
        <g>
          <path d="M 1600,1000 Q 1555,960 1510,920" stroke={cornerShadowColor} strokeWidth="0.9" fill="none" transform="translate(1,1)" />
          <path d="M 1600,1000 Q 1555,960 1510,920" stroke={cornerCreaseColor} strokeWidth="1.0" fill="none" />
          <path d="M 1600,1000 Q 1555,960 1510,920" stroke={cornerHighlightColor} strokeWidth="0.5" fill="none" transform="translate(-1,-1)" />

          <path d="M 1580,1000 Q 1560,975 1540,945" stroke={cornerShadowColor} strokeWidth="0.8" fill="none" transform="translate(1,1)" />
          <path d="M 1580,1000 Q 1560,975 1540,945" stroke={cornerCreaseColor} strokeWidth="0.9" fill="none" />
          <path d="M 1580,1000 Q 1560,975 1540,945" stroke={cornerHighlightColor} strokeWidth="0.5" fill="none" transform="translate(-1,-1)" />

          <path d="M 1600,965 Q 1570,955 1545,960" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(1,1)" />
          <path d="M 1600,965 Q 1570,955 1545,960" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 1600,965 Q 1570,955 1545,960" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(-1,-1)" />

          <path d="M 1600,935 Q 1575,940 1555,955" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(1,1)" />
          <path d="M 1600,935 Q 1575,940 1555,955" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 1600,935 Q 1575,940 1555,955" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(-1,-1)" />

          <path d="M 1545,1000 Q 1550,980 1560,960" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(1,1)" />
          <path d="M 1545,1000 Q 1550,980 1560,960" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 1545,1000 Q 1550,980 1560,960" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(-1,-1)" />
        </g>

        {/* ── Top-right corner crumples ── */}
        <g>
          <path d="M 1600,0 Q 1560,30 1525,70" stroke={cornerShadowColor} strokeWidth="0.9" fill="none" transform="translate(-1,1)" />
          <path d="M 1600,0 Q 1560,30 1525,70" stroke={cornerCreaseColor} strokeWidth="1.0" fill="none" />
          <path d="M 1600,0 Q 1560,30 1525,70" stroke={cornerHighlightColor} strokeWidth="0.5" fill="none" transform="translate(1,-1)" />

          <path d="M 1600,40 Q 1570,45 1550,35" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(-1,1)" />
          <path d="M 1600,40 Q 1570,45 1550,35" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 1600,40 Q 1570,45 1550,35" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(1,-1)" />

          <path d="M 1570,0 Q 1565,25 1555,50" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(-1,1)" />
          <path d="M 1570,0 Q 1565,25 1555,50" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 1570,0 Q 1565,25 1555,50" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(1,-1)" />

          <path d="M 1540,0 Q 1545,20 1560,40" stroke={cornerShadowColor} strokeWidth="0.7" fill="none" transform="translate(-1,1)" />
          <path d="M 1540,0 Q 1545,20 1560,40" stroke={cornerCreaseColor} strokeWidth="0.8" fill="none" />
          <path d="M 1540,0 Q 1545,20 1560,40" stroke={cornerHighlightColor} strokeWidth="0.4" fill="none" transform="translate(1,-1)" />
        </g>
      </svg>

      {/* ── Background noise grain (fixed, full viewport) ── */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
