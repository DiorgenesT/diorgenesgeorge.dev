import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { DARK_TOKENS, LIGHT_TOKENS } from "./tokens";

const THEMES = [
  ["escuro", DARK_TOKENS],
  ["claro", LIGHT_TOKENS],
] as const;

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

describe.each(THEMES)("tema %s", (_name, tokens) => {
  it.each(TEXT_PAIRS)(
    "should meet 4.5:1 contrast when rendering %s on %s",
    (fg, bg) => {
      const fgValue = tokens[fg];
      const bgValue = tokens[bg];
      expect(fgValue, `token ausente: ${fg}`).toBeDefined();
      expect(bgValue, `token ausente: ${bg}`).toBeDefined();
      expect(contrastRatio(fgValue!, bgValue!)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("should meet 3:1 contrast when rendering the live-status signal on bg", () => {
    expect(contrastRatio(tokens.signal!, tokens.bg!)).toBeGreaterThanOrEqual(3);
  });

  it("should define exactly the same token names as the other theme", () => {
    expect(Object.keys(tokens).sort()).toEqual(Object.keys(DARK_TOKENS).sort());
  });
});
