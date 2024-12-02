<template>
  <div class="container_box w-full h-full flex items-stretch gap-[20px]">
    <div class="classify_box w-[200px]">
      <div
        class="classify_item py-2 text-[var(--text-200)] text-center cursor-pointer flex items-center gap-[10px]"
        v-for="item in classifyData"
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
            type="category-management"
            size="24"
            theme="outline"
            :fill="[activeID == item.id ? '#ffffff' : '#454545']"
          />
        </div>
        <div>{{ item.name }}</div>
      </div>
      <div
        class="add_btn w-[60px] h-[60px] rounded-full bg-[#454545] hover:bg-[#0085ff] flex items-center justify-center fixed bottom-4 left-4 cursor-pointer"
      >
        <icon-park type="other" size="28" theme="outline" :fill="['#ffffff']" />
      </div>
    </div>
    <div class="line w-[1px] h-full bg-white"></div>
    <div class="notes_box flex-1 grid grid-cols-3 gap-10">
      <div
        v-for="item in activeChildren"
        :key="item.id"
        :class="`editor_box_${item.id}`"
      >
        <Editor class="editor_self" :api-key="editorKey" :init="editorConfig" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Editor from "@tinymce/tinymce-vue";
import { IconPark } from "@icon-park/vue-next/es/all";
import { useStore } from "@/hooks/store";

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

// 分类数据
const classifyData: any = [
  {
    id: 1,
    name: "分类1",
    children: [
      {
        id: 11,
        name: "分类1-1",
      },
      {
        id: 12,
        name: "分类1-2",
      },
      {
        id: 13,
        name: "分类1-2",
      },
      {
        id: 14,
        name: "分类1-2",
      },
    ],
  },
];
const activeID = ref(1); // 当前选中的分类ID
const activeChildren = ref<any[]>([]); // 子分类

// 点击分类
const handleClick = (item) => {
  activeID.value = item.id;
  activeChildren.value = item?.children || [];
};

const {
  treeData,
  edgeData,
  addNode,
  addEdge,
  updateNode,
  deleteNode,
  deleteEdge,
} = useStore();

onMounted(() => {
  handleClick(classifyData[0]);
  console.log("🚀这是treeData的输出：", treeData);
  nextTick(() => {
    addNode({ id: "1", label: "分类1" });
  });
});
</script>

<style lang="scss" scoped></style>
