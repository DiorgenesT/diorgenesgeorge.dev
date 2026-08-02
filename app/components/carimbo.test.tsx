// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Carimbo } from "./carimbo";

// Sem `globals: true`, a testing-library nao registra a limpeza automatica:
// sem isto os elementos de um teste sobrariam no DOM do proximo.
afterEach(cleanup);

describe("Carimbo", () => {
  it("should render what it was given", () => {
    render(<Carimbo indice={0}>Betim, MG</Carimbo>);

    expect(screen.getByText("Betim, MG")).not.toBeNull();
  });

  it("should rotate, because a stamp is pressed by hand", () => {
    render(<Carimbo indice={3}>Betim, MG</Carimbo>);

    expect(screen.getByText("Betim, MG").style.transform).toMatch(/rotate\(/);
  });

  it("should never drop below the 13px floor of the typewriter face", () => {
    render(<Carimbo indice={0}>Betim, MG</Carimbo>);
    const classe = screen.getByText("Betim, MG").className;

    expect(classe).toContain("text-meta");
    expect(classe).not.toContain("text-xs");
  });
});
