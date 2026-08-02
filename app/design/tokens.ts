/**
 * Paleta do zine, um tema so. Preto e branco de alto contraste como base, com dois
 * acentos: o vermelho punk carrega texto, o amarelo fita crepe nunca carrega.
 *
 * Cada valor entrou aqui depois de medido, nao antes. O teste ao lado e a autoridade
 * sobre estes numeros; este comentario so registra por que o amarelo e diferente dos
 * outros: sobre o papel ele da 1,58:1, longe dos 4,5:1 exigidos, entao ele existe como
 * preenchimento e recebe tinta por cima, o que da 10,74:1.
 */
export const TOKENS: Record<string, string> = {
  bg: "#f2ede4",
  "bg-raised": "#faf7f1",
  fg: "#0a0a0a",
  "fg-muted": "#57504a",
  "fg-subtle": "#645c55",
  accent: "#c81d25",
  "accent-fg": "#ffffff",
  fita: "#e8b923",
};
