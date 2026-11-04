import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { ehIdioma, htmlLang, idiomas, SITE_URL } from "@/i18n/config";
import { dicionario } from "@/i18n";
import "../globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => idiomas.map((lang) => ({ lang }));
export const viewport: Viewport = { themeColor: "#0a0a0a" };

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
    openGraph: { title: t.meta.titulo, description: t.meta.descricao, locale: htmlLang[lang], type: "website", siteName: "Diorgenes George" },
  };
}

export default async function LayoutIdioma({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!ehIdioma(lang)) notFound();
  return (
    <html lang={htmlLang[lang]} className={`${geist.variable} ${geistMono.variable}`} data-tema="escuro" data-visual="escuro" suppressHydrationWarning>
      <head>
        {/* Aplica o tema salvo (src/lib/tema.ts) antes da primeira pintura, sem piscar. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("tema")==="claro"){var h=document.documentElement;h.dataset.tema="claro";h.dataset.visual="claro"}}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
