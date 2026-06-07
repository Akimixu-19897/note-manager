import type { JSONContent } from "@tiptap/vue-3";
import type { NoteItem } from "../types";

export const emptyTiptapDocument = (): JSONContent => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export const getNoteEditorContent = (note: NoteItem): JSONContent | string => {
  if (note.contentFormat === "tiptap-json" && note.contentJson) {
    return note.contentJson;
  }

  return note.content || "";
};

export const toPlainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
