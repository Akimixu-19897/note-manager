// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "./markdown";

describe("htmlToMarkdown", () => {
  it("converts basic rich text html to markdown", () => {
    expect(
      htmlToMarkdown(
        '<h2>标题</h2><p>我是<strong>重点</strong>和<em>斜体</em></p><ul><li>第一项</li><li><code>pnpm build</code></li></ul>'
      )
    ).toBe("## 标题\n\n我是**重点**和_斜体_\n\n- 第一项\n- `pnpm build`");
  });

  it("returns an empty string for blank html", () => {
    expect(htmlToMarkdown("  ")).toBe("");
  });
});
