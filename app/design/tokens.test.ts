import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { TOKENS } from "./tokens";

/** Pares que carregam texto: exigem 4.5:1 (WCAG 2.1 AA, texto normal). */
const TEXT_PAIRS = [
  ["fg", "bg"],
  ["fg-muted", "bg"],
  ["fg-subtle", "bg"],
  ["fg", "bg-raised"],
  ["fg-muted", "bg-raised"],
  ["accent", "bg"],
  ["accent-fg", "accent"],
  // A fita e preenchimento, nunca cor de texto. O que este par garante e o inverso:
  // que o texto posto **sobre** a fita continue legivel, e ele e sempre a tinta.
  ["fg", "fita"],
] as const;

describe("TOKENS", () => {
  it.each(TEXT_PAIRS)(
    "should meet 4.5:1 contrast when rendering %s on %s",
    (fg, bg) => {
      const fgValue = TOKENS[fg];
      const bgValue = TOKENS[bg];
      expect(fgValue, `token ausente: ${fg}`).toBeDefined();
      expect(bgValue, `token ausente: ${bg}`).toBeDefined();
      expect(contrastRatio(fgValue!, bgValue!)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("should keep the paper lighter than the ink, because the zine is printed, not screened", () => {
    // contrastRatio e simetrico, entao ele sozinho nao distingue tinta sobre papel de
    // papel sobre tinta. Medir cada um contra o branco resolve: quanto mais claro o
    // tom, menor o contraste dele com o branco.
    const papelContraBranco = contrastRatio(TOKENS.bg!, "#ffffff");
    const tintaContraBranco = contrastRatio(TOKENS.fg!, "#ffffff");

    expect(papelContraBranco).toBeLessThan(tintaContraBranco);
  });
});
