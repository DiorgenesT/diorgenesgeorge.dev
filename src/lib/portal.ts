import { criarNevoa, type Nevoa } from "./nevoa";

/**
 * Portal entre o hero e as telas (Trabalhos, Jogos...).
 *
 * No quarto (tema escuro), a câmera entra na tela do monitor de código. Roteiro, em função do progresso
 * p (0 = hero, 1 = tela aberta):
 *  1. a câmera acelera rumo ao monitor (zoom exponencial) e leva o centro da tela ao centro da janela;
 *     a tela continua mostrando o código do vídeo, e a luz dela cresce;
 *  2. de perto, aparece a grade de subpixels do LCD (vermelho, verde e azul), presa à tela e crescendo
 *     com o zoom (camada em multiply: onde a imagem é branca, as três barras acendem);
 *  3. no pico, quando o que se vê são os subpixels, o código vira a página por baixo da grade;
 *  4. a grade se abre e some, e a página assenta nítida.
 * No mundo do jogo (tema claro), o mundo escurece e depois "buga" (ou se abre em nuvens) revelando a tela
 * (menuDePausa).
 * Abrir e fechar são o mesmo desenho ao contrário.
 */

type Ponto = readonly [number, number];
type Quad = readonly [Ponto, Ponto, Ponto, Ponto]; // sup. esq., sup. dir., inf. dir., inf. esq.

/** A tela do monitor de código no quadro 16:9 dos vídeos (frações), medida no loop do Veo. */
const MONITOR_CODIGO: Quad = [
  [0.482, 0.345],
  [0.673, 0.333],
  [0.673, 0.586],
  [0.482, 0.584],
];

/** Elementos do hero que o portal move (o Hero registra ao montar). */
export const palco: {
  capa: HTMLElement | null;
  texto: HTMLElement | null;
  /** O que mostra o mundo do jogo agora (vídeo ou a imagem do 1º quadro), para a transição em WebGL. */
  mundo: (() => TexImageSource | null) | null;
} = { capa: null, texto: null, mundo: null };

/** Transição do mundo do jogo para uma tela, depois que ele escurece. */
export const MODO_MUNDO: "nuvens" | "glitch" = "glitch";

const limitar = (a: number, b: number, t: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

export interface PartesDoPortal {
  /** Envolve o painel: o drop-shadow dele segue o formato projetado (borda que brilha). */
  moldura: HTMLElement;
  /** O painel (a tela nova). */
  tela: HTMLElement;
  /** O conteúdo dentro do painel: "liga" como um CRT. */
  conteudo: HTMLElement | null;
  /** Vidro por cima do conteúdo: brilho de tela (no menu de pausa, a linha de luz). */
  vidro: HTMLElement | null;
  /** Grade de subpixels do LCD, fixa sobre a janela (variáveis CSS --c, --gx, --gy). */
  grade: HTMLElement | null;
  /** Canvas da transição do mundo do jogo (src/lib/nevoa.ts), fixo sobre a janela. */
  nevoa: HTMLCanvasElement | null;
  /** Rolagem da tela no momento de fechar: durante a volta o conteúdo fica nesse mesmo trecho. */
  deslocamento?: number;
}

/** Mantém o trecho que estava na tela enquanto o portal anima (a página já voltou ao topo). */
const manterTrecho = (p: number, partes: PartesDoPortal) => {
  if (!partes.conteudo) return;
  const y = p > 0 && p < 1 ? (partes.deslocamento ?? 0) : 0;
  partes.conteudo.style.transform = y ? `translateY(${-y}px)` : "";
};

let camadaMundo: Nevoa | null | undefined;
const obterNevoa = (canvas: HTMLCanvasElement | null) => {
  if (camadaMundo === undefined && canvas) {
    try {
      camadaMundo = criarNevoa(canvas, () => palco.mundo?.() ?? null, () => palco.capa?.getBoundingClientRect() ?? null);
    } catch {
      camadaMundo = null;
    }
  }
  return camadaMundo ?? null;
};

const suave = (k: number) => k * k * (3 - 2 * k);
const textosDoHero = () => document.querySelectorAll<HTMLElement>("#topo .hero-texto");

/**
 * Mundo do jogo, em dois tempos. Primeiro o mundo escurece e perde cor (a câmera chega um pouco mais perto
 * do personagem). Depois vem a transição em WebGL (src/lib/nevoa.ts, MODO_MUNDO): o mundo escurecido
 * "buga" e se desfaz em pedaços, ou se abre em nuvens, e revela a tela que já está por trás.
 * Fechar faz o caminho inverso: o mundo se recompõe e só então recupera as cores.
 */
const ESCURO = { brilho: 0.38, saturacao: 0.45 };
function menuDePausa(p: number, partes: PartesDoPortal) {
  const { moldura, tela, conteudo, vidro } = partes;
  const capa = palco.capa;
  const fase1 = suave(limitar(0, 0.42, p));
  const fase2 = limitar(0.45, 1, p);
  const brilho = 1 - (1 - ESCURO.brilho) * fase1;
  const saturacao = 1 - (1 - ESCURO.saturacao) * fase1;
  if (capa) {
    capa.style.transformOrigin = "45% 55%";
    capa.style.transform = p > 0 ? `scale(${(1 + 0.05 * fase1).toFixed(4)})` : "";
    capa.style.filter = fase1 > 0 ? `brightness(${brilho.toFixed(3)}) saturate(${saturacao.toFixed(3)})` : "";
  }
  const t = limitar(0, 0.2, p);
  for (const el of textosDoHero()) {
    el.style.opacity = String(1 - t);
    el.style.transform = "";
  }
  moldura.style.filter = "";
  if (vidro) vidro.style.opacity = "0";
  if (conteudo) conteudo.style.opacity = "";
  manterTrecho(p, partes);

  const nevoa = obterNevoa(partes.nevoa);
  const animando = p > 0 && p < 1;
  const segunda = animando && fase2 > 0;
  // a tela fica por trás da camada desde o início da 2ª fase (sem WebGL, ela só aparece em fade)
  tela.style.visibility = p <= 0 || (!segunda && p < 1) ? "hidden" : "visible";
  tela.style.clipPath = "";
  tela.style.filter = "";
  tela.style.height = animando ? `${window.innerHeight}px` : "";
  tela.style.overflow = animando ? "hidden" : "";
  tela.style.opacity = animando && !nevoa ? suave(fase2).toFixed(3) : "";
  tela.style.transformOrigin = `50% ${window.innerHeight / 2}px`;
  tela.style.transform = segunda ? `scale(${(1 + 0.03 * (1 - suave(fase2))).toFixed(4)})` : "";

  if (nevoa) {
    nevoa.mostrar(segunda);
    if (segunda) nevoa.desenhar(fase2, ESCURO.brilho, ESCURO.saturacao, MODO_MUNDO);
  }
}

/** Desenha o instante p do portal. */
export function quadroDoPortal(p: number, partes: PartesDoPortal, visual: "escuro" | "claro") {
  if (partes.grade) partes.grade.style.opacity = "0";
  if (partes.nevoa) partes.nevoa.style.visibility = "hidden";
  if (visual === "claro") return menuDePausa(p, partes);
  const { moldura, tela, conteudo, vidro, grade } = partes;
  const capa = palco.capa;
  const W = window.innerWidth;
  const H = window.innerHeight;
  moldura.style.filter = "";
  if (vidro) vidro.style.opacity = "0";

  // o monitor na janela com a câmera parada (a caixa da .capa sem transform)
  const pai = capa?.offsetParent?.getBoundingClientRect();
  const cx0 = (pai?.left ?? 0) + (capa?.offsetLeft ?? 0);
  const cy0 = (pai?.top ?? 0) + (capa?.offsetTop ?? 0);
  const cw = capa?.offsetWidth ?? W;
  const ch = capa?.offsetHeight ?? H;
  const naJanela = ([fx, fy]: Ponto): Ponto => [cx0 + fx * cw, cy0 + fy * ch];
  const quad0 = MONITOR_CODIGO.map(naJanela);
  const centro = MONITOR_CODIGO.reduce<[number, number]>((a, [x, y]) => [a[0] + x / 4, a[1] + y / 4], [0, 0]);
  const O = naJanela(centro);
  const qw = Math.hypot(quad0[1][0] - quad0[0][0], quad0[1][1] - quad0[0][1]);
  const qh = Math.hypot(quad0[3][0] - quad0[0][0], quad0[3][1] - quad0[0][1]);

  // força da grade de subpixels (ela escurece tudo; o que está por baixo ganha brilho na mesma medida)
  const forca = suave(limitar(0.3, 0.58, p)) * (1 - suave(limitar(0.66, 0.97, p)));

  // 1) câmera: acelera rumo à tela (até 0,62) e chega com a tela cobrindo a janela
  const chega = limitar(0, 0.62, p);
  const k = chega * chega * (2.2 - 1.2 * chega); // começa devagar e chega rápido, sem parar seco
  const zMax = Math.max(W / qw, H / qh) * 1.06;
  const z = zMax ** k;
  const tx = (W / 2 - O[0]) * suave(Math.min(1, k * 1.15));
  const ty = (H / 2 - O[1]) * suave(Math.min(1, k * 1.15));
  if (capa) {
    capa.style.transformOrigin = `${centro[0] * 100}% ${centro[1] * 100}%`;
    capa.style.transform = p > 0 ? `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${z.toFixed(4)})` : "";
    // a luz da tela domina o quarto à medida que a câmera chega
    const luz = suave(limitar(0.15, 0.62, p));
    capa.style.filter = luz > 0 ? `brightness(${(1 + 0.35 * luz + 1.3 * forca).toFixed(3)}) contrast(${(1 - 0.15 * luz).toFixed(3)})` : "";
  }
  const sai = limitar(0, 0.2, p);
  for (const el of textosDoHero()) {
    el.style.opacity = String(1 - sai);
    el.style.transform = sai ? `translateY(${-14 * sai}px)` : "";
  }

  // 2) subpixels: presos à tela (o tamanho cresce com o zoom) e, depois da troca, continuam crescendo
  //    enquanto somem, como o foco saindo da grade para a imagem
  const naCamera = ([x, y]: Ponto): Ponto => [O[0] + (x - O[0]) * z + tx, O[1] + (y - O[1]) * z + ty];
  const quad = quad0.map(naCamera);
  const depois = limitar(0.6, 1, p);
  const celula = 2.6 * z * (1 + 2.2 * depois ** 1.5); // px por pixel do LCD (3 subpixels)
  if (grade) {
    const [gx, gy] = naCamera(O);
    grade.style.setProperty("--c", `${celula.toFixed(2)}px`);
    grade.style.setProperty("--gx", `${gx.toFixed(1)}px`);
    grade.style.setProperty("--gy", `${gy.toFixed(1)}px`);
    grade.style.opacity = forca > 0.001 && p < 1 ? forca.toFixed(3) : "0";
    // antes de cobrir a janela, a grade fica só dentro da tela do monitor
    grade.style.clipPath = p < 0.62 ? `polygon(${quad.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})` : "";
  }

  // 3) a troca: no pico da grade, a página aparece por baixo dela; 4) e assenta (1,06 -> 1)
  const pagina = suave(limitar(0.58, 0.7, p));
  tela.style.visibility = pagina <= 0 ? "hidden" : "visible";
  tela.style.clipPath = "";
  const animando = p > 0 && p < 1;
  tela.style.height = animando ? `${H}px` : "";
  tela.style.overflow = animando ? "hidden" : "";
  tela.style.opacity = animando ? pagina.toFixed(3) : "";
  const escala = 1 + 0.06 * (1 - suave(limitar(0.6, 1, p)));
  tela.style.transformOrigin = `50% ${H / 2}px`;
  tela.style.transform = animando ? `scale(${escala.toFixed(4)})` : "";
  tela.style.filter = animando && forca > 0.01 ? `brightness(${(1 + 1.4 * forca).toFixed(3)})` : "";
  if (conteudo) conteudo.style.opacity = "";
  manterTrecho(p, partes);
}

/** Limpa tudo que o portal mexeu no hero. */
export function soltarPalco() {
  if (palco.capa) {
    palco.capa.style.transform = "";
    palco.capa.style.filter = "";
  }
  for (const el of textosDoHero()) {
    el.style.opacity = "";
    el.style.transform = "";
  }
}
