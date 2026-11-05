"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Dicionario } from "@/i18n";
import { contato, linkWhatsApp } from "@/i18n/config";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Contato: a frase se completa dentro do monitor.
 *
 * O quarto à noite em camadas (public/contato, recortadas por scripts/camadas-parallax.py), com parallax no
 * mouse. No monitor de código, um editor vazio digita sozinho exemplos ("Eu desenvolvo um jogo…"). Ao
 * rolar, a câmera vai até esse monitor e a tela dele preenche a janela; aí está o editor de verdade, onde
 * o visitante escreve o que quer construir e "roda" o arquivo no WhatsApp.
 * Leis: pico-fim (o visitante termina a frase do site), Jakob (editor de código), Fitts (botão grande).
 */

type Camada = { id: string; src: string; d: number; caixa: string };

// posições em % do quadro 16:9 (.capa), tiradas das caixas impressas pelo script de recorte
const CAMADAS: Camada[] = [
  { id: "fundo", src: "/contato/1-fundo.webp", d: 0.1, caixa: "left-[-4%] top-[-4%] w-[108%]" },
  { id: "estante", src: "/contato/2-estante.webp", d: 0.28, caixa: "left-[3.9%] top-[1.3%] w-[93.2%]" },
  { id: "mesa", src: "/contato/3-mesa.webp", d: 0.5, caixa: "left-0 top-[15.7%] w-full" },
  { id: "ele", src: "/contato/4-ele.webp", d: 0.8, caixa: "left-[57%] top-[44%] w-[40%]" },
  { id: "frente", src: "/contato/5-frente.webp", d: 1.2, caixa: "left-[-3%] top-[40%] w-[106%]" },
];

/** A tela do monitor de código no quadro 16:9 (frações): onde a câmera chega. */
const TELA = { x0: 0.2, y0: 0.1785, x1: 0.483, y1: 0.6109 };
/**
 * Os quatro cantos da tela (sup. esq., sup. dir., inf. dir., inf. esq.): ela está em perspectiva forte.
 * Medidos com Hough nas bordas internas da tela: o topo desce 4,3° para a direita e a base sobe 3,1°.
 */
const CANTOS: [number, number][] = [
  [0.2, 0.1785],
  [0.483, 0.2164],
  [0.483, 0.5828],
  [0.2, 0.6109],
];

/**
 * matrix3d que leva o retângulo (0,0)-(w,h) ao quadrilátero q (px, mesma origem do retângulo), com
 * transform-origin 0 0. Homografia do quadrado unitário para q, escalada por 1/w e 1/h.
 */
function perspectiva(w: number, h: number, q: [number, number][]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const k = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].map((n) => +n.toPrecision(8)).join(",")})`;
}
const TELA_C = { x: (TELA.x0 + TELA.x1) / 2, y: (TELA.y0 + TELA.y1) / 2 };
/** Cor da tela do monitor na imagem: o editor de verdade usa a mesma, e a passagem não tem emenda. */
const COR_TELA = "#202932";

/** O editor do monitor digita sozinho os exemplos, um por vez. */
function Digitando({ prefixo, exemplos }: { prefixo: string; exemplos: string[] }) {
  const [texto, setTexto] = useState("");
  useEffect(() => {
    // menos movimento: o primeiro exemplo aparece inteiro, sem digitar
    const parado = menosMovimento();
    let i = 0;
    let n = 0;
    let apagando = false;
    let id = 0;
    const passo = () => {
      const alvo = exemplos[i % exemplos.length];
      if (!apagando) {
        n++;
        setTexto(alvo.slice(0, n));
        if (n >= alvo.length) {
          apagando = true;
          id = window.setTimeout(passo, 1600);
          return;
        }
        id = window.setTimeout(passo, 55 + Math.random() * 60);
      } else {
        n--;
        setTexto(alvo.slice(0, n));
        if (n <= 0) {
          apagando = false;
          i++;
        }
        id = window.setTimeout(passo, 28);
      }
    };
    id = window.setTimeout(parado ? () => setTexto(exemplos[0]) : passo, parado ? 0 : 900);
    return () => window.clearTimeout(id);
  }, [exemplos]);

  return (
    <span className="whitespace-nowrap">
      <span className="text-[#c792ea]">const</span> <span className="text-[#82aaff]">quero</span> <span className="text-white/60">=</span>{" "}
      <span className="text-[#c3e88d]">
        &quot;{prefixo} {texto}
        <span className="cursor-pisca ml-[0.05em] inline-block h-[1.05em] w-[0.08em] translate-y-[0.15em] bg-[#7df3ff]" />
        &quot;
      </span>
    </span>
  );
}

export default function Contato({ t }: { t: Dicionario }) {
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const amostra = useRef<HTMLDivElement>(null);
  const [quero, setQuero] = useState("");

  // o texto do monitor é desenhado num retângulo do tamanho da tela e projetado nos cantos dela
  useEffect(() => {
    const el = amostra.current;
    const pai = el?.parentElement;
    if (!el || !pai) return;
    const ajustar = () => {
      const W = pai.clientWidth;
      const H = pai.clientHeight;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      el.style.transform = perspectiva(w, h, CANTOS.map(([x, y]) => [(x - TELA.x0) * W, (y - TELA.y0) * H]));
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(pai);
    return () => ro.disconnect();
  }, []);

  // mouse: cada camada segue o ponteiro na proporção da sua profundidade, com inércia
  useEffect(() => {
    const el = palco.current;
    if (!el || menosMovimento()) return;
    const camadas = [...el.querySelectorAll<HTMLElement>("[data-d]")].map((c) => ({ c, d: Number(c.dataset.d) }));
    const alvo = { x: 0, y: 0 };
    const atual = { x: 0, y: 0 };
    let raf = 0;
    let visivel = false;
    const mover = (e: PointerEvent) => {
      alvo.x = e.clientX / window.innerWidth - 0.5;
      alvo.y = e.clientY / window.innerHeight - 0.5;
    };
    const quadro = () => {
      atual.x += (alvo.x - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      for (const { c, d } of camadas) c.style.transform = `translate3d(${(-atual.x * d * 80).toFixed(2)}px, ${(-atual.y * d * 36).toFixed(2)}px, 0)`;
      if (visivel) raf = requestAnimationFrame(quadro);
    };
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visivel) raf = requestAnimationFrame(quadro);
    });
    io.observe(el);
    window.addEventListener("pointermove", mover);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
    };
  }, []);

  useGSAP(
    () => {
      const split = SplitText.create(".con-titulo", { type: "words", mask: "words", wordsClass: "sp-palavra" });
      gsap.from(split.words, { yPercent: 110, stagger: 0.06, duration: 1.2, ease: "expo.out", delay: 0.2 });
      gsap.from(".con-entra", { autoAlpha: 0, y: 18, stagger: 0.1, duration: 1, ease: "expo.out", delay: 0.45 });
      gsap.from(".con-camada", { autoAlpha: 0, scale: 1.05, stagger: 0.08, duration: 1.6, ease: "expo.out" });

      if (!menosMovimento()) {
        // a câmera vai até o monitor de código: tudo cresce a partir do centro da tela dele, e o que está
        // perto (ele, a planta, a cama) sai de quadro primeiro
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".con-trilho", start: "top top", end: "bottom bottom", scrub: 0.6 } });
        const escala = (1 / (TELA.x1 - TELA.x0)) * 1.08;
        // além de crescer, a câmera traz o centro da tela do monitor ao centro do quadro
        tl.to(".con-camera", { scale: escala, xPercent: (0.5 - TELA_C.x) * 100, yPercent: (0.5 - TELA_C.y) * 100, ease: "power2.in", duration: 0.9 }, 0.05)
          .to('[data-id="ele"]', { xPercent: 45, yPercent: 30, ease: "power2.in", duration: 0.6 }, 0.05)
          .to('[data-id="frente"]', { yPercent: 60, scale: 1.15, ease: "power2.in", duration: 0.5 }, 0.05)
          .to(".con-texto", { yPercent: -18, autoAlpha: 0, ease: "power1.in", duration: 0.3 }, 0.08)
          .to(".con-rolar", { autoAlpha: 0, ease: "none", duration: 0.12 }, 0)
          .to(".con-amostra", { autoAlpha: 0, ease: "none", duration: 0.15 }, 0.72)
          // de perto, a imagem da tela se dissolve na cor dela: é por aí que se entra no editor de verdade
          .to(".con-tela", { opacity: 1, ease: "power1.in", duration: 0.2 }, 0.78);
      }

      gsap.utils.toArray<HTMLElement>(".con-linha").forEach((l, i) =>
        gsap.from(l, { autoAlpha: 0, x: -12, duration: 0.7, ease: "expo.out", delay: i * 0.06, scrollTrigger: { trigger: ".con-editor", start: "top 75%" } }),
      );
      return () => split.revert();
    },
    { scope: secao },
  );

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = quero.trim() || t.contato.placeholder;
    window.open(linkWhatsApp(`${t.contato.mensagem}${texto}`), "_blank", "noopener");
  };

  const links: [string, string, string][] = [
    ["email", `mailto:${contato.email}`, contato.email],
    ["linkedin", contato.linkedin, "linkedin.com/in/diorgenesgeorge"],
    ["github", contato.github, "github.com/DiorgenesT"],
    ["instagram", contato.instagram, "@diorgenestavares"],
  ];

  return (
    <section ref={secao} className="relative text-white" style={{ background: COR_TELA }} aria-labelledby="con-titulo">
      {/* o quarto em camadas; a câmera vai até o monitor de código enquanto se rola o trilho */}
      <div className="con-trilho relative h-[230svh] bg-[#05070c]">
        <div ref={palco} className="palco sticky top-0 h-svh overflow-hidden bg-[#05070c]" aria-hidden>
          <div className="capa [--px:.3] md:[--px:.5]">
            <div className="con-camera absolute inset-0 will-change-transform" style={{ transformOrigin: `${TELA_C.x * 100}% ${TELA_C.y * 100}%` }}>
              {CAMADAS.map((c) => (
                <div key={c.id} data-d={c.d} className="absolute inset-0 will-change-transform">
                  <div data-id={c.id} className={`con-camada absolute ${c.caixa} will-change-transform`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- export estático, camadas já otimizadas */}
                    <img src={c.src} alt="" draggable={false} className="block w-full select-none" decoding="async" />
                  </div>
                  {/* o editor do monitor digita sozinho (fica preso à camada da mesa) */}
                  {c.id === "mesa" && (
                    <div
                      ref={amostra}
                      className="con-amostra absolute origin-top-left overflow-hidden font-mono leading-none text-white/85"
                      style={{
                        left: `${TELA.x0 * 100}%`,
                        top: `${TELA.y0 * 100}%`,
                        width: `${(TELA.x1 - TELA.x0) * 100}%`,
                        height: `${(TELA.y1 - TELA.y0) * 100}%`,
                        fontSize: "calc(var(--w) * 0.0072)",
                        // o texto começa na linha 2 do editor da imagem (com as linhas a cada ~0,01 da largura
                        // do quadro) e na coluna logo depois dos números de linha
                        padding: "calc(var(--w) * 0.041) 0 0 calc(var(--w) * 0.047)",
                      }}
                    >
                      <span className="block pb-[1.8em] text-white/35">{t.contato.comentario}</span>
                      <Digitando prefixo={t.contato.prefixo} exemplos={t.contato.exemplos} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* leitura do texto à esquerda e na base */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#05070ce6_0%,#05070c80_28%,transparent_55%)]" />
          <div aria-hidden className="grao pointer-events-none absolute inset-0" />
          {/* por cima de tudo: a cor da tela, quando a câmera já está dentro dela */}
          <div className="con-tela pointer-events-none absolute inset-0 opacity-0" style={{ background: COR_TELA }} />
        </div>

        <div className="con-texto pointer-events-none absolute inset-x-0 top-0 flex h-svh items-end">
          <div className="mx-auto w-full max-w-[1600px] px-5 pb-[11vh] md:px-14">
            <p className="con-entra mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">{t.contato.rotulo}</p>
            <h2 id="con-titulo" className="con-titulo font-display text-[12vw] leading-[1.02] md:text-[5vw]">
              {t.contato.titulo}
            </h2>
            <p className="con-entra mt-5 max-w-[30rem] text-[17px] leading-relaxed text-white/75">{t.contato.sub}</p>
          </div>
        </div>
        <p className="con-rolar pointer-events-none absolute bottom-6 right-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45 md:right-14" aria-hidden>
          {t.contato.rolar} ↓
        </p>
      </div>

      {/* dentro do monitor: o editor de verdade, na mesma cor da tela */}
      <div className="con-editor relative z-10 mx-auto -mt-[42svh] min-h-[70svh] max-w-[1100px] px-5 pb-28 pt-[10svh] md:px-14">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a222b] shadow-[0_40px_120px_-40px_rgba(0,0,0,.8)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="size-2.5 rounded-full bg-[#28c840]/80" />
            <span className="ml-4 rounded-t-md border-b-2 border-[#7df3ff] px-3 py-1 font-mono text-[12px] text-white/80">contato.ts</span>
          </div>

          <form onSubmit={enviar} className="grid grid-cols-[2.5rem_1fr] gap-y-3 px-2 py-6 font-mono text-[14px] leading-relaxed md:grid-cols-[3.5rem_1fr] md:text-[16px]">
            {/* 1: o comentário */}
            <span className="con-linha select-none pr-4 text-right text-white/25">1</span>
            <span className="con-linha text-white/40">{t.contato.comentario}</span>

            {/* 2: os "imports" são os outros contatos */}
            <span className="con-linha select-none pr-4 text-right text-white/25">2</span>
            <span className="con-linha flex flex-wrap gap-x-2 text-white/70">
              <span className="text-[#c792ea]">import</span>
              <span>{"{"}</span>
              {links.map(([nome, href], i) => (
                <span key={nome}>
                  <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener" className="text-[#82aaff] underline decoration-white/20 underline-offset-4 transition-colors hover:text-[#7df3ff] hover:decoration-[#7df3ff]">
                    {nome}
                  </a>
                  {i < links.length - 1 && ","}
                </span>
              ))}
              <span>{"}"}</span>
              <span className="text-[#c792ea]">from</span>
              <span className="text-[#c3e88d]">&quot;@diorgenes&quot;</span>
            </span>

            <span className="con-linha select-none pr-4 text-right text-white/25">3</span>
            <span className="con-linha" />

            {/* 4: a frase que o visitante completa */}
            <span className="con-linha select-none pr-4 text-right text-white/25">4</span>
            <label className="con-linha flex flex-wrap items-baseline gap-x-2 text-white/80">
              <span className="sr-only">{t.contato.campo}</span>
              <span className="text-[#c792ea]">const</span>
              <span className="text-[#82aaff]">quero</span>
              <span className="text-white/60">=</span>
              <span className="flex min-w-0 basis-full items-baseline text-[#c3e88d] sm:basis-auto sm:flex-1">
                &quot;{t.contato.prefixo}&nbsp;
                <input
                  value={quero}
                  onChange={(e) => setQuero(e.target.value)}
                  placeholder={t.contato.placeholder}
                  maxLength={140}
                  className="min-w-[8ch] flex-1 border-b border-dashed border-[#c3e88d]/40 bg-transparent text-[#c3e88d] caret-[#7df3ff] outline-none placeholder:text-[#c3e88d]/35 focus:border-[#7df3ff]"
                />
                &quot;
              </span>
            </label>

            <span className="con-linha select-none pr-4 text-right text-white/25">5</span>
            <span className="con-linha" />

            {/* 6: rodar */}
            <span className="con-linha select-none pr-4 text-right text-white/25">6</span>
            <span className="con-linha">
              <button type="submit" className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 font-sans text-[15px] font-medium text-black transition-colors hover:bg-[#7df3ff]">
                <span className="font-mono text-[13px] text-black/50">▶</span>
                {t.contato.enviar}
                <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 ease-corte group-hover:translate-x-0.5 group-hover:rotate-[-45deg]">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </button>
            </span>
          </form>
        </div>

        <p className="mt-8 font-mono text-[12px] text-white/45">
          {t.contato.outros}{" "}
          {links.map(([nome, href, rotulo], i) => (
            <span key={nome}>
              <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener" className="text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white">
                {rotulo}
              </a>
              {i < links.length - 1 && " · "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
