<script setup lang="ts">
import { IconPark } from "@icon-park/vue-next/es/all";
import { ElMessage } from "element-plus";
import NoteEditor from "./NoteEditor.vue";
import { createResizeController } from "../composables/useResizableNote";
import { toPlainText } from "../utils/noteContent";
import { htmlToMarkdown } from "../utils/markdown";
import type { NoteContentUpdate, NoteItem, ResizeDimensions } from "../types";
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/tooltip.scss";

const props = defineProps<{
  note: NoteItem;
}>();

const emit = defineEmits<{
  "update:content": [note: NoteItem, update: NoteContentUpdate];
  save: [note: NoteItem];
  delete: [note: NoteItem];
  resize: [note: NoteItem, dimensions: ResizeDimensions];
}>();

const previewDimensions = ref<ResizeDimensions>({
  width: props.note.width || "300px",
  height: props.note.height || "168px",
});
const cardRef = ref<HTMLElement | null>(null);
const isEditing = ref(false);

const cardStyle = computed(() => ({
  width: previewDimensions.value.width,
  height: previewDimensions.value.height,
}));
const editorHeight = computed(() => `calc(${previewDimensions.value.height} - 48px)`);
const saveStatus = computed(() => props.note.saveStatus || (props.note.clientId ? "dirty" : "saved"));
const saveStateClass = computed(() => `note-card__save-state--${saveStatus.value}`);
const saveStateText = computed(() => {
  if (saveStatus.value === "dirty") return props.note.clientId ? "草稿未保存" : "有未保存修改";
  if (saveStatus.value === "saving") return "正在保存";
  if (saveStatus.value === "failed") return props.note.saveErrorMessage || "保存失败";
  return props.note.lastSavedAt ? `已保存 ${props.note.lastSavedAt}` : "已保存";
});

const updateContent = (update: NoteContentUpdate) => emit("update:content", props.note, update);
const plainText = computed(() => toPlainText(props.note.content));
const noteTitle = computed(() => plainText.value.slice(0, 18) || "未命名便签");
const noteSummary = computed(() => plainText.value.slice(18, 96) || "点击卡片记录想法、命令或调试线索。");

const copyNoteAsMarkdown = async () => {
  const markdown = htmlToMarkdown(props.note.content) || plainText.value;

  if (!markdown) {
    ElMessage.warning("便签内容为空");
    return;
  }

  await navigator.clipboard.writeText(markdown);
  ElMessage.success("已复制 Markdown");
};

const openEditor = () => {
  isEditing.value = true;
};

const resizeController = createResizeController({
  minWidth: 300,
  minHeight: 150,
  onPreview: (dimensions) => {
    previewDimensions.value = dimensions;
  },
  onCommit: (dimensions) => emit("resize", props.note, dimensions),
});

const startResize = (event: PointerEvent) => {
  const card = cardRef.value;
  if (!card) return;
  event.preventDefault();
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  resizeController.start({
    startX: event.clientX,
    startY: event.clientY,
    startWidth: card.offsetWidth,
    startHeight: card.offsetHeight,
  });
};
const moveResize = (event: PointerEvent) => {
  if (event.buttons === 1) resizeController.move({ clientX: event.clientX, clientY: event.clientY });
};
const endResize = (event: PointerEvent) => {
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
  resizeController.end();
};

watch(
  () => [props.note.width, props.note.height],
  ([width, height]) => {
    previewDimensions.value = { width: width || "300px", height: height || "168px" };
  }
);
</script>

<template>
  <article
    ref="cardRef"
    class="note-card"
    :class="{ 'note-card--dirty': saveStatus === 'dirty' }"
    role="listitem"
    :style="cardStyle"
    @click="openEditor"
  >
    <div v-if="!isEditing" class="note-card__summary">
      <h2 class="note-card__title">{{ noteTitle }}</h2>
      <p class="note-card__excerpt">{{ noteSummary }}</p>
    </div>

    <div v-else class="note-card__editor" :style="{ height: editorHeight }" @click.stop>
      <NoteEditor :note="note" auto-focus @change="updateContent" />
    </div>

    <footer class="note-card__footer">
      <span class="note-card__status">
        <span class="note-card__save-state" :class="saveStateClass">{{ saveStateText }}</span>
        <span class="note-card__shortcut-hint" aria-label="可使用 Command 或 Control 加 S 保存">
          ⌘/Ctrl S
        </span>
      </span>
      <div class="note-card__actions">
        <el-tooltip content="保存便签" placement="top" :show-after="250">
          <button
            class="note-card__action"
            type="button"
            aria-label="保存便签"
            @click.stop="emit('save', note)"
          >
            <icon-park type="save" size="18" theme="outline" fill="currentColor" />
          </button>
        </el-tooltip>
        <el-tooltip content="复制为 Markdown" placement="top" :show-after="250">
          <button
            class="note-card__action"
            type="button"
            aria-label="复制便签为 Markdown"
            @click.stop="copyNoteAsMarkdown"
          >
            <icon-park type="copy" size="18" theme="outline" fill="currentColor" />
          </button>
        </el-tooltip>
        <el-tooltip content="删除便签" placement="top" :show-after="250">
          <button
            class="note-card__action note-card__action--danger"
            type="button"
            aria-label="删除便签"
            @click.stop="emit('delete', note)"
          >
            <icon-park type="delete-themes" size="18" theme="outline" fill="currentColor" />
          </button>
        </el-tooltip>
      </div>
    </footer>

    <el-tooltip content="拖拽调整大小" placement="top" :show-after="250">
      <button class="note-card__resize-handle" type="button" aria-label="调整便签大小" @click.stop
        @pointerdown.stop="startResize" @pointermove="moveResize" @pointerup="endResize" @pointercancel="endResize">
        <span aria-hidden="true"></span>
      </button>
    </el-tooltip>
  </article>
</template>

<style lang="scss" scoped>
.note-card {
  position: relative;
  min-width: min(100%, 300px);
  flex: 0 0 auto;
  min-height: 150px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  background: var(--surface-note);
  box-shadow: 0 18px 40px rgba(2, 6, 23, 0.22);
  cursor: text;
}

.note-card--dirty {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--state-dirty) 35%, transparent) inset;
}

.note-card__summary {
  min-height: calc(100% - 48px);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-card__title { margin: 0; color: var(--text-primary); font-size: 15px; line-height: 1.35; }

.note-card__excerpt {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.note-card__editor {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 760px) {
  .note-card { width: 100% !important; }
}

.note-card__footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 44px 0 14px;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-workspace);
}

.note-card__status {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.note-card__save-state {
  min-width: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
}

.note-card__shortcut-hint {
  flex-shrink: 0;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 1px 6px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.4;
  opacity: 0.72;
}

.note-card__save-state--dirty { color: var(--state-dirty); }
.note-card__save-state--saving { color: var(--action-primary-hover); }
.note-card__save-state--saved { color: var(--state-saved); }
.note-card__save-state--failed { color: var(--action-danger); }

.note-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.note-card__action {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.note-card__action:hover,
.note-card__action:focus-visible {
  color: var(--text-primary);
  background: var(--surface-note-hover);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.note-card__action--danger { color: var(--action-danger); }

.note-card__resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 44px;
  height: 44px;
  border: 0;
  padding: 0;
  color: var(--text-muted);
  background: transparent;
  cursor: nwse-resize;
}

.note-card__resize-handle span {
  position: absolute;
  right: 10px;
  bottom: 9px;
  width: 16px;
  height: 16px;
  background:
    linear-gradient(135deg, transparent 44%, currentColor 46%, currentColor 54%, transparent 56%),
    linear-gradient(135deg, transparent 64%, currentColor 66%, currentColor 74%, transparent 76%);
  opacity: 0.9;
}

.note-card__resize-handle:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -4px; }
</style>
