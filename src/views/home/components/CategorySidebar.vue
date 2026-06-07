<script setup lang="ts">
import { IconPark } from "@icon-park/vue-next/es/all";
import type { CategoryNode } from "../types";

const props = defineProps<{
  categories: CategoryNode[];
  activeCategoryId: string | number;
  noteCounts: Record<string, number>;
  categoryQuery: string;
  isCreatingCategory: boolean;
  newCategoryName: string;
}>();

const emit = defineEmits<{
  "update:categoryQuery": [value: string];
  "update:newCategoryName": [value: string];
  selectCategory: [category: CategoryNode];
  startCreateCategory: [];
  cancelCreateCategory: [];
  saveCategory: [];
  editCategory: [category: CategoryNode];
  deleteCategory: [category: CategoryNode];
}>();

const updateCategoryName = (category: CategoryNode, value: string | number) => {
  category.name = String(value);
};

const getNoteCount = (category: CategoryNode) =>
  props.noteCounts[String(category.id)] || 0;
</script>

<template>
  <aside class="category-sidebar" aria-label="便签分类">
    <div class="category-sidebar__header">
      <div class="category-sidebar__brand-row">
        <strong class="category-sidebar__brand">Notes</strong>
        <button
          type="button"
          class="category-sidebar__create-button"
          @click="emit('startCreateCategory')"
        >
          新分类
        </button>
      </div>
      <input
        class="category-sidebar__search"
        aria-label="搜索分类"
        placeholder="搜索分类"
        :value="props.categoryQuery"
        @input="
          emit('update:categoryQuery', ($event.target as HTMLInputElement).value)
        "
      />
    </div>

    <div class="category-sidebar__list">
      <div
        v-for="category in props.categories"
        :key="category.id"
        class="category-sidebar__row"
        :class="{
          'category-sidebar__row--active': props.activeCategoryId == category.id,
          'category-sidebar__row--editing': category.isEdit,
        }"
      >
        <button
          v-if="!category.isEdit"
          type="button"
          class="category-sidebar__category-button"
          @click="emit('selectCategory', category)"
        >
          <span
            class="category-sidebar__name"
            :class="{
              'category-sidebar__name--active': props.activeCategoryId == category.id,
            }"
          >
            {{ category.name }}
          </span>
          <span class="category-sidebar__count">{{ getNoteCount(category) }}</span>
        </button>

        <div v-else class="category-sidebar__edit-row">
          <el-input
            class="category-sidebar__edit-input"
            :model-value="category.name"
            :aria-label="`编辑分类 ${category.name}`"
            @update:model-value="(value) => updateCategoryName(category, value)"
            @keydown.enter.stop="emit('editCategory', category)"
          />
        </div>

        <div v-if="!category.isEdit" class="category-sidebar__actions">
          <button
            type="button"
            class="category-sidebar__icon-button"
            :aria-label="`编辑分类 ${category.name}`"
            @click.stop="emit('editCategory', category)"
          >
            <icon-park type="edit" size="12" theme="outline" fill="currentColor" />
          </button>
          <button
            type="button"
            class="category-sidebar__icon-button"
            :aria-label="`删除分类 ${category.name}`"
            @click.stop="emit('deleteCategory', category)"
          >
            <icon-park type="close" size="12" theme="outline" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="props.isCreatingCategory" class="category-sidebar__new-row">
      <el-input
        class="category-sidebar__new-input"
        :model-value="props.newCategoryName"
        aria-label="新分类名称"
        @update:model-value="(value) => emit('update:newCategoryName', String(value))"
        @keydown.enter="emit('saveCategory')"
      />
      <button
        type="button"
        class="category-sidebar__icon-button"
        aria-label="取消新建分类"
        @click="emit('cancelCreateCategory')"
      >
        <icon-park type="close" size="12" theme="outline" fill="currentColor" />
      </button>
    </div>

    <div class="category-sidebar__storage">本地保存 · IndexedDB</div>
  </aside>
</template>

<style lang="scss" scoped>
.category-sidebar {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-sidebar);
}

.category-sidebar__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-sidebar__brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.category-sidebar__brand {
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.category-sidebar__create-button,
.category-sidebar__search {
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 8px 10px;
}

.category-sidebar__create-button {
  flex-shrink: 0;
  color: var(--text-primary);
  background: var(--surface-note);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--action-primary);
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
}

.category-sidebar__search {
  width: 100%;
  color: var(--text-primary);
  background: var(--surface-note);
  outline: none;

  &::placeholder {
    color: var(--text-muted);
  }
}

.category-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-sidebar__row--active {
  border-color: #365170;
  color: var(--text-primary);
  background: var(--surface-note-hover);
}

.category-sidebar__row,
.category-sidebar__new-row,
.category-sidebar__category-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 10px;
}

.category-sidebar__edit-row,
.category-sidebar__category-button {
  min-width: 0;
  flex: 1;
}

.category-sidebar__category-button {
  width: 100%;
  border: 0;
  border-radius: 10px;
  padding: 10px;
  color: var(--text-secondary);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.category-sidebar__name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover,
  &--active {
    color: var(--text-primary);
  }
}

.category-sidebar__count {
  color: var(--text-muted);
  font-size: 13px;
}

.category-sidebar__edit-input,
.category-sidebar__new-input {
  min-width: 0;
  flex: 1;
}

.category-sidebar__actions {
  display: flex;
  gap: 4px;
  padding-right: 6px;
  opacity: 0.55;
}

.category-sidebar__row:hover .category-sidebar__actions,
.category-sidebar__row:focus-within .category-sidebar__actions {
  opacity: 1;
}

.category-sidebar__icon-button {
  border: 0;
  padding: 4px;
  color: var(--text-muted);
  background: transparent;
  cursor: pointer;
}

.category-sidebar__storage {
  margin-top: auto;
  color: var(--text-muted);
  font-size: 12px;
}

.category-sidebar__category-button:focus-visible,
.category-sidebar__icon-button:focus-visible,
.category-sidebar__search:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
