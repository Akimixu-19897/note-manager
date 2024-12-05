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
import { ref, onMounted, onUnmounted } from "vue"; // 从vue中导入ref, onMounted, onUnmounted
import { openDB } from "idb"; // 从idb库中导入openDB函数
import { v4 as uuidv4 } from "uuid"; // 从uuid库中导入v4并重命名为uuidv4
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/src/message.scss"; // 尝试导入 ElMessage 的单独样式

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
interface TreeEdge {
  id: string | number; // 边ID
  parentId: string | number; // 父节点ID
  content: string; // 边内容
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
}

const dbName = "treeDB"; // 数据库名称
const storeName = "treeStore"; // 节点存储名称
const edgeStoreName = "edgeStore"; // 边存储名称

// 打开数据库，版本为1
const dbPromise = openDB(dbName, 1, {
  upgrade(db) {
    // 数据库升级时的回调函数
    db.createObjectStore(storeName, { keyPath: "id" }); // 创建节点存储
    db.createObjectStore(edgeStoreName, { keyPath: "id" }); // 创建边存储
  },
});

// 导出useStore函数
export const useStore = () => {
  const treeData = ref<TreeNode[]>([]); // 定义treeData，初始值为空数组
  const edgeData = ref<TreeEdge[]>([]); // 定义edgeData，初始值为空数组
  const canReturnData = ref<boolean>(true); // true表示可以返回数据，false表示不可以返回数据
  // 加载数据的函数
  const loadData = async () => {
    canReturnData.value = false; // 设置不可以返回数据
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(storeName, "readonly"); // 开启只读事务
    const store = tx.objectStore(storeName); // 获取节点存储
    treeData.value = await store.getAll(); // 获取所有节点数据并赋值给treeData

    const edgeTx = db.transaction(edgeStoreName, "readonly"); // 开启只读事务
    const edgeStore = edgeTx.objectStore(edgeStoreName); // 获取边存储
    edgeData.value = await edgeStore.getAll(); // 获取所有边数据并赋值给edgeData

    canReturnData.value = true; // 设置可以返回数据
  };

  // 获取是否可以返回数据
  const getCanReturnData = async () => {
    while (!canReturnData.value) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 等待100毫秒
    }
    return canReturnData.value;
  };

  // 组件挂载时执行的函数
  onMounted(async () => {
    await loadData(); // 如果数据尚未加载，则加载数据
  });
  // 组件卸载时执行的函数
  onUnmounted(() => {
    dbPromise.then((db) => db.close()); // 关闭数据库连接
  });

  // 添加节点的函数
  const addNode = async (node: TreeNode) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(storeName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(storeName); // 获取节点存储
    node.id = uuidv4(); // 生成节点ID
    node.createTime = new Date().toLocaleString(); // 设置创建时间
    node.updateTime = new Date().toLocaleString(); // 设置更新时间
    await store.add(JSON.parse(JSON.stringify(node))); // 添加节点到存储
    treeData.value.push(JSON.parse(JSON.stringify(node))); // 将节点添加到treeData
    ElMessage.success("添加成功");
  };

  // 添加边的函数
  const addEdge = async (edge: TreeEdge) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(edgeStoreName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(edgeStoreName); // 获取边存储
    edge.id = uuidv4(); // 生成边ID
    edge.createTime = new Date().toLocaleString(); // 设置创建时间
    edge.updateTime = new Date().toLocaleString(); // 设置更新时间
    await store.add(JSON.parse(JSON.stringify(edge))); // 添加边到存储
    edgeData.value.push(JSON.parse(JSON.stringify(edge))); // 将边添加到edgeData
    ElMessage.success("添加成功");
  };

  // 更新节点的函数
  const updateNode = async (node: TreeNode) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(storeName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(storeName); // 获取节点存储
    node.updateTime = new Date().toLocaleString(); // 更新节点的更新时间
    // 删除isEdit属性
    if (node.isEdit) {
      delete node.isEdit;
    }
    // 找到对应的节点
    const oldNode = treeData.value.find((item) => item.id === node.id);
    if (oldNode) {
      // 更新节点
      oldNode.name = node.name;
      await store.put(JSON.parse(JSON.stringify(oldNode))); // 更新节点到存储
      ElMessage.success("保存成功");
    }
  };

  // 更新边的函数
  const updateEdge = async (edge: TreeEdge) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(edgeStoreName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(edgeStoreName); // 获取边存储
    edge.updateTime = new Date().toLocaleString(); // 更新边的更新时间
    // 找到对应的边
    const oldEdge = edgeData.value.find((item) => item.id === edge.id);
    if (oldEdge) {
      // 更新边
      oldEdge.content = edge.content;
      await store.put(JSON.parse(JSON.stringify(oldEdge))); // 更新边到存储
      ElMessage.success("保存成功");
    }
  };

  // 删除节点的函数
  const deleteNode = async (id: string) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(storeName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(storeName); // 获取节点存储
    await store.delete(id); // 从存储中删除节点
    treeData.value = treeData.value.filter((node) => node.id !== id); // 从treeData中删除节点
    // 删除节点的同时删除边
    const edgeTx = db.transaction(edgeStoreName, "readwrite"); // 开启读写事务
    const edgeStore = edgeTx.objectStore(edgeStoreName); // 获取边存储
    const edges = await edgeStore.getAll(); // 获取所有边
    for (const edge of edges) {
      if (edge.parentId === id) {
        await edgeStore.delete(edge.id); // 从存储中删除边
        edgeData.value = edgeData.value.filter((item) => item.id !== edge.id); // 从edgeData中删除边
      }
    }

    ElMessage.success("删除成功");
  };

  // 删除边的函数
  const deleteEdge = async (id: string) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(edgeStoreName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(edgeStoreName); // 获取边存储
    await store.delete(id); // 从存储中删除边
    edgeData.value = edgeData.value.filter((edge) => edge.id !== id); // 从edgeData中删除边
    ElMessage.success("删除成功");
  };

  // 获取treeData和edgeData
  const getTreeData = async () => {
    await getCanReturnData();
    return treeData.value;
  };
  const getEdgeData = async () => {
    await getCanReturnData();
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
