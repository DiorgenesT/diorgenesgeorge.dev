import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n/config";
import { CV } from "./cv";

describe("CV", () => {
  it.each(LOCALES)("should exist in %s", (locale) => {
    expect(CV[locale].positions.length).toBeGreaterThan(0);
  });

  it("should be translated, not shared between locales", () => {
    expect(CV["en-US"].headline).not.toBe(CV["pt-BR"].headline);
    expect(CV["pt-PT"].headline).not.toBe(CV["pt-BR"].headline);
  });

  it("should order positions from the most recent", () => {
    const starts = CV["pt-BR"].positions.map((position) => position.start);

    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it("should never store a duration, because it would go stale", () => {
    const serialized = JSON.stringify(CV);

    expect(serialized).not.toMatch(/\d+\s*(anos|meses|years|months)/i);
  });

  it("should leave the current position without an end date", () => {
    expect(CV["pt-BR"].positions[0]?.end).toBeUndefined();
  });

  it.each(LOCALES)("should keep every date as year and month in %s", (locale) => {
    const dates = [
      ...CV[locale].positions.flatMap((p) => [p.start, p.end]),
      ...CV[locale].education.flatMap((e) => [e.start, e.end]),
    ].filter(Boolean) as string[];

    expect(dates.every((date) => /^\d{4}-\d{2}$/.test(date))).toBe(true);
  });

  it("should not mention the unfinished graduate course anywhere", () => {
    // Decisão do Diorgenes: só a formação concluída aparece.
    expect(JSON.stringify(CV)).not.toMatch(/UniCesumar|Pós-Gradua|Graduate/i);
  });
});
