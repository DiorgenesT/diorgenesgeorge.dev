/**
 * Transição entre abas (Trabalhos, Jogos, Sobre, Contato) com uma já aberta: "blocos de build".
 * Uma onda de blocos escuros varre a janela em diagonal (de cima à esquerda para baixo à direita) cobrindo a
 * aba atual; cada bloco assenta com um contorno ciano rápido. Com tudo coberto a aba nova é montada por
 * baixo, e os blocos se desfazem continuando a mesma onda.
 * Canvas 2D, uma grade de algumas centenas de retângulos: barato em qualquer aparelho.
 */

const COR = "#05070c";
const CIANO = "125,243,255";

type Bloco = { x: number; y: number; atraso: number };

export function criarBlocos(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let blocos: Bloco[] = [];
  let lado = 56;
  let W = 0;
  let H = 0;

  const montar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lado = W < 768 ? 40 : 60;
    const cols = Math.ceil(W / lado);
    const lins = Math.ceil(H / lado);
    blocos = [];
    for (let l = 0; l < lins; l++)
      for (let c = 0; c < cols; c++) {
        // a diagonal define a onda; um pouco de acaso deixa a frente "quebrada", como um build
        const diag = (c / cols) * 0.62 + (l / lins) * 0.38;
        blocos.push({ x: c * lado, y: l * lado, atraso: diag * 0.62 + Math.random() * 0.16 });
      }
  };

  const suave = (k: number) => 1 - (1 - k) ** 3;

  /** k de 0 a 1: cada bloco cresce do centro (cobrir) ou encolhe para o centro (revelar). */
  function desenhar(k: number, cobrindo: boolean) {
    ctx.clearRect(0, 0, W, H);
    for (const b of blocos) {
      const t = Math.min(1, Math.max(0, (k - b.atraso) / 0.22));
      const s = cobrindo ? suave(t) : 1 - suave(t);
      if (s <= 0.001) continue;
      const tam = lado * s + 0.6; // meio pixel de sobra: sem frestas entre blocos cheios
      const x = b.x + (lado - tam) / 2;
      const y = b.y + (lado - tam) / 2;
      ctx.fillStyle = COR;
      ctx.fillRect(x, y, tam, tam);
      // o contorno ciano acende quando o bloco assenta e apaga logo
      const brilho = cobrindo ? Math.sin(Math.PI * t) : Math.sin(Math.PI * Math.min(1, t * 1.4));
      if (brilho > 0.02) {
        ctx.strokeStyle = `rgba(${CIANO},${(0.55 * brilho).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, tam - 1, tam - 1);
      }
    }
  }

  const rodar = (cobrindo: boolean, ms: number) =>
    new Promise<void>((fim) => {
      const ini = performance.now();
      const quadro = () => {
        const k = Math.min(1, (performance.now() - ini) / ms);
        desenhar(k, cobrindo);
        if (k < 1) requestAnimationFrame(quadro);
        else fim();
      };
      requestAnimationFrame(quadro);
    });

  return {
    /** Cobre a janela (a onda até o fim: tudo preto). */
    cobrir: (ms = 760) => {
      montar();
      canvas.style.visibility = "visible";
      return rodar(true, ms);
    },
    /** Desfaz os blocos revelando o que está por baixo. */
    revelar: async (ms = 820) => {
      await rodar(false, ms);
      ctx.clearRect(0, 0, W, H);
      canvas.style.visibility = "hidden";
    },
  };
}
