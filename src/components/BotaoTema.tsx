"use client";

import type { Dicionario } from "@/i18n";
import { definirTema, useTema } from "@/lib/tema";

const Codigo = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />
  </svg>
);

const Controle = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 8h10a5 5 0 0 1 4.9 6l-.6 3a2.5 2.5 0 0 1-4.3 1.2L15 16H9l-2 2.2A2.5 2.5 0 0 1 2.7 17l-.6-3A5 5 0 0 1 7 8Z" />
    <path d="M7.5 11v3M6 12.5h3" />
    <circle cx="15.5" cy="11.5" r=".6" fill="currentColor" />
    <circle cx="17.5" cy="13.5" r=".6" fill="currentColor" />
  </svg>
);

/**
 * Seletor de tema: escuro = o dev no código; claro = ele dentro do jogo. Trocar dispara a cena do hero.
 * No desktop é uma chave com os dois ícones; no celular, um botão redondo com o ícone do destino.
 * Leis: affordance (chave = dois estados), Fitts (alvo de 40px), feedback imediato (o botão muda no clique).
 */
export default function BotaoTema({ t }: { t: Dicionario }) {
  const tema = useTema();
  const claro = tema === "claro";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={claro}
      aria-label={claro ? t.tema.sair : t.tema.entrar}
      title={claro ? t.tema.sair : t.tema.entrar}
      onClick={() => definirTema(claro ? "escuro" : "claro")}
      className="group relative grid h-10 w-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white md:flex md:w-[76px] md:items-center md:justify-between md:bg-white/[.06] md:px-1"
    >
      {/* celular: só o ícone do destino */}
      <span className="md:hidden">{claro ? <Codigo /> : <Controle />}</span>

      {/* desktop: chave com o botão deslizante */}
      <span
        aria-hidden
        className={`absolute top-1 hidden size-8 rounded-full transition-all duration-500 ease-corte md:block ${claro ? "left-[40px] bg-[#7df3ff] shadow-[0_0_18px_#7df3ff99]" : "left-1 bg-white"}`}
      />
      <span className={`relative hidden size-8 place-items-center transition-colors duration-500 md:grid ${claro ? "text-white/60" : "text-black"}`}>
        <Codigo />
      </span>
      <span className={`relative hidden size-8 place-items-center transition-colors duration-500 md:grid ${claro ? "text-black" : "text-white/60"}`}>
        <Controle />
      </span>
    </button>
  );
}
