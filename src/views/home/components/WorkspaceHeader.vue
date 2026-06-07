<script setup lang="ts">
import { IconPark } from "@icon-park/vue-next/es/all";

const props = defineProps<{
  categoryName: string;
  noteCount: number;
  matchedCount: number;
  searchQuery: string;
}>();

const emit = defineEmits<{
  "update:searchQuery": [value: string];
  clearSearch: [];
  createNote: [];
}>();

const searchInputRef = ref<HTMLInputElement | null>(null);
const isMobileSearchOpen = ref(false);

const updateSearchQuery = (event: Event) => {
  emit("update:searchQuery", (event.target as HTMLInputElement).value);
};

const clearSearch = () => {
  if (!props.searchQuery) {
    return;
  }

  emit("update:searchQuery", "");
  emit("clearSearch");
};

const focusSearch = () => {
  isMobileSearchOpen.value = true;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
};

const toggleMobileSearch = () => {
  isMobileSearchOpen.value = !isMobileSearchOpen.value;

  if (isMobileSearchOpen.value) {
    focusSearch();
  }
};

const closeMobileSearch = () => {
  clearSearch();
  isMobileSearchOpen.value = false;
};

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.stopPropagation();
    closeMobileSearch();
  }
};

const resultText = computed(() => `${props.matchedCount} / ${props.noteCount}`);

const handleSearchFocus = () => {
  isMobileSearchOpen.value = true;
};

defineExpose({ focusSearch });
</script>

<template>
  <header class="workspace-header" aria-label="当前分类工作区">
    <div class="workspace-header__summary">
      <h1 class="workspace-header__title">{{ props.categoryName }}</h1>
      <span class="workspace-header__count">{{ props.noteCount }}</span>
    </div>

    <button
      type="button"
      class="workspace-header__search-toggle"
      aria-label="展开搜索当前分类便签"
      :aria-expanded="isMobileSearchOpen"
      @click="toggleMobileSearch"
    >
      <icon-park type="search" size="18" theme="outline" fill="currentColor" />
    </button>

    <div
      class="workspace-header__search-group"
      :class="{ 'workspace-header__search-group--open': isMobileSearchOpen }"
    >
      <label class="workspace-header__search">
        <icon-park type="search" size="16" theme="outline" fill="currentColor" />
        <input
          ref="searchInputRef"
          class="workspace-header__search-input"
          type="search"
          placeholder="搜索当前分类"
          :value="props.searchQuery"
          aria-label="搜索当前分类便签"
          @input="updateSearchQuery"
          @focus="handleSearchFocus"
          @keydown="handleSearchKeydown"
        />
        <kbd class="workspace-header__shortcut" aria-hidden="true">/</kbd>
      </label>
      <span class="workspace-header__result" aria-live="polite">{{ resultText }}</span>
    </div>

    <div class="workspace-header__actions">
      <button
        type="button"
        class="workspace-header__create-button"
        @click="emit('createNote')"
      >
        <icon-park type="doc-add" size="18" theme="outline" fill="currentColor" />
        <span class="workspace-header__create-label">新建便签</span>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.workspace-header {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(150px, 220px) minmax(220px, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-sidebar);
}

.workspace-header__summary {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.workspace-header__count {
  color: var(--text-muted);
  font-size: 14px;
}

.workspace-header__title {
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-header__search-toggle {
  display: none;
}

.workspace-header__search-group {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.workspace-header__search {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  padding: 0 12px;
  color: var(--text-secondary);
  background: var(--surface-note);

  &:focus-within {
    border-color: var(--border-subtle);
    box-shadow: none;
  }
}

.workspace-header__search-input {
  min-width: 0;
  flex: 1;
  border: 0;
  color: var(--text-primary);
  background: transparent;
  outline: none;

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.workspace-header__shortcut {
  min-width: 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 1px 6px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
}

.workspace-header__result {
  color: var(--text-muted);
  font-size: 12px;
  white-space: nowrap;
}

.workspace-header__create-button {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  padding: 0 16px;
  color: var(--text-primary);
  background: var(--action-primary);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--action-primary-hover);
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
}

@media (max-width: 900px) {
  .workspace-header {
    grid-template-columns: minmax(0, 1fr) 44px auto;
    grid-template-areas:
      "summary searchToggle create"
      "search search search";
    align-items: center;
  }

  .workspace-header__summary {
    grid-area: summary;
  }

  .workspace-header__search-toggle {
    grid-area: searchToggle;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    color: var(--text-secondary);
    background: var(--surface-note);
    cursor: pointer;
  }

  .workspace-header__search-group {
    grid-area: search;
    display: none;
  }

  .workspace-header__search-group--open {
    display: grid;
  }

  .workspace-header__search {
    min-width: 0;
  }

  .workspace-header__create-button {
    grid-area: create;
    width: 40px;
    padding: 0;
    justify-content: center;
  }

  .workspace-header__create-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
