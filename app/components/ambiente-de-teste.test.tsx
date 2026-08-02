// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

/**
 * Guarda de infraestrutura, nao de produto: se este arquivo falhar, o problema esta no
 * vitest ou no jsdom, e nao no componente que o autor estava escrevendo.
 */
describe("ambiente de teste de componente", () => {
  it("should render a react element into a dom", () => {
    render(<p>fanzine</p>);

    expect(screen.getByText("fanzine")).not.toBeNull();
  });
});
