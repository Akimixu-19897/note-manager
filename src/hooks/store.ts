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

// 定义TreeNode接口，表示树节点的数据结构
interface TreeNode {
  id: string; // 节点ID
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
  name: string; // 节点名称
  children: TreeNode[]; // 子节点数组
}

// 定义TreeEdge接口，表示树边的数据结构
interface TreeEdge {
  id: string; // 边ID
  parentId: string; // 父节点ID
  childId: string; // 子节点ID
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

  // 组件挂载时执行的函数
  onMounted(async () => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(storeName, "readonly"); // 开启只读事务
    const store = tx.objectStore(storeName); // 获取节点存储
    treeData.value = await store.getAll(); // 获取所有节点数据并赋值给treeData

    const edgeTx = db.transaction(edgeStoreName, "readonly"); // 开启只读事务
    const edgeStore = edgeTx.objectStore(edgeStoreName); // ��取边存储
    edgeData.value = await edgeStore.getAll(); // 获取所有边数据并赋值给edgeData
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
    await store.add(node); // 添加节点到存储
    treeData.value.push(node); // 将节点添加到treeData
  };

  // 添加边的函数
  const addEdge = async (edge: TreeEdge) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(edgeStoreName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(edgeStoreName); // 获取边存储
    edge.id = uuidv4(); // 生成边ID
    await store.add(edge); // 添加边到存储
    edgeData.value.push(edge); // 将边添加到edgeData
  };

  // 更新节点的函数
  const updateNode = async (node: TreeNode) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(storeName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(storeName); // 获取节点存储
    node.updateTime = new Date().toLocaleString(); // 更新节点的更新时间
    await store.put(node); // 更新节点到存储
  };

  // 删除节点的函数
  const deleteNode = async (id: string) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(storeName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(storeName); // 获取节点存储
    await store.delete(id); // 从存储中删除节点
    treeData.value = treeData.value.filter((node) => node.id !== id); // 从treeData中删除节点
  };

  // 删除边的函数
  const deleteEdge = async (id: string) => {
    const db = await dbPromise; // 等待数据库打开
    const tx = db.transaction(edgeStoreName, "readwrite"); // 开启读写事务
    const store = tx.objectStore(edgeStoreName); // 获取边存储
    await store.delete(id); // 从存储中删除边
    edgeData.value = edgeData.value.filter((edge) => edge.id !== id); // 从edgeData中删除边
  };

  // 返回所有定义的变量和函数
  return {
    treeData,
    edgeData,
    addNode,
    addEdge,
    updateNode,
    deleteNode,
    deleteEdge,
  };
};
