import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { parseFileName } from "../app/content/file-name";
import {
  articleSchema,
  caseSchema,
  pageSchema,
} from "../app/content/schema";

const CONTENT_DIR = "app/content";

const SCHEMAS = {
  pages: pageSchema,
  cases: caseSchema,
  articles: articleSchema,
} as const;

export type ValidationError = { file: string; message: string };

/**
 * A borda deste sistema é o build: o frontmatter é validado aqui, uma vez, e o
 * registro do browser confia no que passou. É o que mantém o Zod fora do bundle.
 */
export function validateContent(): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [dir, schema] of Object.entries(SCHEMAS)) {
    const full = join(CONTENT_DIR, dir);
    if (!existsSync(full)) continue;

    for (const name of readdirSync(full).filter((f) => f.endsWith(".mdx"))) {
      const file = join(full, name);

      if (!parseFileName(`./${dir}/${name}`)) {
        errors.push({
          file,
          message: "nome de arquivo precisa ser <slug>.<locale>.mdx",
        });
        continue;
      }

      const { data } = matter(readFileSync(file, "utf8"));
      const result = schema.safeParse(data);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            file,
            message: `${issue.path.join(".") || "frontmatter"}: ${issue.message}`,
          });
        }
      }
    }
  }

  return errors;
}

function main(): void {
  const errors = validateContent();

  if (errors.length > 0) {
    const report = errors.map((e) => `  ${e.file} — ${e.message}`).join("\n");
    throw new Error(`frontmatter inválido:\n${report}`);
  }

  console.log("conteúdo validado");
}

if (process.argv[1]?.endsWith("validate-content.ts")) {
  main();
}
