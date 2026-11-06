import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { ehIdioma, htmlLang, idiomas, SITE_URL } from "@/i18n/config";
import { dicionario } from "@/i18n";
import { SCRIPT_CARREGADOR } from "@/lib/carregador-script";
import { LOGO_CHEVRON, LOGO_CORPO, LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo-path";
import "../globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const dynamicParams = false;

const escapar = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** O carregador da primeira abertura (estilos em globals.css, animação em src/lib/carregador-script.ts). */
function htmlCarregador(t: { comando: string; quarto: string; mundo: string; shaders: string; rodar: string }) {
  const passo = (k: "quarto" | "mundo" | "shaders") =>
    `<li data-passo="${k}"><span class="cg-ico"></span><span class="cg-txt">${escapar(t[k])}</span><span class="cg-pontos"></span><span class="cg-n">0/0</span></li>`;
  const [, , lw, lh] = LOGO_VIEWBOX.split(" ").map(Number);
  // a logo: cada contorno se traça com o progresso (um path por contorno: o tracejado recomeça a cada um), o preenchimento, o chevron-cursor e a luz que varre
  const logo = `<svg class="cg-logo" viewBox="${LOGO_VIEWBOX}" aria-hidden="true"><defs><clipPath id="cg-recorte"><path clip-rule="evenodd" d="${LOGO_PATH}"/></clipPath><linearGradient id="cg-brilho" x1="0" x2="1"><stop offset="0" stop-color="#7df3ff" stop-opacity="0"/><stop offset=".5" stop-color="#e9feff" stop-opacity=".95"/><stop offset="1" stop-color="#7df3ff" stop-opacity="0"/></linearGradient></defs>${LOGO_PATH.split(/(?=M)/).map((d) => `<path class="cg-tracado" pathLength="1" d="${d}"/>`).join("")}<path class="cg-cheio" fill-rule="evenodd" d="${LOGO_CORPO}"/><path class="cg-chevron" d="${LOGO_CHEVRON}"/><g clip-path="url(#cg-recorte)"><rect class="cg-luz" x="${-lw * 0.4}" y="0" width="${lw * 0.3}" height="${lh}" fill="url(#cg-brilho)"/></g></svg>`;
  return `${logo}<div class="cg-caixa"><p class="cg-cmd"><span>&gt;</span> ${escapar(t.comando)}</p><ul>${passo("quarto")}${passo("mundo")}${passo("shaders")}</ul><div class="cg-progresso"><span class="cg-barra"><i></i></span><span class="cg-pct">0%</span></div><p class="cg-run">${escapar(t.rodar)}</p></div>`;
}
export const generateStaticParams = () => idiomas.map((lang) => ({ lang }));
export const viewport: Viewport = { themeColor: "#0a0a0a", colorScheme: "dark" };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!ehIdioma(lang)) return {};
  const t = dicionario(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.titulo,
    description: t.meta.descricao,
    alternates: {
      canonical: `/${lang}/`,
      languages: { ...Object.fromEntries(idiomas.map((l) => [htmlLang[l], `/${l}/`])), "x-default": "/en/" },
    },
    // gerados da logo por scripts/gerar-favicon.py
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: { url: "/apple-icon.png", sizes: "180x180" },
    },
    openGraph: { title: t.meta.titulo, description: t.meta.descricao, locale: htmlLang[lang], type: "website", siteName: "Diorgenes George" },
  };
}

export default async function LayoutIdioma({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!ehIdioma(lang)) notFound();
  const t = dicionario(lang);
  // data-tema/data-visual não são props: quem os define é o script do <head> e src/lib/tema.ts (sem eles,
  // vale o escuro). Se fossem props, o React os reaplicaria numa troca de idioma e o tema salvo se perderia.
  return (
    <html lang={htmlLang[lang]} className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Antes da primeira pintura: tema salvo, hero oculto e o carregador (src/lib/carregador-script.ts). */}
        <script
          dangerouslySetInnerHTML={{
            __html: SCRIPT_CARREGADOR,
          }}
        />
      </head>
      <body>
        {/* o carregador da primeira abertura: HTML estático, animado pelo script do <head> (src/lib/carregador-script.ts) */}
        {/* o miolo vai como HTML bruto: o script mexe nele antes da hidratação e o React não o compara */}
        <div id="carregador" aria-hidden="true" dangerouslySetInnerHTML={{ __html: htmlCarregador(t.carregador) }} />
        {children}
      </body>
    </html>
  );
}
