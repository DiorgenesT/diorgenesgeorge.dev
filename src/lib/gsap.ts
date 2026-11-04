"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Registro único dos plugins (este módulo só é avaliado uma vez no cliente).
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: "power3.out", duration: 0.9 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** true quando o visitante pediu menos movimento no sistema. */
export const menosMovimento = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
