import type { CategoryNode, NoteItem } from "../types";

const normalizeQuery = (query: string) => query.trim().toLowerCase();

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
  const activeNotes = notes.filter((note) => note.parentId === activeCategoryId);

  if (!normalizedQuery) {
    return activeNotes;
  }

  return activeNotes.filter((note) =>
    note.content.toLowerCase().includes(normalizedQuery)
  );
}
