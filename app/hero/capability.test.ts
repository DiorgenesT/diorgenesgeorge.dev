import { describe, expect, it } from "vitest";
import { decide } from "./capability";

describe("decide", () => {
  it("should allow motion when the visitor did not ask for less", () => {
    expect(decide({ reducedMotion: false })).toEqual({ motion: true });
  });

  it("should turn off the motion layer when the visitor asked for less motion", () => {
    expect(decide({ reducedMotion: true })).toEqual({ motion: false });
  });
});
