// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NotaDeResgate } from "./nota-de-resgate";

// Sem `globals: true`, a testing-library nao registra a limpeza automatica:
// sem isto os elementos de um teste sobrariam no DOM do proximo.
afterEach(cleanup);

describe("NotaDeResgate", () => {
  it("should read as one word to a screen reader, not as loose letters", () => {
    render(<NotaDeResgate texto="DG" />);

    // O texto real vive no rotulo: letra a letra, um leitor de tela soletraria.
    expect(screen.getByLabelText("DG")).not.toBeNull();
  });

  it("should hide every cut letter from assistive technology", () => {
    const { container } = render(<NotaDeResgate texto="DG" />);
    const letras = container.querySelectorAll("span[aria-hidden='true']");

    expect(letras.length).toBeGreaterThanOrEqual(2);
  });

  it("should give each letter its own angle, because each was cut from a different page", () => {
    const { container } = render(<NotaDeResgate texto="DG" />);
    const letras = [...container.querySelectorAll("span[aria-hidden='true']")];
    const angulos = letras.map(
      (letra) => (letra as HTMLElement).style.transform,
    );

    expect(new Set(angulos).size).toBeGreaterThan(1);
  });

  it("should keep a space as a gap, never as a cut letter", () => {
    const { container } = render(<NotaDeResgate texto="a b" />);
    const comTexto = [
      ...container.querySelectorAll("span[aria-hidden='true']"),
    ].filter((letra) => letra.textContent !== "");

    expect(comTexto).toHaveLength(2);
  });
});
