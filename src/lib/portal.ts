/**
 * Portal entre o hero e as telas (Trabalhos, Jogos...).
 *
 * A tela nova é projetada em perspectiva de verdade (homografia em matrix3d) dentro do monitor de código
 * (tema escuro) ou do cristal (mundo do jogo). Roteiro, em função do progresso p (0 = hero, 1 = tela aberta):
 *  1. o monitor "liga" como um CRT: uma linha de luz se abre e a página aparece dentro da tela do PC;
 *  2. a câmera mergulha e o quarto desfoca e escurece;
 *  3. o painel se solta do monitor e voa até a janela (passa um pouco e assenta), com a borda brilhando;
 *  4. ao pousar, um reflexo varre o painel e as scanlines somem.
 * Abrir e fechar são o mesmo desenho ao contrário.
 */

type Ponto = readonly [number, number];
type Quad = readonly [Ponto, Ponto, Ponto, Ponto]; // sup. esq., sup. dir., inf. dir., inf. esq.

interface Forma {
  /** Quadrilátero de origem no quadro 16:9 dos vídeos (frações). */
  quad: Quad;
  /** Recorte (em % do painel) enquanto ele está na origem; abre até o retângulo. 5 pontos. */
  recorte?: readonly Ponto[];
}

export const FORMAS: Record<"escuro" | "claro", Forma> = {
  // a tela do monitor de código, medida no vídeo do Kling
  escuro: {
    quad: [
      [0.491, 0.317],
      [0.67, 0.294],
      [0.67, 0.566],
      [0.491, 0.566],
    ],
  },
  // o cristal: o painel nasce na caixa dele, recortado no formato do cristal
  claro: {
    quad: [
      [0.184, 0.308],
      [0.299, 0.308],
      [0.299, 0.894],
      [0.184, 0.894],
    ],
    recorte: [
      [17, 17],
      [71, 0],
      [100, 27],
      [98, 100],
      [0, 100],
    ],
  },
};
const RETANGULO: readonly Ponto[] = [
  [0, 0],
  [50, 0],
  [100, 0],
  [100, 100],
  [0, 100],
];

/** Elementos do hero que o portal move (o Hero registra ao montar). */
export const palco: { capa: HTMLElement | null; texto: HTMLElement | null } = { capa: null, texto: null };

const limitar = (a: number, b: number, t: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const entrarSair = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const entrar = (k: number) => k * k * k;
const sair = (k: number) => 1 - (1 - k) ** 3;
/** Passa um pouco do alvo e volta (o painel "pousa"). */
const pousar = (k: number) => {
  const c = 1.2;
  return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
};

/** matrix3d que leva o retângulo w×h (origem 0 0) ao quadrilátero q (homografia). */
function homografia(w: number, h: number, q: readonly Ponto[]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.map((n) => +n.toFixed(8)).join(",")})`;
}

export interface PartesDoPortal {
  /** Envolve o painel: o drop-shadow dele segue o formato projetado (borda que brilha). */
  moldura: HTMLElement;
  /** O painel (a tela nova): recebe a homografia e o recorte. */
  tela: HTMLElement;
  /** O conteúdo dentro do painel: "liga" como um CRT. */
  conteudo: HTMLElement | null;
  /** Vidro por cima do conteúdo: scanlines, brilho de tela e o reflexo que varre ao pousar. */
  vidro: HTMLElement | null;
}

/** Desenha o instante p do portal. */
export function quadroDoPortal(p: number, partes: PartesDoPortal, visual: "escuro" | "claro") {
  const { moldura, tela, conteudo, vidro } = partes;
  const capa = palco.capa;
  const forma = FORMAS[visual];
  const centro = forma.quad.reduce((a, [x, y]) => [a[0] + x / 4, a[1] + y / 4], [0, 0]);
  const W = window.innerWidth;
  const H = window.innerHeight;

  // 2) câmera: mergulha no ponto e o quarto escurece por trás do painel
  const zoom = 1 + 0.9 * entrar(limitar(0.05, 0.8, p));
  const fundo = limitar(0.2, 0.8, p);
  if (capa) {
    capa.style.transformOrigin = `${centro[0] * 100}% ${centro[1] * 100}%`;
    capa.style.transform = p > 0 ? `scale(${zoom})` : "";
    // só brilho (blur em vídeo de tela cheia derruba o FPS)
    capa.style.filter = fundo > 0 ? `brightness(${(1 - 0.6 * fundo).toFixed(3)})` : "";
  }
  if (palco.texto) {
    const k = limitar(0, 0.3, p);
    palco.texto.style.opacity = String(1 - k);
    palco.texto.style.transform = k ? `translateY(${-24 * k}px)` : "";
  }

  // posição da forma na janela (o rect da capa já vem com o zoom; a origem do zoom não se move)
  const r = capa?.getBoundingClientRect();
  const naJanela = ([fx, fy]: Ponto): Ponto =>
    r ? [r.left + r.width * centro[0] + (fx - centro[0]) * r.width, r.top + r.height * centro[1] + (fy - centro[1]) * r.height] : [W * fx, H * fy];
  const origem = forma.quad.map(naJanela);
  const janela: Ponto[] = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H],
  ];

  // 3) o painel se solta e voa até a janela (passa um pouco e assenta)
  const voo = limitar(0.32, 1, p);
  const v = pousar(voo);
  const quad = origem.map(([x, y], i) => [x + (janela[i][0] - x) * v, y + (janela[i][1] - y) * v] as Ponto);

  if (p >= 1 || p <= 0) {
    tela.style.transform = "";
    tela.style.transformOrigin = "";
    tela.style.clipPath = "";
    tela.style.height = "";
    tela.style.overflow = "";
  } else {
    // durante o voo o painel tem a altura da janela (a homografia vale para um retângulo W×H)
    tela.style.height = `${H}px`;
    tela.style.overflow = "hidden";
    tela.style.transformOrigin = "0 0";
    tela.style.transform = homografia(W, H, quad);
    if (forma.recorte) {
      const k = sair(limitar(0.32, 0.8, p));
      const pts = forma.recorte.map(([x, y], i) => `${x + (RETANGULO[i][0] - x) * k}% ${y + (RETANGULO[i][1] - y) * k}%`);
      tela.style.clipPath = `polygon(${pts.join(",")})`;
    } else tela.style.clipPath = "";
  }
  tela.style.visibility = p <= 0 ? "hidden" : "visible";

  // 1) o monitor liga como um CRT: uma linha de luz se abre na vertical
  const liga = limitar(0.02, 0.22, p);
  if (conteudo) {
    const sy = 0.012 + 0.988 * sair(liga);
    conteudo.style.transform = p >= 1 || p <= 0 ? "" : `scaleY(${sy.toFixed(4)})`;
    conteudo.style.transformOrigin = `50% ${H / 2}px`;
  }

  // 4) vidro: brilho de tela ligada, scanlines que somem ao pousar e o reflexo que varre o painel
  if (vidro) {
    const tela0 = 1 - limitar(0.55, 1, p);
    vidro.style.setProperty("--brilho", (0.9 * (1 - liga) + 0.22 * tela0).toFixed(3));
    vidro.style.setProperty("--linhas", (0.35 * tela0).toFixed(3));
    const varre = limitar(0.68, 1, p);
    vidro.style.setProperty("--reflexo", `${(-40 + 180 * entrarSair(varre)).toFixed(1)}%`);
    vidro.style.setProperty("--reflexo-a", (Math.sin(Math.PI * varre) * 0.5).toFixed(3));
    vidro.style.opacity = p >= 1 || p <= 0 ? "0" : "1";
  }

  // borda: acende quando a tela liga, fica forte no voo e some ao assentar
  const b = Math.min(1, p * 10) * (1 - limitar(0.8, 1, p));
  moldura.style.filter =
    b > 0.01 ? `drop-shadow(0 0 ${(10 + 18 * b).toFixed(1)}px rgba(125,243,255,${b.toFixed(2)}))` : "";
}

/** Limpa tudo que o portal mexeu no hero. */
export function soltarPalco() {
  if (palco.capa) {
    palco.capa.style.transform = "";
    palco.capa.style.filter = "";
  }
  if (palco.texto) {
    palco.texto.style.opacity = "";
    palco.texto.style.transform = "";
  }
}
