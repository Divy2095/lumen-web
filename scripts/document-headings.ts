export type HeadingEntry = { id: string; title: string; level: number };
export function headingId(title: string) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}
export function markdownHeadings(source: string): HeadingEntry[] {
  let fenced = false;
  const seen = new Set<string>();
  const headings: HeadingEntry[] = [];
  for (const line of source.split("\n")) {
    if (/^```/.test(line)) { fenced = !fenced; continue; }
    const match = !fenced && /^(#{2,3}) (.+)$/.exec(line);
    if (!match) continue;
    const title = match[2].replace(/`/g, "");
    const id = headingId(title);
    if (!id || seen.has(id)) throw new Error(`Duplicate/empty heading: ${title}`);
    seen.add(id); headings.push({ id, title, level: match[1].length });
  }
  return headings;
}

type Node = { type: string; value?: string; depth?: number; children?: Node[]; data?: Record<string, unknown> };
const text = (node: Node): string => node.value ?? node.children?.map(text).join("") ?? "";
const literal = (value: string | number) => ({ type: "Literal", value });

// Same heading IDs power rendered Markdown, the route handle and static checks.
export function remarkDocumentHeadings() {
  return (tree: Node) => {
    const headings: HeadingEntry[] = [];
    const seen = new Set<string>();
    function visit(node: Node) {
      if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
        const title = text(node), id = headingId(title);
        if (!id || seen.has(id)) throw new Error(`Duplicate/empty heading: ${title}`);
        seen.add(id);
        node.data = { ...node.data, hProperties: { id } };
        headings.push({ id, title, level: node.depth });
      }
      node.children?.forEach(visit);
    }
    visit(tree);
    tree.children!.push({ type: "mdxjsEsm", value: "", data: { estree: {
      type: "Program", sourceType: "module", body: [{ type: "ExportNamedDeclaration", specifiers: [], source: null,
        declaration: { type: "VariableDeclaration", kind: "const", declarations: [{ type: "VariableDeclarator", id: { type: "Identifier", name: "headings" }, init: {
          type: "ArrayExpression", elements: headings.map(heading => ({ type: "ObjectExpression", properties: Object.entries(heading).map(([key, value]) => ({ type: "Property", key: { type: "Identifier", name: key }, value: literal(value), computed: false, shorthand: false, kind: "init", method: false })) }))
        } }] }
      }]
    } } });
  };
}
