import { describe, expect, it } from "vitest";
import { filterCategories, filterNotesInCategory } from "./useNoteSearch";
import type { CategoryNode, NoteItem } from "../types";

const categories: CategoryNode[] = [
  { id: "cat-1", parentId: "0", name: "项目备忘" },
  { id: "cat-2", parentId: "0", name: "代码片段" },
  { id: "cat-3", parentId: "0", name: "临时收集" },
  { id: "cat-4", parentId: "0", name: "Frontend Notes" },
];

const notes: NoteItem[] = [
  { id: "note-1", parentId: "cat-1", content: "API 调试记录 curl token" },
  { id: "note-2", parentId: "cat-1", content: "部署命令 pnpm build" },
  { id: "note-3", parentId: "cat-2", content: "Vue ref shallowRef markRaw" },
  { id: "note-4", parentId: "cat-4", content: "Release Checklist includes Smoke Test" },
];

describe("useNoteSearch", () => {
  it("filters categories by category name only", () => {
    expect(filterCategories(categories, "代码")).toEqual([categories[1]]);
  });

  it("trims and lowercases non-blank category queries", () => {
    expect(filterCategories(categories, "  frontend notes  ")).toEqual([categories[3]]);
  });

  it("returns all categories when category query is blank", () => {
    expect(filterCategories(categories, "   ")).toEqual(categories);
  });

  it("filters notes only inside the active category", () => {
    expect(filterNotesInCategory(notes, "cat-1", "pnpm")).toEqual([notes[1]]);
  });

  it("trims and lowercases non-blank note queries inside the active category", () => {
    expect(filterNotesInCategory(notes, "cat-4", "  smoke test  ")).toEqual([notes[3]]);
  });

  it("does not return matches from other categories", () => {
    expect(filterNotesInCategory(notes, "cat-1", "Vue")).toEqual([]);
  });

  it("returns all active category notes when note query is blank", () => {
    expect(filterNotesInCategory(notes, "cat-1", "")).toEqual([notes[0], notes[1]]);
  });
});
