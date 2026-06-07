import type { JSONContent } from "@tiptap/vue-3";

export interface CategoryNode {
  id: string | number;
  parentId: string | number;
  name: string;
  createTime?: string;
  updateTime?: string;
  isEdit?: boolean;
  children?: NoteItem[];
}

export interface NoteItem {
  id: string | number;
  clientId?: string;
  parentId: string | number;
  content: string;
  contentJson?: JSONContent;
  contentFormat?: "html" | "tiptap-json";
  width?: string;
  height?: string;
  createTime?: string;
  updateTime?: string;
  saveStatus?: SaveStatus;
  saveErrorMessage?: string;
  lastSavedAt?: string;
}

export interface NoteContentUpdate {
  html: string;
  json: JSONContent;
}

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "failed";

export interface NoteDraftState {
  status: SaveStatus;
  errorMessage: string;
  lastSavedAt: string;
}

export interface ResizeDimensions {
  width: string;
  height: string;
}
