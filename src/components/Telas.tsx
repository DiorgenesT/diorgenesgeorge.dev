"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Dicionario } from "@/i18n";
import type { Idioma } from "@/i18n/config";
import { gsap, menosMovimento, ScrollTrigger } from "@/lib/gsap";
import { criarBlocos } from "@/lib/blocos";
import { aquecido, prontas } from "@/lib/carregar";
import { aquecerPortal, palco, quadroDoPortal, soltarPalco } from "@/lib/portal";
import { useLenis } from "./RolagemSuave";
import Contato from "./Contato";
import Jogos from "./Jogos";
import Sobre from "./Sobre";
import Trabalhos from "./Trabalhos";

/**
 * O site é um hero fixo (sem scroll) e "telas" que abrem por cima dele, como em um jogo.
 * Cada tela tem um hash (#work, #games, #about, #contact): links, o menu, o botão voltar do navegador
 * e links diretos funcionam. Abrir/fechar passa pelo portal (src/lib/portal.ts): mergulho no monitor de
 * código no quarto; no mundo do jogo, o mundo escurece e a tela aparece.
 * Leis: Jakob (o voltar do navegador funciona), feedback (a transição mostra de onde a tela veio),
 * Fitts (botão voltar grande), controle do usuário (Esc fecha).
 */
const TELAS = ["work", "games", "about", "contact"] as const;
type Tela = (typeof TELAS)[number];

const daHash = (): Tela | null => {
  const h = window.location.hash.slice(1);
  return (TELAS as readonly string[]).includes(h) ? (h as Tela) : null;
};

const visualAtual = () => (document.documentElement.dataset.visual === "claro" ? "claro" : "escuro");

function EmBreve({ t }: { t: Dicionario }) {
  return (
    <section className="grid min-h-svh place-items-center px-6 text-center text-white">
      <div className="max-w-md">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#7df3ff]">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h2 className="mt-8 font-display text-[9vw] leading-[1.05] md:text-[3vw]">{t.telas.emBreve}</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-white/60">{t.telas.emBreveDesc}</p>
      </div>
    </section>
  );
}

export default function Telas({ t, lang }: { t: Dicionario; lang: Idioma }) {
  const lenis = useLenis();
  const tela = useRef<HTMLDivElement>(null);
  const moldura = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const vidro = useRef<HTMLDivElement>(null);
  const compila = useRef<HTMLCanvasElement>(null);
  const blocosCanvas = useRef<HTMLCanvasElement>(null);
  const rotuloTroca = useRef<HTMLParagraphElement>(null);
  const trocando = useRef(false);
  const nevoa = useRef<HTMLCanvasElement>(null);
  /** Quanto a tela estava rolada ao fechar: a volta mostra esse mesmo trecho, sem saltar para o topo. */
  const deslocamento = useRef(0);
  const inicial = useRef(false);
  const [aberta, setAberta] = useState<Tela | null>(null);
  // o que fica montado: a tela aberta, ou a que está fechando (até o portal terminar)
  const [montada, setMontada] = useState<Tela | null>(null);
  const progresso = useRef({ p: 0 });
  const visual = useRef<"escuro" | "claro">("escuro");
  const animacao = useRef<gsap.core.Tween | null>(null);
  const empurrou = useRef(false);

  /** Quanto dura a saída do texto do hero (Hero.tsx, palco.textoSai). */
  const SAIDA_S = 0.6;
  // o texto do hero sai antes de o portal abrir; volta só depois de ele fechar por completo (com uma pausa)
  const textoFora = useRef(false);
  const saiuEm = useRef(0);
  const textoDoHero = useCallback((alvo: 0 | 1) => {
    if (alvo === 1 && !textoFora.current) {
      textoFora.current = true;
      saiuEm.current = performance.now();
      palco.textoSai?.();
    } else if (alvo === 0 && textoFora.current) {
      textoFora.current = false;
      gsap.delayedCall(menosMovimento() ? 0 : 0.25, () => palco.textoVolta?.());
    }
  }, []);

  const desenhar = useCallback(() => {
    if (tela.current && moldura.current)
      quadroDoPortal(
        progresso.current.p,
        { moldura: moldura.current, tela: tela.current, conteudo: conteudoRef.current, vidro: vidro.current, compila: compila.current, nevoa: nevoa.current, deslocamento: deslocamento.current },
        visual.current,
      );
  }, []);

  // só em desenvolvimento: desenha o portal num instante p (para prints quadro a quadro)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const w = window as unknown as { __portal?: (p: number) => void };
    w.__portal = (p) => {
      animacao.current?.kill();
      progresso.current.p = p;
      desenhar();
    };
    return () => {
      delete w.__portal;
    };
  }, [desenhar]);

  /** Leva o portal até `alvo` (0 ou 1). */
  const animar = useCallback(
    (alvo: 0 | 1, depois?: () => void) => {
      animacao.current?.kill();
      if (menosMovimento()) {
        progresso.current.p = alvo;
        desenhar();
        if (alvo === 1) textoDoHero(1);
        depois?.();
        return;
      }
      // na ida o texto do hero sai primeiro (a camada do portal cobriria a saída): o portal começa quando a
      // saída termina, contando o tempo que já passou esperando as imagens
      if (alvo === 1) textoDoHero(1);
      const espera = alvo === 1 && progresso.current.p === 0 ? Math.max(0, SAIDA_S - (performance.now() - saiuEm.current) / 1000) : 0;
      animacao.current = gsap.to(progresso.current, {
        p: alvo,
        delay: espera,
        // no mundo do jogo são dois tempos (escurece, depois a transição); a entrada no monitor é um movimento só
        duration: visual.current === "claro" ? (alvo ? 1.7 : 1.3) : alvo ? 2.6 : 2.1,
        ease: "none",
        onUpdate: desenhar,
        onComplete: depois,
      });
    },
    [desenhar, textoDoHero],
  );

  // hash -> tela (links, menu, voltar do navegador, link direto). Antes da pintura: com #work na URL (link
  // direto ou troca de idioma) a aba já nasce montada por cima do hero, e o quarto não chega a aparecer.
  useLayoutEffect(() => {
    const sincronizar = () => setAberta(daHash());
    const h = daHash();
    inicial.current = h !== null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a URL é estado externo e a aba precisa existir antes da 1ª pintura
    if (h) setMontada(h);
    sincronizar();
    window.addEventListener("popstate", sincronizar);
    window.addEventListener("hashchange", sincronizar);

    // links internos (#work...) abrem a tela sem pular a página
    const clique = (e: MouseEvent) => {
      // o logo (link para esta mesma página) fecha a tela aberta
      const inicio = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (inicio && daHash() && inicio.pathname === window.location.pathname && !inicio.hash && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        history.pushState(null, "", window.location.pathname);
        empurrou.current = false;
        setAberta(null);
        return;
      }
      const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      const id = a?.getAttribute("href")?.slice(1);
      if (!a || !id || !(TELAS as readonly string[]).includes(id) || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      if (window.location.hash !== `#${id}`) {
        history.pushState(null, "", `#${id}`);
        empurrou.current = true;
      }
      setAberta(id as Tela);
    };
    document.addEventListener("click", clique);
    return () => {
      window.removeEventListener("popstate", sincronizar);
      window.removeEventListener("hashchange", sincronizar);
      document.removeEventListener("click", clique);
    };
  }, []);

  const fechar = useCallback(() => {
    if (empurrou.current) {
      empurrou.current = false;
      history.back(); // o popstate fecha
    } else {
      history.pushState(null, "", window.location.pathname);
      setAberta(null);
    }
  }, []);

  // Esc fecha
  useEffect(() => {
    if (!aberta) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberta, fechar]);


  // aquece os shaders do portal enquanto o carregador da primeira abertura está na tela
  useEffect(() => {
    try {
      aquecerPortal(compila.current, nevoa.current);
    } catch {}
    aquecido("compila");
    aquecido("nevoa");
  }, []);

  // avisa o menu qual tela está aberta (o pushState não dispara hashchange)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("tela", { detail: aberta }));
  }, [aberta]);

  /** Fecha a aba: volta ao topo e o portal se fecha de volta no monitor (ou no mundo). */
  const fecharPortal = () => {
    deslocamento.current = window.scrollY;
    lenis?.stop();
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    visual.current = visualAtual();
    palco.pausar?.(false);
    animar(0, () => {
      deslocamento.current = 0;
      setMontada(null);
      soltarPalco();
      textoDoHero(0);
      lenis?.start();
    });
  };

  // a aba pedida agora (cliques durante a troca: no fim vale a última)
  const pedida = useRef<Tela | null>(null);
  const blocos = useRef<ReturnType<typeof criarBlocos> | null>(null);
  const trocar = async () => {
    if (trocando.current || !blocosCanvas.current) return;
    trocando.current = true;
    lenis?.stop();
    const b = (blocos.current ??= criarBlocos(blocosCanvas.current));
    const destino = pedida.current;
    const rotulo = rotuloTroca.current;
    if (rotulo) {
      rotulo.textContent = `> cd ~/${destino}`;
      gsap.fromTo(rotulo, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, delay: 0.3, ease: "power2.out" });
    }
    if (menosMovimento()) {
      setMontada(destino);
    } else {
      await b.cobrir();
      setMontada(destino);
    }
    // a aba nova já no topo e com as imagens prontas antes de os blocos saírem
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    await prontas(tela.current, 2000);
    ScrollTrigger.refresh();
    if (rotulo) gsap.to(rotulo, { autoAlpha: 0, duration: 0.25, ease: "power1.in" });
    if (!menosMovimento()) await b.revelar();
    trocando.current = false;
    lenis?.start();
    // pediram outra aba (ou fecharam) durante a troca
    if (pedida.current !== destino) {
      if (pedida.current) trocar();
      else fecharPortal();
    }
  };

  useEffect(() => {
    pedida.current = aberta;
    if (aberta) {
      // de uma aba aberta para outra: os blocos de build cobrem, a nova é montada por baixo e eles se desfazem
      if (montada && montada !== aberta && progresso.current.p >= 1) {
        trocar();
        return;
      }
      if (trocando.current) return;
      setMontada(aberta);
      return;
    }
    if (!montada || trocando.current) return; // durante a troca, quem fecha é o fim dela
    fecharPortal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta]);

  // tela montada: abre o portal (ou já aparece aberta, se a página carregou com o hash). Antes da pintura,
  // para o link direto já pintar a aba no primeiro quadro.
  useLayoutEffect(() => {
    if (!montada || !aberta) return;
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    visual.current = visualAtual();
    if (inicial.current) {
      inicial.current = false;
      progresso.current.p = 1;
      desenhar();
      textoDoHero(1);
      palco.pausar?.(true);
      // link direto: o fundo da aba já cobre o hero; o conteúdo aparece inteiro quando as imagens ficam prontas
      const c = conteudoRef.current;
      if (c) {
        c.style.opacity = "0";
        prontas(tela.current, 2500).then(() => gsap.to(c, { opacity: 1, duration: 0.5, ease: "power2.out", clearProps: "opacity" }));
      }
    } else if (progresso.current.p < 1) {
      lenis?.stop();
      // o texto do hero já sai (resposta imediata ao clique); o portal só abre com as imagens da tela
      // prontas, então a cena aparece inteira, nunca uma camada depois da outra
      textoDoHero(1);
      let cancelado = false;
      prontas(tela.current, 2500).then(() => {
        if (cancelado) return;
        ScrollTrigger.refresh();
        animar(1, () => {
          palco.pausar?.(true);
          lenis?.start();
          ScrollTrigger.refresh();
        });
      });
      return () => {
        cancelado = true;
      };
    }
    ScrollTrigger.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montada, aberta]);

  let conteudo: ReactNode = null;
  if (montada === "work") conteudo = <Trabalhos t={t} lang={lang} />;
  else if (montada === "games") conteudo = <Jogos t={t} lang={lang} />;
  else if (montada === "about") conteudo = <Sobre t={t} />;
  else if (montada === "contact") conteudo = <Contato t={t} />;
  else if (montada) conteudo = <EmBreve t={t} />;

  return (
    <>
    {/* compilação do quarto (src/lib/compila.ts): por cima da tela, que já está no lugar */}
    {/* troca entre abas: os blocos de build e o caminho da aba nova (src/lib/blocos.ts) */}
    <canvas ref={blocosCanvas} aria-hidden className="pointer-events-none fixed inset-0 z-[45] size-full" style={{ visibility: "hidden" }} />
    <p
      ref={rotuloTroca}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-1/2 z-[46] -translate-y-1/2 text-center font-mono text-[13px] tracking-[0.12em] text-[#7df3ff] opacity-0"
    />
    <canvas ref={compila} aria-hidden className="pointer-events-none fixed inset-0 z-[31] size-full" style={{ visibility: "hidden" }} hidden={!montada} />
    {/* transição do mundo do jogo (src/lib/nevoa.ts): por cima da tela, que já está no lugar */}
    <canvas ref={nevoa} aria-hidden className="pointer-events-none fixed inset-0 z-[32] size-full" style={{ visibility: "hidden" }} hidden={!montada} />
    <div ref={moldura} className="relative z-30 overflow-x-clip" hidden={!montada}>
      <div ref={tela} className="relative min-h-svh bg-[#05070c]" style={{ visibility: "hidden" }}>
        <div ref={conteudoRef}>{conteudo}</div>
        {/* vidro: camada de brilho sobre a tela (hoje sem uso nas transições; src/lib/portal.ts) */}
        <div
          ref={vidro}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-50 opacity-0"
          style={{
            background:
              "linear-gradient(105deg, transparent calc(var(--reflexo, -40%) - 14%), rgba(255,255,255,var(--reflexo-a, 0)) var(--reflexo, -40%), transparent calc(var(--reflexo, -40%) + 14%))," +
              "repeating-linear-gradient(0deg, rgba(0,0,0,var(--linhas, 0)) 0 1px, transparent 1px 3px)," +
              "radial-gradient(ellipse at center, rgba(220,252,255,var(--brilho, 0)), rgba(125,243,255,calc(var(--brilho, 0) * 0.6)))",
          }}
        />
        <button
          type="button"
          onClick={fechar}
          aria-label={t.telas.fechar}
          className="fixed bottom-5 left-5 z-40 flex h-12 items-center gap-2 rounded-full border border-white/15 bg-[#0a0a0a]/85 pl-3 pr-5 text-[14px] text-white/85 md:bg-[#0a0a0a]/60 md:backdrop-blur-xl transition-colors hover:border-white/50 hover:text-white md:bottom-8 md:left-10"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          {t.telas.voltar}
        </button>
      </div>
    </div>
    </>
  );
}
