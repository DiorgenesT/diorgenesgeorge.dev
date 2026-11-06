"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Registro único dos plugins (este módulo só é avaliado uma vez no cliente).
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
gsap.defaults({ ease: "power3.out", duration: 0.9 });
// celular: a barra de endereço que aparece e some ao rolar muda a altura da janela; sem isto cada mudança
// recalcula os gatilhos e a cena pula no meio da rolagem
if (typeof window !== "undefined") ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** true quando o visitante pediu menos movimento no sistema. */
export const menosMovimento = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
