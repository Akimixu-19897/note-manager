<template>
  <div class="notes-workbench">
    <CategorySidebar
      v-model:category-query="categoryQuery"
      v-model:new-category-name="addTreeData.name"
      :categories="filteredCategories"
      :active-category-id="activeID"
      :note-counts="categoryNoteCounts"
      :is-creating-category="increasing"
      @select-category="handleClick"
      @start-create-category="handleAdd"
      @cancel-create-category="cancelCreateCategory"
      @save-category="saveTreeData"
      @edit-category="editNodeData"
      @delete-category="deleteNodeData"
    />
    <main class="notes-workbench__workspace" aria-label="当前分类便签">
      <WorkspaceHeader
        ref="workspaceHeaderRef"
        v-model:search-query="noteSearchQuery"
        :category-name="activeCategoryName"
        :note-count="activeChildren.length"
        :matched-count="filteredActiveChildren.length"
        @clear-search="clearNoteSearch"
        @create-note="handleAddNote"
      />
      <NoteGrid
        :notes="filteredActiveChildren"
        :total-count="activeChildren.length"
        :has-active-category="Boolean(activeID)"
        :is-searching="Boolean(noteSearchQuery.trim())"
        @create-note="handleAddNote"
        @clear-search="clearNoteSearch"
        @save-note="saveEdgeData"
        @delete-note="deleteEdgeByNote"
        @resize-note="resizeEdgeData"
        @update-note-content="updateNoteContent"
      />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useStore, type TreeEdge } from "@/hooks/store";
import { handleTree } from "@/utils/tools";
import { ElMessageBox } from "element-plus";
import CategorySidebar from "./components/CategorySidebar.vue";
import WorkspaceHeader from "./components/WorkspaceHeader.vue";
import NoteGrid from "./components/NoteGrid.vue";
import {
  filterCategories,
  filterNotesInCategory,
  sortNotesByCreateTime,
} from "./composables/useNoteSearch";
import { useSaveShortcut } from "./composables/useSaveShortcut";
import { emptyTiptapDocument } from "./utils/noteContent";
import type { NoteContentUpdate, NoteItem, ResizeDimensions } from "./types";
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/overlay.scss";
import "element-plus/theme-chalk/src/button.scss";

defineOptions({
  name: "HomeView",
});

const toPersistedEdge = (item: TreeEdge): TreeEdge => {
  const persistedEdge = { ...item };

  delete persistedEdge.clientId;
  delete persistedEdge.saveStatus;
  delete persistedEdge.saveErrorMessage;
  delete persistedEdge.lastSavedAt;

  return persistedEdge;
};

const markNoteSaveState = (
  item: NoteItem,
  saveStatus: NonNullable<NoteItem["saveStatus"]>,
  saveErrorMessage = ""
) => {
  item.saveStatus = saveStatus;
  item.saveErrorMessage = saveErrorMessage;

  if (saveStatus === "saved") {
    item.lastSavedAt = new Date().toLocaleTimeString();
  }
};

// 从indexDB中获取数据
const {
  getTreeData,
  getEdgeData,
  addNode,
  addEdge,
  updateNode,
  updateEdge,
  deleteNode,
  deleteEdge,
} = useStore();

// 树节点数据,从treeData中获取，并保持响应式
const classifyData: any = ref([]);
// note的子数据，从edgeData中获取，并保持响应式
const noteData = ref<TreeEdge[]>([]);
// 树形结构数据
const noteTreeData: any = ref([]);
const categoryQuery = ref("");
const noteSearchQuery = ref("");
const filteredCategories = computed(() =>
  filterCategories(noteTreeData.value, categoryQuery.value)
);
const categoryNoteCounts = computed<Record<string, number>>(() =>
  noteData.value.reduce<Record<string, number>>((counts, note) => {
    const key = String(note.parentId);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {})
);

const getAllData = async () => {
  classifyData.value = [...(await getTreeData())];
  noteData.value = [...(await getEdgeData())];

  // 将树节点数据和note数据进行处理，得到树形结构
  noteTreeData.value = handleTree(
    [...classifyData.value, ...noteData.value],
    "id",
    "parentId",
    "children",
    "0"
  )
    .sort(
      (a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    )
    .map((item) => {
      if (item.children && item.children.length > 0) {
        item.children.sort(
          (a, b) =>
            new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
        );
      }
      return item;
    });
};

const activeID = ref<string | number>(""); // 当前选中的分类ID
const activeChildren = computed<TreeEdge[]>(() =>
  sortNotesByCreateTime(
    noteData.value.filter((note) => note.parentId === activeID.value)
  )
);
const filteredActiveChildren = computed(() =>
  filterNotesInCategory(
    noteData.value,
    activeID.value,
    noteSearchQuery.value
  )
);
const activeCategoryName = computed(
  () =>
    noteTreeData.value.find((item) => item.id == activeID.value)?.name ||
    "未选择分类"
);
const workspaceHeaderRef = ref<InstanceType<typeof WorkspaceHeader> | null>(null);
const isSaveableNote = (note: TreeEdge) =>
  Boolean(note.clientId) ||
  note.saveStatus === "dirty" ||
  note.saveStatus === "failed";

// 点击分类
const handleClick = (item) => {
  if (!item) {
    activeID.value = "";
    return;
  }

  activeID.value = item.id;
};

const increasing = ref(false); // 是否正在添加分类
const addTreeData = ref({ id: 0, name: "", parentId: "0" }); // 添加的分类数据
// 点击添加分类
const handleAdd = () => {
  increasing.value = true;
};
const cancelCreateCategory = () => {
  increasing.value = false;
  addTreeData.value.name = "";
};
// 回车保存分类
const saveTreeData = async () => {
  const name = addTreeData.value.name.trim();

  if (!name) {
    increasing.value = false;
    addTreeData.value.name = "";
    return;
  }

  await addNode({ ...addTreeData.value, name });
  await getAllData();
  increasing.value = false;
  addTreeData.value.name = "";
};

// 编辑分类
const editNodeData = (item) => {
  if (item.isEdit) {
    updateNodeData(item);
    return;
  }

  item.isEdit = true;
};

// 更新分类
const updateNodeData = async (item) => {
  item.name = item.name.trim();

  if (!item.name) {
    item.isEdit = false;
    return;
  }

  await updateNode(item);
  item.isEdit = false;
};

// 删除分类
const deleteNodeData = (category) => {
  const id =
    typeof category === "object" && category !== null ? category.id : category;
  ElMessageBox.confirm("此操作将永久删除该分类, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    showClose: false,
    appendTo: "body",
    type: "warning",
  }).then(async () => {
    await deleteNode(id);
    await getAllData();

    if (noteTreeData.value[0]) {
      handleClick(noteTreeData.value[0]);
      return;
    }

    const defaultNode = await addNode({
      id: 1,
      name: "默认分类",
      parentId: "0",
    });
    await getAllData();
    handleClick(noteTreeData.value.find((item) => item.id === defaultNode.id));
  });
};

// 点击添加便签
const handleAddNote = () => {
  noteSearchQuery.value = "";
  const clientId = createClientNoteId();
  const now = new Date().toLocaleString();

  if (!activeID.value) {
    return;
  }

  noteData.value.push({
    id: clientId,
    clientId,
    parentId: activeID.value,
    content: "",
    contentJson: emptyTiptapDocument(),
    contentFormat: "tiptap-json",
    width: "300px",
    height: "168px",
    createTime: now,
    updateTime: now,
  });
};

const createClientNoteId = () => `client-${crypto.randomUUID()}`;

const updateNoteContent = (item: TreeEdge, update: NoteContentUpdate) => {
  item.content = update.html;
  item.contentJson = update.json;
  item.contentFormat = "tiptap-json";
  markNoteSaveState(item, "dirty");
};

const resizeEdgeData = async (item: TreeEdge, dimensions: ResizeDimensions) => {
  item.width = dimensions.width;
  item.height = dimensions.height;
  await saveEdgeData(item);
};

const saveActiveNotes = async () => {
  const saveableNotes = activeChildren.value.filter(isSaveableNote);

  if (!saveableNotes.length) {
    return;
  }

  await Promise.all(saveableNotes.map((note) => saveEdgeData(note)));
};

// 保存便签
const saveEdgeData = async (item: TreeEdge) => {
  markNoteSaveState(item, "saving");

  try {
    const persistedData = toPersistedEdge(item);

    if (item.clientId) {
      const savedEdge = await addEdge({
        ...persistedData,
        parentId: activeID.value,
      });
      Object.assign(item, savedEdge);
      delete item.clientId;
      markNoteSaveState(item, "saved");
      return;
    }

    await updateEdge(persistedData);
    markNoteSaveState(item, "saved");
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败";
    markNoteSaveState(item, "failed", message);
    throw error;
  }
};

const deleteEdgeData = async (item: TreeEdge) => {
  if (!item.clientId) {
    try {
      await ElMessageBox.confirm("此操作将删除该便签，是否继续？", "删除便签", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        showClose: false,
        appendTo: "body",
        type: "warning",
      });
    } catch {
      return;
    }

    await deleteEdge(item.id);
  }

  const index = noteData.value.findIndex(
    (note) => note === item || (item.id !== "0" && note.id === item.id)
  );

  if (index !== -1) {
    noteData.value.splice(index, 1);
  }
};

const deleteEdgeByNote = async (note: TreeEdge) => {
  await deleteEdgeData(note);
};

const clearNoteSearch = () => {
  noteSearchQuery.value = "";
};

const isEditableShortcutTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]')
  );
};

const { handleSaveShortcut } = useSaveShortcut({
  onSave: saveActiveNotes,
});

const handleWorkspaceShortcut = (event: KeyboardEvent) => {
  if (handleSaveShortcut(event)) {
    return;
  }

  if (
    event.key !== "/" ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    isEditableShortcutTarget(event.target)
  ) {
    return;
  }

  event.preventDefault();
  workspaceHeaderRef.value?.focusSearch();
};

onMounted(async () => {
  window.addEventListener("keydown", handleWorkspaceShortcut, { capture: true });
  await getAllData();

  if (noteTreeData.value[0]) {
    handleClick(noteTreeData.value[0]);
  } else {
    await addNode({
      id: 1,
      name: "默认分类",
      parentId: "0",
    });
    await getAllData();
    handleClick(noteTreeData.value[0]);
  }

});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleWorkspaceShortcut, { capture: true });
});
</script>

<style lang="scss" scoped>
.notes-workbench {
  min-height: 100%;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
  color: var(--text-primary);
  background: var(--surface-app);
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
</style>
