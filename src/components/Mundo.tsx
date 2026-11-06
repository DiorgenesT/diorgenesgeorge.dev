"use client";

import { useEffect, useRef } from "react";
import { menosMovimento } from "@/lib/gsap";

/**
 * O mundo do jogo (tema claro), no mesmo modelo do quarto: o fundo é vídeo (o mundo vazio: nuvens, névoa,
 * cachoeiras e grama, media/raw/veo-4-mundo-vazio.mp4) e, por cima, em parallax, ele de costas na beira da
 * pedra e a grama da frente. As transições (blocos, portal) não leem o DOM: pedem a cena composta num canvas,
 * com o deslocamento de parallax de agora, para a troca não pular.
 */

export type MundoApi = {
  /** A cena inteira num canvas 1280×720 (o mesmo quadro 16:9 da página). */
  cena: () => HTMLCanvasElement;
  /** Põe o vídeo no 1º quadro e espera ele estar pronto (a ida monta o mundo a partir desse quadro). */
  preparar: () => Promise<void>;
  /** Liga (tema claro) ou para o vídeo e o parallax. */
  ligar: (sim: boolean) => void;
};

type Camada = { id: string; src: string; d: number; x: number; y: number; w: number };

const W = 1280;
const H = 720;
/** O vídeo é um pouco maior que o quadro, para o parallax não mostrar as bordas. */
const FOLGA = 1.04;
const D_VIDEO = 0.12;

// posições em frações do quadro 16:9: ele de pé na pedra do vídeo, a grama na frente
const CAMADAS: Camada[] = [
  { id: "ele", src: "/mundo/ele.webp", d: 0.55, x: 0.432, y: 0.46, w: 0.0742 },
  { id: "frente", src: "/mundo/frente.webp", d: 1.1, x: -0.03, y: 0.7, w: 1.06 },
];
const PARALLAX = { x: 80, y: 36 };
/** Sombra de contato sob as botas (frações do quadro): centro e raios da elipse. */
const SOMBRA = { x: 0.469, y: 0.858, rx: 0.05, ry: 0.012 };

export default function Mundo({ onPronto }: { onPronto?: (api: MundoApi) => void }) {
  const raiz = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const ligado = useRef(false);
  const atual = useRef({ x: 0, y: 0 });

  // parallax: mouse onde houver; sem mouse (toque), uma deriva lenta
  useEffect(() => {
    const el = raiz.current!;
    const camadas = [...el.querySelectorAll<HTMLElement>("[data-d]")].map((c) => ({ c, d: Number(c.dataset.d) }));
    const alvo = { x: 0, y: 0 };
    const a = atual.current;
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
    };
    if (!menosMovimento()) {
      raf = requestAnimationFrame(quadro);
      window.addEventListener("pointermove", mover);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
    };
  }, []);

  useEffect(() => {
    const el = raiz.current!;
    const quadro = document.createElement("canvas");
    quadro.width = W;
    quadro.height = H;
    const img = (id: string) => el.querySelector<HTMLImageElement>(`img[data-camada="${id}"]`);

    const cena = () => {
      const ctx = quadro.getContext("2d")!;
      const largura = el.offsetWidth || W;
      const a = atual.current;
      const desloc = (d: number) => [((-a.x * d * PARALLAX.x) / largura) * W, ((-a.y * d * PARALLAX.y) / largura) * W];
      ctx.fillStyle = "#0b1d38";
      ctx.fillRect(0, 0, W, H);
      const v = video.current;
      if (v && v.readyState >= 2) {
        // o mesmo object-cover da página, com a folga do parallax
        const [dx, dy] = desloc(D_VIDEO);
        const vw = W * FOLGA;
        const vh = H * FOLGA;
        const e = Math.max(vw / v.videoWidth, vh / v.videoHeight);
        const sw = vw / e;
        const sh = vh / e;
        ctx.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, (W - vw) / 2 + dx, (H - vh) / 2 + dy, vw, vh);
      }
      for (const c of CAMADAS) {
        if (c.id === "ele") {
          const [sx, sy] = desloc(c.d);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
          g.addColorStop(0, "rgba(5,8,14,.55)");
          g.addColorStop(1, "rgba(5,8,14,0)");
          ctx.save();
          ctx.translate(SOMBRA.x * W + sx, SOMBRA.y * H + sy);
          ctx.scale(SOMBRA.rx * W, SOMBRA.ry * H);
          ctx.fillStyle = g;
          ctx.fillRect(-1, -1, 2, 2);
          ctx.restore();
        }
        const i = img(c.id);
        if (!i?.naturalWidth) continue;
        const [dx, dy] = desloc(c.d);
        const w = c.w * W;
        ctx.drawImage(i, c.x * W + dx, c.y * H + dy, w, (w * i.naturalHeight) / i.naturalWidth);
      }
      return quadro;
    };

    const preparar = () =>
      new Promise<void>((ok) => {
        const v = video.current;
        if (!v) return ok();
        v.preload = "auto";
        v.pause();
        const pronto = () => {
          clearTimeout(seguro);
          ok();
        };
        const seguro = setTimeout(pronto, 1500);
        if (v.currentTime === 0 && v.readyState >= 2) return pronto();
        v.addEventListener(v.readyState >= 1 ? "seeked" : "loadeddata", pronto, { once: true });
        if (v.readyState >= 1) v.currentTime = 0;
        else v.load();
      });

    const ligar = (sim: boolean) => {
      ligado.current = sim;
      const v = video.current;
      if (!v) return;
      if (sim) {
        v.preload = "auto";
        v.play().catch(() => {});
      } else v.pause();
    };

    onPronto?.({ cena, preparar, ligar });
  }, [onPronto]);

  const caixa = (x: number, y: number, w: number) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%` });

  return (
    <div ref={raiz} className="absolute inset-0 overflow-hidden">
      <div data-d={D_VIDEO} className="absolute inset-0 will-change-transform">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero/isekai/mundo.webp"
          className="absolute max-w-none object-cover"
          style={{ left: `${((1 - FOLGA) / 2) * 100}%`, top: `${((1 - FOLGA) / 2) * 100}%`, width: `${FOLGA * 100}%`, height: `${FOLGA * 100}%` }}
        >
          <source src="/hero/isekai/mundo-loop.webm" type="video/webm" />
          <source src="/hero/isekai/mundo-loop.mp4" type="video/mp4" />
        </video>
      </div>
      {CAMADAS.map((c) => (
        <div key={c.id} data-d={c.d} className="absolute inset-0 will-change-transform">
          {c.id === "ele" && (
            <div
              className="absolute rounded-[50%]"
              style={{
                left: `${(SOMBRA.x - SOMBRA.rx) * 100}%`,
                top: `${(SOMBRA.y - SOMBRA.ry) * 100}%`,
                width: `${SOMBRA.rx * 200}%`,
                height: `${SOMBRA.ry * 200}%`,
                background: "radial-gradient(closest-side, rgba(5,8,14,.55), rgba(5,8,14,0))",
              }}
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- export estático, camadas já otimizadas */}
          <img data-camada={c.id} src={c.src} alt="" draggable={false} decoding="async" className="absolute block select-none" style={caixa(c.x, c.y, c.w)} />
        </div>
      ))}
    </div>
  );
}
