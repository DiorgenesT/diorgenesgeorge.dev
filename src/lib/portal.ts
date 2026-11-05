import { criarCompila, type Compila } from "./compila";
import { CODIGO } from "./quarto";
import { criarNevoa, type Nevoa } from "./nevoa";

/**
 * Portal entre o hero e as telas (Trabalhos, Jogos...).
 *
 * No quarto (tema escuro), o monitor de código puxa o quarto para dentro e a página é "compilada" no lugar
 * (src/lib/compila.ts), o par da sucção.
 * No mundo do jogo (tema claro), o mundo escurece e depois "buga" (ou se abre em nuvens) revelando a tela
 * (menuDePausa).
 * Abrir e fechar são o mesmo desenho ao contrário.
 */

type Ponto = readonly [number, number];
type Quad = readonly [Ponto, Ponto, Ponto, Ponto]; // sup. esq., sup. dir., inf. dir., inf. esq.

/** A tela do monitor de código no quadro 16:9 (frações), a do quarto em camadas. */
const MONITOR_CODIGO = CODIGO as unknown as Quad;

/** Elementos do hero que o portal move (o Hero registra ao montar). */
export const palco: {
  capa: HTMLElement | null;
  texto: HTMLElement | null;
  /** O que mostra o mundo do jogo agora (vídeo ou a imagem do 1º quadro), para a transição em WebGL. */
  mundo: (() => TexImageSource | null) | null;
  /** O vídeo do quarto agora, para a compilação em WebGL. */
  quarto: (() => TexImageSource | null) | null;
  /** O texto do hero sai (ao abrir uma tela) e volta (ao fechar): animações do próprio Hero. */
  textoSai: (() => void) | null;
  textoVolta: (() => void) | null;
} = { capa: null, texto: null, mundo: null, quarto: null, textoSai: null, textoVolta: null };

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
  /** Canvas da compilação do quarto (src/lib/compila.ts), fixo sobre a janela. */
  compila: HTMLCanvasElement | null;
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

let camadaQuarto: Compila | null | undefined;
const obterCompila = (canvas: HTMLCanvasElement | null) => {
  if (camadaQuarto === undefined && canvas) {
    try {
      camadaQuarto = criarCompila(canvas, MONITOR_CODIGO);
    } catch {
      camadaQuarto = null;
    }
  }
  return camadaQuarto ?? null;
};

/**
 * Desenha o instante p do portal.
 *
 * No quarto (escuro), a "compilação" (src/lib/compila.ts): o monitor de código puxa o quarto para dentro e,
 * onde os blocos se soltam, a página aparece, já no lugar por baixo da camada. No fim ela assenta (um leve
 * recuo de escala e o brilho voltando ao normal). Sem WebGL, a página só aparece em fade.
 */
export function quadroDoPortal(p: number, partes: PartesDoPortal, visual: "escuro" | "claro") {
  if (partes.nevoa) partes.nevoa.style.visibility = "hidden";
  if (partes.compila) partes.compila.style.visibility = "hidden";
  if (visual === "claro") return menuDePausa(p, partes);
  const { moldura, tela, conteudo, vidro } = partes;
  const capa = palco.capa;
  const H = window.innerHeight;
  if (vidro) vidro.style.opacity = "0";
  moldura.style.filter = "";
  if (capa) {
    capa.style.transform = "";
    capa.style.filter = "";
  }

  const camada = obterCompila(partes.compila);
  const animando = p > 0 && p < 1;
  if (camada) {
    camada.mostrar(animando);
    if (animando) camada.desenhar(p, palco.quarto?.() ?? null, capa?.getBoundingClientRect() ?? null);
  }

  // a página fica por baixo da camada desde que ela cobre o hero; assenta de 1,035 para 1, com o brilho
  // do build passando
  const assenta = suave(limitar(0.3, 1, p));
  tela.style.visibility = p <= 0 || (camada && p < 0.06) ? "hidden" : "visible";
  tela.style.clipPath = "";
  tela.style.height = animando ? `${H}px` : "";
  tela.style.overflow = animando ? "hidden" : "";
  tela.style.opacity = animando && !camada ? suave(limitar(0.2, 0.9, p)).toFixed(3) : "";
  tela.style.transformOrigin = `50% ${H / 2}px`;
  tela.style.transform = animando ? `scale(${(1 + 0.035 * (1 - assenta)).toFixed(4)})` : "";
  tela.style.filter = animando ? `brightness(${(1 + 0.3 * (1 - assenta)).toFixed(3)})` : "";
  if (conteudo) conteudo.style.opacity = "";
  manterTrecho(p, partes);
}

/** Limpa tudo que o portal mexeu no hero. */
export function soltarPalco() {
  if (palco.capa) {
    palco.capa.style.transform = "";
    palco.capa.style.transformOrigin = "";
    palco.capa.style.filter = "";
  }
}
