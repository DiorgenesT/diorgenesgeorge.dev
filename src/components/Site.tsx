"use client";

import type { Dicionario } from "@/i18n";
import type { Idioma } from "@/i18n/config";
import RolagemSuave from "./RolagemSuave";
import Cabecalho from "./Cabecalho";
import Hero from "./Hero";
import Hud from "./Hud";
import Telas from "./Telas";

export default function Site({ t, lang }: { t: Dicionario; lang: Idioma }) {
  return (
    <RolagemSuave>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        {t.nav.pular}
      </a>
      <Cabecalho t={t} lang={lang} />
      <Hud t={t} />
      <main id="conteudo">
        <Hero t={t} />
        {/* hero fixo; Trabalhos, Jogos, Sobre e Contato abrem como telas por cima (portal) */}
        <Telas t={t} lang={lang} />
      </main>
    </RolagemSuave>
  );
}
