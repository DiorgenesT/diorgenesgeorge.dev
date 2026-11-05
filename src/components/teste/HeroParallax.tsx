"use client";

/**
 * TESTE DESCARTÁVEL (05/11/2026): o hero escuro em parallax, para comparar com o hero em vídeo.
 * Usa as camadas do Contato (public/contato) e faz a vida em código: chuva na janela, vapor da caneca,
 * código rolando no monitor esquerdo, o vídeo do mundo dentro do monitor direito e a luz das telas.
 * Rota: /pt/teste-parallax. Apagar este arquivo e a rota se o teste não for aprovado.
 */

import { useEffect, useRef } from "react";

type P = [number, number];

// camadas e posições em % do quadro 16:9 (as mesmas do Contato)
const CAMADAS = [
  { id: "fundo", src: "/contato/1-fundo.webp", d: 0.1, caixa: "left-[-4%] top-[-4%] w-[108%]" },
  { id: "estante", src: "/contato/2-estante.webp", d: 0.28, caixa: "left-[3.9%] top-[1.3%] w-[93.2%]" },
  { id: "mesa", src: "/contato/3-mesa.webp", d: 0.5, caixa: "left-0 top-[15.7%] w-full" },
  { id: "ele", src: "/contato/4-ele.webp", d: 0.8, caixa: "left-[57%] top-[44%] w-[40%]" },
  { id: "frente", src: "/contato/5-frente.webp", d: 1.2, caixa: "left-[-3%] top-[40%] w-[106%]" },
];

/** Telas dos monitores no quadro 16:9, medidas com Hough (sup. esq., sup. dir., inf. dir., inf. esq.). */
const CODIGO: P[] = [[0.2, 0.1785], [0.483, 0.2164], [0.483, 0.5828], [0.2, 0.6109]];
const JOGO: P[] = [[0.499, 0.2135], [0.85, 0.2185], [0.85, 0.5905], [0.499, 0.585]];
/** A caneca (topo da boca), de onde sai o vapor. */
const CANECA: P = [0.425, 0.69];

function perspectiva(w: number, h: number, q: P[]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const k = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].map((n) => +n.toPrecision(8)).join(",")})`;
}

const caixaDe = (q: P[]) => {
  const xs = q.map(([x]) => x);
  const ys = q.map(([, y]) => y);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
};

/** Um retângulo projetado nos cantos q (frações do quadro), dentro de um pai do tamanho do quadro. */
function Projetado({ q, className = "", children }: { q: P[]; className?: string; children: React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const c = caixaDe(q);
  useEffect(() => {
    const e = el.current;
    const pai = e?.parentElement;
    if (!e || !pai) return;
    const ajustar = () => {
      const W = pai.clientWidth;
      const H = pai.clientHeight;
      if (!e.offsetWidth) return;
      e.style.transform = perspectiva(e.offsetWidth, e.offsetHeight, q.map(([x, y]) => [(x - c.x0) * W, (y - c.y0) * H]));
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(pai);
    return () => ro.disconnect();
  }, [q, c.x0, c.y0]);
  return (
    <div
      ref={el}
      className={`absolute origin-top-left overflow-hidden ${className}`}
      style={{ left: `${c.x0 * 100}%`, top: `${c.y0 * 100}%`, width: `${(c.x1 - c.x0) * 100}%`, height: `${(c.y1 - c.y0) * 100}%` }}
    >
      {children}
    </div>
  );
}

const LINHAS = [
  ["kw", "import", "tx", " { ", "fn", "World", "tx", " } ", "kw", "from", "st", ' "./engine"'],
  ["cm", "// cada frame é um commit"],
  ["kw", "export function", "fn", " build", "tx", "(seed: number) {"],
  ["tx", "  ", "kw", "const", "tx", " world = ", "kw", "new", "fn", " World", "tx", "(seed)"],
  ["tx", "  world.", "fn", "spawn", "tx", "(", "st", '"player"', "tx", ", { x: 0, y: 0 })"],
  ["tx", "  world.terrain.", "fn", "raise", "tx", "(", "nm", "0.62", "tx", ")"],
  ["tx", "  world.weather = ", "st", '"rain"'],
  ["kw", "  for", "tx", " (", "kw", "const", "tx", " ruin ", "kw", "of", "tx", " world.ruins) {"],
  ["tx", "    ruin.", "fn", "erode", "tx", "(", "nm", "1200", "tx", ")"],
  ["tx", "  }"],
  ["kw", "  return", "tx", " world"],
  ["tx", "}"],
  ["tx", ""],
  ["kw", "await", "fn", " run", "tx", "(", "fn", "build", "tx", "(", "nm", "42", "tx", "))"],
  ["cm", "// você entra nele."],
];
const COR: Record<string, string> = { kw: "#c792ea", fn: "#82aaff", st: "#c3e88d", nm: "#f78c6c", cm: "rgba(255,255,255,.35)", tx: "rgba(255,255,255,.78)" };

/** O código rola devagar no monitor esquerdo (duas cópias para emendar). */
function Codigo() {
  const bloco = (
    <div className="pb-[1.4em]">
      {LINHAS.map((l, i) => (
        <div key={i} className="flex h-[1.4em] gap-[1.4em]">
          <span className="w-[1.6em] shrink-0 text-right text-white/25">{i + 1}</span>
          <span className="whitespace-pre">
            {Array.from({ length: l.length / 2 }, (_, j) => (
              <span key={j} style={{ color: COR[l[j * 2]] }}>
                {l[j * 2 + 1]}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="absolute inset-0 bg-[#202932] pt-[8%] font-mono leading-none" style={{ fontSize: "calc(var(--w) * 0.0068)" }}>
      <div className="teste-rola">
        {bloco}
        {bloco}
      </div>
    </div>
  );
}

/** Chuva no vidro: riscos caindo e gotas escorrendo (canvas 2D barato). */
function Chuva() {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const riscos = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), v: 0.6 + Math.random() * 0.8, l: 0.02 + Math.random() * 0.04 }));
    const gotas = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), v: 0.02 + Math.random() * 0.05, r: 0.6 + Math.random() * 1.4 }));
    let ultimo = performance.now();
    const quadro = (agora: number) => {
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      const r = c.getBoundingClientRect();
      if (c.width !== Math.round(r.width) || c.height !== Math.round(r.height)) {
        c.width = Math.round(r.width);
        c.height = Math.round(r.height);
      }
      const W = c.width;
      const H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(190,210,235,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const s of riscos) {
        s.y += s.v * dt * 1.6;
        if (s.y > 1.05) {
          s.y = -0.05;
          s.x = Math.random();
        }
        ctx.moveTo(s.x * W, s.y * H);
        ctx.lineTo(s.x * W - s.l * H * 0.08, (s.y + s.l) * H);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(210,225,245,0.35)";
      for (const g of gotas) {
        g.y += g.v * dt * (0.4 + Math.random());
        if (g.y > 1.02) {
          g.y = -0.02;
          g.x = Math.random();
        }
        ctx.beginPath();
        ctx.ellipse(g.x * W, g.y * H, g.r, g.r * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={cv} className="absolute inset-0 size-full mix-blend-screen" />;
}

/** Vapor da caneca: fios claros e borrados subindo e se torcendo. */
function Vapor() {
  return (
    <div className="absolute" style={{ left: `${CANECA[0] * 100}%`, top: `${CANECA[1] * 100}%`, width: "2.4%", height: "9%", transform: "translate(-50%, -100%)" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="teste-vapor absolute bottom-0 left-1/2 h-full w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(230,236,245,.32),transparent)] blur-[3px]"
          style={{ animationDelay: `${i * 1.3}s`, marginLeft: `${(i - 1) * 18}%` }}
        />
      ))}
    </div>
  );
}

export default function HeroParallax() {
  const palco = useRef<HTMLDivElement>(null);
  const luz = useRef<HTMLDivElement>(null);

  // parallax: mouse onde houver; sem mouse (toque), uma deriva lenta
  useEffect(() => {
    const el = palco.current!;
    const camadas = [...el.querySelectorAll<HTMLElement>("[data-d]")].map((c) => ({ c, d: Number(c.dataset.d) }));
    const alvo = { x: 0, y: 0 };
    const atual = { x: 0, y: 0 };
    let mouse = false;
    let raf = 0;
    const t0 = performance.now();
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse = true;
      alvo.x = e.clientX / window.innerWidth - 0.5;
      alvo.y = e.clientY / window.innerHeight - 0.5;
    };
    const quadro = (agora: number) => {
      const t = (agora - t0) / 1000;
      if (!mouse) {
        alvo.x = Math.sin(t * 0.25) * 0.35;
        alvo.y = Math.sin(t * 0.17 + 1) * 0.2;
      }
      atual.x += (alvo.x - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      for (const { c, d } of camadas) c.style.transform = `translate3d(${(-atual.x * d * 80).toFixed(2)}px, ${(-atual.y * d * 36).toFixed(2)}px, 0)`;
      // a luz das telas respira e às vezes treme (troca de cena no jogo)
      if (luz.current) luz.current.style.opacity = (0.55 + 0.12 * Math.sin(t * 1.3) + (Math.sin(t * 7.1) > 0.97 ? 0.15 : 0)).toFixed(3);
      raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);
    window.addEventListener("pointermove", mover);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
    };
  }, []);

  return (
    <main className="fixed inset-0 bg-[#05070c] text-white">
      <div ref={palco} className="palco absolute inset-0 overflow-hidden">
        <div className="capa [--px:.3] md:[--px:.5]">
          {CAMADAS.map((c) => (
            <div key={c.id} data-d={c.d} className="absolute inset-0 will-change-transform">
              <div className={`absolute ${c.caixa}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- teste */}
                <img src={c.src} alt="" draggable={false} className="block w-full select-none" />
                {/* chuva só no vidro da janela (frações da imagem do fundo) */}
                {c.id === "fundo" && (
                  <div className="absolute overflow-hidden" style={{ left: "0%", top: "13%", width: "33.5%", height: "47%" }}>
                    <Chuva />
                  </div>
                )}
              </div>
              {c.id === "mesa" && (
                <>
                  <Projetado q={CODIGO}>
                    <Codigo />
                  </Projetado>
                  {/* a cúpula da luminária fica na frente do monitor: recortada da própria mesa, por cima do código */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- teste */}
                  <img src="/contato/3b-luminaria.webp" alt="" draggable={false} className="pointer-events-none absolute select-none" style={{ left: "12.74%", top: "34.01%", width: "9.33%" }} />
                  <Projetado q={JOGO}>
                    <video src="/hero/isekai/mundo-loop.mp4" autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
                  </Projetado>
                  <Vapor />
                </>
              )}
            </div>
          ))}
          {/* luz fria das telas sobre o quarto */}
          <div
            ref={luz}
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{ background: "radial-gradient(38% 42% at 52% 42%, rgba(110,170,230,.16), transparent 70%)" }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#05070cf2_0%,#05070cc7_22%,#05070c55_40%,transparent_55%)] md:[mask-image:linear-gradient(to_bottom,transparent_40%,black_66%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#05070c_0%,transparent_30%)]" />
        <div aria-hidden className="grao pointer-events-none absolute inset-0" />
      </div>

      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-[8vh] md:px-14 md:pb-[9vh]">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">Teste · hero em parallax</p>
        <h1 className="font-display text-[10.5vw] leading-[1.04] md:text-[3.9vw]">
          <span className="block">Eu programo o mundo.</span>
          <span className="block text-white/35">Você entra nele.</span>
        </h1>
        <p className="mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/65 md:text-[17px]">
          Camadas do quarto + chuva, vapor, código e o jogo feitos em código. Compare com o hero em vídeo em /pt/.
        </p>
      </div>
    </main>
  );
}
