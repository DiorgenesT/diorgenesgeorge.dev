"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dicionario } from "@/i18n";
import { idiomas, linkWhatsApp, type Idioma } from "@/i18n/config";
import { LOGO_CHEVRON, LOGO_CORPO, LOGO_VIEWBOX } from "@/lib/logo-path";
import BotaoTema from "./BotaoTema";

/**
 * Menu em pílula de vidro, flutuando no topo: monograma, seções com um indicador que desliza até
 * o item sob o mouse, idiomas e o convite. No celular vira uma pílula compacta (monograma + tema + convite + menu) e as seções e os idiomas
 * abrem num painel abaixo dela.
 * Leis: Jakob (padrão conhecido), Fitts (alvos ≥ 40px), Hick (4 seções), proximidade (grupos separados).
 */
export default function Cabecalho({ t, lang }: { t: Dicionario; lang: Idioma }) {
  const router = useRouter();
  const lista = useRef<HTMLUListElement>(null);
  const [ind, setInd] = useState<{ x: number; w: number; on: boolean }>({ x: 0, w: 0, on: false });
  // a tela aberta (Telas avisa com o evento "tela"; o hash cobre o link direto e o voltar do navegador)
  const [ativa, setAtiva] = useState<string | null>(null);
  // menu do celular (abaixo de md as seções não cabem na pílula)
  const [menu, setMenu] = useState(false);
  const header = useRef<HTMLElement>(null);
  const botaoMenu = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    // Esc fecha e devolve o foco ao botão; tocar fora também fecha
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      setMenu(false);
      botaoMenu.current?.focus();
    };
    const fora = (e: PointerEvent) => !header.current?.contains(e.target as Node) && setMenu(false);
    // passou para o desktop com o menu aberto
    const largura = window.matchMedia("(min-width: 768px)");
    const fechar = () => largura.matches && setMenu(false);
    window.addEventListener("keydown", tecla, true);
    document.addEventListener("pointerdown", fora);
    largura.addEventListener("change", fechar);
    return () => {
      window.removeEventListener("keydown", tecla, true);
      document.removeEventListener("pointerdown", fora);
      largura.removeEventListener("change", fechar);
    };
  }, [menu]);
  useEffect(() => {
    const doHash = () => setAtiva(window.location.hash.slice(1) || null);
    const daTela = (e: Event) => setAtiva((e as CustomEvent<string | null>).detail);
    doHash();
    window.addEventListener("tela", daTela);
    window.addEventListener("popstate", doHash);
    return () => {
      window.removeEventListener("tela", daTela);
      window.removeEventListener("popstate", doHash);
    };
  }, []);

  /** Troca o idioma sem sair de onde está: a tela aberta (#work...) vai junto, e o tema fica salvo. */
  const idiomasLista = (className: string) => (
    <ul className={`items-center ${className}`} aria-label={t.nav.idioma}>
      {idiomas.map((l) => (
        <li key={l}>
          <Link
            href={`/${l}/`}
            hrefLang={l}
            onClick={(e) => {
              setMenu(false);
              if (e.metaKey || e.ctrlKey || l === lang) return;
              e.preventDefault();
              // o hero some e reaparece inteiro com a cena pronta (o mesmo portão da primeira pintura)
              document.documentElement.dataset.carregando = "1";
              router.push(`/${l}/${window.location.hash}`, { scroll: false });
            }}
            aria-current={l === lang ? "page" : undefined}
            className={`grid h-10 min-w-9 place-items-center rounded-full px-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${l === lang ? "text-white" : "text-white/40 hover:text-white/80"}`}
          >
            {l}
          </Link>
        </li>
      ))}
    </ul>
  );

  const sobre = (el: HTMLElement) => {
    const ul = lista.current;
    if (!ul) return;
    const a = ul.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    setInd({ x: b.left - a.left, w: b.width, on: true });
  };

  return (
    <header ref={header} className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center px-3 pt-4 md:pt-5">
      <nav
        aria-label="Menu"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#0a0a0a]/80 p-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,.6)] md:bg-[#0a0a0a]/45 md:backdrop-blur-xl md:backdrop-saturate-150"
      >
        <Link
          href={`/${lang}/`}
          aria-label="Diorgenes George"
          aria-current={ativa ? undefined : "page"}
          className={`logo-menu group grid h-10 w-12 place-items-center rounded-full transition-[transform,background-color,color] duration-300 hover:scale-105 ${ativa ? "bg-white/10 text-white" : "bg-white text-black"}`}
        >
          {/* a logo DG (scripts/vetorizar-logo.py); no hover o ">" pisca como cursor */}
          <svg viewBox={LOGO_VIEWBOX} className="w-[30px]" aria-hidden>
            <path fill="currentColor" fillRule="evenodd" d={LOGO_CORPO} />
            <path className="logo-cursor" fill="currentColor" d={LOGO_CHEVRON} />
          </svg>
        </Link>

        <ul ref={lista} className="relative hidden items-center md:flex" onPointerLeave={() => setInd((s) => ({ ...s, on: false }))}>
          <span
            aria-hidden
            className="absolute inset-y-0 rounded-full bg-white/10 transition-all duration-500 ease-corte"
            style={{ transform: `translateX(${ind.x}px)`, width: ind.w, opacity: ind.on ? 1 : 0 }}
          />
          {t.nav.secoes.map(([href, rotulo]) => (
            <li key={href} className="relative">
              <a
                href={href}
                aria-current={ativa === href.slice(1) ? "page" : undefined}
                onPointerEnter={(e) => sobre(e.currentTarget)}
                onFocus={(e) => sobre(e.currentTarget)}
                className={`block rounded-full px-4 py-2.5 text-[14px] transition-colors duration-300 ${ativa === href.slice(1) ? "bg-white text-black" : "text-white/75 hover:text-white"}`}
              >
                {rotulo}
              </a>
            </li>
          ))}
        </ul>

        <span aria-hidden className="mx-1 hidden h-5 w-px bg-white/15 md:block" />

        <BotaoTema t={t} />

        {idiomasLista("hidden md:flex")}

        <a
          href={linkWhatsApp(t.nav.contato)}
          target="_blank"
          rel="noopener"
          className="ml-1 flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-white px-3.5 text-[13px] md:px-4 md:text-[14px] font-medium text-black transition-colors duration-300 hover:bg-white/85"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60 motion-reduce:animate-none" />
            <span className="relative size-2 rounded-full bg-emerald-500" />
          </span>
          {t.nav.contato}
        </a>

        {/* celular: abre o painel com as seções e os idiomas */}
        <button
          ref={botaoMenu}
          type="button"
          data-menu-movel
          aria-expanded={menu}
          aria-controls="menu-movel"
          aria-label={menu ? t.nav.fecharMenu : t.nav.menu}
          onClick={() => setMenu((m) => !m)}
          className="ml-0.5 grid size-10 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 md:hidden"
        >
          <span aria-hidden className="relative block h-3 w-[18px]">
            <span className={`absolute inset-x-0 top-0 h-[1.5px] rounded-full bg-current transition-transform duration-500 ease-corte ${menu ? "translate-y-[5.25px] rotate-45" : ""}`} />
            <span className={`absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-current transition-transform duration-500 ease-corte ${menu ? "-translate-y-[5.25px] -rotate-45" : ""}`} />
          </span>
        </button>
      </nav>

      {/* painel do celular: cai da pílula; as seções entram em sequência (CSS, .menu-movel em globals.css) */}
      <div
        id="menu-movel"
        data-aberto={menu || undefined}
        inert={!menu}
        className="menu-movel pointer-events-auto mt-2 w-full max-w-[26rem] overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a]/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,.8)] md:hidden"
      >
        <ul>
          {t.nav.secoes.map(([href, rotulo], i) => (
            <li key={href} className="menu-item" style={{ ["--i" as string]: i }}>
              <a
                href={href}
                onClick={() => setMenu(false)}
                aria-current={ativa === href.slice(1) ? "page" : undefined}
                className={`flex h-14 items-center justify-between rounded-2xl px-4 font-display text-[26px] transition-colors ${ativa === href.slice(1) ? "bg-white text-black" : "text-white/85 active:bg-white/10"}`}
              >
                {rotulo}
                <span aria-hidden className="font-mono text-[11px] tracking-widest opacity-40">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="menu-item mt-2 flex items-center justify-between border-t border-white/10 px-2 pt-2" style={{ ["--i" as string]: 4 }}>
          <span className="pl-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{t.nav.idioma}</span>
          {idiomasLista("flex")}
        </div>
      </div>
    </header>
  );
}
