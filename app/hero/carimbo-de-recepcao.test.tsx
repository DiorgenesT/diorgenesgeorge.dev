// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CarimboDeRecepcao } from "./carimbo-de-recepcao";
import type { TelemetryState } from "./telemetry";

// Sem `globals: true`, a testing-library nao registra a limpeza automatica.
afterEach(cleanup);

vi.mock("../i18n/use-locale", () => ({ useLocale: () => "pt-BR" }));

const PRONTO: TelemetryState = {
  status: "ready",
  rttMs: 18,
  data: {
    visitor: { city: "Betim", country: "BR", lat: -19.9678, lon: -44.1983 },
    colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
    httpProtocol: "HTTP/3",
  },
};

describe("CarimboDeRecepcao", () => {
  it("should reserve its space before there is anything to stamp", () => {
    const { container } = render(
      <CarimboDeRecepcao state={{ status: "loading" }} />,
    );

    // O invólucro existe mesmo vazio: é ele que impede o layout de saltar quando
    // o dado chega depois do primeiro desenho.
    expect(container.querySelector("[data-carimbo]")).not.toBeNull();
  });

  it("should stamp nothing visible while it has nothing to say", () => {
    render(<CarimboDeRecepcao state={{ status: "failed" }} />);

    expect(screen.queryByText(/GIG/)).toBeNull();
  });

  it("should stamp what the edge reported", () => {
    render(<CarimboDeRecepcao state={PRONTO} />);

    expect(screen.getByText(/Betim, BR/)).not.toBeNull();
    expect(screen.getByText(/GIG/)).not.toBeNull();
  });

  it("should announce itself politely, because it arrives after the page is read", () => {
    const { container } = render(<CarimboDeRecepcao state={PRONTO} />);

    expect(
      container.querySelector("[data-carimbo]")?.getAttribute("aria-live"),
    ).toBe("polite");
  });
});
