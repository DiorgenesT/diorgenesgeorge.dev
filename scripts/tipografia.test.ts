import { globSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A regra da spec: a Special Elite (`font-mono`) nunca desce de 13px, porque em 11,5px
 * ela desmonta e leva junto o alvo de acessibilidade. Uma regra que depende de alguem
 * lembrar nao e uma regra, entao ela e varrida no codigo-fonte.
 *
 * `text-xs` do Tailwind vale 12px e `text-sm` vale 14px; nao ha degrau de 13px por
 * padrao, e por isso `text-meta` existe.
 */
const PEQUENO_DEMAIS =
  /\btext-(xs|\[(?:[0-9]|1[0-2])(?:\.\d+)?px\]|\[0\.[0-7]\d*rem\])/;

function arquivosDeUi(): string[] {
  return globSync("app/**/*.tsx").filter(
    (caminho) => !caminho.endsWith(".test.tsx"),
  );
}

describe("piso de 13px da datilografada", () => {
  it("should never put the typewriter face below 13px", () => {
    const infratores = arquivosDeUi().filter((caminho) => {
      const fonte = readFileSync(caminho, "utf8");
      return [...fonte.matchAll(/className=\{?["'`]([^"'`]*)["'`]/g)].some(
        ([, classes]) =>
          (classes ?? "").includes("font-mono") &&
          PEQUENO_DEMAIS.test(classes ?? ""),
      );
    });

    expect(infratores).toEqual([]);
  });

  it("should have something to scan, or the guard is worthless", () => {
    expect(arquivosDeUi().length).toBeGreaterThan(5);
  });
});
