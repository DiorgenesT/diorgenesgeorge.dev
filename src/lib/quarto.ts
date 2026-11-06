/**
 * O quarto à noite em camadas (public/contato, recortadas por scripts/camadas-parallax.py e, a camada dele,
 * separada da cadeira à mão). Um lugar só para as posições, usado pelo hero (src/components/Quarto.tsx),
 * pelo Contato, pela sucção e pelo portal.
 *
 * Tudo em frações do quadro 16:9 (.capa): x e y do canto superior esquerdo e a largura; a altura sai da
 * proporção da imagem. d é a profundidade no parallax (0 = infinito, 1 = colado na câmera).
 */

export type Ponto = [number, number];
export type Camada = { id: string; src: string; d: number; x: number; y: number; w: number };

export const CAMADAS: Camada[] = [
  { id: "fundo", src: "/contato/1-fundo.webp", d: 0.1, x: -0.04, y: -0.04, w: 1.08 },
  { id: "estante", src: "/contato/2-estante.webp", d: 0.28, x: 0.039, y: 0.013, w: 0.932 },
  { id: "mesa", src: "/contato/3-mesa.webp", d: 0.5, x: 0, y: 0.157, w: 1 },
  { id: "ele", src: "/contato/4a-ele.webp", d: 0.8, x: 0.57, y: 0.44, w: 0.4 },
  { id: "cadeira", src: "/contato/4b-cadeira.webp", d: 0.8, x: 0.57, y: 0.44, w: 0.4 },
  { id: "frente", src: "/contato/5-frente.webp", d: 1.2, x: -0.03, y: 0.4, w: 1.06 },
];

/** Telas dos monitores, medidas com Hough (sup. esq., sup. dir., inf. dir., inf. esq.). */
export const CODIGO: Ponto[] = [[0.2, 0.1785], [0.483, 0.2164], [0.483, 0.5828], [0.2, 0.6109]];
/** A área visível da tela do jogo (dentro da moldura), medida pixel a pixel nos cantos. */
export const JOGO: Ponto[] = [[0.497, 0.2166], [0.8481, 0.2313], [0.85, 0.5751], [0.497, 0.5882]];
/** A cúpula da luminária, na frente do monitor de código (recortada da mesa: public/contato/3b-luminaria.webp). */
export const LUMINARIA = { src: "/contato/3b-luminaria.webp", x: 0.1274, y: 0.3401, w: 0.0933 };
/** A boca da caneca, de onde sai o vapor. */
export const CANECA: Ponto = [0.425, 0.69];
/** O vidro da janela, em frações da imagem do fundo. */
export const VIDRO = { x: 0, y: 0.13, w: 0.335, h: 0.47 };
/** Cor da tela do monitor de código. */
export const COR_TELA = "#202932";

/** Deslocamento máximo de cada camada no parallax (px por unidade de profundidade). */
export const PARALLAX = { x: 80, y: 36 };

export const caixaDe = (q: Ponto[]) => {
  const xs = q.map(([x]) => x);
  const ys = q.map(([, y]) => y);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
};
export const centroDe = (q: Ponto[]): Ponto => [q.reduce((a, [x]) => a + x / q.length, 0), q.reduce((a, [, y]) => a + y / q.length, 0)];

/**
 * matrix3d que leva o retângulo (0,0)-(w,h) ao quadrilátero q (px, mesma origem do retângulo), com
 * transform-origin 0 0. Homografia do quadrado unitário para q, escalada por 1/w e 1/h.
 */
export function perspectiva(w: number, h: number, q: Ponto[]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const k = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].map((n) => +n.toPrecision(8)).join(",")})`;
}

/**
 * Ponto do quadrilátero q em (u, v) ∈ [0,1]², pela homografia (a mesma perspectiva do matrix3d da página;
 * a interpolação bilinear errava até ~9 px no meio da tela).
 */
const noQuad = (q: Ponto[], u: number, v: number): Ponto => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const h = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  const w = g * u + h * v + 1;
  return [(a * u + b * v + x0) / w, (d * u + e * v + y0) / w];
};

/** Desenha `img` deformada no quadrilátero q (px do canvas), numa malha de triângulos afins. */
export function desenharNoQuad(ctx: CanvasRenderingContext2D, img: CanvasImageSource, iw: number, ih: number, q: Ponto[], n = 6) {
  const tri = (s: Ponto[], d: Ponto[]) => {
    const [[x0, y0], [x1, y1], [x2, y2]] = s;
    const [[u0, v0], [u1, v1], [u2, v2]] = d;
    ctx.save();
    ctx.beginPath();
    // meio pixel de folga contra as frestas entre triângulos
    const cx = (u0 + u1 + u2) / 3, cy = (v0 + v1 + v2) / 3;
    const f = (u: number, v: number): Ponto => [u + Math.sign(u - cx) * 0.5, v + Math.sign(v - cy) * 0.5];
    ctx.moveTo(...f(u0, v0));
    ctx.lineTo(...f(u1, v1));
    ctx.lineTo(...f(u2, v2));
    ctx.closePath();
    ctx.clip();
    const det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    const a = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / det;
    const b = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / det;
    const c = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / det;
    const d2 = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / det;
    ctx.transform(a, b, c, d2, u0 - a * x0 - c * y0, v0 - b * x0 - d2 * y0);
    ctx.drawImage(img, 0, 0, iw, ih);
    ctx.restore();
  };
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const u0 = i / n, u1 = (i + 1) / n, v0 = j / n, v1 = (j + 1) / n;
      const s: Ponto[] = [[u0 * iw, v0 * ih], [u1 * iw, v0 * ih], [u1 * iw, v1 * ih], [u0 * iw, v1 * ih]];
      const d: Ponto[] = [noQuad(q, u0, v0), noQuad(q, u1, v0), noQuad(q, u1, v1), noQuad(q, u0, v1)];
      tri([s[0], s[1], s[2]], [d[0], d[1], d[2]]);
      tri([s[0], s[2], s[3]], [d[0], d[2], d[3]]);
    }
}

