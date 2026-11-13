declare module "*.mdx" {
  export const headings: readonly { id: string; title: string; level: number }[];
}
