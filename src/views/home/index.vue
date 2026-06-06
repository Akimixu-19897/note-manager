<template>
  <div class="container_box w-full h-full flex items-stretch gap-[20px]">
    <div class="classify_box w-[200px]">
      <div
        class="classify_item py-2 text-center cursor-pointer flex items-center justify-between"
        v-for="item in noteTreeData"
        :key="item.id"
        :class="activeID == item.id ? ' text-[#ffffff]' : ''"
        @click="handleClick(item)"
      >
        <div class="flex items-center gap-[10px]">
          <div
            class="w-[40px] h-[40px] flex items-center justify-center"
            :class="
              activeID == item.id
                ? ' bg-[var(--primary-100)] text-[#ffffff] rounded-xl'
                : ''
            "
          >
            <icon-park
              v-show="activeID != item.id"
              type="category-management"
              size="24"
              theme="outline"
              fill="#454545"
            />
            <icon-park
              v-show="activeID == item.id"
              type="category-management"
              size="24"
              theme="outline"
              fill="#ffffff"
            />
          </div>
          <div
            class="hover:text-[#ffffff]"
            :class="{
              'text-[#ffffff]': activeID == item.id,
              'text-[var(--text-200)]': activeID != item.id,
            }"
          >
            <span v-show="!item.isEdit">{{ item.name }}</span>
            <div v-show="item.isEdit">
              <el-input
                v-model="item.name"
                @keydown.enter="updateNodeData(item)"
              ></el-input>
            </div>
          </div>
        </div>
        <div class="delete_icon gap-3" :class="item.isEdit ? 'noVisible' : ''">
          <icon-park
            type="edit"
            size="12"
            theme="outline"
            fill="#ffffff"
            @click.stop="editNodeData(item)"
          />
          <icon-park
            type="close"
            size="12"
            theme="outline"
            fill="#ffffff"
            @click.stop="deleteNodeData(item.id)"
          />
        </div>
      </div>
      <!-- 新增的按钮 -->
      <el-popover
        placement="top-start"
        :width="200"
        trigger="hover"
        content="新增分类，分类名称填写好后回车"
      >
        <template #reference>
          <div
            class="add_btn w-[60px] h-[60px] rounded-full bg-[#454545] hover:bg-[#0085ff] flex items-center justify-center fixed bottom-4 left-4 cursor-pointer"
            @click="handleAdd"
          >
            <icon-park
              type="other"
              size="28"
              theme="outline"
              :fill="['#ffffff']"
            />
          </div>
        </template>
      </el-popover>

      <!-- 新增的输入框 -->
      <div v-if="increasing" class="flex items-center">
        <div class="w-[40px] h-[40px] flex items-center justify-center">
          <icon-park
            type="category-management"
            size="24"
            theme="outline"
            fill="#ffffff"
          />
        </div>
        <div>
          <el-input
            v-model="addTreeData.name"
            @keydown.enter="saveTreeData"
          ></el-input>
        </div>
        <div>
          <icon-park
            type="close"
            size="12"
            theme="outline"
            fill="#ffffff"
            @click="((increasing = false), (addTreeData.name = ''))"
          />
        </div>
      </div>
    </div>
    <div class="line w-[1px] h-full bg-white"></div>
    <div class="notes_box flex-1 flex flex-wrap gap-10 content-start">
      <div
        v-if="!activeChildren.length"
        class="w-3/6 h-3/6 border-2 border-slate-300 flex items-center justify-center rounded flex-col gap-4 text-white text-2xl cursor-pointer"
        @click="handleAddNote"
      >
        <icon-park
          type="doc-add"
          size="100"
          theme="outline"
          fill="#ffffff"
          :strokeWidth="1"
        />
        新建便签
      </div>
      <el-popover
        placement="top-start"
        :width="150"
        trigger="hover"
        content="新增便签"
      >
        <template #reference>
          <div
            v-if="activeChildren.length"
            class="add_btn w-[60px] h-[60px] rounded-full bg-[#454545] hover:bg-[#0085ff] flex items-center justify-center fixed top-4 right-4 cursor-pointer z-10"
            @click="handleAddNote"
          >
            <icon-park
              type="doc-add"
              size="24"
              theme="outline"
              fill="#ffffff"
            />
          </div>
        </template>
      </el-popover>

      <div
        v-for="(item, index) in activeChildren"
        :key="item.id"
        class="note-item relative"
        :style="{
          width: item.width || '400px',
          height: item.height || '480px',
        }"
      >
        <div
          class="w-full relative z-[9]"
          :style="{ height: `calc(${item.height || '480px'} - 40px)` }"
        >
          <XEditor
            v-if="mounted"
            v-model="item.content"
            :api-key="editorKey"
            :init="getEditorConfig(item.id, item.height)"
            :disabled="false"
          />
        </div>
        <div
          class="h-10 bg-[#ffffff] pt-[10px] pl-3 flex items-center rounded-md gap-3"
        >
          <icon-park
            class="cursor-pointer"
            type="save"
            size="20"
            theme="outline"
            fill="#1E1E1E"
            title="保存"
            @click="saveEdgeData(item)"
          />

          <icon-park
            class="cursor-pointer"
            type="delete-themes"
            size="20"
            theme="outline"
            fill="#1E1E1E"
            title="删除"
            @click="deleteEdgeData(index)"
          />
        </div>
        <!-- 拖拽调整大小手柄 -->
        <div
          class="resize-handle"
          @mousedown="startResize($event, item)"
          title="拖拽调整大小"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#666">
            <path
              d="M15 1L1 15M15 6L6 15M15 11L11 15"
              stroke="#666"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { IconPark } from "@icon-park/vue-next/es/all";
import { useStore, type TreeEdge } from "@/hooks/store";
import { handleTree } from "@/utils/tools";
import { ElMessageBox } from "element-plus";
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/button.scss";

defineOptions({
  name: "HomeView",
});

const editorKey = "no-api-key"; // 使用本地文件不需要 API key
const editorConfig = {
  base_url: "/tinymce", // 使用 public 目录下的本地 TinyMCE
  suffix: ".min", // 使用压缩版本
  menubar: false, // 菜单栏
  toolbar: false, // 工具栏
  statusbar: false, // 状态栏
  language: "zh_CN", // 语言
  language_url: "/tinymce/langs/zh_CN.js", // 本地语言包
  width: "100%", // 宽度
  height: "450px", // 高度
  content_css: "dark",
  promotion: false, // 禁用推广信息
  branding: false, // 禁用品牌信息
  resize: false, // 禁用调整大小
  auto_focus: false, // 禁用自动聚焦
  inline: false, // 禁用内联模式
};

// 存储编辑器实例
const editorInstances = ref<Map<string | number, any>>(new Map());

// 为每个编辑器实例生成配置，避免共享引用
const getEditorConfig = (id: string | number, height?: string) => ({
  ...editorConfig,
  selector: `#editor-${id}`,
  height: height ? `calc(${height} - 40px)` : "450px",
  setup: (editor: any) => {
    editor.on("init", () => {
      // 存储编辑器实例
      editorInstances.value.set(id, editor);
    });
  },
});

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
const noteData: any = ref([]);
// 树形结构数据
const noteTreeData: any = ref([]);

const getAllData = async () => {
  classifyData.value = await getTreeData();
  noteData.value = await getEdgeData();

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
const activeChildren = ref<TreeEdge[]>([]); // 当前分类下的便签
const mounted = ref(false); // 编辑器是否加载完成

// 点击分类
const handleClick = (item) => {
  if (!item) {
    activeID.value = "";
    activeChildren.value = [];
    return;
  }

  activeID.value = item.id;
  activeChildren.value = item?.children || [];
};

const increasing = ref(false); // 是否正在添加分类
const addTreeData = ref({ id: 0, name: "", parentId: "0" }); // 添加的分类数据
// 点击添加分类
const handleAdd = () => {
  increasing.value = true;
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
const deleteNodeData = (id) => {
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
  activeChildren.value.push({
    id: "0",
    parentId: activeID.value,
    content: "",
    width: "400px", // 默认宽度
    height: "480px", // 默认高度
  });
};

// 拖拽调整大小
const startResize = (e: MouseEvent, item: any) => {
  e.preventDefault();
  e.stopPropagation();

  // 从DOM元素获取实际宽高
  const noteElement = (e.target as HTMLElement).closest(
    ".note-item"
  ) as HTMLElement;
  if (!noteElement) return;

  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = noteElement.offsetWidth;
  const startHeight = noteElement.offsetHeight;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX;
    const deltaY = moveEvent.clientY - startY;

    // 计算新的宽高，设置最小值
    const newWidth = Math.max(300, startWidth + deltaX);
    const newHeight = Math.max(300, startHeight + deltaY);

    item.width = `${newWidth}px`;
    item.height = `${newHeight}px`;

    // 动态调整编辑器高度
    const editor = editorInstances.value.get(item.id);
    if (editor && editor.editorContainer) {
      const editorHeight = newHeight - 40; // 减去底部按钮栏高度
      editor.editorContainer.style.height = `${editorHeight}px`;
      // 调整 iframe 高度
      const iframe = editor.iframeElement;
      if (iframe) {
        iframe.style.height = `${editorHeight}px`;
      }
    }
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    // 保存大小
    saveEdgeData(item);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

// 保存便签
const saveEdgeData = async (item: TreeEdge) => {
  const data: TreeEdge = {
    ...item,
    content: item.content,
    width: item.width,
    height: item.height,
  };

  if (data.id === "0") {
    const savedEdge = await addEdge({
      ...data,
      parentId: activeID.value,
    });
    Object.assign(item, savedEdge);
    return;
  }

  await updateEdge(data);
};

// 删除便签
const deleteEdgeData = async (index) => {
  const activeNote = activeChildren.value[index];

  if (activeNote.id !== "0") {
    await deleteEdge(activeNote.id);
  }

  activeChildren.value.splice(index, 1);
};

onMounted(async () => {
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

  // 延迟加载编辑器，避免阻塞页面渲染
  nextTick(() => {
    mounted.value = true;
  });
});
</script>

<style lang="scss" scoped>
.classify_item {
  .delete_icon {
    display: none;
  }
  &:hover {
    .delete_icon {
      display: flex;
      &.noVisible {
        display: none;
      }
    }
  }
}

.note-item {
  position: relative;
  min-width: 300px;
  min-height: 300px;
  transition: box-shadow 0.2s;

  &:hover .resize-handle {
    opacity: 1;
  }
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  &:hover {
    opacity: 1 !important;
  }

  svg {
    pointer-events: none;
  }
}
</style>
