/**
 * A luz que sai do PC no "Enter" (camada por cima do vídeo, sincronizada com ele).
 *
 * Tudo é função pura do tempo t (segundos do clipe de 3 s): o mesmo desenho serve para a ida
 * (t de 0 a 3) e para a volta (t de 3 a 0), sem estado acumulado. Camadas, em ordem:
 *  1. a tela do jogo acende no formato real do monitor (com bloom) e faixas de "compilação" correm nela;
 *  2. a luz vaza para o quarto (halo amplo e raios suaves);
 *  3. o código sai da tela: cada trecho nasce num ponto da tela e voa em perspectiva até o visitante;
 *  4. o branco nasce do monitor e se expande até cobrir a cena.
 * Além disso, mexe na câmera (o elemento `camera`): mergulha no centro da tela e estoura de brilho.
 */

/** Tela do jogo dentro do quadro 16:9 do vídeo (frações da largura/altura), medida no loop do Veo. */
export const TELA = {
  se: { x: 0.414, y: 0.293 },
  sd: { x: 0.693, y: 0.309 },
  id: { x: 0.693, y: 0.587 },
  ie: { x: 0.414, y: 0.599 },
};
/** Momento do flash de impacto (s do clipe); a troca de vídeo acontece dentro dele. */
export const IMPACTO = 1.0;
/** Centro da tela do jogo. */
export const MONITOR = { x: 0.553, y: 0.447 };

const SIMBOLOS = "{}<>/;=()[]01$#*+:".split("");
const TRECHOS = ["new World()", "spawn(player)", "render()", "</>", "build()", "isekai.run()", "=>", "const", "await", "{ }", "loop()", "60fps"];
const N_GLIFOS = 220;
const N_RAIOS = 9;
const CIANO = "125,243,255";

// Gerador determinístico: o desenho de cada instante é sempre o mesmo (ida e volta batem).
function semente(n: number) {
  let s = n;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const suave = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** Ponto da tela (u, v em 0..1) por interpolação bilinear dos quatro cantos. */
function naTela(u: number, v: number) {
  const { se, sd, id, ie } = TELA;
  const topo = { x: se.x + (sd.x - se.x) * u, y: se.y + (sd.y - se.y) * u };
  const base = { x: ie.x + (id.x - ie.x) * u, y: ie.y + (id.y - ie.y) * u };
  return { x: topo.x + (base.x - topo.x) * v, y: topo.y + (base.y - topo.y) * v };
}

/** Glifo pré-renderizado com brilho (desenhar com sombra a cada quadro custaria caro). */
function sprite(texto: string, cor: string) {
  const px = 40;
  const c = document.createElement("canvas");
  const x = c.getContext("2d")!;
  x.font = `600 ${px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  const w = Math.ceil(x.measureText(texto).width) + px;
  c.width = w;
  c.height = px * 2;
  x.font = `600 ${px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.shadowColor = `rgba(${CIANO},0.9)`;
  x.shadowBlur = px * 0.45;
  x.fillStyle = cor;
  x.fillText(texto, w / 2, px);
  x.shadowBlur = 0;
  x.fillText(texto, w / 2, px);
  return { c, w, h: px * 2, px };
}

export function criarLuz(canvas: HTMLCanvasElement, camera: HTMLElement) {
  const ctx = canvas.getContext("2d")!;
  const r = semente(11);

  const glifos = Array.from({ length: N_GLIFOS }, () => {
    const trecho = r() < 0.22;
    const texto = trecho ? TRECHOS[Math.floor(r() * TRECHOS.length)] : SIMBOLOS[Math.floor(r() * SIMBOLOS.length)];
    const branco = r() < 0.35;
    return {
      u: 0.06 + r() * 0.88,
      v: 0.08 + r() * 0.84,
      nasce: 0.55 + r() * 1.9,
      vida: 0.55 + r() * 0.5,
      tam: trecho ? 0.75 + r() * 0.35 : 0.6 + r() * 0.7,
      s: sprite(texto, branco ? "#ffffff" : "#c8fbff"),
    };
  });
  const raios = Array.from({ length: N_RAIOS }, () => ({ ang: r() * Math.PI * 2, larg: 0.05 + r() * 0.08, compr: 0.7 + r() * 0.5 }));

  const ajustar = () => {
    const b = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(b.width * dpr));
    const h = Math.max(1, Math.round(b.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  function caminhoDaTela(W: number, H: number, folga = 0) {
    const c = { x: MONITOR.x * W, y: MONITOR.y * H };
    ctx.beginPath();
    [TELA.se, TELA.sd, TELA.id, TELA.ie].forEach((p, i) => {
      const x = p.x * W + (p.x * W - c.x) * folga;
      const y = p.y * H + (p.y * H - c.y) * folga;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.closePath();
  }

  function desenhar(t: number) {
    ajustar();
    const { width: W, height: H } = canvas;
    const cx = MONITOR.x * W;
    const cy = MONITOR.y * H;
    const D = Math.hypot(W, H);
    ctx.clearRect(0, 0, W, H);

    // câmera: mergulha no centro da tela (acelerando) com um tremor mínimo no pico
    const mergulho = suave(0.25, 2.95, t) ** 1.8;
    const tremor = suave(1.4, 2.0, t) * (1 - suave(2.6, 2.9, t)) * 0.18;
    camera.style.transformOrigin = `${MONITOR.x * 100}% ${MONITOR.y * 100}%`;
    camera.style.transform = `translate(${Math.sin(t * 47) * tremor}%, ${Math.cos(t * 39) * tremor}%) scale(${1 + mergulho * 1.6})`;
    const estouro = suave(0.5, 2.8, t);
    camera.style.filter = estouro > 0 ? `brightness(${1 + estouro * 0.7}) saturate(${1 + estouro * 0.35})` : "";

    // a mesma câmera vale para o desenho: tudo fica preso à tela do monitor durante o mergulho
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1 + mergulho * 1.6, 1 + mergulho * 1.6);
    ctx.translate(-cx, -cy);
    ctx.globalCompositeOperation = "lighter";

    // 1) a tela acende: brilho em gradiente (centro branco, bordas ciano) com bloom no formato do monitor.
    //    Some conforme o branco final cresce, para não virar um retângulo chapado no mergulho.
    const acende = suave(0.1, 0.9, t) * (1 - suave(1.8, 2.5, t));
    if (acende > 0) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, (TELA.sd.x - TELA.se.x) * W * 0.62);
      g.addColorStop(0, `rgba(255,255,255,${0.75 * acende})`);
      g.addColorStop(0.55, `rgba(190,250,255,${0.45 * acende})`);
      g.addColorStop(1, `rgba(${CIANO},${0.25 * acende})`);
      ctx.save();
      ctx.shadowColor = `rgba(${CIANO},${0.8 * acende})`;
      ctx.shadowBlur = W * (0.04 + 0.08 * acende);
      ctx.filter = "none";
      caminhoDaTela(W, H);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }

    // 2) a luz vaza para o quarto: halo amplo + raios suaves girando devagar
    const vaza = suave(0.4, 1.8, t);
    if (vaza > 0) {
      const raio = D * (0.18 + 0.45 * vaza);
      const g = ctx.createRadialGradient(cx, cy, raio * 0.05, cx, cy, raio);
      g.addColorStop(0, `rgba(230,255,255,${0.55 * vaza})`);
      g.addColorStop(0.35, `rgba(${CIANO},${0.22 * vaza})`);
      g.addColorStop(1, "rgba(60,120,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      const giro = t * 0.18;
      for (const f of raios) {
        const a = f.ang + giro;
        const L = D * f.compr * (0.5 + vaza);
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, L);
        gr.addColorStop(0, `rgba(220,255,255,${0.16 * vaza})`);
        gr.addColorStop(1, `rgba(${CIANO},0)`);
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, L, a - f.larg, a + f.larg);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    // 3) o código sai da tela em perspectiva (fora da câmera: ele vem na direção do visitante)
    ctx.globalCompositeOperation = "lighter";
    const base = H * 0.022;
    const zoom = 1 + mergulho * 1.6;
    for (const p of glifos) {
      const k = (t - p.nasce) / p.vida;
      if (k <= 0 || k >= 1) continue;
      const z = 1 - k * 0.9; // 1 = na tela, perto de 0 = no rosto de quem vê
      const o = naTela(p.u, p.v);
      const ox = cx + (o.x * W - cx) * zoom;
      const oy = cy + (o.y * H - cy) * zoom;
      // some antes de chegar perto demais (glifo enorme fica borrado)
      const alpha = Math.min(1, k * 6) * (1 - k) ** 0.7 * suave(0.18, 0.4, z);
      // rastro curto: duas cópias recuando para a tela
      for (const [atraso, a] of [
        [0.05, 0.25],
        [0.025, 0.45],
        [0, 1],
      ] as const) {
        const zz = Math.min(1, z + atraso);
        ctx.globalAlpha = alpha * a;
        const e = Math.min((base * p.tam * zoom) / zz, H * 0.055) / p.s.px;
        ctx.drawImage(p.s.c, cx + (ox - cx) / zz - (p.s.w * e) / 2, cy + (oy - cy) / zz - (p.s.h * e) / 2, p.s.w * e, p.s.h * e);
      }
    }
    ctx.globalAlpha = 1;

    // impacto do Enter (t = 1 s): um flash curto, estilo anime. A troca entre o vídeo do loop e o do
    // Enter acontece dentro dele (Hero.tsx), então a diferença entre os dois não aparece.
    ctx.globalCompositeOperation = "source-over";
    const impacto = Math.exp(-(((t - IMPACTO) / 0.075) ** 2));
    if (impacto > 0.01) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, D * 0.9);
      g.addColorStop(0, `rgba(250,255,255,${0.95 * impacto})`);
      g.addColorStop(1, `rgba(200,245,255,${0.7 * impacto})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // 4) o branco nasce do monitor e se expande
    const abre = suave(2.0, 2.85, t);
    if (abre > 0) {
      const R = D * (0.08 + 1.1 * abre ** 1.4);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, `rgba(248,254,255,${Math.min(1, abre * 1.6)})`);
      g.addColorStop(0.6, `rgba(235,252,255,${abre * 0.85})`);
      g.addColorStop(1, "rgba(220,250,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    const branco = suave(2.6, 2.95, t);
    if (branco > 0) {
      ctx.fillStyle = `rgba(245,253,255,${branco})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function limpar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    camera.style.transform = "";
    camera.style.filter = "";
  }

  return { desenhar, limpar };
}
