import { describe, expect, it } from "vitest";
import { decide } from "./capability";

const capable = { reducedMotion: false, webgl: true, memoryGb: 8, cores: 8 };

describe("decide", () => {
  it("should allow both scene and motion on a capable device", () => {
    expect(decide(capable)).toEqual({ scene: true, motion: true });
  });

  it("should turn off the whole motion layer when the visitor asked for less motion", () => {
    expect(decide({ ...capable, reducedMotion: true })).toEqual({
      scene: false,
      motion: false,
    });
  });

  it("should ignore the device when the visitor asked for less motion", () => {
    expect(
      decide({ reducedMotion: true, webgl: true, memoryGb: 64, cores: 32 }),
    ).toEqual({ scene: false, motion: false });
  });

  it("should keep motion when only webgl is missing", () => {
    expect(decide({ ...capable, webgl: false })).toEqual({
      scene: false,
      motion: true,
    });
  });

  it("should turn off the scene on a device with little memory", () => {
    expect(decide({ ...capable, memoryGb: 2 }).scene).toBe(false);
  });

  it("should turn off the scene on a device with few cores", () => {
    expect(decide({ ...capable, cores: 2 }).scene).toBe(false);
  });

  it("should keep motion on a weak device, because transitions are cheap", () => {
    expect(decide({ ...capable, memoryGb: 2, cores: 2 }).motion).toBe(true);
  });

  it("should not punish a browser that does not report memory or cores", () => {
    expect(decide({ reducedMotion: false, webgl: true }).scene).toBe(true);
  });
});
