import { z } from "zod";

/**
 * Este módulo só é carregado em tempo de build: o Zod compila validadores com
 * `new Function`, que a CSP estrita do site bloqueia no browser. O frontmatter é
 * estático, então validá-lo no build basta — e o bundle do cliente fica sem o Zod.
 */

/** Documento em rascunho não é pré-renderizado, não entra no sitemap e não é linkado. */
export const STATUSES = ["rascunho", "publicado"] as const;

const SLUG = /^[a-z0-9-]+$/;

const baseSchema = z.object({
  title: z.string().min(8).max(70),
  // O bloco de resposta do AEO: compreensível fora da página e curto o bastante para ser citado.
  answer: z.string().min(120).max(320),
  translationKey: z.string().regex(SLUG),
  status: z.enum(STATUSES),
  updated: z.iso.date(),
});

export const pageSchema = baseSchema;

export const caseSchema = baseSchema.extend({
  org: z.string().min(2),
  role: z.string().min(4),
  period: z.string().min(4),
  stack: z.array(z.string().min(1)).min(3).max(10),
  outcome: z.string().min(40).max(200),
  order: z.number().int().positive(),
  /** Número exibido na home. Só entra aqui o que estiver documentado como fato. */
  proof: z
    .object({ value: z.string().max(12), label: z.string().max(60) })
    .optional(),
});

export const articleSchema = baseSchema.extend({
  published: z.iso.date(),
  tags: z.array(z.string().regex(SLUG)).min(1).max(5),
});

export type PageFrontmatter = z.infer<typeof pageSchema>;
export type CaseFrontmatter = z.infer<typeof caseSchema>;
export type ArticleFrontmatter = z.infer<typeof articleSchema>;
