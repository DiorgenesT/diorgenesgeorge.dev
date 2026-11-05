// TESTE DESCARTÁVEL (05/11/2026): o hero escuro em parallax, para comparar com o hero em vídeo.
// Apagar esta rota e src/components/teste/ se o teste não for aprovado.
import type { Metadata } from "next";
import HeroParallax from "@/components/teste/HeroParallax";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function TesteParallax() {
  return <HeroParallax />;
}
