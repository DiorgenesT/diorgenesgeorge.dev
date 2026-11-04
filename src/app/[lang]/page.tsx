import { notFound } from "next/navigation";
import { ehIdioma } from "@/i18n/config";
import { dicionario } from "@/i18n";
import Site from "@/components/Site";

export default async function Pagina({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!ehIdioma(lang)) notFound();
  return <Site t={dicionario(lang)} lang={lang} />;
}
