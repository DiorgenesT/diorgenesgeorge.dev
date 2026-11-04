"use client";

import { useEffect, useRef } from "react";
import type { Dicionario } from "@/i18n";
import { linkWhatsApp } from "@/i18n/config";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";
import { criarLuz, IMPACTO } from "@/lib/luz";
import { criarTransicao } from "@/lib/pixels";
import { palco } from "@/lib/portal";
import { useTema, type Tema } from "@/lib/tema";
import Redes from "./Redes";

/**
 * Hero ISEKAI. Escuro: o Diorgenes programando à noite (vídeo em loop). Ao trocar para o tema claro
 * ele aperta Enter, a tela do jogo explode em luz (vídeo) e o clarão se desfaz em blocos que constroem
 * o mundo do jogo (canvas, src/lib/pixels.ts) — ele foi parar dentro do jogo que estava criando.
 * Voltar ao escuro desmonta o mundo em blocos e toca o clarão ao contrário, de volta ao quarto.
 *
 * No mundo, ele olha em volta e encara a câmera (vídeo em vai e volta). A <img> é o primeiro quadro desse
 * vídeo: fundo enquanto ele carrega e fonte dos blocos na ida.
 *
 * O Kling gerou o personagem um pouco maior no loop do que no Enter. Por isso a troca entre os dois nunca é
 * seca: na ida e na volta os vídeos se misturam enquanto a câmera se move e a luz do monitor esconde a diferença.
 * Leis: Von Restorff (a cena é o foco), proximidade (frase + ação), Fitts (CTA grande), feedback (a cena
 * responde ao clique no tema).
 */
export default function Hero({ t }: { t: Dicionario }) {
  const secao = useRef<HTMLElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const enter = useRef<HTMLVideoElement>(null);
  const volta = useRef<HTMLVideoElement>(null);
  const mundo = useRef<HTMLDivElement>(null);
  const imgMundo = useRef<HTMLImageElement>(null);
  const mundoLoop = useRef<HTMLVideoElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const luz = useRef<HTMLCanvasElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const capa = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);
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
    gsap.set([enter.current, volta.current, tela.current, luz.current], { autoAlpha: 0 });
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
    const l = mundoLoop.current!;
    l.preload = "auto";
    l.currentTime = 0;
    gsap.set(l, { autoAlpha: 1 });
    l.play().catch(() => {});
  };

  const pararMundo = () => {
    mundoLoop.current?.pause();
    gsap.set(mundoLoop.current, { autoAlpha: 0 });
  };

  /** O quadro do mundo que está na tela agora (fonte dos blocos na volta). */
  const quadroDoMundo = () => {
    const l = mundoLoop.current!;
    return l.style.visibility !== "hidden" && l.readyState >= 2 ? l : imgMundo.current!;
  };

  /** Toca o vídeo do início ao fim, chamando `aCada` em todo quadro com o tempo atual do vídeo. */
  const tocarAteOFim = (v: HTMLVideoElement, limiteMs: number, aCada?: (t: number) => void) =>
    new Promise<void>((fim) => {
      let raf = 0;
      const pronto = () => {
        clearTimeout(seguro);
        cancelAnimationFrame(raf);
        v.removeEventListener("ended", pronto);
        fim();
      };
      const seguro = setTimeout(pronto, limiteMs); // se o vídeo travar, a cena não fica presa
      const quadro = () => {
        aCada?.(v.currentTime);
        raf = requestAnimationFrame(quadro);
      };
      v.addEventListener("ended", pronto);
      v.currentTime = 0;
      v.play().catch(pronto);
      if (aCada) raf = requestAnimationFrame(quadro);
    });

  async function irParaOJogo() {
    const img = imgMundo.current!;
    await img.decode().catch(() => {});
    const fx = criarTransicao(tela.current!, img);
    const brilho = criarLuz(luz.current!, camera.current!);

    // 1) Enter: a câmera mergulha no monitor, o código sai voando da tela e a luz toma o quarto
    // o Enter troca de lugar com o loop dentro do flash de impacto (o personagem difere um pouco entre os dois vídeos)
    const e = enter.current!;
    mundoLoop.current!.preload = "auto";
    gsap.set(e, { autoAlpha: 0.001 });
    gsap.set(luz.current, { autoAlpha: 1 });
    await tocarAteOFim(e, 4000, (te) => {
      e.style.opacity = String(Math.min(1, Math.max(0.001, (te - IMPACTO + 0.05) / 0.1)));
      brilho.desenhar(te);
    });
    gsap.set(e, { autoAlpha: 1 });
    brilho.desenhar(3);

    // 2) o branco vira blocos e o mundo compila
    fx.desenhar(0);
    gsap.set(tela.current, { autoAlpha: 1 });
    gsap.set([enter.current, luz.current], { autoAlpha: 0 });
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

    // 1) o mundo se desmonta em blocos até virar luz
    fx.desenhar(1);
    gsap.set(tela.current, { autoAlpha: 1 });
    gsap.set(mundo.current, { autoAlpha: 0 });
    pararMundo();
    await fx.animar(1, 0, 900);

    // 2) a luz e o código voltam para dentro do monitor, a câmera recua e o quarto reaparece
    brilho.desenhar(3);
    gsap.set([volta.current, luz.current], { autoAlpha: 1 });
    gsap.set(tela.current, { autoAlpha: 0 });
    marcarVisual("escuro");
    loop.current!.currentTime = 0;
    loop.current?.play().catch(() => {});
    // a volta devolve o lugar ao loop dentro do mesmo flash de impacto
    const v = volta.current!;
    await tocarAteOFim(v, 4000, (tv) => {
      v.style.opacity = String(Math.min(1, Math.max(0, 1 - (tv - (3 - IMPACTO) + 0.05) / 0.1)));
      brilho.desenhar(3 - tv);
    });
    brilho.limpar();
    gsap.set([luz.current, v], { autoAlpha: 0 });
  }

  // Primeira montagem: o script do <head> já aplicou o tema salvo; só sincroniza a cena, sem animar.
  // Também entrega ao portal (src/lib/portal.ts) a capa e o texto, que ele move ao abrir uma tela.
  useEffect(() => {
    palco.capa = capa.current;
    palco.texto = texto.current;
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
    <section ref={secao} id="topo" className="fixed inset-0 z-0 bg-tinta transition-colors duration-700 jogo:bg-[#e8f2ff]">
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

            {/* claro: o mundo do jogo — ele olha em volta e encara a câmera */}
            <div ref={mundo} className="invisible absolute inset-0 overflow-hidden opacity-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- export estático; a imagem também alimenta o canvas */}
              <img ref={imgMundo} src="/hero/isekai/mundo.webp" alt="" className="size-full object-cover" decoding="async" />
              <video ref={mundoLoop} className={`${video} invisible opacity-0`} muted loop playsInline preload="metadata">
                <source src="/hero/isekai/mundo-loop.webm" type="video/webm" />
                <source src="/hero/isekai/mundo-loop.mp4" type="video/mp4" />
              </video>
            </div>

            {/* transição: o Enter (ida) e o mesmo clarão ao contrário (volta) */}
            <video ref={enter} className={`${video} invisible opacity-0`} muted playsInline preload="auto">
              <source src="/hero/isekai/enter.webm" type="video/webm" />
              <source src="/hero/isekai/enter.mp4" type="video/mp4" />
            </video>
            <video ref={volta} className={`${video} invisible opacity-0`} muted playsInline preload="metadata">
              <source src="/hero/isekai/enter-volta.webm" type="video/webm" />
              <source src="/hero/isekai/enter-volta.mp4" type="video/mp4" />
            </video>
            </div>
            <canvas ref={luz} className="pointer-events-none invisible absolute inset-0 size-full opacity-0" />
            <canvas ref={tela} className="invisible absolute inset-0 size-full opacity-0" />
          </div>
        </div>

        {/* leitura do texto: escurece (ou clareia, no mundo do jogo) a esquerda e a base */}
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-700 jogo:opacity-0 bg-[linear-gradient(90deg,#05070ccc_0%,#05070c80_30%,transparent_55%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-700 jogo:opacity-0 bg-[linear-gradient(0deg,#05070c_0%,#05070ccc_38%,transparent_70%)] md:bg-[linear-gradient(0deg,#05070c_0%,transparent_30%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[linear-gradient(90deg,#eef6ffe6_0%,#eef6ff99_28%,transparent_52%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[linear-gradient(0deg,#e8f2ff_0%,#e8f2ffcc_38%,transparent_70%)] md:bg-[linear-gradient(0deg,#e8f2ffd9_0%,transparent_32%)]" />
        <div aria-hidden className="grao pointer-events-none absolute inset-0" />

        {/* redes em coluna, à direita, centralizadas na altura */}
        <Redes mensagem={t.hero.conversar} className="hero-entra hero-texto absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 md:flex lg:right-10" />

        <div ref={texto} className="hero-texto relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-[8vh] md:px-14 md:pb-[9vh]">
          <p className="hero-entra mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70 transition-colors duration-700 jogo:text-[#0d1b33]/70">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
              <span className="relative size-2 rounded-full bg-emerald-400 jogo:bg-emerald-500" />
            </span>
            {t.hero.status}
            <span className="hidden opacity-40 sm:inline">/</span>
            <span className="hidden sm:inline">{t.hero.papel}</span>
          </p>
          {/* a frase acompanha a cena: no escuro brilha o "código", no mundo do jogo brilha o "produto" */}
          <h1 className="font-display text-[10.5vw] leading-[1.04] md:text-[3.9vw]">
            <span className="hero-linha block text-white transition-colors duration-700 jogo:text-[#0d1b33]/35">{t.hero.titulo[0]}</span>
            <span className="hero-linha block text-white/35 transition-colors duration-700 jogo:text-[#0a7ea3]">{t.hero.titulo[1]}</span>
          </h1>
          <p className="hero-entra mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/60 transition-colors duration-700 md:text-[17px] jogo:text-[#0d1b33]/70">{t.hero.sub}</p>
          <div className="hero-entra mt-8 flex flex-wrap items-center gap-3">
            <a href="#work" className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 text-[15px] font-medium text-black transition-colors hover:bg-[#7df3ff] jogo:bg-[#0d1b33] jogo:text-white jogo:hover:bg-[#0a7ea3]">
              {t.hero.cta}
              <span className="grid size-8 place-items-center rounded-full bg-black text-white transition-transform duration-500 ease-corte group-hover:translate-x-0.5 group-hover:rotate-[-45deg] jogo:bg-white jogo:text-[#0d1b33]">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
            <a href={linkWhatsApp(t.hero.conversar)} target="_blank" rel="noopener" className="inline-flex h-12 items-center rounded-full border border-white/20 px-5 text-[15px] text-white/85 backdrop-blur transition-colors hover:border-white/60 hover:text-white jogo:border-[#0d1b33]/25 jogo:text-[#0d1b33] jogo:hover:border-[#0d1b33]/60">
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
