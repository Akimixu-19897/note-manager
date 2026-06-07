# Notes Workbench Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将便签主页重构为已批准的“双栏开发者工作台”：左侧分类、右侧紧凑标题栏搜索、新建便签、便签网格、可见保存状态、删除保护和移动端适配。

**Architecture:** 保留 Vue 3 + Vite + TypeScript + Element Plus + Tailwind + SCSS + TinyMCE。把当前 `src/views/home/index.vue` 拆成页面编排、侧栏、工作区标题、便签网格、便签卡片和可测试 composables；IndexedDB store 的数据库名、表名、版本保持不变，避免丢失用户本地数据。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、TypeScript、Element Plus、Tailwind CSS、SCSS、TinyMCE Vue wrapper、Vitest。

---

## Source References

- Approved spec: `docs/superpowers/specs/2026-06-06-notes-workbench-redesign-design.md`
- Design context: `.impeccable.md`
- Current page: `src/views/home/index.vue`
- Current editor content style: `src/views/home/editor.css`
- Current store: `src/hooks/store.ts`
- Global styles/tokens: `src/assets/styles/index.scss`, `src/assets/styles/light.scss`, `src/assets/styles/dark.scss`

## File Structure

### Create

- `src/views/home/types.ts`
  Shared UI-facing types: category node, note draft, save status, resize dimensions.

- `src/views/home/composables/useNoteSearch.ts`
  Category search and current-category note search helpers.

- `src/views/home/composables/useNoteDraftState.ts`
  Dirty/saving/saved/failed state transitions for note cards.

- `src/views/home/composables/useResizableNote.ts`
  Pointer-based desktop resize state with min dimensions and requestAnimationFrame batching.

- `src/views/home/components/CategorySidebar.vue`
  Product title, new category form, category search, category list, edit/delete controls, local persistence hint.

- `src/views/home/components/WorkspaceHeader.vue`
  Active category name, note count, compact current-category search, match count, new note action.

- `src/views/home/components/NoteGrid.vue`
  Category empty state, search empty state, responsive note grid.

- `src/views/home/components/NoteCard.vue`
  TinyMCE editor wrapper, save/delete actions, save state label, resize handle.

- `src/views/home/composables/useNoteSearch.test.ts`
  Unit tests for category filtering and current-category note filtering.

- `src/views/home/composables/useNoteDraftState.test.ts`
  Unit tests for dirty/saving/saved/failed state transitions.

- `src/views/home/composables/useResizableNote.test.ts`
  Unit tests for min width/height clamping and resize lifecycle.

### Modify

- `src/views/home/index.vue`
  Reduce to orchestration: load IndexedDB data, derive active category and filtered notes, pass props/events to components.

- `src/views/home/editor.css`
  Align TinyMCE content colors and spacing with semantic tokens.

- `src/assets/styles/index.scss`
  Add semantic design tokens and workbench base styles. Remove or narrow unsafe global overrides such as `.el-overlay { position: relative; }`.

- `src/assets/styles/dark.scss`
  Fix `$bg-color.page` from `#ff0` to the dark page surface.

### Do Not Change

- `dbName`, `storeName`, `edgeStoreName`, and IndexedDB version in `src/hooks/store.ts`.
- TinyMCE local asset base path `/tinymce`.
- Router shape unless the redesign explicitly needs routes, which it does not.

---

## Task 1: Shared Types and Search Composable

**Files:**
- Create: `src/views/home/types.ts`
- Create: `src/views/home/composables/useNoteSearch.ts`
- Create: `src/views/home/composables/useNoteSearch.test.ts`

- [ ] **Step 1: Create shared types**

Create `src/views/home/types.ts`:

```ts
export interface CategoryNode {
  id: string | number;
  parentId: string | number;
  name: string;
  createTime?: string;
  updateTime?: string;
  children?: NoteItem[];
}

export interface NoteItem {
  id: string | number;
  clientId?: string;
  parentId: string | number;
  content: string;
  width?: string;
  height?: string;
  createTime?: string;
  updateTime?: string;
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
```

- [ ] **Step 2: Write search tests**

Create `src/views/home/composables/useNoteSearch.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { filterCategories, filterNotesInCategory } from "./useNoteSearch";
import type { CategoryNode, NoteItem } from "../types";

const categories: CategoryNode[] = [
  { id: "cat-1", parentId: "0", name: "项目备忘" },
  { id: "cat-2", parentId: "0", name: "代码片段" },
  { id: "cat-3", parentId: "0", name: "临时收集" },
];

const notes: NoteItem[] = [
  { id: "note-1", parentId: "cat-1", content: "API 调试记录 curl token" },
  { id: "note-2", parentId: "cat-1", content: "部署命令 pnpm build" },
  { id: "note-3", parentId: "cat-2", content: "Vue ref shallowRef markRaw" },
];

describe("useNoteSearch", () => {
  it("filters categories by category name only", () => {
    expect(filterCategories(categories, "代码")).toEqual([categories[1]]);
  });

  it("returns all categories when category query is blank", () => {
    expect(filterCategories(categories, "   ")).toEqual(categories);
  });

  it("filters notes only inside the active category", () => {
    expect(filterNotesInCategory(notes, "cat-1", "pnpm")).toEqual([notes[1]]);
  });

  it("does not return matches from other categories", () => {
    expect(filterNotesInCategory(notes, "cat-1", "Vue")).toEqual([]);
  });

  it("returns all active category notes when note query is blank", () => {
    expect(filterNotesInCategory(notes, "cat-1", "")).toEqual([notes[0], notes[1]]);
  });
});
```

- [ ] **Step 3: Run search tests and observe failure**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useNoteSearch.test.ts
```

Expected: failure because `useNoteSearch.ts` does not exist yet.

- [ ] **Step 4: Implement search helpers**

Create `src/views/home/composables/useNoteSearch.ts`:

```ts
import type { CategoryNode, NoteItem } from "../types";

const normalizeQuery = (query: string) => query.trim().toLocaleLowerCase();

export function filterCategories(
  categories: CategoryNode[],
  query: string
): CategoryNode[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return categories;
  }

  return categories.filter((category) =>
    category.name.toLocaleLowerCase().includes(normalizedQuery)
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
    note.content.toLocaleLowerCase().includes(normalizedQuery)
  );
}
```

- [ ] **Step 5: Verify search tests pass**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useNoteSearch.test.ts
```

Expected: all tests pass.

---

## Task 2: Draft State Composable

**Files:**
- Create: `src/views/home/composables/useNoteDraftState.ts`
- Create: `src/views/home/composables/useNoteDraftState.test.ts`

- [ ] **Step 1: Write draft state tests**

Create `src/views/home/composables/useNoteDraftState.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createNoteDraftState } from "./useNoteDraftState";

describe("createNoteDraftState", () => {
  it("starts idle", () => {
    const state = createNoteDraftState();

    expect(state.value.status).toBe("idle");
    expect(state.value.errorMessage).toBe("");
    expect(state.value.lastSavedAt).toBe("");
  });

  it("marks dirty when content changes", () => {
    const state = createNoteDraftState();

    state.markDirty();

    expect(state.value.status).toBe("dirty");
  });

  it("moves through saving and saved states", () => {
    const state = createNoteDraftState();

    state.markSaving();
    expect(state.value.status).toBe("saving");

    state.markSaved("刚刚");
    expect(state.value.status).toBe("saved");
    expect(state.value.lastSavedAt).toBe("刚刚");
    expect(state.value.errorMessage).toBe("");
  });

  it("stores failure message", () => {
    const state = createNoteDraftState();

    state.markFailed("保存失败");

    expect(state.value.status).toBe("failed");
    expect(state.value.errorMessage).toBe("保存失败");
  });
});
```

- [ ] **Step 2: Run draft state tests and observe failure**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useNoteDraftState.test.ts
```

Expected: failure because `useNoteDraftState.ts` does not exist yet.

- [ ] **Step 3: Implement draft state composable**

Create `src/views/home/composables/useNoteDraftState.ts`:

```ts
import { ref } from "vue";
import type { NoteDraftState } from "../types";

export function createNoteDraftState() {
  const value = ref<NoteDraftState>({
    status: "idle",
    errorMessage: "",
    lastSavedAt: "",
  });

  const markDirty = () => {
    value.value = {
      ...value.value,
      status: "dirty",
      errorMessage: "",
    };
  };

  const markSaving = () => {
    value.value = {
      ...value.value,
      status: "saving",
      errorMessage: "",
    };
  };

  const markSaved = (lastSavedAt: string) => {
    value.value = {
      status: "saved",
      errorMessage: "",
      lastSavedAt,
    };
  };

  const markFailed = (errorMessage: string) => {
    value.value = {
      ...value.value,
      status: "failed",
      errorMessage,
    };
  };

  return {
    value,
    markDirty,
    markSaving,
    markSaved,
    markFailed,
  };
}
```

- [ ] **Step 4: Verify draft state tests pass**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useNoteDraftState.test.ts
```

Expected: all tests pass.

---

## Task 3: Resizable Note Composable

**Files:**
- Create: `src/views/home/composables/useResizableNote.ts`
- Create: `src/views/home/composables/useResizableNote.test.ts`

- [ ] **Step 1: Write resize tests**

Create `src/views/home/composables/useResizableNote.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { calculateResizedDimensions, createResizeController } from "./useResizableNote";

describe("calculateResizedDimensions", () => {
  it("adds deltas to starting dimensions", () => {
    expect(
      calculateResizedDimensions({
        startWidth: 400,
        startHeight: 480,
        deltaX: 40,
        deltaY: 20,
        minWidth: 300,
        minHeight: 300,
      })
    ).toEqual({ width: "440px", height: "500px" });
  });

  it("clamps to minimum dimensions", () => {
    expect(
      calculateResizedDimensions({
        startWidth: 320,
        startHeight: 320,
        deltaX: -100,
        deltaY: -80,
        minWidth: 300,
        minHeight: 300,
      })
    ).toEqual({ width: "300px", height: "300px" });
  });
});

describe("createResizeController", () => {
  it("calls commit with the final dimensions", () => {
    const commit = vi.fn();
    const controller = createResizeController({
      minWidth: 300,
      minHeight: 300,
      onPreview: vi.fn(),
      onCommit: commit,
    });

    controller.start({ startX: 10, startY: 10, startWidth: 400, startHeight: 480 });
    controller.move({ clientX: 60, clientY: 40 });
    controller.end();

    expect(commit).toHaveBeenCalledWith({ width: "450px", height: "510px" });
  });
});
```

- [ ] **Step 2: Run resize tests and observe failure**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useResizableNote.test.ts
```

Expected: failure because `useResizableNote.ts` does not exist yet.

- [ ] **Step 3: Implement resize logic**

Create `src/views/home/composables/useResizableNote.ts`:

```ts
import type { ResizeDimensions } from "../types";

interface CalculateResizeInput {
  startWidth: number;
  startHeight: number;
  deltaX: number;
  deltaY: number;
  minWidth: number;
  minHeight: number;
}

interface ResizeStartInput {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

interface ResizeMoveInput {
  clientX: number;
  clientY: number;
}

interface ResizeControllerOptions {
  minWidth: number;
  minHeight: number;
  onPreview: (dimensions: ResizeDimensions) => void;
  onCommit: (dimensions: ResizeDimensions) => void;
}

export function calculateResizedDimensions({
  startWidth,
  startHeight,
  deltaX,
  deltaY,
  minWidth,
  minHeight,
}: CalculateResizeInput): ResizeDimensions {
  const nextWidth = Math.max(minWidth, startWidth + deltaX);
  const nextHeight = Math.max(minHeight, startHeight + deltaY);

  return {
    width: `${nextWidth}px`,
    height: `${nextHeight}px`,
  };
}

export function createResizeController(options: ResizeControllerOptions) {
  let startState: ResizeStartInput | undefined;
  let latestDimensions: ResizeDimensions | undefined;
  let animationFrame = 0;

  const preview = (dimensions: ResizeDimensions) => {
    latestDimensions = dimensions;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = requestAnimationFrame(() => {
      options.onPreview(dimensions);
      animationFrame = 0;
    });
  };

  const start = (input: ResizeStartInput) => {
    startState = input;
    latestDimensions = {
      width: `${input.startWidth}px`,
      height: `${input.startHeight}px`,
    };
  };

  const move = (input: ResizeMoveInput) => {
    if (!startState) {
      return;
    }

    preview(
      calculateResizedDimensions({
        startWidth: startState.startWidth,
        startHeight: startState.startHeight,
        deltaX: input.clientX - startState.startX,
        deltaY: input.clientY - startState.startY,
        minWidth: options.minWidth,
        minHeight: options.minHeight,
      })
    );
  };

  const end = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    if (latestDimensions) {
      options.onCommit(latestDimensions);
    }

    startState = undefined;
    latestDimensions = undefined;
  };

  return { start, move, end };
}
```

- [ ] **Step 4: Verify resize tests pass**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useResizableNote.test.ts
```

Expected: all tests pass.

---

## Task 4: Semantic Tokens and Theme Cleanup

**Files:**
- Modify: `src/assets/styles/index.scss`
- Modify: `src/assets/styles/dark.scss`
- Modify: `src/views/home/editor.css`

- [ ] **Step 1: Add semantic tokens**

Modify `src/assets/styles/index.scss` so `:root` contains semantic workbench tokens. Preserve existing tokens during migration to avoid breaking nearby code:

```scss
:root {
  --primary-100: #0085ff;
  --primary-200: #69b4ff;
  --primary-300: #e0ffff;
  --accent-100: #006fff;
  --accent-200: #e1ffff;
  --text-100: #ffffff;
  --text-200: #9e9e9e;
  --bg-100: #1e1e1e;
  --bg-200: #2d2d2d;
  --bg-300: #454545;

  --surface-app: #0f1724;
  --surface-sidebar: #0a111c;
  --surface-workspace: #111a29;
  --surface-note: #182235;
  --surface-note-hover: #1d2a3d;
  --border-subtle: #233044;
  --border-strong: #32445d;
  --text-primary: #eef5ff;
  --text-secondary: #b4c3d6;
  --text-muted: #7f91a8;
  --action-primary: #4f9cff;
  --action-primary-hover: #76b4ff;
  --action-danger: #ff6b7a;
  --state-dirty: #d7a25a;
  --state-saved: #7ccf91;
  --focus-ring: #8fc5ff;
}
```

- [ ] **Step 2: Remove unsafe overlay override**

In `src/assets/styles/index.scss`, delete the global override:

```scss
.el-overlay {
  position: relative;
}
```

Do not replace it globally. If a later component needs scoped overlay behavior, add that behavior near the component.

- [ ] **Step 3: Fix dark theme page background**

Modify `src/assets/styles/dark.scss` so `$bg-color.page` is not yellow:

```scss
$bg-color: (
  ('': #041933, 'page': #0f1724, 'overlay': #0b2648)
),
```

- [ ] **Step 4: Align editor content CSS**

Modify `src/views/home/editor.css` to use app-aligned colors while keeping TinyMCE content readable:

```css
body {
  height: 100%;
  background-color: #182235;
  color: #eef5ff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.5;
  margin: 1rem;
}

a {
  color: #76b4ff;
}
```

Keep table, figure, code, and scrollbar rules, but replace pure hard-coded whites/grays only where they visibly conflict with the new workbench palette.

- [ ] **Step 5: Verify typecheck/build after style changes**

Run:

```bash
volta run npm run build
```

Expected: Vue typecheck and Vite build complete successfully.

---

## Task 5: CategorySidebar Component

**Files:**
- Create: `src/views/home/components/CategorySidebar.vue`
- Modify: `src/views/home/index.vue`

- [ ] **Step 1: Create CategorySidebar component**

Create `src/views/home/components/CategorySidebar.vue` with this public contract:

```vue
<script setup lang="ts">
import type { CategoryNode } from "../types";

const props = defineProps<{
  categories: CategoryNode[];
  activeCategoryId: string | number;
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
</script>
```

Template requirements:

- Use `<aside class="category-sidebar" aria-label="便签分类">`.
- Use `<button type="button">新分类</button>` for creation.
- Use `<input aria-label="搜索分类" placeholder="搜索分类">` for category search.
- Render categories as buttons, not clickable divs.
- Each category row exposes edit and delete buttons with accessible labels.
- Edit/delete can be visually low-emphasis but must be reachable by keyboard focus.

- [ ] **Step 2: Move category UI from HomeView into CategorySidebar**

In `src/views/home/index.vue`, remove the old classification template block and replace it with:

```vue
<CategorySidebar
  v-model:category-query="categoryQuery"
  v-model:new-category-name="addTreeData.name"
  :categories="filteredCategories"
  :active-category-id="activeID"
  :is-creating-category="increasing"
  @select-category="handleClick"
  @start-create-category="handleAdd"
  @cancel-create-category="cancelCreateCategory"
  @save-category="saveTreeData"
  @edit-category="editNodeData"
  @delete-category="deleteNodeData"
/>
```

Add a `cancelCreateCategory` function in `index.vue`:

```ts
const cancelCreateCategory = () => {
  increasing.value = false;
  addTreeData.value.name = "";
};
```

- [ ] **Step 3: Wire category filtering**

Import `filterCategories` and create computed state:

```ts
import { filterCategories } from "./composables/useNoteSearch";

const categoryQuery = ref("");
const filteredCategories = computed(() =>
  filterCategories(noteTreeData.value, categoryQuery.value)
);
```

- [ ] **Step 4: Verify the page still builds**

Run:

```bash
volta run npm run build
```

Expected: build succeeds and no unused imports remain.

---

## Task 6: WorkspaceHeader and Current-Category Search

**Files:**
- Create: `src/views/home/components/WorkspaceHeader.vue`
- Modify: `src/views/home/index.vue`

- [ ] **Step 1: Create WorkspaceHeader component**

Create `src/views/home/components/WorkspaceHeader.vue` with this public contract:

```vue
<script setup lang="ts">
const props = defineProps<{
  categoryName: string;
  noteCount: number;
  matchedCount: number;
  searchQuery: string;
}>();

const emit = defineEmits<{
  "update:searchQuery": [value: string];
  createNote: [];
  clearSearch: [];
}>();
</script>
```

Template requirements:

- Use `<header class="workspace-header">`.
- Show active category name and total note count.
- Search input stays in the same header row on desktop.
- Search input label: `aria-label="搜索当前分类便签"`.
- Show match count only when search is non-empty.
- Use a real button for `新建便签`.
- Add key handling so `Escape` clears search when the input is focused.

- [ ] **Step 2: Add workspace search state**

In `src/views/home/index.vue`, add:

```ts
const noteSearchQuery = ref("");

const activeCategoryName = computed(() => {
  const category = noteTreeData.value.find((item) => item.id === activeID.value);
  return category?.name || "未选择分类";
});

const filteredActiveChildren = computed(() =>
  filterNotesInCategory(noteData.value, activeID.value, noteSearchQuery.value)
);

const clearNoteSearch = () => {
  noteSearchQuery.value = "";
};
```

Use `activeChildren` only as the raw active category child list until Task 7 replaces grid rendering.

- [ ] **Step 3: Add slash shortcut**

In `index.vue`, register a document keydown listener on mount and clean it up on unmount:

```ts
const workspaceSearchInput = ref<HTMLInputElement | null>(null);

const focusWorkspaceSearch = (event: KeyboardEvent) => {
  if (event.key !== "/") {
    return;
  }

  const target = event.target as HTMLElement | null;
  if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
    return;
  }

  event.preventDefault();
  workspaceSearchInput.value?.focus();
};

onMounted(() => {
  document.addEventListener("keydown", focusWorkspaceSearch);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", focusWorkspaceSearch);
});
```

If the search input lives inside `WorkspaceHeader`, expose focus via component ref or pass a boolean prop/event in the implementation plan execution. Keep the public behavior: `/` focuses current-category search.

- [ ] **Step 4: Verify search tests still pass**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useNoteSearch.test.ts
```

Expected: all search tests pass.

---

## Task 7: NoteGrid and Empty States

**Files:**
- Create: `src/views/home/components/NoteGrid.vue`
- Modify: `src/views/home/index.vue`

- [ ] **Step 1: Create NoteGrid component**

Create `src/views/home/components/NoteGrid.vue` with this public contract:

```vue
<script setup lang="ts">
import type { NoteItem } from "../types";

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
  resizeNote: [note: NoteItem];
}>();
</script>
```

Template requirements:

- If there is no active category, show a calm first-run state.
- If active category has no notes and not searching, show category empty state with `新建便签` button.
- If searching and no matches, show `没有匹配便签` with `清空搜索` button.
- Otherwise render a responsive note grid.

- [ ] **Step 2: Replace old empty state and inline note loop**

In `index.vue`, replace the current `notes_box` empty state and `v-for` block with `NoteGrid`:

```vue
<NoteGrid
  :notes="filteredActiveChildren"
  :total-count="activeChildren.length"
  :has-active-category="Boolean(activeID)"
  :is-searching="Boolean(noteSearchQuery.trim())"
  @create-note="handleAddNote"
  @clear-search="clearNoteSearch"
  @save-note="saveEdgeData"
  @delete-note="deleteEdgeByNote"
  @resize-note="saveEdgeData"
/>
```

Add `deleteEdgeByNote`:

```ts
const deleteEdgeByNote = async (note: TreeEdge) => {
  const index = activeChildren.value.findIndex((item) => item.id === note.id);

  if (index >= 0) {
    await deleteEdgeData(index);
  }
};
```

- [ ] **Step 3: Verify build**

Run:

```bash
volta run npm run build
```

Expected: build succeeds.

---

## Task 8: NoteCard, Save State, Delete Protection

**Files:**
- Create: `src/views/home/components/NoteCard.vue`
- Modify: `src/views/home/components/NoteGrid.vue`
- Modify: `src/views/home/index.vue`

- [ ] **Step 1: Create NoteCard component**

Create `src/views/home/components/NoteCard.vue` with this public contract:

```vue
<script setup lang="ts">
import type { NoteItem, ResizeDimensions } from "../types";

const props = defineProps<{
  note: NoteItem;
  editorKey: string;
  mounted: boolean;
}>();

const emit = defineEmits<{
  "update:content": [note: NoteItem, content: string];
  save: [note: NoteItem];
  delete: [note: NoteItem];
  resize: [note: NoteItem, dimensions: ResizeDimensions];
}>();
</script>
```

Template requirements:

- Card root is `<article class="note-card">`.
- TinyMCE editor remains local and receives the existing editor config shape without `selector`.
- Footer contains visible save state text and real buttons for save/delete.
- Delete button has `aria-label="删除便签"` and danger styling.
- Resize handle is a real button or pointer target with `aria-label="调整便签大小"` and at least 44×44px hit area.

- [ ] **Step 2: Remove TinyMCE selector use**

In `index.vue`, change `getEditorConfig` so it does not set `selector`:

```ts
const getEditorConfig = (id: string | number, height?: string) => ({
  ...editorConfig,
  height: height ? `calc(${height} - 44px)` : "450px",
  setup: (editor: any) => {
    editor.on("init", () => {
      editorInstances.value.set(id, editor);
    });
  },
});
```

- [ ] **Step 3: Add unique client id for unsaved notes**

In `handleAddNote`, replace hard-coded `id: "0"` with a unique client id while preserving persisted save behavior:

```ts
const createClientNoteId = () => `client-${crypto.randomUUID()}`;

const handleAddNote = () => {
  activeChildren.value.push({
    id: createClientNoteId(),
    clientId: createClientNoteId(),
    parentId: activeID.value,
    content: "",
    width: "400px",
    height: "480px",
  });
};
```

Then update `saveEdgeData` to treat notes with `clientId` as new persisted notes:

```ts
if (data.clientId) {
  const savedEdge = await addEdge({
    ...data,
    id: data.clientId,
    parentId: activeID.value,
  });
  delete savedEdge.clientId;
  Object.assign(item, savedEdge);
  return;
}
```

When implementing, ensure `clientId` is not written permanently to IndexedDB if the store should keep persisted records clean.

- [ ] **Step 4: Protect note deletion**

Change `deleteEdgeData` to confirm persisted note deletion using Element Plus, matching category deletion behavior:

```ts
const deleteEdgeData = async (index: number) => {
  const activeNote = activeChildren.value[index];

  if (!activeNote) {
    return;
  }

  if (activeNote.clientId) {
    activeChildren.value.splice(index, 1);
    return;
  }

  await ElMessageBox.confirm("此操作将删除该便签，是否继续？", "删除便签", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    showClose: false,
    appendTo: "body",
    type: "warning",
  });

  await deleteEdge(activeNote.id);
  activeChildren.value.splice(index, 1);
};
```

- [ ] **Step 5: Verify build**

Run:

```bash
volta run npm run build
```

Expected: build succeeds and TypeScript accepts the note model updates.

---

## Task 9: Page Composition and Responsive Styling

**Files:**
- Modify: `src/views/home/index.vue`
- Modify: `src/views/home/components/CategorySidebar.vue`
- Modify: `src/views/home/components/WorkspaceHeader.vue`
- Modify: `src/views/home/components/NoteGrid.vue`
- Modify: `src/views/home/components/NoteCard.vue`
- Modify: `src/layouts/BasicLayout.vue`

- [ ] **Step 1: Convert HomeView layout to workbench shell**

In `index.vue`, replace root classes with semantic shell classes:

```vue
<template>
  <div class="notes-workbench">
    <CategorySidebar ... />
    <main class="notes-workbench__workspace" aria-label="当前分类便签">
      <WorkspaceHeader ... />
      <NoteGrid ... />
    </main>
  </div>
</template>
```

- [ ] **Step 2: Add scoped workbench layout styles**

In `index.vue` scoped style:

```scss
.notes-workbench {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 14px;
  min-height: 100%;
  padding: 16px;
  background: var(--surface-app);
  color: var(--text-primary);
}

.notes-workbench__workspace {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
}

@media (max-width: 760px) {
  .notes-workbench {
    grid-template-columns: 1fr;
    padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
  }
}
```

- [ ] **Step 3: Update BasicLayout viewport handling**

Modify `src/layouts/BasicLayout.vue`:

```scss
.basic-layout {
  min-height: 100dvh;
  overflow: auto;
  background-color: var(--surface-app, var(--bg-100));
}
```

- [ ] **Step 4: Ensure component styles use tokens**

Each component should use semantic tokens such as:

```scss
background: var(--surface-sidebar);
border: 1px solid var(--border-subtle);
color: var(--text-primary);
outline-color: var(--focus-ring);
```

Avoid new `#ffffff`, `#454545`, `#0085ff`, or arbitrary Tailwind color values in the redesigned components.

- [ ] **Step 5: Verify mobile width manually in CSS**

Check these conditions in code:

- no fixed horizontal combination that exceeds 320px;
- note card width can shrink to container;
- workspace header can wrap or collapse search below 760px;
- no hover-only control is the only path to an action.

- [ ] **Step 6: Verify build**

Run:

```bash
volta run npm run build
```

Expected: build succeeds.

---

## Task 10: Cleanup, Focus States, and Final Verification

**Files:**
- Modify: all files touched above as needed.

- [ ] **Step 1: Remove obsolete inline classes and dead scoped CSS**

In `src/views/home/index.vue`, remove old classes and styles that are replaced by components:

- `.classify_item`
- `.note-item`
- `.resize-handle`
- old fixed FAB classes
- old empty-state markup

- [ ] **Step 2: Add shared focus-visible behavior**

In component scoped styles or a small shared selector in `index.scss`, ensure buttons and inputs have visible focus:

```scss
button:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

Keep selector scope narrow enough not to fight Element Plus internals unexpectedly.

- [ ] **Step 3: Run targeted unit tests**

Run:

```bash
volta run npm run test:unit -- src/views/home/composables/useNoteSearch.test.ts src/views/home/composables/useNoteDraftState.test.ts src/views/home/composables/useResizableNote.test.ts src/utils/tools.test.ts
```

Expected: all targeted tests pass.

- [ ] **Step 4: Run production build**

Run:

```bash
volta run npm run build
```

Expected: Vue typecheck and Vite build complete successfully.

- [ ] **Step 5: Manual browser smoke test**

Run the dev server:

```bash
volta run npm run dev
```

Open the local URL and verify:

- first run creates or shows default category;
- create category works;
- category search filters category names;
- create note works;
- current-category search filters only active category notes;
- note save shows a visible saved state;
- delete persisted note requires confirmation;
- keyboard Tab reaches category, search, new note, save, delete;
- `/` focuses current-category search;
- `Esc` clears current-category search;
- viewport at 320px does not horizontally overflow.

---

## Implementation Order

1. Task 1: shared types and search.
2. Task 2: draft state.
3. Task 3: resize logic.
4. Task 4: tokens and theme cleanup.
5. Task 5: sidebar.
6. Task 6: workspace header and compact search.
7. Task 7: grid and empty states.
8. Task 8: note card, save state, delete protection.
9. Task 9: responsive shell and styling.
10. Task 10: cleanup and verification.

## Risks

- TinyMCE wrapper may not need or tolerate low-level selector usage; remove selector first and verify editor mounting.
- Existing IndexedDB records may not contain `clientId`; all persisted logic must treat absence of `clientId` as persisted data.
- Component splitting can create stale active children if `activeChildren` and `noteData` diverge. Prefer deriving filtered notes from the latest `noteData` and active category id.
- Element Plus global overlay override removal may reveal the original issue that caused it. Fix locally if it appears.

## Final Acceptance

The redesign is complete when:

- `volta run npm run test:unit -- src/views/home/composables/useNoteSearch.test.ts src/views/home/composables/useNoteDraftState.test.ts src/views/home/composables/useResizableNote.test.ts src/utils/tools.test.ts` passes.
- `volta run npm run build` passes.
- Manual smoke test confirms the approved UX: sidebar category search, compact workspace note search, note creation, save state, deletion protection, keyboard access, and no mobile horizontal overflow.
