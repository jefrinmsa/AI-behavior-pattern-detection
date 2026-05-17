"use client";

import { useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Events from "./components/Events";
import Contact from "./components/Contact";
import useTransitionOverlay from "./components/TransitionOverlay";
import { PaperCreaseOverlay } from "./components/PaperTexture";

export default function Home() {
  const { trigger, Overlay } = useTransitionOverlay();

  const handleNavigate = useCallback(
    (href) => {
      trigger(href);
    },
    [trigger]
  );

  return (
    <>
      <Overlay />
      <PaperCreaseOverlay />
      <Navbar onNavigate={handleNavigate} />

      <main className="paper-bg">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Events />
        <Contact />
      </main>
    </>
  );
}
