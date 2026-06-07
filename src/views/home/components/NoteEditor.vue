<script setup lang="ts">
import { EditorContent, useEditor, type JSONContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { getNoteEditorContent } from "../utils/noteContent";
import type { NoteItem } from "../types";

const props = defineProps<{
  note: NoteItem;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  change: [payload: { html: string; json: JSONContent }];
}>();

const editor = useEditor({
  extensions: [StarterKit],
  content: getNoteEditorContent(props.note),
  autofocus: props.autoFocus ? "end" : false,
  editorProps: {
    attributes: {
      class: "note-editor__surface",
      spellcheck: "true",
    },
  },
  onUpdate: ({ editor }) => {
    emit("change", {
      html: editor.getHTML(),
      json: editor.getJSON(),
    });
  },
});

watch(
  () => props.note.id,
  () => {
    editor.value?.commands.setContent(getNoteEditorContent(props.note), { emitUpdate: false });
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <EditorContent class="note-editor" :editor="editor" />
</template>

<style lang="scss" scoped>
.note-editor {
  height: 100%;
}

.note-editor :deep(.note-editor__surface) {
  height: 100%;
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.65;
  outline: none;
  overflow: auto;
  white-space: pre-wrap;
}

.note-editor :deep(.note-editor__surface p) {
  margin: 0 0 0.75em;
}

.note-editor :deep(.note-editor__surface p:last-child) {
  margin-bottom: 0;
}
</style>
