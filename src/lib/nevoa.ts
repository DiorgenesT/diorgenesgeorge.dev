/**
 * Nuvens que se abrem: a transição do mundo do jogo para uma tela (WebGL, por cima de tudo).
 *
 * A camada pinta o mundo exatamente como ele está na tela (o mesmo quadro do vídeo, no mesmo
 * enquadramento e já escurecido) e o dissolve num ruído de nuvem que se abre a partir do centro. As bordas
 * da abertura acendem em luz ciano suave e a névoa deriva devagar; por trás, a página já está no lugar.
 * Modo "glitch": em vez de nuvens, o jogo "buga" (blocos saltando, RGB separado, faixas, cor chapada) e se
 * desfaz em pedaços.
 * a = 0: o mundo cobre tudo; a = 1: as nuvens se abriram por completo.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uMundo;
uniform vec4 uCaixa;     // onde o quadro 16:9 do mundo está na janela: x, y, largura, altura (frações)
uniform float uA;        // abertura (0..1)
uniform float uT;        // relógio (a névoa deriva)
uniform float uBrilho;   // o mesmo escurecimento aplicado ao mundo pelo CSS
uniform float uSat;
uniform float uAsp;      // largura / altura da janela
uniform float uModo;     // 0 = nuvens se abrindo; 1 = glitch (o jogo "buga")
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float nuvem(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * ruido(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return s;
}

vec3 mundo(vec2 uv) {
  vec3 cor = texture2D(uMundo, clamp(uv, 0.0, 1.0)).rgb;
  float lum = dot(cor, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(lum), cor, uSat) * uBrilho;
}

// O jogo "buga": blocos e faixas horizontais saltam de lugar, as cores se separam (RGB), aparecem blocos
// de cor chapada e linhas de varredura, e os pedaços somem em ordem aleatória revelando a página.
vec4 glitch(vec2 uv0) {
  float quadro = floor(uT * 24.0);                       // o glitch "pula" a 24 quadros por segundo
  float forca = smoothstep(0.0, 0.25, uA) * (1.0 - smoothstep(0.9, 1.0, uA));
  // faixas horizontais finas que se deslocam
  float faixa = floor(uv0.y * 46.0);
  float hf = hash(vec2(faixa, quadro));
  float desloca = (hf > 0.72 ? (hash(vec2(faixa, quadro + 3.0)) - 0.5) * 0.12 : 0.0) * forca;
  // blocos de tamanhos variados
  vec2 grade = mix(vec2(10.0, 6.0), vec2(28.0, 16.0), step(0.5, hash(vec2(floor(uv0.y * 6.0), 7.0))));
  vec2 bloco = floor(uv0 * grade);
  float hb = hash(bloco + 0.37);
  // cada bloco some num momento; antes disso, perto da hora dele, fica instável
  float hora = 0.2 + 0.75 * hb;
  if (uA > hora) return vec4(0.0);
  float perto = smoothstep(hora - 0.3, hora, uA);
  vec2 salto = (vec2(hash(bloco + quadro), hash(bloco - quadro)) - 0.5) * vec2(0.08, 0.02) * perto * step(0.55, hash(bloco + quadro * 1.7));
  vec2 uv = uv0 + vec2(desloca, 0.0) + salto;
  // separação RGB
  float rgb = 0.004 + 0.018 * forca * (0.4 + perto);
  vec2 caixa = (uv - uCaixa.xy) / uCaixa.zw;
  vec2 d = vec2(rgb, 0.0) / uCaixa.z;
  vec3 cor = vec3(mundo(caixa + d).r, mundo(caixa).g, mundo(caixa - d).b);
  // blocos de cor chapada (ciano/magenta) e "pixel morto"
  float hc = hash(bloco + quadro * 0.13);
  if (hc > 0.965 - 0.08 * perto) cor = mix(cor, hc > 0.985 ? vec3(1.0, 0.2, 0.75) : vec3(0.49, 0.95, 1.0), 0.75);
  // posteriza e varredura
  cor = floor(cor * mix(32.0, 6.0, perto * forca)) / mix(32.0, 6.0, perto * forca);
  cor *= 0.85 + 0.15 * step(0.5, fract(uv0.y * 240.0));
  return vec4(cor, 1.0);
}

void main() {
  if (uModo > 0.5) {
    vec4 g = glitch(vUv);
    if (g.a <= 0.0) discard;
    gl_FragColor = g;
    return;
  }
  // forma da abertura: nuvem (que deriva) misturada à distância ao centro, então abre do meio para fora
  vec2 c = (vUv - 0.5) * vec2(uAsp, 1.0);
  float n = nuvem(c * 2.4 + vec2(uT * 0.05, -uT * 0.03));
  float campo = 0.55 * n + 0.45 * clamp(length(c) / 0.95, 0.0, 1.0);
  float limiar = mix(-0.05, 1.08, uA);
  float aberto = smoothstep(limiar - 0.07, limiar + 0.005, campo); // 1 = ainda é mundo
  if (aberto <= 0.001) discard;

  // o mundo, no mesmo lugar e com o mesmo escurecimento do CSS; perto da borda ele se desfaz em névoa
  vec2 uv = (vUv - uCaixa.xy) / uCaixa.zw;
  float borda = 1.0 - smoothstep(0.0, 0.16, campo - limiar);
  uv += (vec2(ruido(c * 9.0 + uT * 0.3), ruido(c * 9.0 - uT * 0.3)) - 0.5) * 0.02 * borda;
  vec3 cor = mundo(uv);
  // névoa azulada e luz na borda da abertura
  cor = mix(cor, vec3(0.62, 0.78, 0.95) * 0.55, borda * 0.55);
  cor += vec3(0.49, 0.95, 1.0) * pow(borda, 3.0) * 0.55;
  gl_FragColor = vec4(cor, aberto);
}`;

export type Nevoa = {
  /** Desenha a abertura `a` com o mundo escurecido por `brilho`/`saturacao` (os mesmos do CSS). */
  desenhar: (a: number, brilho: number, saturacao: number, modo?: "nuvens" | "glitch") => void;
  mostrar: (sim: boolean) => void;
};

/** Cria a camada sobre `canvas`. `fonte` devolve o que mostra o mundo agora (vídeo ou imagem). */
export function criarNevoa(canvas: HTMLCanvasElement, fonte: () => TexImageSource | null, caixa: () => DOMRect | null): Nevoa | null {
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
  const [uCaixa, uA, uT, uBrilho, uSat, uAsp, uModo] = ["uCaixa", "uA", "uT", "uBrilho", "uSat", "uAsp", "uModo"].map(u);
  gl.uniform1i(u("uMundo"), 0);
  const t0 = performance.now();

  function desenhar(a: number, brilho: number, saturacao: number, modo: "nuvens" | "glitch" = "nuvens") {
    gl.uniform1f(uModo, modo === "glitch" ? 1 : 0);
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
    const f = fonte();
    if (f) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, f);
    const r = caixa();
    gl.uniform4f(uCaixa, r ? r.left / W : 0, r ? r.top / H : 0, r ? r.width / W : 1, r ? r.height / H : 1);
    gl.uniform1f(uA, a);
    gl.uniform1f(uT, (performance.now() - t0) / 1000);
    gl.uniform1f(uBrilho, brilho);
    gl.uniform1f(uSat, saturacao);
    gl.uniform1f(uAsp, W / H);
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
