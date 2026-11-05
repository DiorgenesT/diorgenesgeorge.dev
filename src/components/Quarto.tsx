"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { menosMovimento } from "@/lib/gsap";
import {
  CAMADAS,
  CANECA,
  CODIGO,
  JOGO,
  LUMINARIA,
  PARALLAX,
  VIDRO,
  caixaDe,
  desenharNoQuad,
  perspectiva,
  type Ponto,
} from "@/lib/quarto";

/**
 * O quarto à noite, vivo: as camadas (src/lib/quarto.ts) com parallax no mouse (sem mouse, uma deriva
 * lenta), chuva no vidro, vapor da caneca, o mundo do jogo em vídeo no monitor direito, código parado no
 * editor do monitor esquerdo, a cúpula da luminária na frente do monitor e a luz respirando.
 *
 * As transições em WebGL (sucção e portal) não leem o DOM: pedem ao quarto um quadro composto num canvas
 * (QuartoApi), desenhado com o mesmo deslocamento de parallax que está na tela, para a troca não pular.
 */

export type QuartoApi = {
  /** A cena inteira, sem ele (o quarto vazio) e só a silhueta dele (branco no preto), em 1280×720. */
  compor: () => { quadro: HTMLCanvasElement; vazio: HTMLCanvasElement; mascara: HTMLCanvasElement };
  /** Só a cena inteira (barato o bastante para cada quadro do portal). */
  cena: () => HTMLCanvasElement;
  /** Para o loop de efeitos e o vídeo do jogo (tema claro) ou retoma. */
  ligar: (sim: boolean) => void;
};

const W = 1280;
const H = 720;

/** Um retângulo projetado nos cantos q (frações do quadro), dentro de um pai do tamanho do quadro. */
function Projetado({ q, children }: { q: Ponto[]; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const c = caixaDe(q);
  useEffect(() => {
    const e = el.current;
    const pai = e?.parentElement;
    if (!e || !pai) return;
    const ajustar = () => {
      if (!e.offsetWidth) return;
      e.style.transform = perspectiva(e.offsetWidth, e.offsetHeight, q.map(([x, y]) => [(x - c.x0) * pai.clientWidth, (y - c.y0) * pai.clientHeight]));
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(pai);
    return () => ro.disconnect();
  }, [q, c.x0, c.y0]);
  return (
    <div
      ref={el}
      className="absolute origin-top-left overflow-hidden"
      style={{ left: `${c.x0 * 100}%`, top: `${c.y0 * 100}%`, width: `${(c.x1 - c.x0) * 100}%`, height: `${(c.y1 - c.y0) * 100}%` }}
    >
      {children}
    </div>
  );
}

/**
 * O código do monitor esquerdo: parado, transparente sobre o editor da própria imagem (a barra de abas e os
 * números de linha são os da imagem). Em frações do retângulo da tela (CODIGO): a linha n fica em
 * LINHA0 + (n - 1) × PASSO e o texto começa em COLUNA, logo depois do cursor desenhado.
 */
const LINHA0 = 0.1596;
const PASSO = 0.0421;
const COLUNA = 0.19;
const LINHAS: [string, string][][] = [
  [["cm", "// o mundo do monitor ao lado"]],
  [["kw", "import"], ["tx", " { "], ["fn", "World"], ["tx", ", "], ["fn", "Fog"], ["tx", " } "], ["kw", "from"], ["st", ' "./engine"']],
  [],
  [["kw", "export function"], ["fn", " build"], ["tx", "(seed: "], ["fn", "number"], ["tx", ") {"]],
  [["kw", "  const"], ["tx", " world = "], ["kw", "new"], ["fn", " World"], ["tx", "(seed)"]],
  [["tx", "  world.terrain."], ["fn", "raise"], ["tx", "("], ["nm", "0.62"], ["tx", ")"]],
  [["tx", "  world.sky = "], ["st", '"overcast"']],
  [["tx", "  world."], ["fn", "add"], ["tx", "("], ["kw", "new"], ["fn", " Fog"], ["tx", "({ density: "], ["nm", "0.4"], ["tx", " }))"]],
  [["kw", "  for"], ["tx", " ("], ["kw", "const"], ["tx", " ruin "], ["kw", "of"], ["tx", " world.ruins)"]],
  [["tx", "    ruin."], ["fn", "erode"], ["tx", "("], ["nm", "1200"], ["tx", ")"]],
  [["tx", "  world."], ["fn", "spawn"], ["tx", "("], ["st", '"player"'], ["tx", ", { hood: "], ["kw", "true"], ["tx", " })"]],
  [["kw", "  return"], ["tx", " world"]],
  [["tx", "}"]],
  [],
  [["kw", "await"], ["fn", " run"], ["tx", "("], ["fn", "build"], ["tx", "("], ["nm", "42"], ["tx", "))"]],
];
const COR: Record<string, string> = { kw: "#c792ea", fn: "#82aaff", st: "#c3e88d", nm: "#f78c6c", cm: "rgba(255,255,255,.38)", tx: "rgba(226,232,240,.8)" };

function Codigo() {
  return (
    <div data-codigo className="absolute inset-0 font-mono [container-type:size]" style={{ opacity: 0.88 }}>
      {LINHAS.map((l, i) => (
        <div key={i} className="absolute whitespace-pre leading-none" style={{ left: `${COLUNA * 100}%`, top: `${(LINHA0 + i * PASSO) * 100}%`, fontSize: "2.55cqh", transform: "translateY(-50%)" }}>
          {l.map(([c, t], j) => (
            <span key={j} style={{ color: COR[c] }}>
              {t}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Chuva no vidro: riscos caindo e gotas escorrendo (canvas 2D barato). */
function Chuva({ ligado }: { ligado: React.RefObject<boolean> }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const riscos = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), v: 0.6 + Math.random() * 0.8, l: 0.02 + Math.random() * 0.04 }));
    const gotas = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), v: 0.02 + Math.random() * 0.05, r: 0.6 + Math.random() * 1.4 }));
    let ultimo = performance.now();
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      if (!ligado.current) return;
      const r = c.getBoundingClientRect();
      if (c.width !== Math.round(r.width) || c.height !== Math.round(r.height)) {
        c.width = Math.max(1, Math.round(r.width));
        c.height = Math.max(1, Math.round(r.height));
      }
      const w = c.width;
      const h = c.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(190,210,235,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const s of riscos) {
        s.y += s.v * dt * 1.6;
        if (s.y > 1.05) {
          s.y = -0.05;
          s.x = Math.random();
        }
        ctx.moveTo(s.x * w, s.y * h);
        ctx.lineTo(s.x * w - s.l * h * 0.08, (s.y + s.l) * h);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(210,225,245,0.35)";
      for (const g of gotas) {
        g.y += g.v * dt * (0.4 + Math.random());
        if (g.y > 1.02) {
          g.y = -0.02;
          g.x = Math.random();
        }
        ctx.beginPath();
        ctx.ellipse(g.x * w, g.y * h, g.r, g.r * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    if (!menosMovimento()) raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }, [ligado]);
  return <canvas ref={cv} className="absolute inset-0 size-full mix-blend-screen" />;
}

function Vapor() {
  return (
    <div className="absolute" style={{ left: `${CANECA[0] * 100}%`, top: `${CANECA[1] * 100}%`, width: "2.4%", height: "9%", transform: "translate(-50%, -100%)" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="quarto-vapor absolute bottom-0 left-1/2 h-full w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(230,236,245,.32),transparent)] blur-[3px]"
          style={{ animationDelay: `${i * 1.3}s`, marginLeft: `${(i - 1) * 18}%` }}
        />
      ))}
    </div>
  );
}

const caixaCss = (x: number, y: number, w: number) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%` });

export default function Quarto({ onPronto }: { onPronto?: (api: QuartoApi) => void }) {
  const raiz = useRef<HTMLDivElement>(null);
  const jogo = useRef<HTMLVideoElement>(null);
  const luz = useRef<HTMLDivElement>(null);
  const ligado = useRef(true);
  const atual = useRef({ x: 0, y: 0 });

  // parallax e a luz das telas
  useEffect(() => {
    const el = raiz.current!;
    const camadas = [...el.querySelectorAll<HTMLElement>("[data-d]")].map((c) => ({ c, d: Number(c.dataset.d) }));
    const alvo = { x: 0, y: 0 };
    const a = atual.current;
    const parado = menosMovimento();
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
      if (!ligado.current) return;
      const t = (agora - t0) / 1000;
      if (!mouse) {
        alvo.x = Math.sin(t * 0.25) * 0.35;
        alvo.y = Math.sin(t * 0.17 + 1) * 0.2;
      }
      a.x += (alvo.x - a.x) * 0.06;
      a.y += (alvo.y - a.y) * 0.06;
      for (const { c, d } of camadas) c.style.transform = `translate3d(${(-a.x * d * PARALLAX.x).toFixed(2)}px, ${(-a.y * d * PARALLAX.y).toFixed(2)}px, 0)`;
      if (luz.current) luz.current.style.opacity = (0.55 + 0.12 * Math.sin(t * 1.3) + (Math.sin(t * 7.1) > 0.97 ? 0.15 : 0)).toFixed(3);
    };
    if (!parado) {
      raf = requestAnimationFrame(quadro);
      window.addEventListener("pointermove", mover);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
    };
  }, []);

  // o compositor (para as transições em WebGL)
  useEffect(() => {
    const el = raiz.current!;
    const novo = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      return c;
    };
    const quadro = novo();
    const vazio = novo();
    const mascara = novo();
    // a caixa da tela do jogo (a mesma do Projetado), em px do quadro composto
    const cj = caixaDe(JOGO);
    const telaJogo = document.createElement("canvas");
    // em dobro: a malha em perspectiva amostra melhor e o vídeo não fica mais mole que o da página
    telaJogo.width = Math.round((cj.x1 - cj.x0) * W * 2);
    telaJogo.height = Math.round((cj.y1 - cj.y0) * H * 2);
    // o código do monitor esquerdo, desenhado uma vez (é parado), em dobro de resolução
    const cc = caixaDe(CODIGO);
    const telaCodigo = document.createElement("canvas");
    telaCodigo.width = Math.round((cc.x1 - cc.x0) * W * 2);
    telaCodigo.height = Math.round((cc.y1 - cc.y0) * H * 2);
    // a mesma fonte do DOM (a Geist Mono do site): outra fonte muda a largura das letras e o texto "pula"
    const pintarCodigo = () => {
      const g = telaCodigo.getContext("2d")!;
      g.clearRect(0, 0, telaCodigo.width, telaCodigo.height);
      const fs = 0.0255 * telaCodigo.height;
      const familia = getComputedStyle(el.querySelector<HTMLElement>("[data-codigo]") ?? el).fontFamily;
      g.font = `${fs}px ${familia}`;
      g.textBaseline = "middle";
      g.globalAlpha = 0.88;
      LINHAS.forEach((l, i) => {
        let x = COLUNA * telaCodigo.width;
        const y = (LINHA0 + i * PASSO) * telaCodigo.height;
        for (const [c, t] of l) {
          g.fillStyle = COR[c];
          g.fillText(t, x, y);
          x += g.measureText(t).width;
        }
      });
    };
    pintarCodigo();
    document.fonts?.ready.then(pintarCodigo);
    const img = (id: string) => el.querySelector<HTMLImageElement>(`img[data-camada="${id}"]`)!;

    const deslocamento = () => {
      const largura = el.offsetWidth || W;
      const a = atual.current;
      return (d: number): Ponto => [((-a.x * d * PARALLAX.x) / largura) * W, ((-a.y * d * PARALLAX.y) / largura) * W];
    };
    const pintar = (ctx: CanvasRenderingContext2D, comEle: boolean, desloc: (d: number) => Ponto) => {
        ctx.fillStyle = "#05070c";
        ctx.fillRect(0, 0, W, H);
        for (const c of CAMADAS) {
          if (c.id === "ele" && !comEle) continue;
          const i = img(c.id);
          if (!i?.naturalWidth) continue;
          const [dx, dy] = desloc(c.d);
          const w = c.w * W;
          ctx.drawImage(i, c.x * W + dx, c.y * H + dy, w, (w * i.naturalHeight) / i.naturalWidth);
          if (c.id === "mesa") {
            // as telas e a cúpula andam com a mesa
            desenharNoQuad(ctx, telaCodigo, telaCodigo.width, telaCodigo.height, CODIGO.map(([x, y]) => [x * W + dx, y * H + dy] as Ponto));
            const v = jogo.current;
            if (v && v.readyState >= 2) {
              // o mesmo recorte do object-cover da página: senão a tela encolhe e estica na troca
              const g = telaJogo.getContext("2d")!;
              const ev = Math.max(telaJogo.width / v.videoWidth, telaJogo.height / v.videoHeight);
              const sw = telaJogo.width / ev;
              const sh = telaJogo.height / ev;
              g.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, telaJogo.width, telaJogo.height);
              desenharNoQuad(ctx, telaJogo, telaJogo.width, telaJogo.height, JOGO.map(([x, y]) => [x * W + dx, y * H + dy] as Ponto));
            }
            const l = img("luminaria");
            if (l?.naturalWidth) {
              const lw = LUMINARIA.w * W;
              ctx.drawImage(l, LUMINARIA.x * W + dx, LUMINARIA.y * H + dy, lw, (lw * l.naturalHeight) / l.naturalWidth);
            }
          }
        }
        pintarLuz(ctx);
      };
    /** A luz fria das telas (o mesmo radial em "screen" da página, na opacidade do momento). */
    const pintarLuz = (ctx: CanvasRenderingContext2D) => {
      const op = Number(luz.current?.style.opacity || 0.55);
      const g = ctx.createRadialGradient(0.52 * W, 0.42 * H, 0, 0.52 * W, 0.42 * H, 1);
      g.addColorStop(0, `rgba(110,170,230,${(0.16 * op).toFixed(4)})`);
      g.addColorStop(0.7, "rgba(110,170,230,0)");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      // o radial do CSS é uma elipse de 38% × 42% do quadro
      ctx.translate(0.52 * W, 0.42 * H);
      ctx.scale(0.38 * W, 0.42 * H);
      ctx.translate(-0.52 * W, -0.42 * H);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    };

    const cena = () => {
      pintar(quadro.getContext("2d")!, true, deslocamento());
      return quadro;
    };

    const compor = () => {
      const desloc = deslocamento();
      pintar(quadro.getContext("2d")!, true, desloc);
      pintar(vazio.getContext("2d")!, false, desloc);
      // a silhueta dele: a própria camada, pintada de branco sobre o preto
      const m = mascara.getContext("2d")!;
      m.globalCompositeOperation = "source-over";
      m.fillStyle = "#000";
      m.fillRect(0, 0, W, H);
      const ele = CAMADAS.find((c) => c.id === "ele")!;
      const ie = img("ele");
      if (ie?.naturalWidth) {
        const [dx, dy] = desloc(ele.d);
        const w = ele.w * W;
        const tmp = novo();
        const t = tmp.getContext("2d")!;
        t.drawImage(ie, ele.x * W + dx, ele.y * H + dy, w, (w * ie.naturalHeight) / ie.naturalWidth);
        t.globalCompositeOperation = "source-in";
        t.fillStyle = "#fff";
        t.fillRect(0, 0, W, H);
        m.drawImage(tmp, 0, 0);
      }
      return { quadro, vazio, mascara };
    };

    const ligar = (sim: boolean) => {
      ligado.current = sim;
      const v = jogo.current;
      if (!v) return;
      if (sim) v.play().catch(() => {});
      else v.pause();
    };
    onPronto?.({ compor, cena, ligar });
  }, [onPronto]);

  return (
    <div ref={raiz} className="absolute inset-0">
      {CAMADAS.map((c) => (
        <div key={c.id} data-d={c.d} className="absolute inset-0 will-change-transform">
          <div className="absolute" style={caixaCss(c.x, c.y, c.w)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- export estático, camadas já otimizadas */}
            <img data-camada={c.id} src={c.src} alt="" draggable={false} decoding="async" className="block w-full select-none" />
            {c.id === "fundo" && (
              <div className="absolute overflow-hidden" style={{ left: `${VIDRO.x * 100}%`, top: `${VIDRO.y * 100}%`, width: `${VIDRO.w * 100}%`, height: `${VIDRO.h * 100}%` }}>
                <Chuva ligado={ligado} />
              </div>
            )}
          </div>
          {c.id === "mesa" && (
            <>
              <Projetado q={CODIGO}>
                <Codigo />
              </Projetado>
              <Projetado q={JOGO}>
                {/* o mesmo arquivo do mundo do tema claro: o navegador baixa uma vez só */}
                <video ref={jogo} autoPlay muted loop playsInline preload="auto" className="absolute inset-0 size-full object-cover">
                  <source src="/hero/isekai/mundo-loop.webm" type="video/webm" />
                  <source src="/hero/isekai/mundo-loop.mp4" type="video/mp4" />
                </video>
              </Projetado>
              {/* a cúpula da luminária fica na frente do monitor de código */}
              {/* eslint-disable-next-line @next/next/no-img-element -- export estático */}
              <img data-camada="luminaria" src={LUMINARIA.src} alt="" draggable={false} className="pointer-events-none absolute select-none" style={caixaCss(LUMINARIA.x, LUMINARIA.y, LUMINARIA.w)} />
              <Vapor />
            </>
          )}
        </div>
      ))}
      {/* luz fria das telas sobre o quarto */}
      <div ref={luz} className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: "radial-gradient(38% 42% at 52% 42%, rgba(110,170,230,.16), transparent 70%)" }} />
    </div>
  );
}
