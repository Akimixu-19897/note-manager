<script setup lang="ts">
import { IconPark } from "@icon-park/vue-next/es/all";
import NoteCard from "./NoteCard.vue";
import type { NoteContentUpdate, NoteItem, ResizeDimensions } from "../types";

const props = defineProps<{
  notes: NoteItem[];
  totalCount: number;
  hasActiveCategory: boolean;
  isSearching: boolean;
}>();

const emit = defineEmits<{
  createNote: [];
  clearSearch: [];
  saveNote: [note: NoteItem];
  deleteNote: [note: NoteItem];
  resizeNote: [note: NoteItem, dimensions: ResizeDimensions];
  updateNoteContent: [note: NoteItem, update: NoteContentUpdate];
}>();

const emptyState = computed<"firstRun" | "category" | "search" | "grid">(() => {
  if (!props.hasActiveCategory) {
    return "firstRun";
  }

  if (props.isSearching && props.notes.length === 0) {
    return "search";
  }

  if (props.totalCount === 0) {
    return "category";
  }

  return "grid";
});

const saveNote = (note: NoteItem) => emit("saveNote", note);
const deleteNote = (note: NoteItem) => emit("deleteNote", note);
const resizeNote = (note: NoteItem, dimensions: ResizeDimensions) =>
  emit("resizeNote", note, dimensions);
const updateNoteContent = (note: NoteItem, update: NoteContentUpdate) =>
  emit("updateNoteContent", note, update);
</script>

<template>
  <section class="note-grid-shell" aria-label="便签列表">
    <div v-if="emptyState === 'firstRun'" class="empty-state empty-state--calm">
      <div class="empty-state__icon" aria-hidden="true">
        <icon-park type="notebook" size="44" theme="outline" fill="currentColor" />
      </div>
      <h2>选择一个分类开始整理便签</h2>
      <p>左侧分类会承载你的便签工作区，选中后即可查看和新建内容。</p>
    </div>

    <div v-else-if="emptyState === 'category'" class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">
        <icon-park type="doc-add" size="52" theme="outline" fill="currentColor" />
      </div>
      <h2>这个分类还没有便签</h2>
      <p>创建第一张便签，把当前想法先放下来。</p>
      <button class="empty-state__action" type="button" @click="emit('createNote')">
        新建便签
      </button>
    </div>

    <div v-else-if="emptyState === 'search'" class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">
        <icon-park type="search" size="48" theme="outline" fill="currentColor" />
      </div>
      <h2>没有匹配便签</h2>
      <p>换个关键词试试，或清空搜索查看当前分类下的全部便签。</p>
      <button class="empty-state__action" type="button" @click="emit('clearSearch')">
        清空搜索
      </button>
    </div>

    <div v-else class="note-grid" role="list">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @update:content="updateNoteContent"
        @save="saveNote"
        @delete="deleteNote"
        @resize="resizeNote"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.note-grid-shell {
  overflow: auto;
  padding: 4px 4px 48px;
}

.note-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: start;
  align-content: start;
}

.empty-state {
  min-height: 360px;
  border: 1px solid var(--border-subtle);
  border-radius: 24px;
  background: linear-gradient(145deg, var(--surface-workspace), var(--surface-note));
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 48px 24px;
}

.empty-state--calm {
  background: var(--surface-workspace);
}

.empty-state__icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: var(--surface-note-hover);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.empty-state p {
  max-width: 420px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.empty-state__action {
  margin-top: 4px;
  border: 0;
  border-radius: 999px;
  background: var(--action-primary);
  color: var(--text-primary);
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.18s ease, transform 0.18s ease;

  &:hover,
  &:focus-visible {
    background: var(--action-primary-hover);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
}

@media (max-width: 760px) {
  .note-grid-shell {
    padding-bottom: 24px;
  }

  .note-grid {
    gap: 16px;
  }
}

</style>
