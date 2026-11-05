/**
 * "Compilar": o portal do quarto para uma tela (Trabalhos, Jogos...). WebGL, por cima da página.
 *
 * É o par da sucção (src/lib/succao.ts): lá o monitor do jogo puxa o Diorgenes; aqui o monitor de código
 * puxa o quarto inteiro, e o projeto é compilado no lugar.
 *
 * Roteiro em função de p (0 = o quarto; 1 = a página aberta):
 *  1. a tela de código acende em ciano, o ar ondula perto dela e riscos de luz correm para dentro;
 *  2. o quarto é puxado para a tela num redemoinho leve: o que está perto vai primeiro, cada direção tem
 *     seu ritmo (ruído), então ele se estica em fios; perto da tela vira pixel;
 *  3. os blocos se soltam e, onde somem, aparece a página (que já está por baixo). Cada bloco que sai deixa
 *     um rastro ciano, como um build compilando, e a frente avança da tela para as bordas.
 * Tudo é função de p (o relógio só faz o ruído fluir): fechar é a mesma coisa com p de 1 até 0, e o quarto
 * sai da tela e se remonta.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // y para baixo, como na janela
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uQuarto;
uniform float uP;
uniform float uT;
uniform float uAsp;      // largura / altura da janela
uniform vec4 uCaixa;     // onde o quadro 16:9 do quarto está na janela (x, y, largura, altura em frações)
uniform vec2 uC;         // centro da tela de código, na janela (frações)
uniform vec4 uTela;      // caixa da tela de código no quadro do vídeo (x0, y0, x1, y1)
uniform float uCols;     // blocos na largura da janela
varying vec2 vUv;

const vec3 CIANO = vec3(0.49, 0.95, 1.0);
const vec3 FUNDO = vec3(0.02, 0.027, 0.047); // o fundo do hero fora do vídeo (#05070c)

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// o quarto num ponto da janela (fora do vídeo, o fundo do hero); a tela de código acende no começo
vec3 quarto(vec2 uv, float acende) {
  vec2 q = (uv - uCaixa.xy) / uCaixa.zw;
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return FUNDO;
  vec3 c = texture2D(uQuarto, q).rgb;
  float naTela = smoothstep(uTela.x - 0.004, uTela.x + 0.004, q.x) * smoothstep(uTela.z + 0.004, uTela.z - 0.004, q.x)
               * smoothstep(uTela.y - 0.004, uTela.y + 0.004, q.y) * smoothstep(uTela.w + 0.004, uTela.w - 0.004, q.y);
  return c + vec3(0.75, 0.97, 1.0) * naTela * 0.55 * acende;
}

// quanto do caminho até a tela um ponto a rn (0 = na tela, 1 = no canto mais longe) já percorreu
float percurso(float rn, float n) {
  float atraso = 0.1 + 0.34 * rn + 0.08 * n;
  float e = clamp((uP - atraso) / 0.3, 0.0, 1.0);
  return e * e * (3.0 - 2.0 * e);
}

void main() {
  vec2 A = vec2(uAsp, 1.0);
  vec2 P = vUv * A;            // janela em unidades com a proporção certa
  vec2 C = uC * A;
  float rMax = max(max(length(C), length(C - vec2(uAsp, 0.0))), max(length(C - vec2(0.0, 1.0)), length(C - A)));

  float acende = smoothstep(0.0, 0.3, uP) * (1.0 - smoothstep(0.8, 1.0, uP));

  // o bloco deste pixel e quando ele se solta
  float lado = uAsp / uCols;
  vec2 bloco = floor(P / lado);
  vec2 Pb = (bloco + 0.5) * lado;
  vec2 db = Pb - C;
  float nb = ruido(normalize(db + 1e-4) * 6.0 + vec2(uT * 0.15, 0.0));
  float eb = percurso(length(db) / rMax, nb);
  float hora = 0.45 + 0.42 * hash(bloco + 3.7);

  if (eb > hora) {
    // o bloco já saiu: a página aparece, com o rastro ciano de quem acabou de compilar
    float rastro = exp(-(eb - hora) * 14.0);
    vec2 f = fract(P / lado);
    float aresta = 1.0 - smoothstep(0.0, 0.08, min(min(f.x, f.y), min(1.0 - f.x, 1.0 - f.y)));
    float a = rastro * (0.1 + 0.4 * aresta);
    if (a < 0.004) discard;
    gl_FragColor = vec4(CIANO, a);
    return;
  }

  // o quarto, puxado para a tela: amostra mais longe (rs = r / (1 - e)) e gira de leve (redemoinho)
  // a câmera se aproxima um pouco da tela antes do puxão
  vec2 d = (P - C) / (1.0 + 0.12 * smoothstep(0.0, 0.4, uP));
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);
  float n = ruido(dir * 6.0 + vec2(uT * 0.15, 0.0));
  float e = percurso(r / rMax, n);
  float giro = e * e * 0.6;
  float cg = cos(giro), sg = sin(giro);
  vec2 dg = vec2(dir.x * cg - dir.y * sg, dir.x * sg + dir.y * cg);
  float rs = r / (1.0 - 0.72 * e);
  // o ar ondula perto da tela antes do puxão
  float ondula = smoothstep(0.0, 0.3, uP) * exp(-r * 3.5) * (1.0 - e);
  vec2 haze = (vec2(ruido(P * 30.0 + vec2(0.0, uT * 1.7)), ruido(P * 26.0 - vec2(uT * 1.3, 0.0))) - 0.5) * 0.012 * ondula;
  vec2 S = C + dg * rs + haze;
  // esticado, ele se parte em fios ao longo do caminho, com cores separadas
  vec2 ca = dg * 0.012 * e / A;
  vec2 su = S / A;
  vec3 liso = vec3(quarto(su + ca, acende).r, quarto(su, acende).g, quarto(su - ca, acende).b);
  // perto da tela (e já avançado), vira pixel: o bloco inteiro mostra uma cor só
  vec2 Sb = C + dg * (length(db) / (1.0 - 0.72 * eb));
  vec3 pix = quarto(Sb / A, acende);
  vec3 cor = mix(liso, pix, smoothstep(0.25, 0.55, eb));
  float fio = smoothstep(0.4, 0.62, ruido(dir * 90.0 + vec2(0.0, rs * 3.0)));
  cor = mix(cor, vec3(0.78, 0.99, 1.0), smoothstep(0.35, 0.9, e) * 0.4 * (0.3 + 0.7 * fio));

  // a luz da tela domina: o resto do quarto escurece, halo ciano e riscos correndo para dentro
  float rn = r / rMax;
  cor *= mix(1.0, 0.5, smoothstep(0.05, 0.5, uP) * smoothstep(0.05, 0.6, rn));
  cor += CIANO * (0.22 * exp(-r * 4.0) + 0.6 * exp(-r * 14.0)) * acende;
  float faixa = pow(ruido(dir * 18.0 + 3.0), 6.0) * 3.0;
  float corre = pow(fract(r * 2.4 + uT * 1.5), 8.0);
  cor += vec3(0.8, 0.98, 1.0) * faixa * corre * smoothstep(0.08, 0.45, uP) * (1.0 - smoothstep(0.75, 0.95, uP)) * smoothstep(0.02, 0.12, r) * smoothstep(1.0, 0.25, r);

  // o bloco brilha logo antes de se soltar
  float quase = smoothstep(hora - 0.18, hora, eb);
  cor = mix(cor, vec3(0.85, 1.0, 1.0), quase * 0.3);

  // no comecinho a camada entra em fade sobre o hero (que tem o mesmo quarto por baixo)
  gl_FragColor = vec4(cor, smoothstep(0.0, 0.06, uP));
}`;

export type Compila = {
  /** Desenha o instante p. `quarto` é o vídeo do quarto; `caixa`, onde o quadro 16:9 dele está na janela. */
  desenhar: (p: number, quarto: TexImageSource | null, caixa: DOMRect | null) => void;
  mostrar: (sim: boolean) => void;
};

/**
 * Cria a camada sobre `canvas`. `tela` é o quadrilátero da tela de código no quadro do vídeo (frações).
 * Devolve null sem WebGL.
 */
export function criarCompila(canvas: HTMLCanvasElement, tela: readonly (readonly [number, number])[]): Compila | null {
  const ctx = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
  if (!ctx) return null;
  const gl: WebGLRenderingContext = ctx;

  const shader = (tipo: number, src: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform1i(u("uQuarto"), 0);
  const xs = tela.map(([x]) => x);
  const ys = tela.map(([, y]) => y);
  gl.uniform4f(u("uTela"), Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
  const centro = [xs.reduce((a, b) => a + b) / xs.length, ys.reduce((a, b) => a + b) / ys.length];
  const [uP, uT, uAsp, uCaixa, uC, uCols] = ["uP", "uT", "uAsp", "uCaixa", "uC", "uCols"].map(u);
  const t0 = performance.now();

  function desenhar(p: number, quarto: TexImageSource | null, caixa: DOMRect | null) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const esc = Math.min(window.devicePixelRatio || 1, 1.25);
    const w = Math.round(W * esc);
    const h = Math.round(H * esc);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    if (quarto) {
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, quarto);
      } catch {
        /* vídeo ainda sem quadro: fica o último enviado */
      }
    }
    const cx = caixa ? caixa.left / W : 0;
    const cy = caixa ? caixa.top / H : 0;
    const cw = caixa ? caixa.width / W : 1;
    const chh = caixa ? caixa.height / H : 1;
    gl.uniform4f(uCaixa, cx, cy, cw, chh);
    gl.uniform2f(uC, cx + centro[0] * cw, cy + centro[1] * chh);
    gl.uniform1f(uP, p);
    gl.uniform1f(uT, (performance.now() - t0) / 1000);
    gl.uniform1f(uAsp, W / H);
    gl.uniform1f(uCols, W < 768 ? 22 : 46);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  return {
    desenhar,
    mostrar: (sim) => {
      canvas.style.visibility = sim ? "visible" : "hidden";
    },
  };
}
