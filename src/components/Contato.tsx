"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Dicionario } from "@/i18n";
import { contato, linkWhatsApp } from "@/i18n/config";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Contato: o acampamento. O mundo de ruínas à noite em camadas (public/acampamento, recortadas por
 * scripts/camadas-parallax.py): ele sentado de costas perto da fogueira, o notebook aceso ao lado e o
 * quadro de missões. O visitante publica uma missão ("Eu desenvolvo ___") e ela vai para o WhatsApp.
 *
 * Parallax no mouse (sem mouse, uma deriva lenta). A vida é código: a luz da fogueira treme, poucas brasas
 * sobem, a lanterna e o notebook brilham.
 * Leis: pico-fim (o visitante termina a frase do site), Fitts (botão grande), proximidade (campo + ação).
 */

type Camada = { id: string; src: string; d: number; x: number; y: number; w: number; espelhar?: boolean };

// posições em frações do quadro 16:9 (.capa); a cena fica à direita, o painel da missão à esquerda
const CAMADAS: Camada[] = [
  { id: "fundo", src: "/acampamento/1-fundo.webp", d: 0.08, x: -0.04, y: -0.04, w: 1.08 },
  { id: "ruinas", src: "/acampamento/2-ruinas.webp", d: 0.25, x: 0.52, y: 0.2, w: 0.45 },
  // o chão do acampamento: as ruínas e o quadro se apoiam nele, em vez de flutuar sobre o vale
  { id: "chao", src: "", d: 0.38, x: -0.05, y: 0.57, w: 1.1 },
  { id: "acampamento", src: "/acampamento/3-acampamento.webp", d: 0.5, x: 0.36, y: 0.36, w: 0.62 },
  { id: "quadro", src: "/acampamento/4-quadro.webp", d: 0.8, x: 0.86, y: 0.44, w: 0.22, espelhar: true },
  { id: "frente", src: "/acampamento/5-frente.webp", d: 1.2, x: -0.03, y: 0.78, w: 1.06 },
];

/** A fogueira, o notebook e a lanterna (frações do quadro), de onde vêm as luzes. */
const FOGO = { x: 0.831, y: 0.8 };
const NOTEBOOK = { x: 0.537, y: 0.727 };
const LANTERNA = { x: 0.875, y: 0.55 };

/** Brasas: poucas, pequenas, subindo devagar e se apagando (sem brilho exagerado). */
function Brasas() {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (menosMovimento()) return;
    const c = cv.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const nova = () => ({ x: (Math.random() - 0.5) * 0.4, y: 0, vx: (Math.random() - 0.5) * 0.06, vy: 0.12 + Math.random() * 0.16, vida: 0, dura: 1.6 + Math.random() * 1.8, r: 0.6 + Math.random() * 1.1 });
    const brasas = Array.from({ length: 16 }, () => ({ ...nova(), vida: Math.random() * 2 }));
    let ultimo = performance.now();
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      const r = c.getBoundingClientRect();
      if (c.width !== Math.round(r.width) || c.height !== Math.round(r.height)) {
        c.width = Math.max(1, Math.round(r.width));
        c.height = Math.max(1, Math.round(r.height));
      }
      const W = c.width;
      const H = c.height;
      ctx.clearRect(0, 0, W, H);
      for (const b of brasas) {
        b.vida += dt;
        if (b.vida > b.dura) Object.assign(b, nova());
        b.x += (b.vx + Math.sin(agora / 600 + b.r * 9) * 0.02) * dt;
        b.y += b.vy * dt;
        const k = b.vida / b.dura;
        ctx.globalAlpha = Math.sin(Math.PI * k) * 0.85;
        ctx.fillStyle = k < 0.5 ? "#ffb35c" : "#ff7a3a";
        ctx.beginPath();
        ctx.arc(W * (0.5 + b.x), H * (1 - b.y), b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={cv} className="absolute size-full" />;
}

/** O placeholder do campo digita os exemplos sozinho, um por vez. */
function useExemplo(exemplos: string[]) {
  const [texto, setTexto] = useState("");
  useEffect(() => {
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
          id = window.setTimeout(passo, 1800);
          return;
        }
        id = window.setTimeout(passo, 55 + Math.random() * 55);
      } else {
        n--;
        setTexto(alvo.slice(0, n));
        if (n <= 0) {
          apagando = false;
          i++;
        }
        id = window.setTimeout(passo, 26);
      }
    };
    id = window.setTimeout(parado ? () => setTexto(exemplos[0]) : passo, parado ? 0 : 900);
    return () => window.clearTimeout(id);
  }, [exemplos]);
  return texto;
}

export default function Contato({ t }: { t: Dicionario }) {
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const fogo = useRef<HTMLDivElement>(null);
  const [quero, setQuero] = useState("");
  const exemplo = useExemplo(t.contato.exemplos);

  // parallax e a luz da fogueira
  useEffect(() => {
    const el = palco.current;
    if (!el || menosMovimento()) return;
    const camadas = [...el.querySelectorAll<HTMLElement>("[data-d]")].map((c) => ({ c, d: Number(c.dataset.d) }));
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
      // fogo: soma de senos rápidos e lentos, nunca apaga
      if (fogo.current) fogo.current.style.opacity = (0.78 + 0.1 * Math.sin(t * 9.3) + 0.07 * Math.sin(t * 23.1 + 1) + 0.05 * Math.sin(t * 2.1)).toFixed(3);
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
      const split = SplitText.create(".con-titulo", { type: "words", mask: "words", wordsClass: "sp-palavra" });
      gsap.from(split.words, { yPercent: 110, stagger: 0.06, duration: 1.2, ease: "expo.out", delay: 0.2 });
      gsap.from(".con-entra", { autoAlpha: 0, y: 18, stagger: 0.1, duration: 1, ease: "expo.out", delay: 0.45 });
      gsap.from(".con-camada", { autoAlpha: 0, scale: 1.04, stagger: 0.08, duration: 1.6, ease: "expo.out" });
      return () => split.revert();
    },
    { scope: secao },
  );

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = quero.trim() || exemplo || t.contato.exemplos[0];
    window.open(linkWhatsApp(`${t.contato.mensagem}${texto}`), "_blank", "noopener");
  };

  const links: [string, string][] = [
    [contato.email, `mailto:${contato.email}`],
    ["LinkedIn", contato.linkedin],
    ["GitHub", contato.github],
    ["Instagram", contato.instagram],
  ];

  const luz = (p: { x: number; y: number }, raio: string, cor: string) => ({
    background: `radial-gradient(${raio} at ${p.x * 100}% ${p.y * 100}%, ${cor}, transparent 70%)`,
  });

  return (
    <section ref={secao} className="relative bg-[#05070c] text-white md:h-svh md:min-h-[640px]" aria-labelledby="con-titulo">
      {/* a cena: no celular, a metade de cima; no desktop, a tela toda */}
      <div ref={palco} className="palco relative h-[58svh] overflow-hidden md:absolute md:inset-0 md:h-full" aria-hidden>
        <div className="capa [--px:.82] md:[--px:.5]">
          {CAMADAS.map((c) => (
            <div key={c.id} data-d={c.d} className="absolute inset-0 will-change-transform">
              {c.id === "chao" ? (
                <div className="con-camada absolute bottom-[-6%]" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, width: `${c.w * 100}%` }}>
                  {/* névoa rente ao chão e a terra escura por baixo */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(70,82,104,.55)_7%,#141a26_16%,#0b0f17_45%,#080b12_100%)]" />
                  <div className="sob-nevoa absolute inset-x-0 top-[-4%] h-[22%] opacity-40" />
                </div>
              ) : (
                <div className="con-camada absolute" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, width: `${c.w * 100}%` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- export estático, camadas já otimizadas */}
                  <img src={c.src} alt="" draggable={false} decoding="async" className={`block w-full select-none ${c.espelhar ? "-scale-x-100" : ""}`} />
                </div>
              )}
              {/* as luzes e as brasas andam com o acampamento */}
              {c.id === "acampamento" && (
                <>
                  <div ref={fogo} className="pointer-events-none absolute inset-0 mix-blend-screen" style={luz(FOGO, "22% 30%", "rgba(255,140,60,.32)")} />
                  <div className="pointer-events-none absolute inset-0 mix-blend-screen" style={luz(NOTEBOOK, "6% 9%", "rgba(110,170,255,.22)")} />
                  <div className="pointer-events-none absolute" style={{ left: `${(FOGO.x - 0.05) * 100}%`, top: `${(FOGO.y - 0.32) * 100}%`, width: "10%", height: "32%" }}>
                    <Brasas />
                  </div>
                </>
              )}
              {c.id === "quadro" && <div className="pointer-events-none absolute inset-0 mix-blend-screen" style={luz(LANTERNA, "7% 10%", "rgba(255,170,80,.28)")} />}
            </div>
          ))}
        </div>
        {/* leitura do painel à esquerda e da base */}
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#05070cf5_0%,#05070cd9_28%,#05070c66_46%,transparent_62%)] md:block" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#05070c_0%,transparent_35%)]" />
        <div aria-hidden className="grao pointer-events-none absolute inset-0" />
      </div>

      {/* o painel da missão */}
      <div className="relative mx-auto flex max-w-[1600px] flex-col justify-center px-5 pb-24 pt-2 md:h-full md:px-14 md:pb-0 md:pt-16">
        <div className="max-w-[34rem]">
          <p className="con-entra mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">{t.contato.rotulo}</p>
          <h2 id="con-titulo" className="con-titulo font-display text-[11vw] leading-[1.02] md:text-[4.2vw]">
            {t.contato.titulo}
          </h2>
          <p className="con-entra mt-5 text-[17px] leading-relaxed text-white/70">{t.contato.sub}</p>

          <form onSubmit={enviar} className="con-entra mt-10 rounded-2xl border border-white/10 bg-[#0b0f17]/80 p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)] backdrop-blur-md md:p-6">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#ffb35c]">
              <span className="size-1.5 rounded-full bg-[#ffb35c]" aria-hidden />
              {t.contato.missao}
            </p>
            <label className="mt-4 block">
              <span className="sr-only">{t.contato.campo}</span>
              <span className="flex flex-wrap items-baseline gap-x-2 font-display text-[22px] leading-snug md:text-[26px]">
                <span className="text-white/55">{t.contato.prefixo}</span>
                <input
                  value={quero}
                  onChange={(e) => setQuero(e.target.value)}
                  placeholder={exemplo}
                  maxLength={140}
                  className="min-w-[10ch] basis-full border-b sm:basis-auto sm:flex-1 border-white/20 bg-transparent pb-1 text-white caret-[#ffb35c] outline-none transition-colors placeholder:text-white/30 focus:border-[#ffb35c]"
                />
              </span>
            </label>
            <button type="submit" className="group mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 text-[15px] font-medium text-black transition-colors hover:bg-[#ffb35c]">
              {t.contato.enviar}
              <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 ease-corte group-hover:translate-x-0.5 group-hover:rotate-[-45deg]">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          </form>

          <p className="con-entra mt-6 text-[13px] text-white/45">
            {t.contato.outros}{" "}
            {links.map(([rotulo, href], i) => (
              <span key={rotulo}>
                <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener" className="text-white/75 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60">
                  {rotulo}
                </a>
                {i < links.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
