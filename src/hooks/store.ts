// 利用indexDB存储数据，实现数据持久化
// 这边的数据结构是这样的
/**
 * {
 * id：1，
 * createTime: 2021-01-01 12:00:00,
 * updateTime: 2021-01-01 12:00:00,
 * name: '分类',
 * children: [
 *          {
 *              id: 1-1,
 *              parentId: 1,
 *              createTime: 2021-01-01 12:00:00,
 *              updateTime: 2021-01-01 12:00:00,
 *              content: '内容',
 *              parentName: '分类',
 *          }
 *      ]
 * }
 *
 */
//  从这个数据结构可以看出，这个数据结构是一个树形结构，每个节点都有一个id，createTime，updateTime，name，children属性
// 所以需要两张表，一张表存储树的节点，一张表存储树的边
import { ref } from "vue";
import { openDB } from "idb";
import { v4 as uuidv4 } from "uuid";
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/src/message.scss";

// 定义TreeNode接口，表示树节点的数据结构
interface TreeNode {
  id: string | number; // 节点ID
  parentId: string | number; // 父节点ID
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
  name: string; // 节点名称
  isEdit?: boolean; // 是否处于编辑状态
}

// 定义TreeEdge接口，表示树边的数据结构
export interface TreeEdge {
  id: string | number;
  parentId: string | number;
  content: string;
  width?: string;
  height?: string;
  createTime?: string;
  updateTime?: string;
}

const dbName = "treeDB"; // 数据库名称
const storeName = "treeStore"; // 节点存储名称
const edgeStoreName = "edgeStore"; // 边存储名称

// 不修改 dbName / storeName / edgeStoreName / version，避免重新部署后丢失同源浏览器里的旧 IndexedDB 数据。
const dbPromise = openDB(dbName, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains(edgeStoreName)) {
      db.createObjectStore(edgeStoreName, { keyPath: "id" });
    }
  },
});

// 导出useStore函数
export const useStore = () => {
  const treeData = ref<TreeNode[]>([]); // 定义treeData，初始值为空数组
  const edgeData = ref<TreeEdge[]>([]); // 定义edgeData，初始值为空数组
  let loadDataPromise: Promise<void> | undefined;

  // 加载数据的函数。按需加载，避免依赖组件 mounted 顺序。
  const loadData = async () => {
    const db = await dbPromise;
    const tx = db.transaction([storeName, edgeStoreName], "readonly");
    const store = tx.objectStore(storeName);
    const edgeStore = tx.objectStore(edgeStoreName);
    const [nodes, edges] = await Promise.all([store.getAll(), edgeStore.getAll()]);

    await tx.done;
    treeData.value = nodes;
    edgeData.value = edges;
  };

  const ensureDataLoaded = async () => {
    loadDataPromise ||= loadData();
    await loadDataPromise;
  };


  // 添加节点的函数
  const addNode = async (node: TreeNode) => {
    const db = await dbPromise;
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const savedNode: TreeNode = {
      ...node,
      id: uuidv4(),
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    };

    await store.add(savedNode);
    await tx.done;
    treeData.value.push(savedNode);
    ElMessage.success("添加成功");

    return savedNode;
  };

  // 添加边的函数
  const addEdge = async (edge: TreeEdge) => {
    const db = await dbPromise;
    const tx = db.transaction(edgeStoreName, "readwrite");
    const store = tx.objectStore(edgeStoreName);
    const savedEdge: TreeEdge = {
      ...edge,
      id: uuidv4(),
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    };

    await store.add(savedEdge);
    await tx.done;
    edgeData.value.push(savedEdge);
    ElMessage.success("添加成功");

    return savedEdge;
  };

  // 更新节点的函数
  const updateNode = async (node: TreeNode) => {
    const oldNode = treeData.value.find((item) => item.id === node.id);

    if (!oldNode) {
      return;
    }

    const db = await dbPromise;
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const savedNode: TreeNode = {
      ...oldNode,
      name: node.name,
      updateTime: new Date().toLocaleString(),
    };

    delete savedNode.isEdit;
    await store.put(savedNode);
    await tx.done;
    Object.assign(oldNode, savedNode);
    ElMessage.success("保存成功");
  };

  // 更新边的函数
  const updateEdge = async (edge: TreeEdge) => {
    const oldEdge = edgeData.value.find((item) => item.id === edge.id);

    if (!oldEdge) {
      return;
    }

    const db = await dbPromise;
    const tx = db.transaction(edgeStoreName, "readwrite");
    const store = tx.objectStore(edgeStoreName);
    const savedEdge: TreeEdge = {
      ...oldEdge,
      content: edge.content,
      width: edge.width,
      height: edge.height,
      updateTime: new Date().toLocaleString(),
    };

    await store.put(savedEdge);
    await tx.done;
    Object.assign(oldEdge, savedEdge);
    ElMessage.success("保存成功");
  };

  // 删除节点的函数
  const deleteNode = async (id: string | number) => {
    const db = await dbPromise;
    const tx = db.transaction([storeName, edgeStoreName], "readwrite");
    const store = tx.objectStore(storeName);
    const edgeStore = tx.objectStore(edgeStoreName);
    const edges = await edgeStore.getAll();

    await store.delete(id);

    for (const edge of edges) {
      if (edge.parentId === id) {
        await edgeStore.delete(edge.id);
      }
    }

    await tx.done;
    treeData.value = treeData.value.filter((node) => node.id !== id);
    edgeData.value = edgeData.value.filter((edge) => edge.parentId !== id);
    ElMessage.success("删除成功");
  };

  // 删除边的函数
  const deleteEdge = async (id: string | number) => {
    const db = await dbPromise;
    const tx = db.transaction(edgeStoreName, "readwrite");
    const store = tx.objectStore(edgeStoreName);

    await store.delete(id);
    await tx.done;
    edgeData.value = edgeData.value.filter((edge) => edge.id !== id);
    ElMessage.success("删除成功");
  };

  // 获取treeData和edgeData
  const getTreeData = async () => {
    await ensureDataLoaded();
    return treeData.value;
  };
  const getEdgeData = async () => {
    await ensureDataLoaded();
    return edgeData.value;
  };

  // 返回所有定义的变量和函数
  return {
    getTreeData,
    getEdgeData,
    addNode,
    addEdge,
    updateNode,
    updateEdge,
    deleteNode,
    deleteEdge,
  };
};
