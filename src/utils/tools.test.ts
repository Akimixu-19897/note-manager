import { describe, expect, it } from "vitest";
import { handleTree } from "./tools";

describe("handleTree", () => {
  it("builds a tree without dropping existing note fields", () => {
    const data = [
      { id: "category-1", parentId: "0", name: "工作", createTime: "2026-01-01" },
      {
        id: "note-1",
        parentId: "category-1",
        content: "内容",
        width: "420px",
        height: "520px",
        createTime: "2026-01-02",
      },
    ];

    const tree = handleTree(data, "id", "parentId", "children", "0");

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toEqual([
      expect.objectContaining({
        id: "note-1",
        content: "内容",
        width: "420px",
        height: "520px",
      }),
    ]);
  });

  it("returns original flat data when no root node matches", () => {
    const data = [{ id: "orphan", parentId: "missing", name: "孤儿节点" }];

    expect(handleTree(data, "id", "parentId", "children", "0")).toBe(data);
  });
});
