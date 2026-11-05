"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Dicionario } from "@/i18n";
import type { Idioma } from "@/i18n/config";
import { jogos, type Jogo } from "@/data/jogos";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Jogos da Open Digital Games: a mesma linguagem de Trabalhos (janela + ficha). "Jogar aqui" abre o jogo
 * em tela cheia dentro do site (iframe), com fechar e "abrir em nova aba"; o jogo que não aceita iframe
 * abre direto em nova aba.
 * Leis: Jakob (janela de navegador), Fitts (botão grande de jogar), proximidade (capa + ficha do mesmo jogo).
 */

const Seta = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const Play = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
);

/** O jogo aberto em tela cheia, por cima de tudo. Esc fecha. */
function Fliperama({ jogo, t, fechar }: { jogo: Jogo; t: Dicionario; fechar: () => void }) {
  const [pronto, setPronto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation(); // o Esc fecha o jogo, não a tela de Jogos
      fechar();
    };
    window.addEventListener("keydown", tecla, true);
    botao.current?.focus();
    if (caixa.current) gsap.fromTo(caixa.current, { clipPath: "inset(10% 10% 10% 10% round 24px)", autoAlpha: 0 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", autoAlpha: 1, duration: 0.7, ease: "expo.out" });
    return () => window.removeEventListener("keydown", tecla, true);
  }, [fechar]);

  return createPortal(
    <div ref={caixa} role="dialog" aria-modal="true" aria-label={jogo.nome} className="fixed inset-0 z-[80] flex flex-col bg-[#05070c]">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-4 md:px-6">
        <span className="font-display text-[17px] text-white">{jogo.nome}</span>
        <span className="hidden font-mono text-[11px] text-white/40 sm:inline">{new URL(jogo.url).host}</span>
        <a href={jogo.url} target="_blank" rel="noopener" className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/80 transition-colors hover:border-white/50 hover:text-white">
          {t.jogos.novaAba}
          <Seta />
        </a>
        <button ref={botao} type="button" onClick={fechar} aria-label={t.jogos.fechar} className="grid size-9 place-items-center rounded-full bg-white text-black transition-colors hover:bg-[#7df3ff]">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div className="relative flex-1">
        {!pronto && (
          <p className="absolute inset-0 grid place-items-center font-mono text-[12px] uppercase tracking-[0.2em] text-white/50" aria-live="polite">
            {t.jogos.carregando}
          </p>
        )}
        <iframe
          src={jogo.url}
          title={jogo.nome}
          allow="fullscreen; autoplay; gamepad"
          onLoad={() => setPronto(true)}
          className={`absolute inset-0 size-full border-0 transition-opacity duration-500 ${pronto ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>,
    document.body,
  );
}

export default function Jogos({ t, lang }: { t: Dicionario; lang: Idioma }) {
  const secao = useRef<HTMLElement>(null);
  const [aberto, setAberto] = useState<Jogo | null>(null);
  const fechar = useCallback(() => setAberto(null), []);

  useGSAP(
    () => {
      const split = SplitText.create(".jog-titulo", { type: "words", mask: "words", wordsClass: "sp-palavra" });
      gsap.from(split.words, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".jog-titulo", start: "top 85%" } });
      gsap.from(".jog-cabeca", { autoAlpha: 0, y: 20, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".jog-titulo", start: "top 80%" } });
      gsap.utils.toArray<HTMLElement>(".jog-item").forEach((item) => {
        gsap.from(item.querySelector(".jog-janela"), { clipPath: "inset(12% 8% 12% 8% round 24px)", scale: 0.96, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: item, start: "top 85%" } });
        gsap.from(item.querySelectorAll(".jog-txt"), { autoAlpha: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: item, start: "top 80%" } });
      });
      return () => split.revert();
    },
    { scope: secao },
  );

  return (
    <section ref={secao} className="relative bg-[#05070c] pb-32 pt-28 text-white md:pb-44 md:pt-40" aria-labelledby="jog-titulo">
      <div className="mx-auto max-w-[1600px] px-5 md:px-14">
        <div className="max-w-2xl">
          <h2 id="jog-titulo" className="jog-titulo font-display text-[10vw] leading-[1.04] md:text-[3.9vw]">
            {t.jogos.titulo}
          </h2>
          <p className="jog-cabeca mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/55">{t.jogos.sub}</p>
        </div>

        <div className="mt-20 md:mt-28">
          {jogos.map((j) => {
            const tx = j.texto[lang];
            const jogar = j.embutir ? (
              <button type="button" onClick={() => setAberto(j)} className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 text-[15px] font-medium text-black transition-colors hover:bg-[#7df3ff]">
                {t.jogos.jogar}
                <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 ease-corte group-hover:scale-110">
                  <Play />
                </span>
              </button>
            ) : (
              <a href={j.url} target="_blank" rel="noopener" className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 text-[15px] font-medium text-black transition-colors hover:bg-[#7df3ff]">
                {t.jogos.jogar}
                <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 ease-corte group-hover:scale-110">
                  <Seta />
                </span>
              </a>
            );
            return (
              <article key={j.id} className="jog-item grid gap-10 border-t border-white/10 py-16 first:border-t-0 first:pt-0 md:grid-cols-12 md:gap-14 md:py-24">
                <div className="md:col-span-7">
                  <div className="jog-janela group/j relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f17] shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)]">
                    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                      <span className="size-2.5 rounded-full bg-white/15" />
                      <span className="size-2.5 rounded-full bg-white/15" />
                      <span className="size-2.5 rounded-full bg-white/15" />
                      <span className="mx-auto truncate rounded-full bg-white/5 px-3 py-1 font-mono text-[11px] text-white/45">{new URL(j.url).host}</span>
                    </div>
                    <div className="relative aspect-[1200/630] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element -- export estático, imagem já otimizada */}
                      <img src={j.capa} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-corte group-hover/j:scale-[1.04]" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:col-span-5">
                  <dl className="jog-txt grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
                    {[
                      [t.jogos.ficha.genero, tx.genero],
                      [t.jogos.ficha.modos, tx.modos],
                      [t.jogos.ficha.estudio, "Open Digital Games"],
                      [t.jogos.ficha.papel, t.jogos.ficha.papelValor],
                    ].map(([rotulo, valor]) => (
                      <div key={rotulo} className="bg-[#080b12] px-4 py-3">
                        <dt className="text-[12px] text-white/40">{rotulo}</dt>
                        <dd className="mt-1 text-[14px] text-white/85">{valor}</dd>
                      </div>
                    ))}
                  </dl>

                  <h3 className="jog-txt mt-8 font-display text-[9vw] leading-[1.02] tracking-[-0.02em] md:text-[2.5vw]">{j.nome}</h3>
                  <p className="jog-txt mt-4 max-w-[40ch] text-[17px] leading-[1.6] text-white/65">{tx.resumo}</p>

                  <h4 className="jog-txt mt-8 text-[13px] text-white/40">{t.trabalhos.feito}</h4>
                  <ul className="mt-3 space-y-2.5">
                    {tx.feitos.map((f) => (
                      <li key={f} className="jog-txt relative pl-5 text-[15px] leading-[1.6] text-white/80 before:absolute before:left-0 before:top-[0.68em] before:size-1.5 before:bg-[#c4ff5c]">
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="jog-txt mt-8 flex flex-col gap-5 border-t border-white/10 pt-5">
                    <p className="text-[13px] leading-relaxed text-white/50">{j.stack.join(" · ")}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {jogar}
                      {j.embutir && (
                        <a href={j.url} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] text-white/85 transition-colors hover:border-white/60 hover:text-white">
                          {t.jogos.novaAba}
                          <Seta />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {aberto && <Fliperama jogo={aberto} t={t} fechar={fechar} />}
    </section>
  );
}
