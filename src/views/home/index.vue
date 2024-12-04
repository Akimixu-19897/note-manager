<template>
  <div class="container_box w-full h-full flex items-stretch gap-[20px]">
    <div class="classify_box w-[200px]">
      <div
        class="classify_item py-2 text-center cursor-pointer flex items-center gap-[10px]"
        v-for="item in noteTreeData"
        :key="item.id"
        :class="activeID == item.id ? ' text-[#ffffff]' : ''"
        @click="handleClick(item)"
      >
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
          :class="
            activeID == item.id ? 'text-[#ffffff]' : 'text-[var(--text-200)]'
          "
        >
          {{ item.name }}
        </div>
      </div>
      <div
        class="add_btn w-[60px] h-[60px] rounded-full bg-[#454545] hover:bg-[#0085ff] flex items-center justify-center fixed bottom-4 left-4 cursor-pointer"
        @click="handleAdd"
      >
        <icon-park type="other" size="28" theme="outline" :fill="['#ffffff']" />
      </div>
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
      </div>
    </div>
    <div class="line w-[1px] h-full bg-white"></div>
    <div class="notes_box flex-1 grid grid-cols-3 gap-10">
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
      <div
        v-if="activeChildren.length"
        class="add_btn w-[60px] h-[60px] rounded-full bg-[#454545] hover:bg-[#0085ff] flex items-center justify-center fixed top-4 right-4 cursor-pointer z-10"
        @click="handleAddNote"
      >
        <icon-park type="doc-add" size="24" theme="outline" fill="#ffffff" />
      </div>
      <div v-for="item in activeChildren" :key="item.id" class="h-[450px]">
        <div class="w-full h-full relative z-10">
          <Editor
            v-model="item.content"
            :api-key="editorKey"
            :init="editorConfig"
          />
        </div>
        <div
          class="h-10 bg-[#ffffff] relative top-[-10px] z-0 pt-[10px] pl-3 flex items-center rounded-md"
        >
          <icon-park
            class="cursor-pointer"
            type="save"
            size="20"
            theme="outline"
            fill="#1E1E1E"
            @click="saveEdgeData(item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Editor from "@tinymce/tinymce-vue";
import { IconPark } from "@icon-park/vue-next/es/all";
import { useStore } from "@/hooks/store";
import { handleTree } from "@/utils/tools";

const editorKey = "e20g4kwvhjp4y0xwbf2ibe73qieph0k4y1um8xo5jl13j0f4";
const editorConfig = {
  menubar: false, // 菜单栏
  toolbar: false, // 工具栏
  statusbar: false, // 状态栏
  language: "zh_CN", // 语言
  width: "100%", // 宽度
  height: "100%", // 高度
  // skin_url: "/src/views/home/myrandow/skins",
  // skin: "myrandow",
  // content_css: "myrandow",
  content_css: "dark",
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
  );
};

const activeID = ref(1); // 当前选中的分类ID
const activeChildren = ref<any[]>([]); // 子分类

// 点击分类
const handleClick = (item) => {
  console.log("🚀这是item的输出：", item);

  activeID.value = item.id;
  activeChildren.value = item?.children || [];
};

const increasing = ref(false); // 是否正在添加分类
const addTreeData = ref({ id: 0, name: "", parentId: 0 }); // 添加的分类数据
// 点击添加分类
const handleAdd = () => {
  increasing.value = true;
};
// 回车保存分类
const saveTreeData = async () => {
  console.log("🚀这是saveTreeData的输出：", "回车保存分类");
  if (!addTreeData.value.name) {
    increasing.value = false;
    return;
  }
  await addNode(addTreeData.value);
  classifyData.value = await getTreeData();
  increasing.value = false;
};

// 点击添加便签
const handleAddNote = () => {
  // addEdge({ id: "0", parentId: activeID.value, content: "hahha" });

  activeChildren.value.push({ id: "0", parentId: activeID.value, content: "" });
};

// 保存便签
const saveEdgeData = async (item) => {
  console.log("🚀这是saveEdgeData的输出：", "保存便签");
  const data = item;
  if (data.id === "0") {
    await addEdge({ id: "0", parentId: activeID.value, content: data.content });
  } else {
    console.log("🚀这是data的输出：", data);

    await updateEdge(data);
  }
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
});
</script>

<style lang="scss" scoped></style>
