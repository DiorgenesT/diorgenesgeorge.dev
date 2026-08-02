// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FATIAS } from "../design/desregistro";
import { Monograma } from "./monograma";

// Sem `globals: true`, a testing-library nao registra a limpeza automatica.
afterEach(cleanup);

function montar(carga = 0.34) {
  return render(<Monograma carga={carga} duracao={900} />);
}

describe("Monograma", () => {
  it("should hide itself from assistive technology, because the h1 carries the name", () => {
    const { container } = montar();

    expect(
      container.querySelector("[data-monograma]")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("should print both letters", () => {
    const { container } = montar();
    const medidas = [...container.querySelectorAll(".monograma-medida")];

    expect(medidas.map((el) => el.textContent)).toEqual(["D", "G"]);
  });

  it("should cut each letter into the bands the table declares", () => {
    const { container } = montar();
    const fatias = container.querySelectorAll(".monograma-fatia");

    // Duas letras, duas camadas por letra, seis fatias por camada.
    expect(fatias).toHaveLength(2 * 2 * FATIAS.length);
  });

  it("should give both plates the same box, or they start from different origins", () => {
    const { container } = montar();
    const letra = container.querySelector(".monograma-letra");

    // As duas camadas são irmãs dentro da mesma letra, e nenhuma delas está em fluxo:
    // é isso que garante que partam do mesmo ponto.
    expect(letra?.querySelectorAll(".monograma-camada")).toHaveLength(2);
    expect(letra?.querySelectorAll(".monograma-medida")).toHaveLength(1);
  });

  it("should carry the load as a custom property, never as a random value", () => {
    const { container } = montar(0.42);
    const marca = container.querySelector("[data-monograma]") as HTMLElement;

    expect(marca.style.getPropertyValue("--carga")).toBe("0.42");
  });

  it("should honour the duration it was given", () => {
    const { container } = render(<Monograma carga={0.34} duracao={900} />);
    const marca = container.querySelector("[data-monograma]") as HTMLElement;

    expect(marca.style.getPropertyValue("--duracao")).toBe("900ms");
  });

  it("should print on mount, because remounting is what restarts the animation", () => {
    const { container } = montar();

    // Quem reimprime e quem chama, trocando a `key`. O componente nao guarda estado:
    // ele ja nasce imprimindo, e por isso a classe esta sempre presente.
    expect(container.querySelector("[data-monograma]")?.className).toContain(
      "monograma-recebendo",
    );
  });
});
