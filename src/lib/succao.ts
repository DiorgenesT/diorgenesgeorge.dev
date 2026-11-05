/**
 * A sucção: o monitor do jogo puxa o Diorgenes para dentro (WebGL, por cima do quarto em camadas).
 *
 * Camadas (compostas pelo quarto, src/components/Quarto.tsx, no quadro 16:9, com o parallax do momento):
 *  - a cena inteira (congelada quando a sucção começa);
 *  - o quarto vazio: a mesma cena sem a camada dele (a cadeira fica);
 *  - a máscara da silhueta dele.
 *
 * Roteiro em função de p (0 = ele digitando, 1 = ele sumiu na tela):
 *  1. o monitor "respira": a luz cresce, o quarto escurece e o ar ondula perto da tela;
 *  2. o corpo é puxado para o centro do monitor, girando de leve e se esticando em fios (deslocamento radial
 *     com ruído por direção, então cada fio anda num ritmo); perto da tela vira pixel e se desfaz em blocos;
 *  3. riscos de luz correm para dentro da tela, com aberração cromática, e o quarto passa à versão vazia.
 * Tudo é função de p (e do relógio, só para o ruído fluir): a volta é a mesma coisa com p de 1 até 0.
 */

import { caixaDe, centroDe, JOGO } from "./quarto";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // y para baixo, como na imagem
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uQuadro;
uniform sampler2D uVazio;
uniform sampler2D uMascara;
uniform float uP;
uniform float uT;
uniform vec2 uC;
uniform vec4 uTela; // x0, y0, x1, y1 da tela do jogo
varying vec2 vUv;

const vec2 ASP = vec2(1.7778, 1.0);
const vec3 CIANO = vec3(0.49, 0.95, 1.0);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// quanto do caminho até a tela um ponto do corpo, a uma distância rs dela, já percorreu (0..1).
// O que está perto (as mãos) vai primeiro; a cabeça e as costas, por último. Cada direção tem seu
// ritmo (ruído), então o corpo se estica em fios em vez de deslizar em bloco.
float percurso(float rs, float n) {
  float atraso = 0.1 + 0.5 * clamp((rs - 0.2) / 0.6, 0.0, 1.0) + 0.1 * n;
  float e = clamp((uP - atraso) / 0.42, 0.0, 1.0);
  return e * e * (3.0 - 2.0 * e);
}

// o personagem no ponto de saída uv: de onde no quadro original vem esse pixel (mapa inverso).
// Um ponto que estava a rs da tela está agora a rs * (1 - e); invertido por iteração de ponto fixo.
vec4 personagem(vec2 uv) {
  vec2 d = (uv - uC) * ASP;
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);
  float n = ruido(dir * 7.0 + vec2(uT * 0.2, 0.0));
  float rs = r, e = 0.0;
  for (int i = 0; i < 6; i++) {
    e = percurso(rs, n);
    rs = min(r / max(1.0 - e * 0.985, 0.015), 2.0);
  }
  e = percurso(rs, n);
  // gira de leve enquanto cai na tela
  float giro = -e * e * 0.7;
  float c = cos(giro), s = sin(giro);
  vec2 ds = vec2(dir.x * c - dir.y * s, dir.x * s + dir.y * c) * rs;
  vec2 su = uC + ds / ASP;
  if (su.x < 0.0 || su.x > 1.0 || su.y < 0.0 || su.y > 1.0) return vec4(0.0);
  float m = texture2D(uMascara, su).r;
  if (m < 0.003) return vec4(0.0);
  // aberração cromática ao longo do puxão
  vec2 ca = (dir / ASP) * 0.009 * e;
  vec3 col = vec3(texture2D(uQuadro, su + ca).r, texture2D(uQuadro, su).g, texture2D(uQuadro, su - ca).b);
  // esticado, o corpo se parte em fios de luz ao longo do caminho
  float fio = smoothstep(0.38, 0.62, ruido(dir * 95.0 + vec2(0.0, rs * 3.0)));
  float parte = smoothstep(0.25, 0.75, e);
  col = mix(col, vec3(0.78, 0.99, 1.0), smoothstep(0.2, 0.85, e) * (0.55 + 0.45 * fio));
  col += CIANO * fio * parte * 0.35;
  float alpha = m * mix(1.0, fio, parte) * (1.0 - smoothstep(0.8, 0.98, e));
  return vec4(col, alpha);
}

void main() {
  float p = uP;
  float k = smoothstep(0.12, 0.95, p);
  vec2 d = (vUv - uC) * ASP;
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);

  // 1) o quarto: o ar ondula e "cai" levemente para dentro da tela
  float ondula = smoothstep(0.02, 0.45, p) * smoothstep(0.75, 0.05, r);
  vec2 haze = (vec2(ruido(vUv * vec2(34.0, 19.0) + vec2(0.0, uT * 1.7)), ruido(vUv * vec2(29.0, 23.0) - vec2(uT * 1.3, 0.0))) - 0.5) * 0.007 * ondula;
  vec2 bu = uC + (vUv - uC) * (1.0 + 0.05 * k * exp(-r * 2.5)) + haze;
  vec3 q = texture2D(uQuadro, bu).rgb;
  vec3 v = texture2D(uVazio, bu).rgb;
  // onde o corpo estava aparece o quarto vazio, conforme cada parte sai do lugar
  float nDir = ruido(dir * 7.0 + vec2(uT * 0.2, 0.0));
  float estava = texture2D(uMascara, bu).r * smoothstep(0.0, 0.3, percurso(r, nDir));
  float vazio = smoothstep(0.5, 0.95, p);
  // o corpo em si vem da camada do personagem; no fundo, sob a silhueta, já fica o quarto vazio
  // (senão a troca para o quarto vazio deixa um fantasma dele na cadeira)
  vec3 semEle = mix(q, v, texture2D(uMascara, bu).r);
  vec3 fundo = mix(semEle, v, max(estava, vazio));
  // a luz do monitor domina: o resto do quarto escurece
  fundo *= mix(1.0, 0.6, smoothstep(0.05, 0.5, p) * smoothstep(0.2, 0.9, r));

  // 2) o personagem: nítido longe da tela, em blocos perto dela
  vec4 liso = personagem(vUv);
  vec2 G = vec2(112.0, 63.0);
  vec2 celula = floor(vUv * G);
  vec4 bloco = personagem((celula + 0.5) / G);
  float pixel = smoothstep(0.6, 0.2, r) * smoothstep(0.15, 0.5, k);
  vec4 ch = mix(liso, bloco, pixel);
  // os blocos se soltam: quanto mais perto e mais avançado, mais buracos
  float solta = smoothstep(0.35, 0.05, r) * k + smoothstep(0.75, 1.0, p);
  ch.a *= step(solta * 1.1, hash(celula + 7.0) + 0.05);
  vec3 cor = mix(fundo, ch.rgb, ch.a);

  // 3) luz: halo do monitor, a tela acendendo e riscos correndo para dentro
  float acende = smoothstep(0.0, 0.6, p);
  cor += CIANO * (0.18 * exp(-r * 3.0) + 0.55 * exp(-r * 11.0)) * acende;
  vec2 t0 = uTela.xy, t1 = uTela.zw;
  float naTela = step(t0.x, vUv.x) * step(vUv.x, t1.x) * step(t0.y, vUv.y) * step(vUv.y, t1.y);
  cor += vec3(0.85, 0.98, 1.0) * naTela * 0.45 * smoothstep(0.05, 0.7, p);
  float faixa = pow(ruido(dir * 18.0 + 3.0), 6.0) * 3.0;
  float corre = pow(fract(r * 2.2 + uT * 1.4), 8.0);
  cor += vec3(0.8, 0.98, 1.0) * faixa * corre * k * smoothstep(0.04, 0.2, r) * smoothstep(1.1, 0.3, r);

  gl_FragColor = vec4(cor, 1.0);
}`;

/** O que a sucção pede ao quarto: a cena, a cena sem ele e a silhueta dele. */
export type FontesDaSuccao = () => { quadro: TexImageSource; vazio: TexImageSource; mascara: TexImageSource };

export type Succao = {
  /** Copia a cena de agora (o que vai ser sugado). */
  capturar: () => void;
  desenhar: (p: number) => void;
  /** Anima de `de` até `ate` em `ms`; resolve ao terminar. */
  /** Com `vivo`, a cena é recapturada a cada quadro: os monitores seguem animados durante a sucção. */
  animar: (de: number, ate: number, ms: number, vivo?: boolean) => Promise<void>;
  liberar: () => void;
};

const ease = (k: number) => k * k * (3 - 2 * k); // suave nas pontas, quase linear no meio

/**
 * Cria a sucção sobre `canvas` (dentro da .capa, então o quadro 16:9 bate com o do vídeo).
 * Devolve null se não houver WebGL; quem chama cai num corte simples.
 */
export async function criarSuccao(canvas: HTMLCanvasElement, fontes: FontesDaSuccao): Promise<Succao | null> {
  const ctx = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: false });
  if (!ctx) return null;
  const gl: WebGLRenderingContext = ctx;

  const shader = (tipo: number, fonte: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "programa");
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const textura = (unidade: number, nome: string, fonte?: TexImageSource) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unidade);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (fonte) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, fonte);
    gl.uniform1i(gl.getUniformLocation(prog, nome), unidade);
    return t;
  };
  const tQuadro = textura(0, "uQuadro");
  const tVazio = textura(1, "uVazio");
  const tMascara = textura(2, "uMascara");

  const uP = gl.getUniformLocation(prog, "uP");
  const uT = gl.getUniformLocation(prog, "uT");
  const [cx, cy] = centroDe(JOGO);
  const caixa = caixaDe(JOGO);
  gl.uniform2f(gl.getUniformLocation(prog, "uC"), cx, cy);
  gl.uniform4f(gl.getUniformLocation(prog, "uTela"), caixa.x0, caixa.y0, caixa.x1, caixa.y1);

  const ajustar = () => {
    const b = canvas.getBoundingClientRect();
    // a cena é composta em 1280 px de largura: mais que isso não ganha nitidez, só custa
    const esc = Math.min(window.devicePixelRatio || 1, 1.5, 1280 / Math.max(1, b.width));
    const w = Math.max(1, Math.round(b.width * esc));
    const h = Math.max(1, Math.round(b.height * esc));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const t0 = performance.now();
  function desenhar(p: number) {
    ajustar();
    gl.uniform1f(uP, p);
    gl.uniform1f(uT, (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function capturar() {
    const f = fontes();
    ([[tQuadro, f.quadro], [tVazio, f.vazio], [tMascara, f.mascara]] as const).forEach(([t, fonte], i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, fonte);
    });
  }

  function animar(de: number, ate: number, ms: number, vivo = false) {
    return new Promise<void>((fim) => {
      const ini = performance.now();
      const quadro = () => {
        const k = Math.min(1, (performance.now() - ini) / ms);
        if (vivo) capturar();
        desenhar(de + (ate - de) * ease(k));
        if (k < 1) requestAnimationFrame(quadro);
        else fim();
      };
      requestAnimationFrame(quadro);
    });
  }

  function liberar() {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return { capturar, desenhar, animar, liberar };
}
