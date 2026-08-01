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
 * O conteúdo descreve sistemas internos de uma prefeitura. Estes termos nunca podem
 * chegar ao HTML publicado — o build falha antes, em vez de depender de revisão humana.
 */
const FORBIDDEN = [
  /[REDIGIDO]/i,
  /[REDIGIDO]/i,
  /[REDIGIDO]/i,
  /\bOracle\b/i,
  /workers\.dev/i,
  /database_id/i,
  /GOOGLE_SA_/i,
  /SYNC_SECRET/i,
  /spreadsheetId/i,
  /GeoServer/i,
  /@betim\.mg\.gov\.br/i,
];

export function forbiddenTerms(body: string): string[] {
  return FORBIDDEN.flatMap((pattern) => {
    const found = pattern.exec(body);
    return found ? [found[0]] : [];
  });
}

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

      const source = readFileSync(file, "utf8");

      for (const term of forbiddenTerms(source)) {
        errors.push({
          file,
          message: `termo que nunca pode ser publicado: "${term}"`,
        });
      }

      // YAML quebra em valor não citado que contenha ": ", e o erro cru não diz o arquivo.
      let data: unknown;
      try {
        data = matter(source).data;
      } catch (cause) {
        errors.push({
          file,
          message: `frontmatter não é YAML válido — valores com dois-pontos precisam de aspas (${
            cause instanceof Error ? cause.message.split("\n")[0] : cause
          })`,
        });
        continue;
      }

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
