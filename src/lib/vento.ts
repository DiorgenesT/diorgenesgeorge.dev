/**
 * Vento no mundo do jogo (canvas 2D por cima do vídeo do mundo).
 *
 * O vídeo mexe pouco; esta camada dá o vento: pétalas e folhas atravessando da esquerda para a direita,
 * pólen brilhando contra o sol e, de vez em quando, um risco de vento no estilo anime. As rajadas são uma
 * soma de senos lentos, então tudo acelera e desacelera junto, como vento de verdade.
 * Barato: algumas dezenas de partículas, sem filtros nem sombras por quadro.
 */

type Particula = {
  x: number;
  y: number;
  z: number; // 0 = longe (pequena, lenta), 1 = perto
  giro: number;
  vGiro: number;
  fase: number;
  tipo: "petala" | "folha" | "polen";
  cor: string;
};

type Risco = { x: number; y: number; vida: number; idade: number; compr: number; curva: number };

const CORES = {
  petala: ["#ffffff", "#fff4fa", "#ffe9f3", "#fff7d6"],
  folha: ["#8fd14f", "#6fbf3a", "#b6e36b"],
};

export function criarVento(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let W = 1;
  let H = 1;
  let raf = 0;
  let ultimo = 0;
  let t = 0;

  const nova = (inicio: boolean): Particula => {
    const r = Math.random();
    const tipo = r < 0.45 ? "polen" : r < 0.8 ? "petala" : "folha";
    const lista = tipo === "polen" ? ["#fffbe6"] : CORES[tipo];
    return {
      x: inicio ? Math.random() * W : -0.05 * W - Math.random() * 0.2 * W,
      y: Math.random() * H,
      z: Math.random() ** 1.6,
      giro: Math.random() * Math.PI * 2,
      vGiro: (Math.random() - 0.5) * 4,
      fase: Math.random() * 100,
      tipo,
      cor: lista[Math.floor(Math.random() * lista.length)],
    };
  };

  let particulas: Particula[] = [];
  let riscos: Risco[] = [];

  const ajustar = () => {
    const b = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(b.width * dpr));
    const h = Math.max(1, Math.round(b.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    W = w;
    H = h;
  };

  /** Força da rajada agora (≈ 0,6 a 1,6). */
  const rajada = () => 1 + 0.35 * Math.sin(t * 0.7) + 0.2 * Math.sin(t * 1.9 + 1.3) + 0.1 * Math.sin(t * 4.3);

  function quadro(agora: number) {
    const dt = Math.min(0.05, (agora - (ultimo || agora)) / 1000);
    ultimo = agora;
    t += dt;
    ajustar();
    ctx.clearRect(0, 0, W, H);
    const g = rajada();
    const u = H / 720; // tamanhos pensados para 720 px de altura

    // riscos de vento: linhas finas que surgem, correm e somem
    if (Math.random() < dt * 0.9 * g) {
      riscos.push({ x: Math.random() * W * 0.7, y: H * (0.15 + Math.random() * 0.7), vida: 1.1 + Math.random() * 0.8, idade: 0, compr: (0.12 + Math.random() * 0.18) * W, curva: (Math.random() - 0.5) * 0.12 * H });
    }
    ctx.lineCap = "round";
    riscos = riscos.filter((r) => (r.idade += dt) < r.vida);
    for (const r of riscos) {
      const k = r.idade / r.vida;
      const a = Math.sin(k * Math.PI) * 0.35;
      const x0 = r.x + k * 0.25 * W * g;
      const ini = x0 + r.compr * Math.max(0, k * 1.4 - 0.4);
      const fim = x0 + r.compr * Math.min(1, k * 1.4);
      ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.lineWidth = 1.6 * u;
      ctx.beginPath();
      ctx.moveTo(ini, r.y);
      ctx.quadraticCurveTo((ini + fim) / 2, r.y + r.curva * Math.sin(k * 3), fim, r.y - r.curva * 0.3);
      ctx.stroke();
    }

    // partículas
    for (const p of particulas) {
      const vel = (0.05 + 0.13 * p.z) * W * g;
      p.x += vel * dt;
      p.y += (Math.sin(t * 1.3 + p.fase) * 0.03 + 0.012) * H * dt * (0.5 + p.z);
      p.giro += p.vGiro * dt * g;
      if (p.x > W * 1.05 || p.y > H * 1.05) Object.assign(p, nova(false));

      const tam = (2 + 7 * p.z) * u;
      if (p.tipo === "polen") {
        const brilho = 0.35 + 0.35 * Math.sin(t * 3 + p.fase);
        ctx.fillStyle = `rgba(255,251,230,${(brilho * (0.4 + 0.6 * p.z)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, tam * 0.28, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      // pétala/folha: elipse girando em 3D (a largura "respira" com o giro)
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.scale(1, 0.25 + 0.75 * Math.abs(Math.cos(p.giro * 1.7 + p.fase)));
      ctx.globalAlpha = 0.55 + 0.45 * p.z;
      ctx.fillStyle = p.cor;
      ctx.beginPath();
      ctx.ellipse(0, 0, tam * (p.tipo === "folha" ? 1.1 : 0.8), tam * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    raf = requestAnimationFrame(quadro);
  }

  function ligar() {
    if (raf) return;
    ajustar();
    const n = W < 900 ? 28 : 46;
    if (particulas.length !== n) particulas = Array.from({ length: n }, () => nova(true));
    ultimo = 0;
    raf = requestAnimationFrame(quadro);
  }

  function desligar() {
    cancelAnimationFrame(raf);
    raf = 0;
    riscos = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { ligar, desligar };
}
