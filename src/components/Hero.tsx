"use client";

import { useEffect, useRef } from "react";
import type { Dicionario } from "@/i18n";
import { linkWhatsApp } from "@/i18n/config";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";
import { criarLuz } from "@/lib/luz";
import { criarTransicao } from "@/lib/pixels";
import { criarSuccao, type Succao } from "@/lib/succao";
import { palco } from "@/lib/portal";
import { useTema, type Tema } from "@/lib/tema";
import { criarVento } from "@/lib/vento";
import Redes from "./Redes";

/**
 * Hero ISEKAI. Escuro: o Diorgenes programando à noite, de costas (vídeo em loop). Ao trocar para o tema
 * claro o monitor do jogo o puxa para dentro (WebGL, src/lib/succao.ts), a câmera mergulha na tela com o
 * código voando (src/lib/luz.ts) e o clarão se desfaz em blocos que constroem o mundo do jogo
 * (src/lib/pixels.ts) — ele foi parar dentro do jogo que estava criando. Voltar ao escuro faz o caminho
 * inverso: o mundo vira luz e a tela o devolve à cadeira.
 *
 * No mundo, ele está de costas admirando a paisagem (vídeo em loop). A <img> é o primeiro quadro desse
 * vídeo: fundo enquanto ele carrega e fonte dos blocos na ida.
 * Leis: Von Restorff (a cena é o foco), proximidade (frase + ação), Fitts (CTA grande), feedback (a cena
 * responde ao clique no tema).
 */
export default function Hero({ t }: { t: Dicionario }) {
  const secao = useRef<HTMLElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const succ = useRef<HTMLCanvasElement>(null);
  const succao = useRef<Promise<Succao | null> | null>(null);
  const mundo = useRef<HTMLDivElement>(null);
  const imgMundo = useRef<HTMLImageElement>(null);
  const mundoLoop = useRef<HTMLVideoElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const luz = useRef<HTMLCanvasElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const capa = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const ventoCanvas = useRef<HTMLCanvasElement>(null);
  const vento = useRef<ReturnType<typeof criarVento> | null>(null);
  const tema = useTema();

  // O que está na tela agora (pode estar atrás do tema escolhido enquanto a transição roda).
  const visual = useRef<Tema | null>(null);
  const ocupado = useRef(false);

  const marcarVisual = (v: Tema) => {
    visual.current = v;
    document.documentElement.dataset.visual = v;
  };

  /** Estado final sem animação (carregamento da página ou "menos movimento"). */
  const aplicar = (v: Tema) => {
    gsap.set(mundo.current, { autoAlpha: v === "claro" ? 1 : 0 });
    gsap.set([succ.current, tela.current, luz.current], { autoAlpha: 0 });
    if (v === "claro") {
      loop.current?.pause();
      mostrarLoopDoMundo();
    } else {
      pararMundo();
      loop.current?.play().catch(() => {});
    }
    marcarVisual(v);
  };

  /** O mundo em loop (começa no 1º quadro, o mesmo da <img> que os blocos montam). */
  const mostrarLoopDoMundo = () => {
    // vento em código (o vídeo mexe pouco); fica parado para quem pediu menos movimento
    if (!menosMovimento()) (vento.current ??= criarVento(ventoCanvas.current!)).ligar();
    const l = mundoLoop.current!;
    l.preload = "auto";
    l.currentTime = 0;
    gsap.set(l, { autoAlpha: 1 });
    l.play().catch(() => {});
  };

  const pararMundo = () => {
    vento.current?.desligar();
    mundoLoop.current?.pause();
    gsap.set(mundoLoop.current, { autoAlpha: 0 });
  };

  /** O quadro do mundo que está na tela agora (fonte dos blocos na volta). */
  const quadroDoMundo = () => {
    const l = mundoLoop.current!;
    return l.style.visibility !== "hidden" && l.readyState >= 2 ? l : imgMundo.current!;
  };

  /** A sucção (WebGL) é criada uma vez só, na primeira troca. null = sem WebGL. */
  const obterSuccao = () =>
    (succao.current ??= criarSuccao(succ.current!, loop.current!).catch(() => null));

  const esperar = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

  /**
   * A luz do Enter (src/lib/luz.ts) de `de` até `ate` segundos do roteiro dela, em `ms`. Com a sucção,
   * o desenho só aparece depois de `visivelEm` s; antes disso ela só move a câmera (o mergulho começa suave).
   */
  const animarLuz = (brilho: ReturnType<typeof criarLuz>, de: number, ate: number, ms: number, visivelEm = 0) =>
    new Promise<void>((fim) => {
      const ini = performance.now();
      const l = luz.current!;
      l.style.visibility = "visible";
      const quadro = () => {
        const k = Math.min(1, (performance.now() - ini) / ms);
        const t = de + (ate - de) * k;
        l.style.opacity = String(Math.min(1, Math.max(0, (t - visivelEm) / 0.3)));
        brilho.desenhar(t);
        if (k < 1) requestAnimationFrame(quadro);
        else fim();
      };
      requestAnimationFrame(quadro);
    });

  /** Põe o loop do quarto no 1º quadro (o da máscara) e espera ele estar pronto. */
  const loopNoComeco = () =>
    new Promise<void>((ok) => {
      const l = loop.current!;
      l.pause();
      if (l.currentTime === 0 && l.readyState >= 2) return ok();
      const pronto = () => {
        clearTimeout(seguro);
        ok();
      };
      const seguro = setTimeout(pronto, 800);
      l.addEventListener("seeked", pronto, { once: true });
      l.currentTime = 0;
    });

  async function irParaOJogo() {
    const img = imgMundo.current!;
    mundoLoop.current!.preload = "auto";
    const [, s] = await Promise.all([img.decode().catch(() => {}), obterSuccao()]);
    const fx = criarTransicao(tela.current!, img);
    const brilho = criarLuz(luz.current!, camera.current!);

    // 1) o monitor do jogo o puxa para dentro; no fim a câmera já mergulha na tela com o código voando
    if (s) {
      loop.current!.pause();
      s.capturar();
      s.desenhar(0);
      gsap.set(succ.current, { autoAlpha: 1 });
      // a luz começa a aparecer quando só restam fios dele (p ≈ 0,85) e termina no branco
      await Promise.all([s.animar(0, 1, 3400), esperar(1500).then(() => animarLuz(brilho, 0.25, 3, 2300, 1.5))]);
    } else {
      await animarLuz(brilho, 0, 3, 3000);
    }

    // 2) o branco vira blocos e o mundo compila
    fx.desenhar(0);
    gsap.set(tela.current, { autoAlpha: 1 });
    gsap.set([succ.current, luz.current], { autoAlpha: 0 });
    brilho.limpar();
    loop.current?.pause();
    marcarVisual("claro");
    await fx.animar(0, 1, 1300);
    gsap.set(mundo.current, { autoAlpha: 1 });
    gsap.set(tela.current, { autoAlpha: 0 });
    mostrarLoopDoMundo();

    // 3) conquista (uma vez por visita)
    if (!sessionStorage.getItem("conquista-isekai")) {
      sessionStorage.setItem("conquista-isekai", "1");
      window.dispatchEvent(new CustomEvent("conquista"));
    }
  }

  async function voltarAoCodigo() {
    const fx = criarTransicao(tela.current!, quadroDoMundo());
    const brilho = criarLuz(luz.current!, camera.current!);
    const [s] = await Promise.all([obterSuccao(), loopNoComeco()]);

    // 1) o mundo se desmonta em blocos até virar luz
    fx.desenhar(1);
    gsap.set(tela.current, { autoAlpha: 1 });
    gsap.set(mundo.current, { autoAlpha: 0 });
    pararMundo();
    await fx.animar(1, 0, 900);

    // 2) a câmera sai da tela e o monitor o devolve à cadeira
    brilho.desenhar(3);
    gsap.set(luz.current, { autoAlpha: 1 });
    if (s) {
      s.capturar();
      s.desenhar(1);
      gsap.set(succ.current, { autoAlpha: 1 });
    }
    gsap.set(tela.current, { autoAlpha: 0 });
    marcarVisual("escuro");
    if (s) {
      await Promise.all([animarLuz(brilho, 3, 0.25, 2200, 1.5), esperar(500).then(() => s.animar(1, 0, 3000))]);
    } else {
      await animarLuz(brilho, 3, 0, 2200);
    }
    brilho.limpar();
    gsap.set([luz.current, succ.current], { autoAlpha: 0 });
    loop.current?.play().catch(() => {});
  }

  // Primeira montagem: o script do <head> já aplicou o tema salvo; só sincroniza a cena, sem animar.
  // Também entrega ao portal (src/lib/portal.ts) a capa e o texto, que ele move ao abrir uma tela.
  useEffect(() => {
    palco.capa = capa.current;
    palco.texto = texto.current;
    palco.mundo = () => quadroDoMundo();
    aplicar(document.documentElement.dataset.tema === "claro" ? "claro" : "escuro");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Troca de tema: roda a cena; se o visitante trocar de novo no meio, a próxima roda em seguida.
  useEffect(() => {
    if (visual.current === null || ocupado.current || visual.current === tema) return;
    const rodar = async () => {
      ocupado.current = true;
      try {
        while (visual.current !== (document.documentElement.dataset.tema === "claro" ? "claro" : "escuro")) {
          const alvo: Tema = visual.current === "claro" ? "escuro" : "claro";
          if (menosMovimento()) {
            await gsap.to(secao.current, { autoAlpha: 0.4, duration: 0.25 });
            aplicar(alvo);
            await gsap.to(secao.current, { autoAlpha: 1, duration: 0.35 });
          } else if (alvo === "claro") await irParaOJogo();
          else await voltarAoCodigo();
        }
      } finally {
        ocupado.current = false;
      }
    };
    rodar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema]);

  useGSAP(
    () => {
      const linhas = SplitText.create(".hero-linha", { type: "words", mask: "words", wordsClass: "sp-palavra" });
      const intro = gsap.timeline({ delay: 0.2 });
      intro
        .from(".palco", { autoAlpha: 0, scale: 1.06, duration: 1.8, ease: "expo.out" }, 0)
        .from(linhas.words, { yPercent: 110, duration: 1.1, stagger: 0.06, ease: "expo.out" }, 0.35)
        .from(".hero-entra", { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08, ease: "expo.out" }, 0.7);

      return () => {
        linhas.revert();
      };
    },
    { scope: secao },
  );

  const video = "absolute inset-0 size-full object-cover";

  return (
    <section ref={secao} id="topo" className="fixed inset-0 z-0 bg-tinta transition-colors duration-700 jogo:bg-[#0b1d38]">
      <div className="relative h-full overflow-hidden">
        {/* palco: no celular, a metade de cima; no desktop, a tela toda */}
        <div
          className="palco absolute inset-x-0 top-0 h-[58svh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)] md:inset-0 md:h-full md:[mask-image:none]"
          aria-hidden
        >
          <div ref={capa} className="capa [--px:.62] md:[--px:.15]">
            {/* câmera: os vídeos do quarto (mergulha no monitor durante o Enter, src/lib/luz.ts) */}
            <div ref={camera} className="absolute inset-0 will-change-transform">
            {/* escuro: o dev no quarto */}
            <video ref={loop} className={video} poster="/hero/isekai/dev-poster.webp" autoPlay muted loop playsInline preload="auto">
              <source src="/hero/isekai/dev-loop.webm" type="video/webm" />
              <source src="/hero/isekai/dev-loop.mp4" type="video/mp4" />
            </video>

            {/* claro: o mundo do jogo — ele de costas, admirando a paisagem */}
            <div ref={mundo} className="invisible absolute inset-0 overflow-hidden opacity-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- export estático; a imagem também alimenta o canvas */}
              <img ref={imgMundo} src="/hero/isekai/mundo.webp" alt="" className="size-full object-cover" decoding="async" />
              <video ref={mundoLoop} className={`${video} invisible opacity-0`} muted loop playsInline preload="metadata">
                <source src="/hero/isekai/mundo-loop.webm" type="video/webm" />
                <source src="/hero/isekai/mundo-loop.mp4" type="video/mp4" />
              </video>
              <canvas ref={ventoCanvas} className="pointer-events-none absolute inset-0 size-full" />
            </div>

            {/* transição: a sucção para dentro do monitor (src/lib/succao.ts) */}
            <canvas ref={succ} className="invisible absolute inset-0 size-full opacity-0" />
            </div>
            <canvas ref={luz} className="pointer-events-none invisible absolute inset-0 size-full opacity-0" />
            <canvas ref={tela} className="invisible absolute inset-0 size-full opacity-0" />
          </div>
        </div>

        {/* leitura do texto: escurece (ou clareia, no mundo do jogo) a esquerda e a base */}
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-700 jogo:opacity-0 bg-[linear-gradient(90deg,#05070cf2_0%,#05070cc7_26%,#05070c66_44%,transparent_62%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-700 jogo:opacity-0 bg-[linear-gradient(0deg,#05070c_0%,#05070ccc_38%,transparent_70%)] md:bg-[linear-gradient(0deg,#05070c_0%,transparent_30%)]" />
        {/* mundo do jogo: um pouco mais escuro no todo e azul-noite atrás do texto (o texto é claro nos dois temas) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[#0a1a33]/20" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[linear-gradient(90deg,#071a33e6_0%,#071a33b3_26%,#071a3359_44%,transparent_62%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[linear-gradient(0deg,#0b1d38_0%,#0b1d38cc_38%,transparent_70%)] md:bg-[linear-gradient(0deg,#071a33cc_0%,transparent_32%)]" />
        <div aria-hidden className="grao pointer-events-none absolute inset-0" />

        {/* redes em coluna, à direita, centralizadas na altura */}
        <Redes mensagem={t.hero.conversar} className="hero-entra hero-texto absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1 rounded-full border border-white/10 bg-[#05070c]/55 p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] backdrop-blur-md md:flex lg:right-10 jogo:bg-[#071a33]/55" />

        <div ref={texto} className="hero-texto relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-[8vh] md:px-14 md:pb-[9vh]">
          <p className="hero-entra mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
              <span className="relative size-2 rounded-full bg-emerald-400" />
            </span>
            {t.hero.status}
            <span className="hidden opacity-40 sm:inline">/</span>
            <span className="hidden sm:inline">{t.hero.papel}</span>
          </p>
          {/* a frase acompanha a cena: no escuro brilha o "código", no mundo do jogo brilha o "produto" */}
          <h1 className="font-display text-[10.5vw] leading-[1.04] md:text-[3.9vw]">
            <span className="hero-linha block text-white transition-colors duration-700 jogo:text-white/40">{t.hero.titulo[0]}</span>
            <span className="hero-linha block text-white/35 transition-colors duration-700 jogo:text-[#7df3ff]">{t.hero.titulo[1]}</span>
          </h1>
          <p className="hero-entra mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/65 md:text-[17px] jogo:text-white/80">{t.hero.sub}</p>
          <div className="hero-entra mt-8 flex flex-wrap items-center gap-3">
            <a href="#work" className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 text-[15px] font-medium text-black transition-colors hover:bg-[#7df3ff]">
              {t.hero.cta}
              <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 ease-corte group-hover:translate-x-0.5 group-hover:rotate-[-45deg]">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
            <a href={linkWhatsApp(t.hero.conversar)} target="_blank" rel="noopener" className="inline-flex h-12 items-center rounded-full border border-white/20 px-5 text-[15px] text-white/85 backdrop-blur transition-colors hover:border-white/60 hover:text-white">
              {t.hero.conversar}
            </a>
          </div>
          {/* no celular as redes ficam em linha, abaixo dos botões */}
          <Redes mensagem={t.hero.conversar} className="hero-entra -ml-3 mt-6 flex gap-1 md:hidden" />
        </div>
      </div>
    </section>
  );
}
