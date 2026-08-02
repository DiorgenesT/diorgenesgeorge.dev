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

  it("should meet 3:1 contrast when rendering the live-status signal on bg", () => {
    expect(contrastRatio(TOKENS.signal!, TOKENS.bg!)).toBeGreaterThanOrEqual(3);
  });
});
