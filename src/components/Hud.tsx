"use client";

import { useEffect, useRef, useState } from "react";
import type { Dicionario } from "@/i18n";
import { ScrollTrigger } from "@/lib/gsap";

const NIVEIS = 5;

/**
 * Camada de jogo do tema claro: HUD com nível e barra de XP que enche conforme o visitante explora
 * o site, e o aviso de conquista quando ele entra no jogo pela primeira vez. Só aparece no mundo do
 * jogo (data-visual="claro"), então no tema escuro o site continua sóbrio.
 */
export default function Hud({ t }: { t: Dicionario }) {
  const barra = useRef<HTMLSpanElement>(null);
  const [nivel, setNivel] = useState(1);
  const [conquista, setConquista] = useState(0);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => {
        barra.current?.style.setProperty("--xp", String(s.progress));
        setNivel(Math.min(NIVEIS, 1 + Math.floor(s.progress * NIVEIS)));
      },
    });
    const mostrar = () => setConquista((n) => n + 1);
    window.addEventListener("conquista", mostrar);
    return () => {
      st.kill();
      window.removeEventListener("conquista", mostrar);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed left-5 top-5 z-40 hidden -translate-y-2 items-center gap-3 rounded-2xl border border-[#0d1b33]/10 bg-white/70 p-2 pr-4 opacity-0 shadow-[0_10px_30px_-14px_#0d1b3366] backdrop-blur-xl transition duration-700 ease-corte md:flex jogo:translate-y-0 jogo:opacity-100 lg:left-10"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-[#0d1b33] font-mono text-[10px] leading-none text-[#7df3ff]">
          <span>
            {t.hud.nivel}
            <span className="block text-center text-[15px] text-white">{nivel}</span>
          </span>
        </span>
        <span className="flex w-36 flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0d1b33]/70">{t.hud.classe}</span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#0a7ea3]">{t.hud.xp}</span>
            <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#0d1b33]/10">
              <span
                ref={barra}
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[linear-gradient(90deg,#0a7ea3,#4ee6ff)] [transform:scaleX(max(var(--xp,0),.04))]"
              />
            </span>
          </span>
        </span>
      </div>

      {/* conquista: aparece uma vez por visita, quando o visitante entra no jogo */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center md:inset-x-auto md:bottom-8 md:right-24">
        {conquista > 0 && (
          <div key={conquista} className="conquista flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1b33]/90 p-2.5 pr-5 text-white shadow-[0_18px_50px_-18px_#0d1b33] backdrop-blur-xl">
            <span className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,#ffd76a,#ff9f3d)] text-[#3a2200]">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ffd76a]">{t.conquista.rotulo}</span>
              <span className="text-[15px] font-medium">{t.conquista.nome}</span>
              <span className="text-[13px] text-white/65">{t.conquista.desc}</span>
            </span>
          </div>
        )}
      </div>
    </>
  );
}
