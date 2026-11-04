"use client";

import { useEffect, useRef, useState } from "react";
import type { Dicionario } from "@/i18n";
import type { Idioma } from "@/i18n/config";
import { trabalhos, type Aba, type Trabalho } from "@/data/trabalhos";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Trabalhos como produtos no ar. Abas por tipo; cada projeto tem uma janela de navegador com o
 * site de verdade (o print da página inteira rola no hover) ou um vídeo, e ao lado o que foi feito.
 * Leis: Hick (3 abas), Jakob (janela de navegador reconhecível), proximidade (mídia + texto do mesmo projeto),
 * Fitts (a janela inteira é link), estético-usabilidade.
 */
const ABAS: Aba[] = ["sites", "sistemas", "motion"];

function Janela({ trabalho }: { trabalho: Trabalho }) {
  const vid = useRef<HTMLVideoElement>(null);
  const dominio = trabalho.url ? new URL(trabalho.url).host.replace(/^www\./, "") : "remotion.dev";

  // vídeo só toca quando está na tela
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const corpo = (
    <div className="trab-janela group/j relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f17] shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="mx-auto flex max-w-[60%] items-center gap-1.5 truncate rounded-full bg-white/5 px-3 py-1 font-mono text-[11px] text-white/45">
          <svg viewBox="0 0 24 24" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {dominio}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden [container-type:size]">
        {trabalho.midia.tipo === "pagina" ? (
          // eslint-disable-next-line @next/next/no-img-element -- export estático, imagem já otimizada
          <img
            src={trabalho.midia.src}
            alt=""
            loading="lazy"
            className="absolute inset-x-0 top-0 w-full transition-transform duration-[7s] ease-in-out group-hover/j:[transform:translateY(calc(-100%+100cqh))] motion-reduce:transition-none"
          />
        ) : (
          <video ref={vid} src={trabalho.midia.src} poster={trabalho.midia.poster} muted loop playsInline preload="metadata" className="absolute inset-0 size-full object-cover" aria-hidden />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-100 transition-opacity duration-500 group-hover/j:opacity-0" />
      </div>
    </div>
  );

  return trabalho.url ? (
    <a href={trabalho.url} target="_blank" rel="noopener" aria-label={trabalho.nome} className="block">
      {corpo}
    </a>
  ) : (
    corpo
  );
}

export default function Trabalhos({ t, lang }: { t: Dicionario; lang: Idioma }) {
  const secao = useRef<HTMLElement>(null);
  const abasRef = useRef<HTMLDivElement>(null);
  const [aba, setAba] = useState<Aba>("sites");
  const [ind, setInd] = useState({ x: 0, w: 0 });
  const lista = trabalhos.filter((p) => p.aba === aba);

  // indicador deslizante das abas
  useEffect(() => {
    const el = abasRef.current?.querySelector<HTMLElement>(`[data-aba="${aba}"]`);
    if (!el) return;
    setInd({ x: el.offsetLeft, w: el.offsetWidth });
  }, [aba, lang]);

  useGSAP(
    () => {
      const split = SplitText.create(".trab-titulo", { type: "words", mask: "words", wordsClass: "sp-palavra" });
      gsap.from(split.words, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".trab-titulo", start: "top 85%" } });
      gsap.from(".trab-cabeca", { autoAlpha: 0, y: 20, stagger: 0.08, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".trab-titulo", start: "top 80%" } });
      return () => split.revert();
    },
    { scope: secao },
  );

  // a cada troca de aba (e na primeira vez que a lista aparece), os projetos entram
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".trab-item").forEach((item) => {
        gsap.from(item.querySelector(".trab-janela"), {
          clipPath: "inset(12% 8% 12% 8% round 24px)",
          scale: 0.96,
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: item, start: "top 85%" },
        });
        gsap.from(item.querySelectorAll(".trab-txt"), {
          autoAlpha: 0,
          y: 24,
          stagger: 0.07,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: item, start: "top 80%" },
        });
      });
    },
    { scope: secao, dependencies: [aba], revertOnUpdate: true },
  );

  return (
    <section ref={secao} id="work" className="relative scroll-mt-24 bg-[#05070c] pb-32 pt-28 text-white md:pb-44 md:pt-40" aria-labelledby="trab-titulo">
      <div className="mx-auto max-w-[1600px] px-5 md:px-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="trab-cabeca mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
              <span className="size-1.5 rounded-full bg-[#6ff0ff]" />
              {t.trabalhos.rotulo} <span className="text-white/25">/</span> {String(trabalhos.length).padStart(2, "0")}
            </p>
            <h2 id="trab-titulo" className="trab-titulo font-display text-[10vw] leading-[1.04] md:text-[3.9vw]">
              {t.trabalhos.titulo}
            </h2>
            <p className="trab-cabeca mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/55">{t.trabalhos.sub}</p>
          </div>

          <div ref={abasRef} role="tablist" aria-label={t.trabalhos.rotulo} className="trab-cabeca relative flex self-start rounded-full border border-white/10 bg-white/[0.03] p-1 md:self-auto">
            <span aria-hidden className="absolute inset-y-1 rounded-full bg-white transition-all duration-500 ease-corte" style={{ left: ind.x, width: ind.w }} />
            {ABAS.map((a) => {
              const n = trabalhos.filter((p) => p.aba === a).length;
              return (
                <button
                  key={a}
                  type="button"
                  role="tab"
                  data-aba={a}
                  aria-selected={aba === a}
                  onClick={() => setAba(a)}
                  className={`relative z-10 flex h-10 items-center gap-2 rounded-full px-4 text-[14px] transition-colors duration-300 ${aba === a ? "text-black" : "text-white/65 hover:text-white"}`}
                >
                  {t.trabalhos.abas[a]}
                  <span className={`font-mono text-[10px] ${aba === a ? "text-black/50" : "text-white/35"}`}>{String(n).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-20 md:mt-28" role="tabpanel">
          {lista.map((p, i) => {
            const tx = p.texto[lang];
            return (
              <article key={p.id} className="trab-item grid gap-10 border-t border-white/10 py-14 first:border-t-0 first:pt-0 md:grid-cols-12 md:gap-14 md:py-20">
                <div className="md:col-span-7">
                  <Janela trabalho={p} />
                </div>
                <div className="flex flex-col md:col-span-5 md:pt-2">
                  <p className="trab-txt flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>{p.ano}</span>
                  </p>
                  <h3 className="trab-txt mt-4 font-display text-[8vw] leading-[1.05] md:text-[2.4vw]">{p.nome}</h3>
                  <p className="trab-txt mt-4 text-[16px] leading-relaxed text-white/65">{tx.resumo}</p>

                  <p className="trab-txt mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">{t.trabalhos.feito}</p>
                  <ul className="mt-4 space-y-3">
                    {tx.feitos.map((f) => (
                      <li key={f} className="trab-txt flex gap-3 text-[15px] leading-relaxed text-white/75">
                        <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-[#6ff0ff]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <ul className="trab-txt mt-8 flex flex-wrap gap-2" aria-label="Stack">
                    {p.stack.map((s) => (
                      <li key={s} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-white/60">
                        {s}
                      </li>
                    ))}
                  </ul>

                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener" className="trab-txt group mt-9 inline-flex h-11 items-center gap-2 self-start rounded-full border border-white/20 px-5 text-[14px] text-white/85 transition-colors hover:border-white hover:bg-white hover:text-black">
                      {t.trabalhos.ver}
                      <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
