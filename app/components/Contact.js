"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import PaperTexture from "./PaperTexture";

/* Wavy divider */
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

/* Postage stamp social links */
const socials = [
  { label: "GitHub", icon: "GH", href: "https://github.com/jefrinmsa" },
  { label: "LinkedIn", icon: "in", href: "https://www.linkedin.com/in/jefrin-m-s-a-632807328/" },
  { label: "Email", icon: "✉", href: "mailto:jefrin.28csa@licet.ac.in" },
];

function PostageStamp({ social }) {
  return (
    <a
      href={social.href}
      className="inline-flex flex-col items-center justify-center w-16 h-20 bg-parchment-dark border border-sepia/15 shadow-[1px_2px_6px_rgba(0,0,0,0.08)] relative group transition-transform hover:-translate-y-1"
    >
      {/* Perforated border effect */}
      <div className="absolute inset-0 m-0.5 border-2 border-dashed border-sepia/10" />
      <span
        className="text-sepia text-lg font-bold"
        style={{ fontFamily: "'IM Fell English', serif" }}
      >
        {social.icon}
      </span>
      <span
        className="text-sepia-light text-[9px] mt-1 tracking-wider uppercase"
        style={{ fontFamily: "'Special Elite', monospace" }}
      >
        {social.label}
      </span>
    </a>
  );
}

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [sealPressed, setSealPressed] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSealPressed(true);
    setTimeout(() => {
      setSealPressed(false);
      alert("Letter sent! (Placeholder — connect your backend.)");
      setFormData({ name: "", email: "", message: "" });
    }, 600);
  };

  return (
    <section id="contact" className="relative py-20 md:py-28 px-6">
      <PaperTexture className="absolute inset-0 paper-bg" />

      <div className="relative z-10 max-w-3xl mx-auto" ref={ref}>
        <WavyDivider />

        <motion.h2
          className="text-3xl md:text-4xl text-ink mb-4 text-center"
          style={{ fontFamily: "'IM Fell English', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Send a Letter
        </motion.h2>

        <motion.p
          className="text-center text-sepia-light text-sm italic mb-12"
          style={{ fontFamily: "'IM Fell English', serif" }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          I would be delighted to hear from you. Do write.
        </motion.p>

        {/* Letter/envelope form */}
        <motion.form
          onSubmit={handleSubmit}
          className="relative max-w-lg mx-auto p-8 md:p-10"
          style={{
            background: "linear-gradient(170deg, #f5f0e8 0%, #ede8d0 100%)",
            boxShadow: "3px 4px 16px rgba(0,0,0,0.08), inset 0 0 30px rgba(0,0,0,0.03)",
            transform: "rotate(-0.3deg)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* To line */}
          <p
            className="text-sepia-light text-xs tracking-[3px] uppercase mb-8"
            style={{ fontFamily: "'Special Elite', monospace" }}
          >
            To: Jefrin M S A
          </p>

          {/* Name field */}
          <div className="mb-6">
            <label
              className="block text-sepia-light text-xs tracking-[2px] uppercase mb-1"
              style={{ fontFamily: "'Special Elite', monospace" }}
            >
              From
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              required
              className="w-full bg-transparent border-0 border-b border-sepia/20 py-2 text-sepia text-sm focus:outline-none focus:border-sepia/40 transition-colors placeholder:text-sepia/30"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            />
          </div>

          {/* Email field */}
          <div className="mb-6">
            <label
              className="block text-sepia-light text-xs tracking-[2px] uppercase mb-1"
              style={{ fontFamily: "'Special Elite', monospace" }}
            >
              Return Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jefrin.28csa@licet.ac.in"
              required
              className="w-full bg-transparent border-0 border-b border-sepia/20 py-2 text-sepia text-sm focus:outline-none focus:border-sepia/40 transition-colors placeholder:text-sepia/30"
              style={{ fontFamily: "'Courier Prime', monospace" }}
            />
          </div>

          {/* Message field */}
          <div className="mb-8">
            <label
              className="block text-sepia-light text-xs tracking-[2px] uppercase mb-1"
              style={{ fontFamily: "'Special Elite', monospace" }}
            >
              Your Message
            </label>
            <textarea
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Dear friend, I am writing to..."
              required
              className="w-full bg-transparent border-0 border-b border-sepia/20 py-2 text-sepia text-sm focus:outline-none focus:border-sepia/40 transition-colors resize-none placeholder:text-sepia/30"
              style={{
                fontFamily: "'Courier Prime', monospace",
                backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(59,47,47,0.06) 27px, rgba(59,47,47,0.06) 28px)",
                backgroundAttachment: "local",
                lineHeight: "28px",
              }}
            />
          </div>

          {/* Wax seal send button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                sealPressed ? "seal-press" : ""
              }`}
              style={{
                background: "radial-gradient(circle at 40% 35%, #b84420, #8b2500 40%, #6b1d00 80%)",
                boxShadow: sealPressed
                  ? "0 0 20px rgba(139,37,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)"
                  : "0 3px 10px rgba(139,37,0,0.3), inset 0 2px 4px rgba(255,255,255,0.15)",
                border: "none",
              }}
              title="Send your letter"
            >
              <span
                className="text-xl font-bold text-parchment select-none"
                style={{ fontFamily: "'IM Fell English', serif" }}
              >
                S
              </span>
            </button>
          </div>

          <p
            className="text-center text-sepia-light text-xs mt-3 italic"
            style={{ fontFamily: "'IM Fell English', serif" }}
          >
            Press the seal to send
          </p>
        </motion.form>

        {/* Social links as postage stamps */}
        <motion.div
          className="flex justify-center gap-4 mt-14 flex-wrap"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {socials.map((s) => (
            <PostageStamp key={s.label} social={s} />
          ))}
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p
            className="text-sepia/30 text-xs tracking-wider"
            style={{ fontFamily: "'Special Elite', monospace" }}
          >
            © 2025 Jefrin M S A. All correspondence reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
