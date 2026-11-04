export const idiomas = ["en", "pt", "es"] as const;
export type Idioma = (typeof idiomas)[number];
export const idiomaPadrao: Idioma = "en";

export const ehIdioma = (v: string): v is Idioma => (idiomas as readonly string[]).includes(v);
export const htmlLang: Record<Idioma, string> = { en: "en", pt: "pt-BR", es: "es" };

/** URL pública (trocar pelo domínio próprio via NEXT_PUBLIC_SITE_URL quando aprovado). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://diorgenes-dev.dgtssk8.workers.dev").replace(/\/$/, "");

export const contato = {
  whatsapp: "5531991519864",
  email: "dgtssk8@hotmail.com",
  github: "https://github.com/DiorgenesT",
  linkedin: "https://www.linkedin.com/in/diorgenesgeorge",
  instagram: "https://www.instagram.com/diorgenestavares/",
} as const;

export const linkWhatsApp = (mensagem: string) => `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;

/** Os mundos do "Eu desenvolvo ___": cada palavra troca o visual do site. */
export const mundos = ["sistemas", "jogos", "3d", "videos", "agentes"] as const;
export type Mundo = (typeof mundos)[number];
