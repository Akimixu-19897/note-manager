type TreeItem = Record<string, any>;

/**
 * 构造树型结构数据。
 * 只做浅拷贝，保留 IndexedDB 里已有字段，避免 JSON 深拷贝吞掉未来扩展字段类型。
 */
export function handleTree(
  data: TreeItem[],
  id = "id",
  parentId = "parentId",
  children = "children",
  rootId: number | string = 0
) {
  const itemMap = new Map<string | number, TreeItem>();
  const treeData: TreeItem[] = [];

  for (const item of data) {
    itemMap.set(item[id], { ...item });
  }

  for (const item of itemMap.values()) {
    const parent = itemMap.get(item[parentId]);

    if (parent) {
      const branch = (parent[children] ||= []);
      branch.push(item);
      continue;
    }

    if (item[parentId] === rootId) {
      treeData.push(item);
    }
  }

  return treeData.length > 0 ? treeData : data;
}
