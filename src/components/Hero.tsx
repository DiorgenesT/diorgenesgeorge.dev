"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Dicionario } from "@/i18n";
import { linkWhatsApp } from "@/i18n/config";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";
import { criarLuz } from "@/lib/luz";
import { criarTransicao } from "@/lib/pixels";
import { criarSuccao, type Succao } from "@/lib/succao";
import { adiantarTelas, aquecido, prontas } from "@/lib/carregar";
import { palco } from "@/lib/portal";
import { definirTema, useTema, type Tema } from "@/lib/tema";
import Mundo, { type MundoApi } from "./Mundo";
import Quarto, { type QuartoApi } from "./Quarto";
import Redes from "./Redes";


/**
 * Hero ISEKAI. Escuro: o Diorgenes no quarto à noite, recostado, vendo o mundo que programou rodar no
 * monitor (o quarto em camadas, src/components/Quarto.tsx, com parallax e a vida feita em código). Ao trocar para o tema
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
  const quarto = useRef<QuartoApi | null>(null);
  const succ = useRef<HTMLCanvasElement>(null);
  const succao = useRef<Promise<Succao | null> | null>(null);
  const mundo = useRef<HTMLDivElement>(null);
  const mundoApi = useRef<MundoApi | null>(null);
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
    gsap.set([succ.current, tela.current, luz.current], { autoAlpha: 0 });
    if (v === "claro") {
      quarto.current?.ligar(false);
      mostrarLoopDoMundo();
    } else {
      pararMundo();
      quarto.current?.ligar(true);
    }
    marcarVisual(v);
  };

  /** O mundo em camadas (src/components/Mundo.tsx): o vídeo do fundo e o parallax ligam ou param. */
  const mostrarLoopDoMundo = () => mundoApi.current?.ligar(true);
  const pararMundo = () => mundoApi.current?.ligar(false);

  /** O mundo como está na tela agora, composto num canvas (fonte dos blocos e do portal). */
  const quadroDoMundo = () => mundoApi.current?.cena() ?? null;

  const aoMundoFicarPronto = useCallback((api: MundoApi) => {
    mundoApi.current = api;
    api.ligar(visual.current === "claro");
  }, []);

  /** O quarto entrega a API dele (compositor e liga/desliga); no mundo do jogo ele fica parado. */
  const aoQuartoFicarPronto = useCallback((api: QuartoApi) => {
    quarto.current = api;
    // só em desenvolvimento: o compositor fica acessível para conferir o encaixe quadro a quadro
    if (process.env.NODE_ENV === "development") (window as unknown as { __quarto?: QuartoApi }).__quarto = api;
    api.ligar(visual.current !== "claro");
  }, []);

  /** A sucção (WebGL) é criada uma vez só, na primeira troca. null = sem WebGL. */
  const obterSuccao = () =>
    (succao.current ??= criarSuccao(succ.current!, () => quarto.current!.compor()).catch(() => null));

  /** Um retrato fixo de um canvas (o do compositor é reaproveitado a cada chamada). */
  const copiar = (fonte: HTMLCanvasElement | null) => {
    const c = document.createElement("canvas");
    c.width = fonte?.width ?? 1280;
    c.height = fonte?.height ?? 720;
    if (fonte) c.getContext("2d")!.drawImage(fonte, 0, 0);
    return c;
  };

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

  async function irParaOJogo() {
    // o mundo é montado a partir do 1º quadro do vídeo, o mesmo em que ele começa a tocar
    const [, s] = await Promise.all([mundoApi.current?.preparar(), obterSuccao()]);
    const fx = criarTransicao(tela.current!, copiar(quadroDoMundo()));
    const brilho = criarLuz(luz.current!, camera.current!);

    // 1) o monitor do jogo o puxa para dentro; no fim a câmera já mergulha na tela com o código voando
    quarto.current?.congelar(true);
    if (s) {
      s.capturar();
      s.desenhar(0);
      gsap.set(succ.current, { autoAlpha: 1 });
      // a luz começa a aparecer quando só restam fios dele (p ≈ 0,85) e termina no branco
      await Promise.all([s.animar(0, 1, 3400, true), esperar(1500).then(() => animarLuz(brilho, 0.25, 3, 2300, 1.5))]);
    } else {
      await animarLuz(brilho, 0, 3, 3000);
    }

    // 2) o branco vira blocos e o mundo compila
    fx.desenhar(0);
    gsap.set(tela.current, { autoAlpha: 1 });
    gsap.set([succ.current, luz.current], { autoAlpha: 0 });
    brilho.limpar();
    quarto.current?.ligar(false);
    quarto.current?.congelar(false);
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
    // o quarto volta a viver já (vídeo do jogo, código, chuva e parallax): a sucção de volta o mostra vivo
    quarto.current?.ligar(true);
    quarto.current?.congelar(true);
    const fx = criarTransicao(tela.current!, copiar(quadroDoMundo()));
    const brilho = criarLuz(luz.current!, camera.current!);
    const s = await obterSuccao();

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
      await Promise.all([animarLuz(brilho, 3, 0.25, 2200, 1.5), esperar(500).then(() => s.animar(1, 0, 3000, true))]);
    } else {
      await animarLuz(brilho, 3, 0, 2200);
    }
    brilho.limpar();
    gsap.set([luz.current, succ.current], { autoAlpha: 0 });
    quarto.current?.congelar(false);
  }

  // Enquanto o carregador da primeira abertura está na tela: as duas cenas decodificadas, o compositor do
  // quarto e do mundo rodados uma vez e a sucção compilada. Assim a primeira troca de tema não carrega em
  // partes nem trava no começo.
  useEffect(() => {
    let vivo = true;
    (async () => {
      await Promise.all([prontas(document.querySelector("#topo .cena-quarto"), 8000), prontas(document.querySelector("#topo .cena-mundo"), 8000)]);
      if (!vivo) return;
      quarto.current?.compor();
      mundoApi.current?.cena();
      const s = await obterSuccao();
      if (!vivo) return;
      s?.capturar();
      s?.desenhar(0);
      aquecido("succao");
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // Primeira montagem: o script do <head> já aplicou o tema salvo; só sincroniza a cena, sem animar.
  // Também entrega ao portal (src/lib/portal.ts) a capa e o texto, que ele move ao abrir uma tela.
  useEffect(() => {
    palco.capa = capa.current;
    palco.texto = texto.current;
    palco.mundo = () => quadroDoMundo();
    palco.quarto = () => quarto.current?.cena() ?? null;
    palco.pausar = (sim) => {
      if (visual.current === "claro") mundoApi.current?.ligar(!sim);
      else quarto.current?.ligar(!sim);
    };
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
      // A entrada do hero é CSS (globals.css, [data-intro]), disparada pelo script do <head> quando as imagens
      // da cena ativa decodificam: não depende deste bundle e nada é escondido de novo. Numa troca de idioma
      // (navegação sem recarregar) o mesmo portão é reaberto daqui.
      const w = window as unknown as { __abrirHero?: () => void };
      const html = document.documentElement;
      if (!html.dataset.intro && !html.dataset.carregando) {
        // o React 19 recria os atributos do <html> quando o layout troca de idioma: refaz o que o script do
        // <head> tinha feito (o tema salvo e o portão) antes desta pintura
        try {
          if (localStorage.getItem("tema") === "claro") definirTema("claro");
        } catch {}
        html.dataset.carregando = "1";
      }
      if (html.dataset.carregando && !html.dataset.carregador) w.__abrirHero?.();
      // as telas baixam depois do carregador (para não disputar a banda com o quarto e o mundo)
      if (html.dataset.carregador) window.addEventListener("carregou", adiantarTelas, { once: true });
      else adiantarTelas();

      // Portal (src/lib/portal.ts): ao abrir uma tela o texto afunda nas máscaras e se apaga; ao fechar,
      // as palavras sobem de novo, a linha de status se "decodifica" de símbolos de código e o resto entra
      // em sequência. Quem pediu menos movimento vê só a troca.
      // na ordem de leitura (a mesma do --i da entrada em CSS): status, subtítulo, botões, redes
      const entra = gsap.utils
        .toArray<HTMLElement>(".hero-entra")
        .sort((x, y) => Number(x.style.getPropertyValue("--i") || 0) - Number(y.style.getPropertyValue("--i") || 0));
      const codigos = gsap.utils.toArray<HTMLElement>(".hero-codigo");
      const originais = codigos.map((el) => el.textContent ?? "");
      const SIMBOLOS = "{}<>/;=01$#";
      let cena: gsap.core.Timeline | null = null;

      /** Saída (antes do portal abrir): o status vira código e apaga, o título sobe para dentro das máscaras
       *  palavra por palavra, e o resto sai em sequência, de cima para baixo. Uns 0,6 s. */
      palco.textoSai = () => {
        cena?.kill();
        if (menosMovimento()) {
          gsap.set(entra, { autoAlpha: 0 });
          gsap.set(linhas.words, { yPercent: -110 });
          return;
        }
        cena = gsap.timeline();
        codigos.forEach((el) => cena!.to(el, { duration: 0.35, ease: "none", scrambleText: { text: el.textContent ?? "", chars: SIMBOLOS, speed: 1, revealDelay: 0.35 } }, 0));
        cena
          .to(linhas.words, { yPercent: -110, duration: 0.5, stagger: 0.03, ease: "power3.in" }, 0.05)
          .to(entra, { autoAlpha: 0, y: -14, filter: "blur(8px)", duration: 0.42, stagger: 0.05, ease: "power2.in" }, 0.1);
      };

      /** Volta (depois do portal fechar, com uma pausa): o título sobe de baixo para cima com o desfoque se
       *  dissolvendo, o status se decodifica de símbolos e o resto entra em sequência. */
      palco.textoVolta = () => {
        cena?.kill();
        if (menosMovimento()) {
          gsap.set(entra, { autoAlpha: 1, y: 0, clearProps: "filter" });
          gsap.set(linhas.words, { yPercent: 0, clearProps: "filter" });
          return;
        }
        cena = gsap
          .timeline()
          .fromTo(
            linhas.words,
            { yPercent: 110, filter: "blur(10px)" },
            { yPercent: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.07, ease: "expo.out", clearProps: "filter" },
            0,
          )
          .fromTo(
            entra,
            { autoAlpha: 0, y: 20, filter: "blur(8px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.09, ease: "expo.out", clearProps: "filter" },
            0.25,
          );
        codigos.forEach((el, i) =>
          cena!.fromTo(el, { textContent: "" }, { duration: 1, ease: "none", scrambleText: { text: originais[i], chars: SIMBOLOS, speed: 0.6 } }, 0.3),
        );
      };

      return () => {
        cena?.kill();
        palco.textoSai = null;
        palco.textoVolta = null;
        linhas.revert();
      };
    },
    { scope: secao },
  );


  return (
    <section ref={secao} id="topo" className="fixed inset-0 z-0 bg-tinta transition-colors duration-700 jogo:bg-[#0b1d38]">
      <div className="relative h-full overflow-hidden">
        {/* palco: no celular, a metade de cima; no desktop, a tela toda */}
        <div
          className="palco absolute inset-x-0 top-0 h-[58svh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)] md:inset-0 md:h-full md:[mask-image:none]"
          aria-hidden
        >
          <div ref={capa} className="capa [--px:.72] md:[--px:.6]">
            {/* câmera: os vídeos do quarto (mergulha no monitor durante o Enter, src/lib/luz.ts) */}
            <div ref={camera} className="absolute inset-0 will-change-transform">
            {/* escuro: ele no quarto, em camadas */}
            <Quarto onPronto={aoQuartoFicarPronto} />

            {/* claro: o mundo do jogo — ele de costas, admirando a paisagem */}
            <div ref={mundo} className="cena-mundo invisible absolute inset-0 overflow-hidden bg-[#0b1d38] opacity-0">
              <Mundo onPronto={aoMundoFicarPronto} />
            </div>

            {/* transição: a sucção para dentro do monitor (src/lib/succao.ts) */}
            <canvas ref={succ} className="invisible absolute inset-0 size-full opacity-0" />
            </div>
            <canvas ref={luz} className="pointer-events-none invisible absolute inset-0 size-full opacity-0" />
            <canvas ref={tela} className="invisible absolute inset-0 size-full opacity-0" />
          </div>
        </div>

        {/* leitura do texto: escurece (ou clareia, no mundo do jogo) a esquerda e a base.
            No desktop, em cima (onde fica o monitor de código) ela escurece menos, mas o bastante para o código
            da tela não competir com o texto. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-700 jogo:opacity-0 bg-[linear-gradient(90deg,#05070cf2_0%,#05070cc7_26%,#05070c66_44%,transparent_62%)] md:[mask-image:linear-gradient(to_bottom,rgba(0,0,0,.62)_0%,rgba(0,0,0,.62)_30%,black_62%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-700 jogo:opacity-0 bg-[linear-gradient(0deg,#05070c_0%,#05070ccc_38%,transparent_70%)] md:bg-[linear-gradient(0deg,#05070c_0%,transparent_30%)]" />
        {/* mundo do jogo: um pouco mais escuro no todo e azul-noite atrás do texto (o texto é claro nos dois temas) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[#0a1a33]/20" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[linear-gradient(90deg,#071a33e6_0%,#071a33b3_26%,#071a3359_44%,transparent_62%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 jogo:opacity-100 bg-[linear-gradient(0deg,#0b1d38_0%,#0b1d38cc_38%,transparent_70%)] md:bg-[linear-gradient(0deg,#071a33cc_0%,transparent_32%)]" />
        <div aria-hidden className="grao pointer-events-none absolute inset-0" />

        {/* redes em coluna, à direita, centralizadas na altura */}
        {/* o centro fica no contêiner: o transform da coluna é do GSAP e do portal, que o sobrescrevem */}
        <div className="absolute inset-y-0 right-6 z-10 hidden items-center md:flex lg:right-10">
          <Redes estilo={{ ["--i" as string]: 4 }} mensagem={t.hero.conversar} className="hero-entra hero-texto flex flex-col gap-1 [filter:drop-shadow(0_1px_8px_rgba(0,0,0,.55))]" />
        </div>

        <div ref={texto} className="hero-texto relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-[8vh] md:px-14 md:pb-[9vh]">
          <p style={{ ["--i" as string]: 0 }} className="hero-entra mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
              <span className="relative size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="hero-codigo">{t.hero.status}</span>
            <span className="hidden opacity-40 sm:inline">/</span>
            <span className="hero-codigo hidden sm:inline">{t.hero.papel}</span>
          </p>
          {/* a frase acompanha a cena: no escuro brilha o "código", no mundo do jogo brilha o "produto" */}
          <h1 className="font-display text-[10.5vw] leading-[1.04] md:text-[3.9vw]">
            <span style={{ ["--i" as string]: 0 }} className="hero-linha block text-white transition-colors duration-700 jogo:text-white/40">{t.hero.titulo[0]}</span>
            <span style={{ ["--i" as string]: 1 }} className="hero-linha block text-white/35 transition-colors duration-700 jogo:text-[#7df3ff]">{t.hero.titulo[1]}</span>
          </h1>
          <p style={{ ["--i" as string]: 1 }} className="hero-entra mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/65 md:text-[17px] jogo:text-white/80">{t.hero.sub}</p>
          <div style={{ ["--i" as string]: 2 }} className="hero-entra mt-8 flex flex-wrap items-center gap-3">
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
          <Redes estilo={{ ["--i" as string]: 3 }} mensagem={t.hero.conversar} className="hero-entra -ml-3 mt-6 flex gap-1 md:hidden" />
        </div>
      </div>
    </section>
  );
}
