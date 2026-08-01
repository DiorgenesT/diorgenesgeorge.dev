import { describe, expect, it } from "vitest";
import { getServerTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "./theme";

describe("THEME_INIT_SCRIPT", () => {
  it("should read the persisted theme from the documented storage key", () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_STORAGE_KEY);
  });

  it("should fall back to the system colour scheme preference", () => {
    expect(THEME_INIT_SCRIPT).toContain("prefers-color-scheme");
  });

  it("should be a single line so its CSP hash stays stable", () => {
    expect(THEME_INIT_SCRIPT).not.toContain("\n");
  });

  it("should guard against storage access throwing", () => {
    expect(THEME_INIT_SCRIPT).toContain("catch");
  });
});

describe("getServerTheme", () => {
  it("should assume dark, matching the script fallback when storage fails", () => {
    expect(getServerTheme()).toBe("dark");
  });
});
