import { describe, expect, it, vi } from "vitest";
import { isSaveShortcut, useSaveShortcut } from "./useSaveShortcut";

const createKeyEvent = (
  options: Partial<KeyboardEvent> & { key: string }
) =>
  ({
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...options,
  }) as unknown as KeyboardEvent;

describe("isSaveShortcut", () => {
  it("matches command or control save", () => {
    expect(isSaveShortcut(createKeyEvent({ key: "s", metaKey: true }))).toBe(true);
    expect(isSaveShortcut(createKeyEvent({ key: "S", ctrlKey: true }))).toBe(true);
  });

  it("ignores other shortcuts", () => {
    expect(isSaveShortcut(createKeyEvent({ key: "s" }))).toBe(false);
    expect(isSaveShortcut(createKeyEvent({ key: "s", ctrlKey: true, altKey: true }))).toBe(false);
  });
});

describe("useSaveShortcut", () => {
  it("prevents browser save and calls the save handler", () => {
    const onSave = vi.fn();
    const { handleSaveShortcut } = useSaveShortcut({ onSave });
    const event = createKeyEvent({ key: "s", ctrlKey: true });

    expect(handleSaveShortcut(event)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});
