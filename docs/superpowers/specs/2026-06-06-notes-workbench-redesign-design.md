# Notes Workbench Redesign Design Spec

## Goal
把当前网页便签项目从“能用的深色便签页”重设计为面向知识工作者 / 开发者的安静、高效、本地优先笔记工作台。

## Context

### Target Users
知识工作者 / 开发者。典型内容包括技术笔记、代码片段、命令、链接、项目备忘、排查结论和临时想法。

### Core Scenario
混合工作台：快速记录 + 分类整理 + 日后检索。用户既需要马上写下一条便签，也需要稍后在分类内快速找回内容。

### Visual Direction
开发者工具感，保持安静专注。界面应紧凑、有秩序、低噪声，避免营销感、霓虹发光、玻璃拟态和装饰性过强的便签墙。

## Approved Direction
采用“双栏开发者工作台”。

- 左侧：大分类栏，负责分类创建、分类搜索、分类编辑/删除、分类计数。
- 右侧：当前分类工作区，负责当前分类标题、当前分类内搜索、新建便签、便签网格、保存状态和便签操作。
- 桌面端：双栏 + 便签网格。
- 窄屏端：分类折叠为抽屉或顶部切换，便签单列显示。

## Information Architecture

```text
App Shell
├─ Sidebar
│  ├─ Product title: Notes
│  ├─ New category action
│  ├─ Category search
│  ├─ Category list
│  │  ├─ Category name
│  │  ├─ Note count
│  │  └─ Edit/Delete actions
│  └─ Local persistence status
└─ Workspace
   ├─ Compact header
   │  ├─ Active category name
   │  ├─ Note count
   │  ├─ Current-category note search
   │  ├─ Match count
   │  └─ New note action
   ├─ Search empty state
   ├─ Category empty state
   └─ Note grid
      └─ Note card
         ├─ Editor/content preview
         ├─ Save state
         ├─ Save action
         ├─ Delete action
         └─ Resize handle on desktop
```

## Layout Requirements

### Desktop
- Sidebar width around 240–260px.
- Workspace header is a single compact row:
  - left: active category name + total note count;
  - center: current-category search input + match count;
  - right: New note button.
- Search must not consume a standalone row on desktop.
- Note area uses responsive grid with content-driven columns, e.g. `repeat(auto-fit, minmax(...))`.
- Note cards must preserve readable content width and avoid stretching to unreadable line lengths.

### Tablet / Narrow Viewport
- Sidebar may collapse into a drawer or top category switcher.
- Workspace header may wrap into two rows only when there is insufficient width.
- Current-category search may collapse to a search icon button, expanding into a full-width row after activation.

### Mobile
- Single-column note list.
- Primary action stays reachable in thumb zone without covering content.
- Touch targets must be at least 44×44px.
- Hover-only interactions are not allowed as the only path.

## Search Model

### Sidebar Search
- Scope: categories only.
- Placeholder: `搜索分类`.
- It filters category names and should not search note body content.

### Workspace Search
- Scope: notes in the currently active category only.
- Placement: compact workspace header, not a separate row on desktop.
- Placeholder: `搜索当前分类便签 /` or `在「分类名」内搜索`.
- Match feedback: show `匹配数 / 总数`, e.g. `3 / 12`.
- Empty state: when no note matches, show a small inline empty state with `没有匹配便签` and an action to clear search.
- Keyboard:
  - `/` focuses workspace search on desktop.
  - `Esc` clears workspace search when focused.

## Note Card Requirements

Each note card should make these states visible:

- unsaved / dirty;
- saving;
- saved with last saved time or relative status;
- save failed;
- delete pending / undo available.

Actions:
- `保存` must be explicit or clearly represented with accessible label.
- `删除` must not silently destroy persisted content. Use confirmation, undo, or soft delete.
- Resize is desktop-only by default and must have a visible low-emphasis handle with a larger hit area than the icon itself.

## Accessibility Requirements

- All interactive controls must be real `button`, `input`, or appropriate Element Plus components.
- Icon-only controls require accessible names such as `aria-label="删除便签"`.
- Decorative icons should be hidden from assistive technology.
- Focus state must be visible with `:focus-visible`.
- Core tasks must work with keyboard:
  - select category;
  - create category;
  - search category;
  - search notes in current category;
  - create note;
  - save note;
  - delete note;
  - cancel or confirm destructive actions.

## State Requirements

Required states:

- first run with no category;
- category exists but has no notes;
- current search has no matches;
- loading IndexedDB data;
- IndexedDB read/write failure;
- note has unsaved changes;
- save succeeds;
- save fails;
- delete confirmation or undo;
- TinyMCE editor loading.

## Visual System Requirements

- Use semantic CSS variables as the single source of truth for page, Element Plus, and TinyMCE-adjacent UI.
- Avoid hard-coded colors inside Vue templates except temporary one-off migration work.
- Avoid pure white separators on dark backgrounds.
- Avoid decorative glow, glassmorphism, gradient text, and generic neon AI palette.
- Keep density efficient but readable.
- The visual hierarchy should be:
  1. active category and search;
  2. note content;
  3. save/dirty state;
  4. secondary actions.

Suggested semantic tokens:

```css
--surface-app
--surface-sidebar
--surface-workspace
--surface-note
--surface-note-hover
--border-subtle
--border-strong
--text-primary
--text-secondary
--text-muted
--action-primary
--action-primary-hover
--action-danger
--state-dirty
--state-saved
--focus-ring
```

## Implementation Boundaries

The current `src/views/home/index.vue` combines data orchestration, TinyMCE configuration, sidebar UI, note grid UI, actions, and resize behavior. The redesign should split responsibilities enough to keep files maintainable.

Recommended units:

- `HomeView`: page orchestration and data loading.
- `CategorySidebar`: category list, category search, create/edit/delete category.
- `WorkspaceHeader`: active category title, current-category search, match count, create note.
- `NoteGrid`: filtered notes and empty states.
- `NoteCard`: editor, save/delete controls, dirty/saved state, resize affordance.
- `useNoteSearch`: current-category filtering.
- `useNoteDraftState`: dirty/saving/saved/failed state.
- `useResizableNote`: pointer-based desktop resizing.

## Out of Scope for First Redesign

- Full global search across all categories.
- Tags.
- Sync or multi-device accounts.
- Collaboration.
- Markdown editor replacement.
- Advanced command palette.

These may be added later, but the first redesign should make the current local categorized notes experience excellent.

## Acceptance Criteria

- Desktop shows sidebar and workspace in one screen without a separate search row.
- Current-category search filters notes in the active category and shows match count.
- Sidebar search filters categories only.
- Core actions are reachable by mouse, keyboard, and touch.
- Mobile layout does not horizontally overflow at 320px.
- Persisted note deletion is protected by confirmation, undo, or soft delete.
- User can see whether each edited note is unsaved, saving, saved, or failed.
- Theme colors come from semantic tokens rather than scattered hard-coded values.
- TinyMCE editor still uses local assets and supports the revised layout.
