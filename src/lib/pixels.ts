/**
 * Transição "Build & Run": o clarão branco do Enter vira blocos que se dissolvem e revelam o mundo do
 * jogo, que entra pixelado e vai ganhando resolução, como um jogo carregando. p = 0 é tudo branco;
 * p = 1 é o mundo nítido. A volta é a mesma função com p de 1 até 0.
 *
 * Canvas 2D, sem WebGL: barato, roda em qualquer celular e aceita imagem ou <video> como fonte.
 */

import { MONITOR } from "./luz";

const COLS = 32;
const LINS = 18;
/** Resoluções (em colunas) pelas quais o mundo passa até ficar nítido. 0 = resolução cheia. */
const RESOLUCOES = [10, 20, 40, 80, 160, 0];

export type Fonte = HTMLImageElement | HTMLVideoElement;

export function criarTransicao(canvas: HTMLCanvasElement, fonte: Fonte) {
  const ctx = canvas.getContext("2d")!;
  const mini = document.createElement("canvas");
  const mctx = mini.getContext("2d")!;

  // Atraso de cada bloco: aleatório + distância até o monitor do jogo (o clarão nasce de lá),
  // então o mundo "vaza" a partir do ponto de onde veio a luz.
  const origem = MONITOR;
  const atrasos = Array.from({ length: COLS * LINS }, (_, i) => {
    const c = i % COLS;
    const l = Math.floor(i / COLS);
    const dx = (c + 0.5) / COLS - origem.x;
    const dy = ((l + 0.5) / LINS - origem.y) * 0.6;
    return Math.min(1, Math.hypot(dx, dy) * 0.75) * 0.55 + Math.random() * 0.2;
  });

  const ajustar = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  function desenhar(p: number) {
    ajustar();
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);

    // 1) o mundo, pixelado conforme o progresso
    const passo = Math.min(RESOLUCOES.length - 1, Math.floor(Math.max(0, p - 0.15) / 0.85 * RESOLUCOES.length));
    const cols = RESOLUCOES[passo];
    if (cols === 0) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(fonte, 0, 0, W, H);
    } else {
      const lins = Math.max(1, Math.round((cols * H) / W));
      mini.width = cols;
      mini.height = lins;
      mctx.imageSmoothingEnabled = true;
      mctx.drawImage(fonte, 0, 0, cols, lins);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(mini, 0, 0, W, H);
    }

    // 2) blocos de luz por cima, se dissolvendo do monitor para fora
    const cw = W / COLS;
    const ch = H / LINS;
    for (let i = 0; i < atrasos.length; i++) {
      const a = 1 - Math.min(1, Math.max(0, (p * 1.25 - atrasos[i]) / 0.3));
      if (a <= 0.01) continue;
      const c = i % COLS;
      const l = Math.floor(i / COLS);
      // borda ciano nos blocos meio dissolvidos: o "glitch" de quando o mundo compila
      ctx.fillStyle = a < 0.6 ? `rgba(125,243,255,${a})` : `rgba(240,252,255,${a})`;
      ctx.fillRect(Math.floor(c * cw), Math.floor(l * ch), Math.ceil(cw), Math.ceil(ch));
    }
  }

  /** Anima de `de` até `ate` em `ms`; resolve ao terminar. */
  function animar(de: number, ate: number, ms: number) {
    return new Promise<void>((fim) => {
      const t0 = performance.now();
      const quadro = (agora: number) => {
        const k = Math.min(1, (agora - t0) / ms);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; // easeInOutQuad
        desenhar(de + (ate - de) * e);
        if (k < 1) requestAnimationFrame(quadro);
        else fim();
      };
      requestAnimationFrame(quadro);
    });
  }

  return { desenhar, animar };
}
