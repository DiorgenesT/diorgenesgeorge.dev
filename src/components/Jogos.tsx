"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Dicionario } from "@/i18n";
import type { Idioma } from "@/i18n/config";
import { jogos, type Jogo } from "@/data/jogos";
import { gsap } from "@/lib/gsap";
import CaseProjeto from "./CaseProjeto";
import CenaJogos from "./CenaJogos";

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

  return (
    <section ref={secao} className="relative bg-[#05070c] pb-32 text-white md:pb-44" aria-labelledby="jog-titulo">
      <CenaJogos t={t} />
      {/* os jogos sobem por cima do fim da cena, já sobre o preto que a cortina trouxe */}
      <div className="relative z-10 mx-auto -mt-[72svh] max-w-[1600px] px-5 md:px-14">
        <div>
          {jogos.map((j, i) => {
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
              <CaseProjeto
                key={j.id}
                t={t}
                caso={{
                  id: j.id,
                  indice: i + 1,
                  total: jogos.length,
                  rotulo: `${tx.genero} · ${j.ano}`,
                  nome: j.nome,
                  resumo: tx.resumo,
                  desafio: tx.desafio,
                  feitos: tx.feitos,
                  resultado: tx.resultado,
                  numeros: tx.numeros,
                  ficha: [
                    [t.jogos.ficha.modos, tx.modos],
                    [t.jogos.ficha.estudio, "Open Digital Games"],
                    [t.jogos.ficha.papel, t.jogos.ficha.papelValor],
                  ],
                  stack: j.stack,
                  midia: { tipo: "imagem", src: j.capa },
                  legenda: new URL(j.url).host,
                  noAr: true,
                  acento: "#c4ff5c",
                  acoes: (
                    <>
                      {jogar}
                      {j.embutir && (
                        <a href={j.url} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] text-white/85 transition-colors hover:border-white/60 hover:text-white">
                          {t.jogos.novaAba}
                          <Seta />
                        </a>
                      )}
                    </>
                  ),
                }}
              />
            );
          })}
        </div>
      </div>
      {aberto && <Fliperama jogo={aberto} t={t} fechar={fechar} />}
    </section>
  );
}
