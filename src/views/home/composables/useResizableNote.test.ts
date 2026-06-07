import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateResizedDimensions, createResizeController } from "./useResizableNote";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("calculateResizedDimensions", () => {
  it("adds deltas to starting dimensions", () => {
    expect(
      calculateResizedDimensions({
        startWidth: 400,
        startHeight: 480,
        deltaX: 40,
        deltaY: 20,
        minWidth: 300,
        minHeight: 300,
      })
    ).toEqual({ width: "440px", height: "500px" });
  });

  it("clamps to minimum dimensions", () => {
    expect(
      calculateResizedDimensions({
        startWidth: 320,
        startHeight: 320,
        deltaX: -100,
        deltaY: -80,
        minWidth: 300,
        minHeight: 300,
      })
    ).toEqual({ width: "300px", height: "300px" });
  });
});

describe("createResizeController", () => {
  it("calls commit with the final dimensions", () => {
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const commit = vi.fn();
    const controller = createResizeController({
      minWidth: 300,
      minHeight: 300,
      onPreview: vi.fn(),
      onCommit: commit,
    });

    controller.start({ startX: 10, startY: 10, startWidth: 400, startHeight: 480 });
    controller.move({ clientX: 60, clientY: 40 });
    controller.end();

    expect(commit).toHaveBeenCalledWith({ width: "450px", height: "510px" });
  });
});
