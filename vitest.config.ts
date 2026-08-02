import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
        ],
      }),
    },
  ],
  test: {
    environment: "node",
    include: [
      "app/**/*.test.ts",
      // Componente renderiza, entao roda em jsdom. O ambiente e declarado por arquivo,
      // com `// @vitest-environment jsdom` no topo, para os testes de logica seguirem
      // em node, que e mais rapido.
      "app/**/*.test.tsx",
      "scripts/**/*.test.ts",
      "workers/**/*.test.ts",
    ],
  },
});
