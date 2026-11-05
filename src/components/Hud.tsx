"use client";

import { useEffect, useState } from "react";
import type { Dicionario } from "@/i18n";

/**
 * Camada de jogo do tema claro: o aviso de conquista quando o visitante entra no jogo pela primeira vez.
 * (O painel de nível e XP foi tirado em 05/11/2026.)
 */
export default function Hud({ t }: { t: Dicionario }) {
  const [conquista, setConquista] = useState(0);

  useEffect(() => {
    const mostrar = () => setConquista((n) => n + 1);
    window.addEventListener("conquista", mostrar);
    return () => {
      window.removeEventListener("conquista", mostrar);
    };
  }, []);

  return (
    <>
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
