"use client";

import { useEffect, useRef } from "react";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";

/**
 * A cena em camadas do topo de uma tela (Trabalhos, Jogos), recortadas por scripts/camadas-parallax.py.
 * Parallax no mouse (sem mouse, uma deriva lenta) e luzes quentes tremendo, em código. Ao rolar, a camada
 * "frente" sobe como cortina e traz o preto onde o conteúdo da tela entra (como no Sobre).
 */

export type Camada = { id: string; src: string; d: number; x: number; y: number; w: number; espelhar?: boolean };
/** Luz que treme, presa a uma camada: centro (frações do quadro), raios do radial e cor. */
export type Luz = { id: string; x: number; y: number; raio: string; cor: string };
/** Faixa de névoa rente à base de uma camada (frações do quadro), para ela não flutuar. */
export type Nevoa = { id: string; y: number; h: number; opacidade: number };

export type CenaProps = {
  camadas: Camada[];
  luzes?: Luz[];
  nevoas?: Nevoa[];
  /** Ids das camadas que se aproximam um pouco ao rolar. */
  aproximar?: string[];
  rotulo: string;
  titulo: string;
  sub: string;
  idTitulo: string;
  rolar: string;
  /** Foco horizontal da cena no celular (0..1). */
  foco?: number;
};

export default function CenaParallax({ camadas, luzes = [], nevoas = [], aproximar = [], rotulo, titulo, sub, idTitulo, rolar, foco = 0.75 }: CenaProps) {
  const raiz = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);

  // parallax e a chama das tochas
  useEffect(() => {
    const el = palco.current;
    if (!el || menosMovimento()) return;
    const camadas = [...el.querySelectorAll<HTMLElement>("[data-d]")].map((c) => ({ c, d: Number(c.dataset.d) }));
    const chamas = [...el.querySelectorAll<HTMLElement>("[data-chama]")];
    const alvo = { x: 0, y: 0 };
    const atual = { x: 0, y: 0 };
    let mouse = false;
    let raf = 0;
    const t0 = performance.now();
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse = true;
      alvo.x = e.clientX / window.innerWidth - 0.5;
      alvo.y = e.clientY / window.innerHeight - 0.5;
    };
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      const t = (agora - t0) / 1000;
      if (!mouse) {
        alvo.x = Math.sin(t * 0.22) * 0.35;
        alvo.y = Math.sin(t * 0.15 + 1) * 0.2;
      }
      atual.x += (alvo.x - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      for (const { c, d } of camadas) c.style.transform = `translate3d(${(-atual.x * d * 80).toFixed(2)}px, ${(-atual.y * d * 36).toFixed(2)}px, 0)`;
      chamas.forEach((c, i) => {
        c.style.opacity = (0.8 + 0.1 * Math.sin(t * (8.7 + i)) + 0.07 * Math.sin(t * (21.3 - i * 2) + i) + 0.04 * Math.sin(t * 2.3 + i)).toFixed(3);
      });
    };
    raf = requestAnimationFrame(quadro);
    window.addEventListener("pointermove", mover);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
    };
  }, []);

  useGSAP(
    () => {
      const split = SplitText.create(".cj-titulo", { type: "words", mask: "words", wordsClass: "sp-palavra" });
      gsap.from(split.words, { yPercent: 110, stagger: 0.06, duration: 1.2, ease: "expo.out", delay: 0.2 });
      gsap.from(".cj-entra", { autoAlpha: 0, y: 18, stagger: 0.1, duration: 1, ease: "expo.out", delay: 0.45 });
      // todas as camadas juntas (já estão decodificadas quando o portal abre): só um leve recuo de câmera
      gsap.from(".cj-camada", { scale: 1.04, duration: 2.2, ease: "expo.out" });
      if (!menosMovimento()) {
        // a frente é uma cortina: sobe na frente de tudo e traz o preto atrás dela
        const altura = () => palco.current?.clientHeight ?? window.innerHeight;
        const tl = gsap.timeline({ scrollTrigger: { trigger: raiz.current, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } });
        if (aproximar.length) tl.to(aproximar.map((id) => `[data-id="${id}"]`).join(", "), { yPercent: -6, scale: 1.04, ease: "none", duration: 1 }, 0);
        tl.to('[data-id="frente"]', { y: () => -altura() * 1.15, scale: 1.06, ease: "power1.inOut", duration: 0.92 }, 0.06)
          .to(".cj-texto", { yPercent: -18, autoAlpha: 0, ease: "power1.in", duration: 0.4 }, 0.3)
          .to(".cj-rolar", { autoAlpha: 0, ease: "none", duration: 0.15 }, 0);
      }
      return () => split.revert();
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className="relative h-[190svh]">
      <div ref={palco} className="palco sticky top-0 h-svh overflow-hidden" aria-hidden>
        <div className="capa md:[--px:.5]" style={{ ["--px" as string]: foco }}>
          {camadas.map((c) => (
            <div key={c.id} data-d={c.d} className="absolute inset-0 will-change-transform">
              <div data-id={c.id} className="cj-camada absolute origin-bottom will-change-transform" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, width: `${c.w * 100}%` }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- export estático, camadas já otimizadas */}
                <img src={c.src} alt="" draggable={false} decoding="async" className={`block w-full select-none ${c.espelhar ? "-scale-x-100" : ""}`} />
                {/* a frente traz o preto atrás dela: degradê na base e um bloco sólido abaixo */}
                {c.id === "frente" && (
                  <>
                    <div className="absolute inset-x-0 top-[55%] h-[46%] bg-gradient-to-b from-transparent via-[#05070c]/80 to-[#05070c]" />
                    <div className="absolute inset-x-0 top-[100%] h-[500%] bg-[#05070c]" />
                  </>
                )}
              </div>
              {nevoas
                .filter((n) => n.id === c.id)
                .map((n, i) => (
                  <div key={`n${i}`} className="sob-nevoa sob-nevoa-densa pointer-events-none absolute inset-x-[-10%]" style={{ top: `${n.y * 100}%`, height: `${n.h * 100}%`, opacity: n.opacidade }} />
                ))}
              {luzes.filter((l) => l.id === c.id).map((l, i) => (
                <div
                  key={i}
                  data-chama
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{ background: `radial-gradient(${l.raio} at ${l.x * 100}% ${l.y * 100}%, ${l.cor}, transparent 70%)` }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#05070ce0_0%,#05070c99_26%,transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#05070c_0%,transparent_30%)]" />
        <div aria-hidden className="grao pointer-events-none absolute inset-0" />
      </div>

      <div className="cj-texto pointer-events-none absolute inset-x-0 top-0 flex h-svh items-end">
        <div className="mx-auto w-full max-w-[1600px] px-5 pb-[12vh] md:px-14">
          <p className="cj-entra mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">{rotulo}</p>
          <h2 id={idTitulo} className="cj-titulo max-w-[14ch] font-display text-[11vw] leading-[1.02] md:text-[4.6vw]">
            {titulo}
          </h2>
          <p className="cj-entra mt-5 max-w-[30rem] text-[17px] leading-relaxed text-white/75">{sub}</p>
        </div>
      </div>
      <p className="cj-rolar pointer-events-none absolute bottom-6 right-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45 md:right-14" aria-hidden>
        {rolar} ↓
      </p>
    </div>
  );
}
