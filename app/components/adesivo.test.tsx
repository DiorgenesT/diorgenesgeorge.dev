// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Adesivo } from "./adesivo";

// Sem `globals: true`, a testing-library nao registra a limpeza automatica:
// sem isto os elementos de um teste sobrariam no DOM do proximo.
afterEach(cleanup);

describe("Adesivo", () => {
  it("should render what it was given", () => {
    render(<Adesivo indice={0}>Python</Adesivo>);

    expect(screen.getByText("Python")).not.toBeNull();
  });

  it("should rotate, because a sticker pressed by hand never lands straight", () => {
    render(<Adesivo indice={2}>Python</Adesivo>);

    expect(screen.getByText("Python").style.transform).toMatch(/rotate\(/);
  });

  it("should give the same index the same angle across separate renders", () => {
    const primeiro = render(<Adesivo indice={5}>A</Adesivo>);
    const anguloUm = screen.getByText("A").style.transform;
    primeiro.unmount();

    render(<Adesivo indice={5}>A</Adesivo>);

    expect(screen.getByText("A").style.transform).toBe(anguloUm);
  });

  it("should give different indexes different angles, or the collage looks printed", () => {
    render(
      <>
        <Adesivo indice={0}>um</Adesivo>
        <Adesivo indice={1}>dois</Adesivo>
      </>,
    );

    expect(screen.getByText("um").style.transform).not.toBe(
      screen.getByText("dois").style.transform,
    );
  });
});
