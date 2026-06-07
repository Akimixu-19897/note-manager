import { describe, expect, it } from "vitest";
import { createNoteDraftState } from "./useNoteDraftState";

describe("createNoteDraftState", () => {
  it("starts idle with empty error and last saved timestamp", () => {
    const draft = createNoteDraftState();

    expect(draft.value.value).toEqual({
      status: "idle",
      errorMessage: "",
      lastSavedAt: "",
    });
  });

  it("marks the draft dirty and clears previous errors", () => {
    const draft = createNoteDraftState();

    draft.markFailed("network unavailable");
    draft.markDirty();

    expect(draft.value.value).toEqual({
      status: "dirty",
      errorMessage: "",
      lastSavedAt: "",
    });
  });

  it("marks the draft saving before marking it saved with a timestamp", () => {
    const draft = createNoteDraftState();
    const lastSavedAt = "2026-06-06T12:00:00.000Z";

    draft.markFailed("previous save failed");
    draft.markSaving();

    expect(draft.value.value).toEqual({
      status: "saving",
      errorMessage: "",
      lastSavedAt: "",
    });

    draft.markSaved(lastSavedAt);

    expect(draft.value.value).toEqual({
      status: "saved",
      errorMessage: "",
      lastSavedAt,
    });
  });

  it("marks the draft failed and stores the error message", () => {
    const draft = createNoteDraftState();

    draft.markFailed("save failed");

    expect(draft.value.value).toEqual({
      status: "failed",
      errorMessage: "save failed",
      lastSavedAt: "",
    });
  });
});
