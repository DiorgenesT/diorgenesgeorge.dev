// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FitaAdesiva } from "./fita-adesiva";

// Sem `globals: true`, a testing-library nao registra a limpeza automatica:
// sem isto os elementos de um teste sobrariam no DOM do proximo.
afterEach(cleanup);

describe("FitaAdesiva", () => {
  it("should render what it was given", () => {
    render(<FitaAdesiva indice={0}>Sobre</FitaAdesiva>);

    expect(screen.getByText("Sobre")).not.toBeNull();
  });

  it("should rotate, because tape is torn by hand", () => {
    render(<FitaAdesiva indice={1}>Sobre</FitaAdesiva>);

    expect(screen.getByText("Sobre").style.transform).toMatch(/rotate\(/);
  });

  it("should put ink on the tape, never the tape colour on the page", () => {
    render(<FitaAdesiva indice={0}>Sobre</FitaAdesiva>);
    const classe = screen.getByText("Sobre").className;

    // O amarelo da 1,58:1 sobre o papel: ele so pode ser fundo, e o texto so pode
    // ser a tinta. Esta asercao e o que impede a regra de virar recomendacao.
    expect(classe).toContain("bg-fita");
    expect(classe).toContain("text-fg");
  });
});
