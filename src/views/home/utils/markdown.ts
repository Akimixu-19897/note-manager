export const htmlToMarkdown = (html: string) => {
  if (!html.trim()) {
    return "";
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  return Array.from(document.body.childNodes)
    .map(nodeToMarkdown)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const nodeToMarkdown = (node: ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  const children = () =>
    Array.from(node.childNodes).map(nodeToMarkdown).join("");
  const blockChildren = () =>
    Array.from(node.childNodes).map(nodeToMarkdown).join("\n");

  switch (node.tagName.toLowerCase()) {
    case "br":
      return "\n";
    case "strong":
    case "b":
      return `**${children()}**`;
    case "em":
    case "i":
      return `_${children()}_`;
    case "code":
      return `\`${children()}\``;
    case "a":
      return `[${children()}](${node.getAttribute("href") || ""})`;
    case "h1":
      return `# ${children()}`;
    case "h2":
      return `## ${children()}`;
    case "h3":
      return `### ${children()}`;
    case "blockquote":
      return blockChildren()
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "li":
      return `- ${children()}`;
    case "ul":
    case "ol":
      return blockChildren();
    case "p":
    case "div":
      return children();
    default:
      return children();
  }
};
