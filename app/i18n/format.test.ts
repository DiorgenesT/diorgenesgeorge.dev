import { describe, expect, it } from "vitest";
import { formatDate, formatMonth, formatNumber } from "./format";

describe("formatDate", () => {
  it("should write the brazilian portuguese long date", () => {
    expect(formatDate("pt-BR", "2026-08-01")).toBe("1 de agosto de 2026");
  });

  it("should write the english long date", () => {
    expect(formatDate("en-US", "2026-08-01")).toBe("August 1, 2026");
  });

  it("should not shift the day because of a timezone", () => {
    expect(formatDate("pt-BR", "2026-01-01")).toContain("1 de janeiro");
  });
});

describe("formatMonth", () => {
  it("should abbreviate the month in pt-BR", () => {
    expect(formatMonth("pt-BR", "2025-11")).toMatch(/nov/);
  });

  it("should abbreviate the month in en-US", () => {
    expect(formatMonth("en-US", "2025-11")).toMatch(/Nov/);
  });

  it("should keep the year", () => {
    expect(formatMonth("en-US", "2025-11")).toContain("2025");
  });
});

describe("formatNumber", () => {
  it("should use the portuguese thousands separator", () => {
    expect(formatNumber("pt-BR", 1468)).toBe("1.468");
  });

  it("should use the english thousands separator", () => {
    expect(formatNumber("en-US", 1468)).toBe("1,468");
  });
});
