import type { CategoryNode, NoteItem } from "../types";

const normalizeQuery = (query: string) => query.trim().toLowerCase();

const getTimeValue = (time?: string) => {
  if (!time) {
    return Number.MAX_SAFE_INTEGER;
  }

  const value = new Date(time).getTime();
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
};

export function sortNotesByCreateTime(notes: NoteItem[]): NoteItem[] {
  return [...notes].sort(
    (left, right) =>
      getTimeValue(left.createTime) - getTimeValue(right.createTime)
  );
}

export function filterCategories(
  categories: CategoryNode[],
  query: string
): CategoryNode[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return categories;
  }

  return categories.filter((category) =>
    category.name.toLowerCase().includes(normalizedQuery)
  );
}

export function filterNotesInCategory(
  notes: NoteItem[],
  activeCategoryId: string | number,
  query: string
): NoteItem[] {
  const normalizedQuery = normalizeQuery(query);
  const activeNotes = sortNotesByCreateTime(
    notes.filter((note) => note.parentId === activeCategoryId)
  );

  if (!normalizedQuery) {
    return activeNotes;
  }

  return activeNotes.filter((note) =>
    note.content.toLowerCase().includes(normalizedQuery)
  );
}
