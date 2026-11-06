"use client";

import { useEffect, useRef } from "react";
import type { Dicionario } from "@/i18n";
import { gsap, menosMovimento, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Sobre: o mundo do jogo em camadas (public/sobre, recortadas por scripts/camadas-parallax.py), com
 * profundidade de verdade. Cada camada tem uma profundidade d: com o mouse ela se desloca d vezes o
 * máximo (a de perto anda mais), e com a rolagem a câmera avança para dentro da cena (a de perto sobe e
 * cresce mais). A névoa entre as camadas é CSS. Embaixo, o texto, os fatos e os materiais.
 * Leis: estético-usabilidade, Von Restorff (a frase em destaque), agrupamento (materiais por área).
 */

type Camada = { id: string; src: string; d: number; caixa: string };

// posições em % do quadro 16:9 (.capa); d = profundidade (0 = infinito, 1 = colado na câmera)
const CAMADAS: Camada[] = [
  { id: "fundo", src: "/sobre/1-fundo.webp", d: 0.12, caixa: "left-[-5%] top-[-5%] w-[110%]" },
  // a base das ruínas e da estátua some num degradê e afunda na névoa do vale (senão parecem flutuar)
  { id: "ruinas", src: "/sobre/2-ruinas.webp", d: 0.3, caixa: "left-[-2%] top-[46%] w-[62%] [mask-image:linear-gradient(to_bottom,#000_55%,transparent_96%)]" },
  { id: "estatua", src: "/sobre/3-estatua.webp", d: 0.48, caixa: "left-[52%] top-[4%] w-[54%] [mask-image:linear-gradient(to_bottom,#000_68%,transparent_97%)]" },
  { id: "ele", src: "/sobre/4-ele.webp", d: 0.72, caixa: "left-[47%] top-[44%] w-[25%]" },
  { id: "frente", src: "/sobre/5-frente.webp", d: 1.1, caixa: "left-[-4%] bottom-[-9%] w-[108%]" },
];

/** Rolagem: quanto cada camada sobe (yPercent da própria caixa) e cresce até o fim do palco. */
const ROLAGEM: Record<string, { y: number; s: number }> = {
  fundo: { y: -3, s: 1.04 },
  ruinas: { y: -14, s: 1.05 },
  estatua: { y: -8, s: 1.07 },
  ele: { y: -14, s: 1.12 },
};

export default function Sobre({ t }: { t: Dicionario }) {
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);

  // mouse: cada camada segue o ponteiro na proporção da sua profundidade, com inércia
  useEffect(() => {
    const el = palco.current;
    if (!el || menosMovimento()) return;
    const camadas = [...el.querySelectorAll<HTMLElement>("[data-d]")].map((c) => ({ c, d: Number(c.dataset.d) }));
    const alvo = { x: 0, y: 0 };
    const atual = { x: 0, y: 0 };
    let raf = 0;
    let visivel = false;
    const mover = (e: PointerEvent) => {
      alvo.x = e.clientX / window.innerWidth - 0.5;
      alvo.y = e.clientY / window.innerHeight - 0.5;
    };
    const quadro = () => {
      atual.x += (alvo.x - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      for (const { c, d } of camadas) c.style.transform = `translate3d(${(-atual.x * d * 96).toFixed(2)}px, ${(-atual.y * d * 44).toFixed(2)}px, 0)`;
      if (visivel) raf = requestAnimationFrame(quadro);
    };
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visivel) raf = requestAnimationFrame(quadro);
    });
    io.observe(el);
    window.addEventListener("pointermove", mover);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
    };
  }, []);

  useGSAP(
    () => {
      const split = SplitText.create(".sob-titulo", { type: "words", mask: "words", wordsClass: "sp-palavra" });
      gsap.from(split.words, { yPercent: 110, stagger: 0.06, duration: 1.2, ease: "expo.out", delay: 0.2 });
      gsap.from(".sob-entra", { autoAlpha: 0, y: 18, stagger: 0.1, duration: 1, ease: "expo.out", delay: 0.45 });
      // todas as camadas juntas (já estão decodificadas quando o portal abre): só um leve recuo de câmera
      gsap.from(".sob-camada", { scale: 1.06, duration: 2.2, ease: "expo.out" });

      if (!menosMovimento()) {
        // a câmera avança para dentro da cena enquanto o palco está preso
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".sob-trilho", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } });
        gsap.utils.toArray<HTMLElement>(".sob-camada").forEach((c) => {
          const r = ROLAGEM[c.dataset.id ?? ""];
          if (r) tl.to(c, { yPercent: r.y, scale: r.s, ease: "none" }, 0);
        });
        // a grama é uma cortina: sobe passando na frente de tudo e traz o preto atrás dela, que cobre o palco
        // inteiro e vira o fundo dos textos lá embaixo
        const altura = () => palco.current?.clientHeight ?? window.innerHeight;
        tl.to('[data-id="frente"]', { y: () => -altura() * 1.15, scale: 1.06, ease: "power1.inOut", duration: 0.92 }, 0.06)
          .to(".sob-texto", { yPercent: -18, autoAlpha: 0, ease: "power1.in", duration: 0.4 }, 0.3)
          .to(".sob-rolar", { autoAlpha: 0, ease: "none", duration: 0.15 }, 0)
          .set({}, {}, 1);
      }

      gsap.utils.toArray<HTMLElement>(".sob-bloco").forEach((b) =>
        gsap.from(b, { autoAlpha: 0, y: 28, duration: 1, ease: "expo.out", scrollTrigger: { trigger: b, start: "top 85%" } }),
      );
      return () => split.revert();
    },
    { scope: secao },
  );

  return (
    <section ref={secao} className="relative bg-[#05070c] text-white" aria-labelledby="sob-titulo">
      {/* palco preso enquanto se rola o trilho: a cena em camadas */}
      <div className="sob-trilho relative h-[210svh]">
        <div ref={palco} className="palco sticky top-0 h-svh overflow-hidden" aria-hidden>
          <div className="capa [--px:.62] md:[--px:.5]">
            {CAMADAS.map((c, i) => (
              <div key={c.id} data-d={c.d} className="absolute inset-0 will-change-transform">
                <div data-id={c.id} className={`sob-camada absolute ${c.caixa} origin-bottom will-change-transform`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- export estático, camadas já otimizadas */}
                  <img src={c.src} alt="" draggable={false} className="block w-full select-none" decoding="async" />
                  {/* a grama traz o preto atrás dela: degradê na base da grama e um bloco sólido abaixo */}
                  {c.id === "frente" && (
                    <>
                      <div className="absolute inset-x-0 top-[45%] h-[56%] bg-gradient-to-b from-transparent via-[#05070c]/80 to-[#05070c]" />
                      <div className="absolute inset-x-0 top-[100%] h-[500%] bg-[#05070c]" />
                    </>
                  )}
                </div>
                {/* névoa: entre as ruínas e a estátua, e entre a estátua e ele */}
                {/* névoa: um banco denso na base das ruínas e outro na base da estátua, onde as imagens terminam */}
                {i === 1 && <div className="sob-nevoa sob-nevoa-densa pointer-events-none absolute inset-x-[-10%] top-[56%] h-[34%]" />}
                {i === 2 && <div className="sob-nevoa sob-nevoa-densa pointer-events-none absolute inset-x-[-10%] top-[60%] h-[32%] opacity-90" />}
              </div>
            ))}
          </div>
          {/* leitura do texto à esquerda e na base, e o escurecimento do fim do trilho */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#05070ce6_0%,#05070c99_30%,transparent_58%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#05070c_0%,transparent_32%)]" />
          <div aria-hidden className="grao pointer-events-none absolute inset-0" />
        </div>

        {/* o texto do palco fica fora do aria-hidden */}
        <div className="sob-texto pointer-events-none absolute inset-x-0 top-0 flex h-svh items-end">
          <div className="pointer-events-auto mx-auto w-full max-w-[1600px] px-5 pb-[12vh] md:px-14">
            <p className="sob-entra mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">{t.sobre.rotulo}</p>
            <h2 id="sob-titulo" className="sob-titulo font-display text-[12vw] leading-[1.02] md:text-[5vw]">
              {t.sobre.titulo}
            </h2>
            <p className="sob-entra mt-6 max-w-[30rem] text-[17px] leading-relaxed text-white/75">{t.sobre.texto[0]}</p>
          </div>
        </div>
        <p className="sob-rolar pointer-events-none absolute bottom-6 right-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45 md:right-14" aria-hidden>
          {t.sobre.rolar} ↓
        </p>
      </div>

      {/* o texto, os fatos e os materiais */}
      {/* sobe por cima do fim do trilho, já sobre o preto que a grama trouxe */}
      <div className="relative z-10 mx-auto -mt-[48svh] max-w-[1600px] px-5 pb-32 md:px-14 md:pb-44">
        <div className="grid gap-14 md:grid-cols-12">
          <blockquote className="sob-bloco md:col-span-6">
            <p className="font-display text-[8.5vw] leading-[1.08] text-white md:text-[3.2vw]">
              <span className="text-[#7df3ff]">“</span>
              {t.sobre.frase}
              <span className="text-[#7df3ff]">”</span>
            </p>
          </blockquote>
          <div className="sob-bloco md:col-span-5 md:col-start-8">
            {t.sobre.texto.slice(1).map((p) => (
              <p key={p} className="mb-5 text-[17px] leading-[1.7] text-white/70">
                {p}
              </p>
            ))}
            <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {t.sobre.fatos.map(([rotulo, valor]) => (
                <div key={rotulo} className="bg-[#080b12] px-4 py-3">
                  <dt className="text-[12px] text-white/40">{rotulo}</dt>
                  <dd className="mt-1 text-[14px] text-white/85">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-28 md:mt-40">
          <h3 className="sob-bloco font-display text-[8vw] leading-[1.05] md:text-[2.6vw]">{t.sobre.materiais}</h3>
          <p className="sob-bloco mt-4 max-w-[36rem] text-[16px] leading-relaxed text-white/55">{t.sobre.materiaisSub}</p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {t.sobre.grupos.map(([grupo, itens]) => (
              <div key={grupo} className="sob-bloco bg-[#080b12] p-6">
                <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">{grupo}</h4>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {itens.map((i) => (
                    <li key={i} className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/80">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
