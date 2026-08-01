export const SITE_URL = "https://diorgenesgeorge.dev";

/**
 * As variações de nome existem para desambiguação de entidade, não para repetição no
 * texto: entram no alternateName do JSON-LD e são citadas uma única vez, naturalmente,
 * em /sobre e /cv. Buscador e IA passam a tratar as buscas como a mesma pessoa.
 */
export const AUTHOR = {
  name: "Diorgenes George",
  legalName: "Diorgenes George Tavares Silva",
  alternateNames: ["Diorgenes Tavares", "Diorgenes George Tavares Silva", "DG"],
  givenName: "Diorgenes",
  familyName: "Tavares Silva",
  jobTitle: "Analista Sênior · Desenvolvedor de Software",
  city: "Betim",
  region: "MG",
  country: "BR",
  github: "https://github.com/DiorgenesT",
  linkedin: "https://www.linkedin.com/in/diorgenesgeorge",
  instagram: "https://www.instagram.com/diorgenestavares/",
  whatsapp: "5531991519864",
} as const;

/** wa.me com mensagem pronta: quem chega já abre a conversa com contexto. */
export function whatsappHref(greeting: string): string {
  return `https://wa.me/${AUTHOR.whatsapp}?text=${encodeURIComponent(greeting)}`;
}

/** sameAs do JSON-LD: perfis que confirmam a mesma entidade para buscador e IA. */
export const SAME_AS: readonly string[] = [
  AUTHOR.linkedin,
  AUTHOR.github,
  AUTHOR.instagram,
];
