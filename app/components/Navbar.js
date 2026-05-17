"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Events", href: "#events" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ onNavigate }) {
  const [active, setActive] = useState("#hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = navLinks.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(`#${sections[i]}`);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = useCallback(
    (e, href) => {
      e.preventDefault();
      setMobileOpen(false);
      if (onNavigate) onNavigate(href);
      else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [onNavigate]
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "torn-edge-bottom pb-5" : "pb-2"
      }`}
      style={{
        background: scrolled
          ? "linear-gradient(180deg, #f5f0e8 60%, #ede8d0 100%)"
          : "transparent",
        boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleClick(e, "#hero")}
          className="text-sepia text-lg tracking-wider"
          style={{ fontFamily: "'IM Fell English', serif" }}
        >
          ✉ <span className="hidden sm:inline">Portfolio</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className={`text-sm tracking-wider transition-colors hover:text-sepia ${
                active === link.href ? "ink-underline text-sepia" : "text-sepia-light"
              }`}
              style={{ fontFamily: "'Special Elite', monospace" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            className="block w-5 h-[1.5px] bg-sepia origin-center"
            animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="block w-5 h-[1.5px] bg-sepia"
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className="block w-5 h-[1.5px] bg-sepia origin-center"
            animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
          />
        </button>
      </div>

      {/* Mobile menu — unfolds like a note */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #f5f0e8 0%, #ede8d0 100%)",
              transformOrigin: "top",
              perspective: "600px",
            }}
            initial={{ rotateX: -90, height: 0, opacity: 0 }}
            animate={{ rotateX: 0, height: "auto", opacity: 1 }}
            exit={{ rotateX: -90, height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="px-6 py-4 flex flex-col gap-3 border-t border-sepia/10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={`text-sm tracking-wider py-1 transition-colors ${
                    active === link.href ? "text-sepia font-bold" : "text-sepia-light"
                  }`}
                  style={{ fontFamily: "'Special Elite', monospace" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
