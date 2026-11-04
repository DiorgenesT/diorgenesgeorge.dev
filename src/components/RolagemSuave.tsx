"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, menosMovimento, ScrollTrigger } from "@/lib/gsap";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

/** Lenis ligado ao ticker do GSAP: um único relógio para o scroll suave e o ScrollTrigger. */
export default function RolagemSuave({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (menosMovimento()) return;
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a instância só existe depois de montar
    setLenis(l);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
