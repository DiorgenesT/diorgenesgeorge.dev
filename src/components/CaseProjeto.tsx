"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Dicionario } from "@/i18n";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Um projeto com a mídia como protagonista (Trabalhos e Jogos).
 *
 * O projeto ocupa a largura quase toda, com o nome enorme por cima e a frase de abertura. Ao entrar, o
 * quadro abre (recuo de câmera) e a mídia se move devagar dentro dele com a rolagem. Logo abaixo, três
 * números grandes que contam até o valor, as tecnologias e a ação. O detalhamento (desafio, o que foi
 * construído, resultado) fica recolhido em "Como foi feito".
 * Leis: Von Restorff (a mídia e o nome), Miller (três números), divulgação progressiva (detalhes recolhidos).
 */

export type Midia = { tipo: "pagina" | "video" | "imagem"; src: string; poster?: string };

export type Caso = {
  id: string;
  indice: number;
  total: number;
  /** Linha de cima, em mono: tipo · ano. */
  rotulo: string;
  nome: string;
  resumo: string;
  desafio: string;
  feitos: string[];
  resultado: string;
  numeros: [string, string][];
  /** Dados curtos dentro dos detalhes (papel, status, gênero...). */
  ficha: [string, string][];
  stack: string[];
  midia: Midia;
  /** Legenda em mono sobre a mídia: o domínio ou o formato. */
  legenda: string;
  /** Mostra a bolinha verde de "no ar" na legenda. */
  noAr?: boolean;
  acoes?: ReactNode;
  /** Cor de destaque do caso. */
  acento?: string;
};

const dois = (n: number) => String(n).padStart(2, "0");

function MidiaCaso({ midia, nome }: { midia: Midia; nome: string }) {
  const vid = useRef<HTMLVideoElement>(null);
  // o vídeo só aparece quando já tem quadro tocando: até lá fica a capa (img) por baixo. No celular, entre o
  // poster e o primeiro quadro o <video> pinta preto, e era isso que piscava.
  const [tocando, setTocando] = useState(false);
  // vídeo: toca só enquanto está na tela
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const cobre = "absolute inset-0 size-full object-cover";
  // eslint-disable-next-line @next/next/no-img-element -- export estático, imagem já otimizada
  if (midia.tipo !== "video") return <img src={midia.src} alt={nome} className="caso-midia absolute inset-x-0 top-[-8%] h-[116%] w-full object-cover will-change-transform" />;
  return (
    <div className="caso-midia absolute inset-x-0 top-[-8%] h-[116%] w-full will-change-transform" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- export estático, capa já otimizada */}
      {midia.poster && <img src={midia.poster} alt="" className={cobre} />}
      <video
        ref={vid}
        src={midia.src}
        muted
        loop
        playsInline
        preload="metadata"
        data-capa={midia.poster ? "" : undefined}
        onPlaying={() => setTocando(true)}
        className={`${cobre} transition-opacity duration-300 ${tocando || !midia.poster ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export default function CaseProjeto({ caso, t }: { caso: Caso; t: Dicionario }) {
  const raiz = useRef<HTMLElement>(null);
  const detalhes = useRef<HTMLDivElement>(null);
  const [aberto, setAberto] = useState(false);
  const idDetalhes = useId();
  const acento = caso.acento ?? "#7df3ff";

  useGSAP(
    () => {
      if (menosMovimento()) return;
      const r = raiz.current!;
      const entrada = { trigger: r, start: "top 78%" };
      // o quadro abre como uma câmera recuando; a mídia anda devagar dentro dele
      // no celular, só transform e opacidade: animar clip-path sobre vídeo repinta o quadro inteiro a cada
      // quadro e pisca no Safari
      if (window.matchMedia("(max-width: 767px)").matches)
        gsap.from(r.querySelector(".caso-quadro"), { autoAlpha: 0, y: 40, scale: 0.96, duration: 1.1, ease: "expo.out", scrollTrigger: entrada });
      else gsap.from(r.querySelector(".caso-quadro"), { clipPath: "inset(10% 8% 10% 8% round 32px)", duration: 1.5, ease: "expo.out", scrollTrigger: entrada });
      gsap.fromTo(r.querySelector(".caso-midia"), { yPercent: -5, scale: 1.08 }, { yPercent: 5, scale: 1, ease: "none", scrollTrigger: { trigger: r, start: "top bottom", end: "bottom top", scrub: true } });
      // o nome sobe palavra por palavra, a frase e a etiqueta logo atrás
      const nome = SplitText.create(r.querySelector(".caso-nome"), { type: "words", mask: "words" });
      gsap.from(nome.words, { yPercent: 110, stagger: 0.06, duration: 1.1, ease: "expo.out", delay: 0.25, scrollTrigger: entrada });
      gsap.from(r.querySelectorAll(".caso-sobre"), { autoAlpha: 0, y: 18, stagger: 0.08, duration: 0.9, ease: "expo.out", delay: 0.45, scrollTrigger: entrada });
      // os números contam até o valor (os que começam com número); os outros só entram
      r.querySelectorAll<HTMLElement>(".caso-num").forEach((el, i) => {
        const m = (el.dataset.valor ?? "").match(/^(\d+)(.*)$/);
        const gatilho = { trigger: el, start: "top 92%" };
        gsap.from(el.closest("div"), { autoAlpha: 0, y: 24, duration: 0.9, delay: i * 0.1, ease: "expo.out", scrollTrigger: gatilho });
        if (m) {
          const n = { v: 0 };
          gsap.to(n, { v: Number(m[1]), duration: 1.4, delay: i * 0.1, ease: "power3.out", scrollTrigger: gatilho, onUpdate: () => void (el.textContent = Math.round(n.v) + m[2]) });
        }
      });
      gsap.from(r.querySelectorAll(".caso-pe"), { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: r.querySelector(".caso-numeros"), start: "top 92%" } });
      return () => nome.revert();
    },
    { scope: raiz },
  );

  // detalhes: abre e fecha medindo a altura do conteúdo
  useEffect(() => {
    const el = detalhes.current;
    if (!el) return;
    if (menosMovimento()) {
      el.style.height = aberto ? "auto" : "0px";
      return;
    }
    gsap.to(el, { height: aberto ? el.scrollHeight : 0, duration: 0.7, ease: "expo.inOut", onComplete: () => void (aberto && (el.style.height = "auto")) });
    if (aberto) gsap.fromTo(el.querySelectorAll(".caso-det"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.6, delay: 0.15, ease: "expo.out" });
  }, [aberto]);

  return (
    <article ref={raiz} className="relative py-16 md:py-24" aria-labelledby={`caso-${caso.id}`}>
      {/* a mídia, larga, com o nome por cima */}
      <div className="caso-quadro relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#0b0f17] ring-1 ring-white/10 sm:aspect-[16/10] md:aspect-[21/10]">
        <MidiaCaso midia={caso.midia} nome={caso.nome} />
        {/* escurecimento para o nome e as etiquetas lerem bem até sobre mídia clara ou com texto próprio */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(5,7,12,.97)_0%,rgba(5,7,12,.8)_26%,rgba(5,7,12,.35)_52%,transparent_72%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,12,.75)_0%,rgba(5,7,12,.3)_40%,transparent_62%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-[linear-gradient(180deg,rgba(5,7,12,.6),transparent)]" />

        <p className="caso-sobre absolute left-5 top-5 flex items-center gap-3 rounded-full border border-white/15 bg-[#05070c]/75 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75 md:bg-[#05070c]/55 md:backdrop-blur-md md:left-8 md:top-8">
          <span style={{ color: acento }}>{dois(caso.indice)}</span>
          <span className="text-white/30">/ {dois(caso.total)}</span>
          <span className="text-white/30">·</span>
          {caso.rotulo}
        </p>
        <p className="caso-sobre absolute right-5 top-5 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 md:right-8 md:top-9 md:flex">
          {caso.noAr && (
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
              <span className="relative size-1.5 rounded-full bg-emerald-400" />
            </span>
          )}
          {caso.legenda}
        </p>

        <div className="absolute inset-x-5 bottom-6 md:inset-x-10 md:bottom-10">
          <h3 id={`caso-${caso.id}`} className="caso-nome max-w-[16ch] font-display text-[13vw] leading-[0.92] tracking-[-0.035em] text-white sm:text-[8vw] md:text-[6.2vw]">
            {caso.nome}
          </h3>
          <p className="caso-sobre mt-4 max-w-[46ch] text-[16px] leading-[1.5] text-white/80 md:mt-5 md:text-[19px]">{caso.resumo}</p>
        </div>
      </div>

      {/* os três números, as tecnologias e a ação */}
      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-12 md:items-end">
        <dl className="caso-numeros grid grid-cols-3 gap-4 md:col-span-7 md:gap-10">
          {caso.numeros.map(([valor, rotulo]) => (
            <div key={rotulo} className="border-t pt-4" style={{ borderColor: `${acento}55` }}>
              <dt className="sr-only">{rotulo}</dt>
              <dd>
                <span data-valor={valor} className="caso-num block font-display text-[9vw] leading-none tracking-[-0.03em] text-white sm:text-[6vw] md:text-[3.6vw]">
                  {valor}
                </span>
                <span className="mt-2 block text-[12px] leading-snug text-white/50 md:text-[13px]">{rotulo}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-5 md:col-span-5 md:items-end">
          <ul className="caso-pe flex flex-wrap gap-2 md:justify-end">
            {caso.stack.map((s) => (
              <li key={s} className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/70">
                {s}
              </li>
            ))}
          </ul>
          <div className="caso-pe flex flex-wrap items-center gap-3 md:justify-end">
            <button
              type="button"
              aria-expanded={aberto}
              aria-controls={idDetalhes}
              onClick={() => setAberto((a) => !a)}
              className="group inline-flex h-12 items-center gap-3 rounded-full border border-white/20 pl-5 pr-2 text-[15px] text-white/85 transition-colors hover:border-white/60 hover:text-white"
            >
              {aberto ? t.casos.ocultar : t.casos.comoFoi}
              <span className="grid size-8 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-corte" style={{ transform: aberto ? "rotate(45deg)" : undefined }}>
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            {caso.acoes}
          </div>
        </div>
      </div>

      {/* como foi feito: recolhido até pedir */}
      <div ref={detalhes} id={idDetalhes} className="h-0 overflow-hidden" aria-hidden={!aberto} inert={!aberto}>
        <div className="mt-10 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h4 className="caso-det flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-px w-6" style={{ background: acento }} />
              {t.casos.desafio}
            </h4>
            <p className="caso-det mt-4 text-[16px] leading-[1.7] text-white/70">{caso.desafio}</p>
            <h4 className="caso-det mt-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-px w-6" style={{ background: acento }} />
              {t.casos.resultado}
            </h4>
            <p className="caso-det mt-4 font-display text-[22px] leading-[1.35] text-white">{caso.resultado}</p>
            <dl className="caso-det mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
              {caso.ficha.map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{k}</dt>
                  <dd className="mt-1.5 text-[14px] text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="md:col-span-7">
            <h4 className="caso-det flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-px w-6" style={{ background: acento }} />
              {t.casos.construi}
            </h4>
            <ol className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {caso.feitos.map((f, i) => (
                <li key={f} className="caso-det bg-[#080b12] p-5 text-[15px] leading-[1.6] text-white/80">
                  <span className="mb-3 block font-mono text-[12px]" style={{ color: acento }}>
                    {dois(i + 1)}
                  </span>
                  {f}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </article>
  );
}
