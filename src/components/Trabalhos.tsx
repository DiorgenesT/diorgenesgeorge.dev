"use client";

import { useEffect, useRef, useState } from "react";
import type { Dicionario } from "@/i18n";
import type { Idioma } from "@/i18n/config";
import { trabalhos, type Aba } from "@/data/trabalhos";
import { gsap, useGSAP } from "@/lib/gsap";
import CaseProjeto from "./CaseProjeto";
import CenaTrabalhos from "./CenaTrabalhos";

/**
 * Trabalhos como produtos no ar. Abas por tipo; cada projeto tem uma janela de navegador com o site de
 * verdade (o print da página inteira rola no hover) ou um vídeo e, ao lado, a ficha técnica: tipo, ano, papel
 * e status em grade, nome, resumo, destaques, stack e link.
 * Leis: Hick (3 abas), Jakob (janela de navegador reconhecível), proximidade (mídia + texto do mesmo projeto),
 * Fitts (a janela inteira é link), estético-usabilidade.
 */
const ABAS: Aba[] = ["sites", "sistemas", "motion"];

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
      gsap.from(".trab-cabeca", { autoAlpha: 0, y: 20, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".trab-cabeca", start: "top 90%" } });
    },
    { scope: secao },
  );

  return (
    <section ref={secao} id="work" className="relative scroll-mt-24 bg-[#05070c] pb-32 text-white md:pb-44" aria-labelledby="trab-titulo">
      <CenaTrabalhos t={t} />
      {/* os projetos sobem por cima do fim da cena, já sobre o preto que a cortina trouxe */}
      <div className="relative z-10 mx-auto -mt-[72svh] max-w-[1600px] px-5 md:px-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-end">

          <div ref={abasRef} role="tablist" aria-label={t.trabalhos.rotulo} className="trab-cabeca relative flex self-start rounded-full border border-white/10 bg-white/[0.03] p-1 md:self-auto">
            <span aria-hidden className="absolute inset-y-1 rounded-full bg-white transition-[left,width] duration-500 ease-corte" style={{ left: ind.x, width: ind.w }} />
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
                  <span className={`text-[12px] tabular-nums ${aba === a ? "text-black/45" : "text-white/35"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div key={aba} className="mt-16 md:mt-24" role="tabpanel">
          {lista.map((p, i) => {
            const tx = p.texto[lang];
            const dominio = p.url ? new URL(p.url).host.replace(/^www\./, "") : null;
            return (
              <CaseProjeto
                key={p.id}
                t={t}
                caso={{
                  id: p.id,
                  indice: i + 1,
                  total: lista.length,
                  rotulo: `${t.trabalhos.ficha.tipos[p.aba]} · ${p.ano}`,
                  nome: p.nome,
                  resumo: tx.resumo,
                  desafio: tx.desafio,
                  feitos: tx.feitos,
                  resultado: tx.resultado,
                  numeros: tx.numeros,
                  ficha: [
                    [t.casos.papel, t.trabalhos.ficha.papeis[p.aba]],
                    [t.casos.status, p.url ? t.trabalhos.ficha.noAr : t.trabalhos.ficha.video],
                  ],
                  stack: p.stack,
                  midia: p.midia,
                  legenda: dominio ?? (p.id === "eventos-betim" ? "reel · 1080×1920" : "vídeo · 1920×1080"),
                  noAr: !!p.url,
                  acoes: p.url ? (
                    <a href={p.url} target="_blank" rel="noopener" className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 text-[15px] font-medium text-black transition-colors hover:bg-[#7df3ff]">
                      {t.trabalhos.ver}
                      <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 ease-corte group-hover:rotate-[-45deg]">
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </a>
                  ) : undefined,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
