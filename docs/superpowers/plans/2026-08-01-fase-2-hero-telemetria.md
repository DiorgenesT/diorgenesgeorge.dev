# Fase 2 — Hero, telemetria ao vivo e movimento · Plano de Implementação

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para rastreamento.

**Goal:** Fazer a home mostrar uma imagem diferente para cada visitante — a posição real de quem lê ligada por um arco ao datacenter real que serviu aquele HTML — sem inventar nenhum número e sem tirar o LCP do texto.

**Architecture:** Um endpoint no Worker lê `request.cf` e devolve a telemetria da requisição; a coordenada do datacenter vem de uma tabela de códigos IATA embarcada, gerada de dado de domínio público. No cliente, um módulo de matemática pura converte latitude e longitude em pontos de tela e no arco de grande círculo — e é consumido tanto pela cena Three.js quanto pelo SVG estático, que precisam desenhar exatamente a mesma coisa. Um portão de capacidade decide qual dos dois carregar antes de qualquer download.

**Tech Stack:** React Router v8 · Three.js 0.185 via React Three Fiber 9.7 · GSAP 3.15 com ScrollTrigger · Motion 12.43 · Cloudflare Workers · Vitest · Playwright.

**Spec:** `docs/superpowers/specs/2026-08-01-fase-2-hero-design.md`
**Spec do site:** `docs/superpowers/specs/2026-07-31-site-dev-design.md`

## Global Constraints

Aplicam-se a todas as tarefas.

- **Diretório:** `/home/dg/projetos/page-dev`. **Branch:** `feature/fase-2-hero`, a partir de `main`.
- **TypeScript `strict`.** Sem `any` implícito. Sem `@ts-ignore` sem justificativa de uma linha.
- **Nunca** incluir `Co-Authored-By` em commit. **Nunca** commitar `insumos/`, `CLAUDE.md`, `.dev.vars`.
- **Não fazer push nem abrir PR** sem pedido explícito.
- **Fronteira de módulos:** `app/` nunca importa `node:*`; código de build vive em `scripts/`; `workers/` nunca importa de `app/routes/`.
- **Zero número inventado.** Todo dado exibido vem de `request.cf`, de medição no browser ou de cálculo sobre esses dois. Dado ausente vira estado "não foi possível medir", nunca zero e nunca estimativa.
- **Nada de log e nada de armazenamento** de qualquer dado de visitante. `/api/edge` responde com `Cache-Control: no-store`.
- **`prefers-reduced-motion: reduce` desliga a camada inteira de movimento**, e quem a pede não baixa GSAP, Motion nem Three.js.
- **Versões exatas:** `three@0.185.1`, `@react-three/fiber@9.7.0`, `gsap@3.15.0`, `motion@12.43.0`. O R3F 9.7 exige `react >=19 <19.3`; o projeto está em 19.2.8. **Não atualizar React nesta fase.**
- Ao fim de cada tarefa: `npm run check` precisa passar **verificando o código de saída**, não a saída de texto.

---

## Convenção deste plano

As tarefas não têm todas a mesma forma, e isso é deliberado:

- **Tarefas de lógica** (1 a 6, 10) trazem o código completo e o teste antes da implementação. Onde só há teste, o teste é a especificação: implemente o mínimo que o faça passar.
- **Tarefas visuais** (7 a 9, 11 e 12) trazem as regras que o componente precisa cumprir e o contrato que ele expõe, não o JSX inteiro. Aparência se ajusta olhando; comportamento não, e é o comportamento que está escrito aqui.
- **Toda tarefa termina com `npm run check` verificado pelo código de saída.** Na Fase 1 um commit passou com typecheck quebrado porque o comando foi encadeado com `grep`, que engoliu o código de saída.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/build-colos.ts` | Gera a tabela IATA → coordenada de dado de domínio público |
| `workers/data/colos.json` | Tabela versionada, consumida pelo Worker |
| `workers/api/edge.ts` | Endpoint `/api/edge`: lê `request.cf`, resolve o colo, responde |
| `app/hero/projection.ts` | Matemática pura: esfera, projeção ortográfica, arco, haversine |
| `app/hero/capability.ts` | Decide cena 3D, SVG estático e se a camada de movimento carrega |
| `app/hero/telemetry.ts` | Hook de carga de `/api/edge` com estados e medição de RTT |
| `app/hero/telemetry-panel.tsx` | Leitura dos dados, do esqueleto ao preenchido |
| `app/hero/globe-static.tsx` | O mesmo desenho em SVG, sem canvas |
| `app/hero/globe-scene.tsx` | Cena R3F, carregada com `lazy` |
| `app/hero/hero.tsx` | Compõe headline, cena e painel; escolhe a versão |
| `app/content/index.generated.ts` | Índice de frontmatter, gerado no build — sem MDX junto |
| `scripts/build-content-index.ts` | Gera o índice acima |
| `scripts/check-budget.ts` | Falha o build se o JS crítico passar do teto |
| `app/motion/` | Transição de rota e revelação de seção por scroll |

---

## Índice de tarefas

| # | Tarefa | Entrega |
|---|---|---|
| 1 | Índice de frontmatter e portão de orçamento | Home deixa de baixar o texto do site inteiro; build falha se o crítico crescer |
| 2 | Tabela de colos | IATA → coordenada, de fonte de domínio público, testada |
| 3 | `/api/edge` | Telemetria da requisição, sem log e sem cache |
| 4 | Projeção | Matemática pura, testada contra coordenadas reais |
| 5 | Capacidade | A decisão que evita download desnecessário |
| 6 | Telemetria no cliente | Hook com estados, RTT medido e falha explícita |
| 7 | Painel | A leitura dos dados, com esqueleto e erro |
| 8 | Globo estático | SVG com os mesmos pontos e o mesmo arco |
| 9 | Cena 3D | R3F com `lazy`, pausando fora do viewport |
| 10 | Movimento do hero | GSAP: câmera com inércia e desenho do arco |
| 11 | Revelação por scroll | ScrollTrigger nas seções da home |
| 12 | Transição de rota | Motion, atrás do mesmo portão |
| 13 | Colofão e spec | O site conta a escolha e o custo |
| 14 | Verificação | E2E, axe, orçamento e medição em aparelho real |

---

## Task 1: Índice de frontmatter e portão de orçamento

**Contexto:** a home carrega hoje 147,6 KB gzip de JS, e 34,3 KB são o chunk `registry` — o registro importa todo o MDX com `eager: true`, então quem abre a home baixa o texto do colofão, dos cases e dos artigos sem precisar de nenhum deles. A navegação e a home só precisam do **frontmatter**, não do conteúdo compilado.

A correção separa as duas coisas: um índice de frontmatter gerado no build, que é pequeno e todo mundo carrega, e o MDX compilado, que fica no chunk da rota que o renderiza.

**Files:**
- Create: `scripts/build-content-index.ts`, `scripts/build-content-index.test.ts`
- Create: `scripts/check-budget.ts`, `scripts/check-budget.test.ts`
- Modify: `app/content/registry.ts`, `app/layouts/site.tsx`, `app/routes/home.tsx`, `app/seo/urls.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `DocumentIndex = { kind: "case" | "article" | "page"; slug: string; locale: Locale; frontmatter: CaseFrontmatter | ArticleFrontmatter | PageFrontmatter }[]`, exportado de `app/content/index.generated.ts` como `CONTENT_INDEX`.
- Produces: `listCaseIndex(locale)`, `listArticleIndex(locale)`, `pageIndex(locale, key)` em `app/content/index.ts`.

- [ ] **Step 1: Escrever o teste do gerador de índice**

Criar `scripts/build-content-index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { renderIndexModule, collectIndexEntries } from "./build-content-index";

describe("collectIndexEntries", () => {
  it("should include every published document in the repository", () => {
    const entries = collectIndexEntries();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.frontmatter.status === "publicado")).toBe(true);
  });

  it("should carry the frontmatter but never the body", () => {
    const entries = collectIndexEntries();

    expect(JSON.stringify(entries)).not.toContain("## ");
  });
});

describe("renderIndexModule", () => {
  it("should emit a module that declares its own type", () => {
    const source = renderIndexModule([]);

    expect(source).toContain("export const CONTENT_INDEX");
  });

  it("should warn that the file is generated", () => {
    expect(renderIndexModule([])).toContain("Gerado por scripts/build-content-index.ts");
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `npx vitest run scripts/build-content-index.test.ts`
Expected: FAIL — `Failed to resolve import "./build-content-index"`

- [ ] **Step 3: Implementar o gerador**

Criar `scripts/build-content-index.ts`:

```ts
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { parseFileName } from "../app/content/file-name";
import type { Locale } from "../app/i18n/config";

const CONTENT_DIR = "app/content";
const OUT = "app/content/index.generated.ts";

export type IndexEntry = {
  kind: "page" | "case" | "article";
  slug: string;
  locale: Locale;
  frontmatter: Record<string, unknown>;
};

const DIRS = { pages: "page", cases: "case", articles: "article" } as const;

export function collectIndexEntries(): IndexEntry[] {
  return Object.entries(DIRS).flatMap(([dir, kind]) => {
    const full = join(CONTENT_DIR, dir);
    if (!existsSync(full)) return [];

    return readdirSync(full)
      .filter((name) => name.endsWith(".mdx"))
      .flatMap((name) => {
        const parsed = parseFileName(`./${dir}/${name}`);
        if (!parsed) return [];

        const { data } = matter(readFileSync(join(full, name), "utf8"));
        if (data.status !== "publicado") return [];

        return [{ kind, ...parsed, frontmatter: data }];
      });
  });
}

export function renderIndexModule(entries: IndexEntry[]): string {
  return `// Gerado por scripts/build-content-index.ts — não editar à mão.
// Só frontmatter: o MDX compilado fica no chunk da rota que o renderiza.
import type { ArticleFrontmatter, CaseFrontmatter, PageFrontmatter } from "./schema";
import type { Locale } from "../i18n/config";

export type IndexEntry =
  | { kind: "page"; slug: string; locale: Locale; frontmatter: PageFrontmatter }
  | { kind: "case"; slug: string; locale: Locale; frontmatter: CaseFrontmatter }
  | { kind: "article"; slug: string; locale: Locale; frontmatter: ArticleFrontmatter };

export const CONTENT_INDEX: IndexEntry[] = ${JSON.stringify(entries, null, 2)};
`;
}

function main(): void {
  const entries = collectIndexEntries();
  writeFileSync(OUT, renderIndexModule(entries));
  console.log(`índice de conteúdo: ${entries.length} documentos`);
}

if (process.argv[1]?.endsWith("build-content-index.ts")) {
  main();
}
```

- [ ] **Step 4: Rodar para ver passar**

```bash
npx tsx scripts/build-content-index.ts
npx vitest run scripts/build-content-index.test.ts
```

Expected: o script imprime a contagem e os 4 testes passam.

- [ ] **Step 5: Criar a fachada que a navegação e a home consomem**

Criar `app/content/index.ts`:

```ts
import type { Locale } from "../i18n/config";
import { CONTENT_INDEX, type IndexEntry } from "./index.generated";
import type { ArticleFrontmatter, CaseFrontmatter, PageFrontmatter } from "./schema";

/** Frontmatter sem o MDX junto: é o que a navegação, a home e o SEO precisam. */
export function listCaseIndex(locale: Locale) {
  return CONTENT_INDEX.filter(
    (entry): entry is Extract<IndexEntry, { kind: "case" }> =>
      entry.kind === "case" && entry.locale === locale,
  ).sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function listArticleIndex(locale: Locale) {
  return CONTENT_INDEX.filter(
    (entry): entry is Extract<IndexEntry, { kind: "article" }> =>
      entry.kind === "article" && entry.locale === locale,
  ).sort((a, b) =>
    b.frontmatter.published.localeCompare(a.frontmatter.published),
  );
}

export function pageIndex(locale: Locale, key: string) {
  return CONTENT_INDEX.find(
    (entry): entry is Extract<IndexEntry, { kind: "page" }> =>
      entry.kind === "page" && entry.locale === locale && entry.slug === key,
  );
}
```

- [ ] **Step 6: Trocar os consumidores que não precisam do MDX**

Em `app/layouts/site.tsx`, `app/routes/home.tsx`, `app/routes/work.tsx`, `app/routes/writing.tsx` e `app/seo/urls.ts`, trocar `listCases`/`listArticles`/`getPage` do `registry` pelas funções de `app/content/index.ts`.

**Não trocar** em `app/routes/work.case.tsx`, `writing.article.tsx`, `about.tsx`, `services.tsx` e `colophon.tsx` — essas rotas renderizam o MDX e precisam do componente.

- [ ] **Step 7: Encaixar o gerador no build, antes de tudo**

Em `package.json`, o `build` passa a começar por ele:

```json
"build": "tsx scripts/validate-content.ts && tsx scripts/build-content-index.ts && react-router build && tsx scripts/build-404.ts && tsx scripts/build-markdown.ts && tsx scripts/build-headers.ts && tsx scripts/check-budget.ts",
```

Acrescentar `app/content/index.generated.ts` ao `.gitignore`? **Não.** Ele é commitado: o `npm run dev` precisa dele sem rodar o build inteiro, e um arquivo gerado versionado é revisável em diff.

- [ ] **Step 8: Escrever o teste do portão de orçamento**

Criar `scripts/check-budget.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { modulesOf, renderReport } from "./check-budget";

const html = `<html><head>
<link rel="modulepreload" href="/assets/entry.client-abc.js"/>
<script type="module">import "/assets/home-def.js";</script>
</head></html>`;

describe("modulesOf", () => {
  it("should find every asset the page pulls", () => {
    expect(modulesOf(html)).toEqual(["entry.client-abc.js", "home-def.js"]);
  });

  it("should never repeat a module", () => {
    expect(modulesOf(html + html)).toHaveLength(2);
  });
});

describe("renderReport", () => {
  it("should name the heaviest module first", () => {
    const report = renderReport([
      { name: "small.js", bytes: 10 },
      { name: "big.js", bytes: 100 },
    ]);

    expect(report.indexOf("big.js")).toBeLessThan(report.indexOf("small.js"));
  });
});
```

- [ ] **Step 9: Implementar o portão**

Criar `scripts/check-budget.ts`:

```ts
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CLIENT_DIR } from "./html-files";

/**
 * Teto do JS que toda visita paga, gzipado. A cena 3D e as bibliotecas de movimento
 * ficam fora desta conta de propósito: carregam depois do LCP e só para quem as recebe.
 * Foi a ausência deste portão que deixou 34 KB de conteúdo desnecessário passarem na Fase 1.
 */
const CRITICAL_BUDGET_BYTES = 120 * 1024;

const ASSET = /\/assets\/([A-Za-z0-9._-]+\.js)/g;

export function modulesOf(html: string): string[] {
  return [...new Set([...html.matchAll(ASSET)].map((match) => match[1] as string))];
}

export function renderReport(modules: { name: string; bytes: number }[]): string {
  return [...modules]
    .sort((a, b) => b.bytes - a.bytes)
    .map((module) => `  ${String(module.bytes).padStart(7)} B  ${module.name}`)
    .join("\n");
}

function main(): void {
  const html = readFileSync(join(CLIENT_DIR, "en", "index.html"), "utf8");

  const modules = modulesOf(html).map((name) => ({
    name,
    bytes: gzipSync(readFileSync(join(CLIENT_DIR, "assets", name))).length,
  }));

  const total = modules.reduce((sum, module) => sum + module.bytes, 0);

  console.log(`JS crítico da home:\n${renderReport(modules)}`);
  console.log(
    `  ${String(total).padStart(7)} B  TOTAL (teto ${CRITICAL_BUDGET_BYTES})`,
  );

  if (total > CRITICAL_BUDGET_BYTES) {
    throw new Error(
      `JS crítico em ${total} bytes, acima do teto de ${CRITICAL_BUDGET_BYTES}. ` +
        `O módulo mais pesado está no topo da lista acima. Se o crescimento for ` +
        `legítimo, mude o teto neste arquivo e explique no colofão.`,
    );
  }
}

if (process.argv[1]?.endsWith("check-budget.ts")) {
  main();
}
```

- [ ] **Step 10: Medir o ganho**

```bash
npm run build
```

Expected: a linha `TOTAL` deve cair de ~147 KB para ~114 KB, e o portão passa. Se não cair, algum consumidor do passo 6 ficou para trás — procure `registry` nos imports de `home.tsx` e `site.tsx`.

- [ ] **Step 11: `npm run check` e commit**

```bash
npm run check && npm run build
git add scripts app package.json
git commit -m "perf: separa indice de frontmatter do mdx e adiciona portao de orcamento"
```

---

## Task 2: Tabela de coordenadas dos datacenters

**Contexto:** `request.cf.colo` devolve o código IATA de três letras do datacenter (por exemplo `GIG`), mas **não devolve a coordenada dele**. Sem coordenada não há arco. A Cloudflare não publica endpoint com essas posições — o `speed.cloudflare.com/locations`, que já serviu para isso, hoje responde vazio.

A fonte é o **OurAirports**, base de aeroportos em **domínio público**: 4.560 aeroportos de porte grande ou médio têm código IATA, o que cobre todo colo da Cloudflare. A tabela é gerada uma vez, versionada no repositório para o build ser reprodutível offline, e o script fica para atualizá-la.

**Files:**
- Create: `scripts/build-colos.ts`, `workers/data/colos.json`, `workers/data/colos.ts`, `workers/data/colos.test.ts`

**Interfaces:**
- Produces: `coloLocation(iata: string): { lat: number; lon: number } | undefined` em `workers/data/colos.ts`.

- [ ] **Step 1: Escrever o teste**

Criar `workers/data/colos.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { coloLocation } from "./colos";

describe("coloLocation", () => {
  it("should locate the São Paulo colo", () => {
    const location = coloLocation("GRU");

    expect(location?.lat).toBeCloseTo(-23.43, 1);
    expect(location?.lon).toBeCloseTo(-46.47, 1);
  });

  it("should locate the Lisbon colo", () => {
    expect(coloLocation("LIS")?.lat).toBeCloseTo(38.78, 1);
  });

  it("should accept a lowercase code", () => {
    expect(coloLocation("gru")).toEqual(coloLocation("GRU"));
  });

  it("should return undefined for an unknown code instead of guessing", () => {
    expect(coloLocation("ZZZ")).toBeUndefined();
  });

  it("should keep every coordinate inside the valid range", () => {
    const invalid = Object.entries(
      (coloLocation as unknown as { table: Record<string, [number, number]> }).table ?? {},
    );

    expect(invalid.filter(([, [lat, lon]]) => Math.abs(lat) > 90 || Math.abs(lon) > 180)).toEqual([]);
  });
});
```

O último teste depende da tabela ser alcançável; o passo 3 a exporta como `COLOS` e o teste usa isso — ajuste a asserção para `Object.entries(COLOS)` ao implementar.

- [ ] **Step 2: Rodar para ver falhar**

Run: `npx vitest run workers/data/colos.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Escrever o gerador**

Criar `scripts/build-colos.ts`:

```ts
import { writeFileSync } from "node:fs";

const SOURCE = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const OUT = "workers/data/colos.json";

/** OurAirports é domínio público. Só porte grande e médio: cobre todo colo da Cloudflare. */
const KEEP = new Set(["large_airport", "medium_airport"]);

function parseCsv(text: string): Record<string, string>[] {
  const [header, ...lines] = text.trim().split("\n");
  const columns = splitRow(header as string);

  return lines.map((line) => {
    const cells = splitRow(line);
    return Object.fromEntries(columns.map((name, index) => [name, cells[index] ?? ""]));
  });
}

function splitRow(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else current += char;
  }
  cells.push(current);

  return cells;
}

async function main(): Promise<void> {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`OurAirports respondeu ${response.status}`);

  const rows = parseCsv(await response.text());

  const table: Record<string, [number, number]> = {};
  for (const row of rows) {
    const iata = row.iata_code?.trim();
    if (!iata || iata.length !== 3 || !KEEP.has(row.type ?? "")) continue;

    const lat = Number(row.latitude_deg);
    const lon = Number(row.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;

    table[iata.toUpperCase()] = [
      Number(lat.toFixed(4)),
      Number(lon.toFixed(4)),
    ];
  }

  writeFileSync(OUT, JSON.stringify(table));
  console.log(`tabela de colos: ${Object.keys(table).length} códigos IATA`);
}

await main();
```

- [ ] **Step 4: Gerar a tabela**

Run: `npx tsx scripts/build-colos.ts`
Expected: `tabela de colos: 4560 códigos IATA` (o número pode variar levemente entre atualizações da base).

- [ ] **Step 5: Implementar o acesso**

Criar `workers/data/colos.ts`:

```ts
import table from "./colos.json";

export const COLOS = table as Record<string, [number, number]>;

/** Colo desconhecido devolve undefined: o painel diz que não mediu, em vez de chutar. */
export function coloLocation(
  iata: string,
): { lat: number; lon: number } | undefined {
  const found = COLOS[iata.toUpperCase()];
  return found ? { lat: found[0], lon: found[1] } : undefined;
}
```

Ajustar o último teste do passo 1 para importar `COLOS` e iterar sobre ele.

- [ ] **Step 6: Rodar os testes e commitar**

```bash
npx vitest run workers/data/colos.test.ts
npm run check
git add scripts/build-colos.ts workers/data
git commit -m "feat: adiciona tabela de coordenadas dos datacenters a partir de dado publico"
```

---

## Task 3: `/api/edge`

**Contexto:** o endpoint que faz a home ser diferente para cada visitante. Lê `request.cf`, resolve a coordenada do colo pela tabela da Task 2, e responde. **Não loga, não armazena, e não pode ser cacheado.**

**Files:**
- Create: `workers/api/edge.ts`, `workers/api/edge.test.ts`
- Modify: `workers/app.ts`

**Interfaces:**
- Produces: `type EdgeTelemetry = { visitor: { city?: string; region?: string; country?: string; lat?: number; lon?: number }; colo: { code: string; lat: number; lon: number } | null; httpProtocol?: string; tlsVersion?: string }`
- Produces: `buildTelemetry(cf: IncomingRequestCfProperties | undefined): EdgeTelemetry`
- Produces: `handleEdge(request: Request): Response`

- [ ] **Step 1: Escrever os testes**

Criar `workers/api/edge.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildTelemetry } from "./edge";

const cf = {
  city: "Betim",
  region: "Minas Gerais",
  country: "BR",
  latitude: "-19.9678",
  longitude: "-44.1983",
  colo: "GIG",
  httpProtocol: "HTTP/3",
  tlsVersion: "TLSv1.3",
} as unknown as IncomingRequestCfProperties;

describe("buildTelemetry", () => {
  it("should convert the visitor coordinates from string to number", () => {
    expect(buildTelemetry(cf).visitor.lat).toBeCloseTo(-19.9678, 4);
  });

  it("should resolve the colo coordinates from its code", () => {
    expect(buildTelemetry(cf).colo?.lat).toBeCloseTo(-22.81, 1);
  });

  it("should keep the city of the visitor", () => {
    expect(buildTelemetry(cf).visitor.city).toBe("Betim");
  });

  it("should never expose the address or the network of the visitor", () => {
    const serialized = JSON.stringify(buildTelemetry(cf));

    expect(serialized).not.toMatch(/asOrganization|asn|ip/i);
  });

  it("should report a null colo when the code is unknown, instead of guessing", () => {
    const unknown = { ...cf, colo: "ZZZ" } as unknown as IncomingRequestCfProperties;

    expect(buildTelemetry(unknown).colo).toBeNull();
  });

  it("should omit the coordinates when the platform did not send them", () => {
    const partial = { colo: "GIG" } as unknown as IncomingRequestCfProperties;

    expect(buildTelemetry(partial).visitor.lat).toBeUndefined();
  });

  it("should survive a request without cf at all", () => {
    expect(buildTelemetry(undefined).colo).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `npx vitest run workers/api/edge.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

Criar `workers/api/edge.ts`:

```ts
import { coloLocation } from "../data/colos";

export type EdgeTelemetry = {
  visitor: {
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  colo: { code: string; lat: number; lon: number } | null;
  httpProtocol?: string;
  tlsVersion?: string;
};

function coordinate(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Só o que o painel mostra. IP, ASN e organização ficam de fora de propósito:
 * publicá-los mudaria a natureza do que está sendo exibido ao visitante.
 */
export function buildTelemetry(
  cf: IncomingRequestCfProperties | undefined,
): EdgeTelemetry {
  const code = typeof cf?.colo === "string" ? cf.colo : "";
  const location = code ? coloLocation(code) : undefined;

  return {
    visitor: {
      city: typeof cf?.city === "string" ? cf.city : undefined,
      region: typeof cf?.region === "string" ? cf.region : undefined,
      country: typeof cf?.country === "string" ? cf.country : undefined,
      lat: coordinate(cf?.latitude),
      lon: coordinate(cf?.longitude),
    },
    colo: location ? { code: code.toUpperCase(), ...location } : null,
    httpProtocol:
      typeof cf?.httpProtocol === "string" ? cf.httpProtocol : undefined,
    tlsVersion: typeof cf?.tlsVersion === "string" ? cf.tlsVersion : undefined,
  };
}

export function handleEdge(request: Request): Response {
  return new Response(JSON.stringify(buildTelemetry(request.cf)), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // A resposta é diferente para cada visitante e não pode ser servida a outro.
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 4: Ligar no Worker**

Em `workers/app.ts`, antes do `requestHandler`:

```ts
    if (url.pathname === "/api/edge") {
      return handleEdge(request);
    }
```

`run_worker_first` já cobre `/api/*` no `wrangler.jsonc`; nada muda ali.

- [ ] **Step 5: Rodar os testes**

Run: `npx vitest run workers/api/edge.test.ts`
Expected: PASS, 7 testes.

- [ ] **Step 6: Verificar no servidor real**

```bash
npm run build
npx wrangler dev --port 8788 &
sleep 10
curl -s -i http://localhost:8788/api/edge | head -6
pkill -f "wrangler dev --port 8788"
```

Expected: `200`, `Cache-Control: no-store`, e um JSON com `visitor` e `colo`. Em `wrangler dev` local o `cf` costuma vir com valores de teste — o importante é que a forma esteja certa e nada quebre.

- [ ] **Step 7: Commit**

```bash
npm run check
git add workers
git commit -m "feat: adiciona endpoint de telemetria da requisicao sem log e sem cache"
```

---

## Task 4: Projeção — a matemática que sustenta as duas versões

**Contexto:** a peça central da fase. O globo 3D e o SVG estático precisam desenhar **exatamente os mesmos dois pontos e o mesmo arco**, então a matemática vive fora dos dois, sem React e sem Three.js. É a única parte que dá para testar contra a realidade sem abrir browser.

**Files:**
- Create: `app/hero/projection.ts`, `app/hero/projection.test.ts`

**Interfaces:**
- Produces: `type Coord = { lat: number; lon: number }`
- Produces: `type Vector3 = { x: number; y: number; z: number }`
- Produces: `toVector(coord: Coord, radius?: number): Vector3`
- Produces: `project(point: Vector3, center: Coord, radius: number): { x: number; y: number; front: boolean }`
- Produces: `greatCircle(from: Coord, to: Coord, segments?: number): Coord[]`
- Produces: `distanceKm(from: Coord, to: Coord): number`

- [ ] **Step 1: Escrever os testes contra distâncias reais**

Criar `app/hero/projection.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { distanceKm, greatCircle, project, toVector } from "./projection";

const BETIM = { lat: -19.9678, lon: -44.1983 };
const RIO = { lat: -22.81, lon: -43.2506 };
const LISBOA = { lat: 38.7813, lon: -9.1359 };

describe("distanceKm", () => {
  it("should measure the known distance from Betim to Rio", () => {
    // ~370 km em linha reta, conferível em qualquer mapa.
    expect(distanceKm(BETIM, RIO)).toBeGreaterThan(340);
    expect(distanceKm(BETIM, RIO)).toBeLessThan(400);
  });

  it("should measure the known distance from Betim to Lisbon", () => {
    // ~7.400 km atravessando o Atlântico.
    expect(distanceKm(BETIM, LISBOA)).toBeGreaterThan(7200);
    expect(distanceKm(BETIM, LISBOA)).toBeLessThan(7600);
  });

  it("should be zero for the same point", () => {
    expect(distanceKm(BETIM, BETIM)).toBeCloseTo(0, 5);
  });

  it("should be symmetric", () => {
    expect(distanceKm(BETIM, LISBOA)).toBeCloseTo(distanceKm(LISBOA, BETIM), 6);
  });
});

describe("toVector", () => {
  it("should put the north pole at the top", () => {
    const point = toVector({ lat: 90, lon: 0 });

    expect(point.y).toBeCloseTo(1, 6);
    expect(point.x).toBeCloseTo(0, 6);
  });

  it("should keep every point on the sphere surface", () => {
    const point = toVector(LISBOA, 3);
    const length = Math.hypot(point.x, point.y, point.z);

    expect(length).toBeCloseTo(3, 6);
  });
});

describe("project", () => {
  it("should place the center of the view at the origin of the screen", () => {
    const projected = project(toVector(BETIM), BETIM, 100);

    expect(projected.x).toBeCloseTo(0, 6);
    expect(projected.y).toBeCloseTo(0, 6);
  });

  it("should mark the center of the view as facing the viewer", () => {
    expect(project(toVector(BETIM), BETIM, 100).front).toBe(true);
  });

  it("should mark the far side of the globe as hidden", () => {
    const antipode = { lat: -BETIM.lat, lon: BETIM.lon + 180 };

    expect(project(toVector(antipode), BETIM, 100).front).toBe(false);
  });

  it("should scale to the given radius", () => {
    const east = project(toVector({ lat: 0, lon: 90 }), { lat: 0, lon: 0 }, 100);

    expect(Math.abs(east.x)).toBeCloseTo(100, 4);
  });
});

describe("greatCircle", () => {
  it("should start at the origin and end at the destination", () => {
    const path = greatCircle(BETIM, LISBOA, 8);

    expect(path[0]?.lat).toBeCloseTo(BETIM.lat, 4);
    expect(path.at(-1)?.lon).toBeCloseTo(LISBOA.lon, 4);
  });

  it("should return one more point than the number of segments", () => {
    expect(greatCircle(BETIM, LISBOA, 8)).toHaveLength(9);
  });

  it("should follow the shortest path over the sphere", () => {
    const path = greatCircle(BETIM, LISBOA, 32);
    const walked = path
      .slice(1)
      .reduce((sum, point, index) => sum + distanceKm(path[index] as typeof point, point), 0);

    // A soma dos trechos aproxima a distância direta por cima, nunca por baixo.
    expect(walked).toBeGreaterThanOrEqual(distanceKm(BETIM, LISBOA) - 1);
    expect(walked).toBeLessThan(distanceKm(BETIM, LISBOA) * 1.01);
  });

  it("should keep a single point when origin and destination match", () => {
    const path = greatCircle(BETIM, BETIM, 4);

    expect(path.every((point) => Math.abs(point.lat - BETIM.lat) < 1e-6)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `npx vitest run app/hero/projection.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

Criar `app/hero/projection.ts`:

```ts
export type Coord = { lat: number; lon: number };
export type Vector3 = { x: number; y: number; z: number };

const EARTH_RADIUS_KM = 6371;
const RAD = Math.PI / 180;

/** Convenção y para cima, a mesma do Three.js, para a cena e o SVG concordarem. */
export function toVector(coord: Coord, radius = 1): Vector3 {
  const lat = coord.lat * RAD;
  const lon = coord.lon * RAD;
  const cosLat = Math.cos(lat);

  return {
    x: radius * cosLat * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: radius * cosLat * Math.sin(lon),
  };
}

/**
 * Projeção ortográfica: gira a esfera até o centro pedido ficar de frente e devolve
 * a posição na tela. `front` é falso para o que está do outro lado do globo.
 */
export function project(
  point: Vector3,
  center: Coord,
  radius: number,
): { x: number; y: number; front: boolean } {
  const lat = center.lat * RAD;
  const lon = center.lon * RAD;

  // Rotação em torno do eixo y, levando a longitude do centro para frente.
  const x1 = point.x * Math.cos(-lon) - point.z * Math.sin(-lon);
  const z1 = point.x * Math.sin(-lon) + point.z * Math.cos(-lon);

  // Rotação em torno do eixo x, levando a latitude do centro para o equador da vista.
  const y2 = point.y * Math.cos(-lat) - z1 * Math.sin(-lat);
  const z2 = point.y * Math.sin(-lat) + z1 * Math.cos(-lat);

  return { x: x1 * radius, y: y2 * radius, front: z2 >= 0 };
}

/** Interpolação sobre a esfera: o caminho mais curto de verdade, não uma reta no plano. */
export function greatCircle(from: Coord, to: Coord, segments = 48): Coord[] {
  const a = toVector(from);
  const b = toVector(to);

  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const angle = Math.acos(dot);

  if (angle < 1e-9) {
    return Array.from({ length: segments + 1 }, () => ({ ...from }));
  }

  const sin = Math.sin(angle);

  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const scaleA = Math.sin((1 - t) * angle) / sin;
    const scaleB = Math.sin(t * angle) / sin;

    const x = a.x * scaleA + b.x * scaleB;
    const y = a.y * scaleA + b.y * scaleB;
    const z = a.z * scaleA + b.z * scaleB;

    return {
      lat: Math.asin(y / Math.hypot(x, y, z)) / RAD,
      lon: Math.atan2(z, x) / RAD,
    };
  });
}

export function distanceKm(from: Coord, to: Coord): number {
  const dLat = (to.lat - from.lat) * RAD;
  const dLon = (to.lon - from.lon) * RAD;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from.lat * RAD) * Math.cos(to.lat * RAD) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
```

- [ ] **Step 4: Rodar para ver passar**

Run: `npx vitest run app/hero/projection.test.ts`
Expected: PASS, 14 testes.

- [ ] **Step 5: Commit**

```bash
npm run check
git add app/hero
git commit -m "feat: adiciona projecao e distancia como matematica pura testada"
```

---

## Task 5: Portão de capacidade

**Contexto:** a decisão que evita download desnecessário. Precisa acontecer **antes** de qualquer `import()`, e distingue dois sinais que o spec separa de propósito: **movimento reduzido** desliga a camada inteira no site todo; **aparelho incapaz** desliga só a cena 3D.

**Files:**
- Create: `app/hero/capability.ts`, `app/hero/capability.test.ts`

**Interfaces:**
- Produces: `type Environment = { reducedMotion: boolean; webgl: boolean; memoryGb?: number; cores?: number }`
- Produces: `decide(env: Environment): { scene: boolean; motion: boolean }`
- Produces: `readEnvironment(): Environment`

- [ ] **Step 1: Escrever os testes**

Criar `app/hero/capability.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { decide } from "./capability";

const capable = { reducedMotion: false, webgl: true, memoryGb: 8, cores: 8 };

describe("decide", () => {
  it("should allow both scene and motion on a capable device", () => {
    expect(decide(capable)).toEqual({ scene: true, motion: true });
  });

  it("should turn off the whole motion layer when the visitor asked for less motion", () => {
    expect(decide({ ...capable, reducedMotion: true })).toEqual({
      scene: false,
      motion: false,
    });
  });

  it("should keep motion when only webgl is missing", () => {
    expect(decide({ ...capable, webgl: false })).toEqual({
      scene: false,
      motion: true,
    });
  });

  it("should turn off the scene on a device with little memory", () => {
    expect(decide({ ...capable, memoryGb: 2 }).scene).toBe(false);
  });

  it("should turn off the scene on a device with few cores", () => {
    expect(decide({ ...capable, cores: 2 }).scene).toBe(false);
  });

  it("should keep motion on a weak device, because transitions are cheap", () => {
    expect(decide({ ...capable, memoryGb: 2, cores: 2 }).motion).toBe(true);
  });

  it("should not punish a browser that does not report memory or cores", () => {
    expect(decide({ reducedMotion: false, webgl: true }).scene).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `npx vitest run app/hero/capability.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

Criar `app/hero/capability.ts`:

```ts
export type Environment = {
  reducedMotion: boolean;
  webgl: boolean;
  memoryGb?: number;
  cores?: number;
};

const MIN_MEMORY_GB = 4;
const MIN_CORES = 4;

/**
 * Dois sinais independentes. Movimento reduzido é preferência declarada e vale para
 * tudo. Aparelho fraco desliga só a cena: transição de rota é barata e não incomoda.
 * Navegador que não informa memória ou núcleos não é penalizado — ausência de dado
 * não é evidência de fraqueza.
 */
export function decide(env: Environment): { scene: boolean; motion: boolean } {
  if (env.reducedMotion) return { scene: false, motion: false };

  const weak =
    (env.memoryGb !== undefined && env.memoryGb < MIN_MEMORY_GB) ||
    (env.cores !== undefined && env.cores < MIN_CORES);

  return { scene: env.webgl && !weak, motion: true };
}

function supportsWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export function readEnvironment(): Environment {
  const navigatorWithHints = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl: supportsWebgl(),
    memoryGb: navigatorWithHints.deviceMemory,
    cores: navigatorWithHints.hardwareConcurrency,
  };
}
```

- [ ] **Step 4: Rodar para ver passar**

Run: `npx vitest run app/hero/capability.test.ts`
Expected: PASS, 7 testes.

- [ ] **Step 5: Commit**

```bash
npm run check
git add app/hero
git commit -m "feat: adiciona portao de capacidade separando movimento reduzido de aparelho fraco"
```

---

## Task 6: Telemetria no cliente

**Contexto:** busca `/api/edge` uma vez, cronometra a própria requisição para obter o RTT, e expõe três estados. Timeout explícito: uma medição que demora mais que quatro segundos não vale mais nada e vira falha.

**Files:**
- Create: `app/hero/telemetry.ts`, `app/hero/telemetry.test.ts`

**Interfaces:**
- Consumes: `EdgeTelemetry` de `workers/api/edge.ts` — copiar o tipo para `app/hero/telemetry.ts`, porque `app/` não importa de `workers/`.
- Produces: `type TelemetryState = { status: "idle" } | { status: "loading" } | { status: "ready"; data: EdgeTelemetry; rttMs: number } | { status: "failed" }`

**Por que existe um estado `idle`:** as páginas são pré-renderizadas. Se o estado inicial fosse `loading`, o HTML estático diria "Medindo…" — e para quem está sem JavaScript essa frase ficaria ali para sempre, mentindo sobre uma medição que nunca vai começar. O `idle` é o que o HTML estático carrega: traços no lugar dos números e uma linha dizendo que a medição depende de JavaScript. O hook só passa para `loading` dentro do efeito, que por definição só roda se houver JavaScript.

Isso também é o que faz servidor e cliente concordarem no primeiro quadro, evitando repetir o erro de hidratação da Fase 1.
- Produces: `measure(fetchImpl: typeof fetch, now: () => number, timeoutMs?: number): Promise<TelemetryState>`
- Produces: `useEdgeTelemetry(enabled: boolean): TelemetryState`

- [ ] **Step 1: Escrever os testes**

Criar `app/hero/telemetry.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { measure } from "./telemetry";

const payload = {
  visitor: { city: "Betim", lat: -19.9678, lon: -44.1983 },
  colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
};

const ok = () =>
  Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));

describe("measure", () => {
  it("should report the data when the edge answers", async () => {
    const state = await measure(ok as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("ready");
  });

  it("should measure the round trip from the clock, not from the payload", async () => {
    const clock = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1240);

    const state = await measure(ok as unknown as typeof fetch, clock);

    expect(state).toMatchObject({ rttMs: 240 });
  });

  it("should fail when the edge answers with an error status", async () => {
    const failing = () => Promise.resolve(new Response("", { status: 500 }));

    const state = await measure(failing as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("failed");
  });

  it("should fail when the network throws", async () => {
    const throwing = () => Promise.reject(new Error("offline"));

    const state = await measure(throwing as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("failed");
  });

  it("should fail when the answer is not valid json", async () => {
    const garbled = () => Promise.resolve(new Response("<html>", { status: 200 }));

    const state = await measure(garbled as unknown as typeof fetch, () => 0);

    expect(state.status).toBe("failed");
  });

  it("should give up on a measurement that took too long to be worth anything", async () => {
    const never = () => new Promise<Response>(() => {});

    const state = await measure(never as unknown as typeof fetch, () => 0, 10);

    expect(state.status).toBe("failed");
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `npx vitest run app/hero/telemetry.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

Criar `app/hero/telemetry.ts`:

```ts
import { useEffect, useState } from "react";

export type EdgeTelemetry = {
  visitor: {
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  colo: { code: string; lat: number; lon: number } | null;
  httpProtocol?: string;
  tlsVersion?: string;
};

export type TelemetryState =
  | { status: "loading" }
  | { status: "ready"; data: EdgeTelemetry; rttMs: number }
  | { status: "failed" };

const TIMEOUT_MS = 4000;

/** O RTT sai do relógio do browser: é a única parte que o servidor não tem como informar. */
export async function measure(
  fetchImpl: typeof fetch,
  now: () => number,
  timeoutMs = TIMEOUT_MS,
): Promise<TelemetryState> {
  const started = now();

  const timeout = new Promise<TelemetryState>((resolve) =>
    setTimeout(() => resolve({ status: "failed" }), timeoutMs),
  );

  const request = (async (): Promise<TelemetryState> => {
    try {
      const response = await fetchImpl("/api/edge", { cache: "no-store" });
      if (!response.ok) return { status: "failed" };

      const data = (await response.json()) as EdgeTelemetry;
      return { status: "ready", data, rttMs: Math.round(now() - started) };
    } catch {
      return { status: "failed" };
    }
  })();

  return Promise.race([request, timeout]);
}

export function useEdgeTelemetry(enabled: boolean): TelemetryState {
  // idle é o estado do HTML pré-renderizado: sem JavaScript, ele permanece, e o painel
  // diz que a medição depende de JavaScript em vez de prometer que está medindo.
  const [state, setState] = useState<TelemetryState>({ status: "idle" });

  useEffect(() => {
    if (!enabled) return;

    let alive = true;
    setState({ status: "loading" });
    void measure(fetch, () => performance.now()).then((next) => {
      if (alive) setState(next);
    });

    return () => {
      alive = false;
    };
  }, [enabled]);

  return state;
}
```

- [ ] **Step 4: Rodar para ver passar**

Run: `npx vitest run app/hero/telemetry.test.ts`
Expected: PASS, 6 testes.

- [ ] **Step 5: Commit**

```bash
npm run check
git add app/hero
git commit -m "feat: adiciona carga de telemetria com rtt medido e falha explicita"
```

---

## Task 7: Painel de telemetria

**Contexto:** a leitura dos dados. É o que entrega a promessa mesmo se a cena nunca carregar, então precisa funcionar sozinho.

**Files:**
- Create: `app/hero/telemetry-panel.tsx`
- Modify: dicionários dos três idiomas

- [ ] **Step 1: Strings**

Acrescentar ao tipo `Dictionary` e aos três arquivos de mensagem: `hero.you`, `hero.servedBy`, `hero.distance`, `hero.rtt`, `hero.protocol`, `hero.tls`, `hero.measuring`, `hero.unavailable`, `hero.privacy`.

Textos em pt-BR:

```ts
  "hero.you": "Você",
  "hero.servedBy": "Servido por",
  "hero.distance": "Distância",
  "hero.rtt": "Ida e volta",
  "hero.protocol": "Protocolo",
  "hero.tls": "TLS",
  "hero.measuring": "Medindo…",
  "hero.unavailable": "Não foi possível medir",
  "hero.privacy":
    "Estes dados vieram da sua própria requisição e não foram armazenados.",
```

Traduzir para pt-PT (`"Ida e volta"` → `"Ida e volta"`, `"Medindo…"` → `"A medir…"`) e en-US (`"You"`, `"Served by"`, `"Distance"`, `"Round trip"`, `"Protocol"`, `"TLS"`, `"Measuring…"`, `"Could not measure"`, `"This data came from your own request and was not stored."`).

- [ ] **Step 2: Escrever o componente**

Criar `app/hero/telemetry-panel.tsx`, que recebe `state: TelemetryState` e renderiza uma `<dl>` em `font-mono`, com uma linha por campo.

Acrescentar também `hero.needsJs`, em pt-BR `"A medição depende de JavaScript."`, em pt-PT o mesmo, e em en-US `"Measuring requires JavaScript."`.

Regras que o componente precisa cumprir:

- **`idle`** → cada valor mostra `—` e a nota abaixo é `hero.needsJs`. É o estado do HTML estático e o único que sobrevive sem JavaScript.
- **`loading`** → cada valor mostra `hero.measuring`, com `aria-busy="true"` na lista.
- **`failed`** → cada valor mostra `hero.unavailable`. Nenhum zero, nenhuma estimativa.
- **`ready`** → cidade e país do visitante; código do colo; distância formatada com `formatNumber` e sufixo `km`; RTT em `ms`; protocolo; TLS. **Campo ausente na resposta mostra `hero.unavailable`, não some** — a linha sumir mudaria a altura e causaria salto de layout.
- A distância só aparece quando **as quatro coordenadas** existem; se o colo for `null`, ela é `hero.unavailable`.
- Abaixo da lista, `hero.privacy` em texto menor.
- `aria-live="polite"` na lista, para que o preenchimento seja anunciado sem interromper.

Altura reservada desde o esqueleto, para CLS zero.

- [ ] **Step 3: Teste de unidade da formatação**

Criar `app/hero/telemetry-panel.test.ts` cobrindo a função `describeState(state, locale, t)` — extraia dela a decisão de qual texto cada campo recebe, para poder testar sem renderizar:

```ts
it("should never show a zero for a missing measurement", () => {
  const rows = describeState({ status: "failed" }, "pt-BR", dictionary);

  expect(rows.every((row) => row.value === dictionary["hero.unavailable"])).toBe(true);
});

it("should keep every row present while loading, to avoid a layout shift", () => {
  expect(describeState({ status: "loading" }, "pt-BR", dictionary)).toHaveLength(6);
});

it("should not promise a measurement in the state the static html carries", () => {
  const rows = describeState({ status: "idle" }, "pt-BR", dictionary);

  expect(rows.every((row) => row.value === "—")).toBe(true);
});

it("should tell a visitor without javascript why the numbers are missing", () => {
  expect(noteFor({ status: "idle" }, dictionary)).toBe(dictionary["hero.needsJs"]);
});
```

`noteFor(state, dictionary)` é a função irmã que decide a linha abaixo da lista: `hero.needsJs` em `idle`, `hero.privacy` nos demais estados.

- [ ] **Step 4: Commit**

```bash
npm run check
git add app app/i18n
git commit -m "feat: adiciona painel de telemetria com esqueleto e falha sem numero inventado"
```

---

## Task 8: Globo estático em SVG

**Contexto:** a versão que quem pede movimento reduzido, quem não tem WebGL e quem está em aparelho fraco recebe. Não é consolo: é a versão correta para essas pessoas, e é mais rápida. Usa a projeção da Task 4 e **nenhuma biblioteca**.

**Files:**
- Create: `app/hero/globe-static.tsx`, `app/hero/graticule.ts`, `app/hero/graticule.test.ts`

**Interfaces:**
- Consumes: `project`, `toVector`, `greatCircle` da Task 4.
- Produces: `graticule(step?: number): Coord[][]` — meridianos e paralelos como listas de pontos.

- [ ] **Step 1: Teste da grade**

```ts
it("should close every parallel around the globe", () => {
  const lines = graticule(30);
  const parallel = lines.find((line) => line.every((p) => p.lat === line[0]?.lat));

  expect(parallel?.at(0)?.lon).toBeCloseTo(-180, 4);
  expect(parallel?.at(-1)?.lon).toBeCloseTo(180, 4);
});

it("should draw meridians from pole to pole", () => {
  const lines = graticule(30);
  const meridian = lines.find((line) => line.every((p) => p.lon === line[0]?.lon));

  expect(meridian?.at(0)?.lat).toBeCloseTo(-90, 4);
});
```

- [ ] **Step 2: Implementar `graticule` e o componente**

O SVG desenha, em ordem:

1. Círculo do disco do globo, com `--hairline`.
2. Grade de meridianos e paralelos a cada 30°, apenas os segmentos com `front: true`, em `--hairline`.
3. O arco da Task 4 entre visitante e colo, em `--accent`, com os trechos escondidos atrás do globo omitidos.
4. Dois marcadores: visitante como círculo vazado, colo como círculo cheio em `--signal`.

Sem marcadores quando o estado não for `ready`. O centro da projeção é a coordenada do visitante quando ela existe; enquanto não existe, é `{ lat: -15, lon: -47 }`, o centro geográfico do Brasil — **isso é enquadramento de câmera, não afirmação de dado**, e nenhum marcador é desenhado até o dado chegar.

`role="img"` com `aria-label` descrevendo em palavras o que o desenho mostra, montado das mesmas strings do painel.

- [ ] **Step 3: Commit**

```bash
npm run check
git add app/hero
git commit -m "feat: adiciona globo estatico em svg usando a mesma projecao da cena"
```

---

## Task 9: Cena 3D

**Contexto:** o globo em Three.js via R3F, carregado com `lazy` depois do LCP e **apenas** quando a Task 5 autorizar.

**Files:**
- Create: `app/hero/globe-scene.tsx`, `app/hero/hero.tsx`
- Modify: `app/routes/home.tsx`
- Modify: `package.json`

- [ ] **Step 1: Instalar, nas versões verificadas**

```bash
npm install three@0.185.1 @react-three/fiber@9.7.0
npm install -D @types/three
npm audit --omit=dev
```

O R3F 9.7 declara `react >=19 <19.3` como peer; o projeto está em 19.2.8. **Não atualizar React nesta fase** — subir para 19.3 quebra o peer.

- [ ] **Step 2: Compor o hero**

Criar `app/hero/hero.tsx`, que decide e compõe:

```tsx
const [env, setEnv] = useState<Environment | null>(null);
useEffect(() => setEnv(readEnvironment()), []);

const choice = env ? decide(env) : { scene: false, motion: false };
const telemetry = useEdgeTelemetry(env !== null);
```

Enquanto `env` é `null` — primeira pintura, antes do efeito — renderiza o globo estático. Isso garante que o HTML pré-renderizado e o primeiro quadro do cliente concordem, que é o que evita repetir o erro de hidratação da Fase 1.

Quando `choice.scene` for verdadeiro, troca para `<Suspense fallback={<GlobeStatic .../>}><GlobeScene .../></Suspense>` com `const GlobeScene = lazy(() => import("./globe-scene"))`.

- [ ] **Step 3: A cena**

`globe-scene.tsx` renderiza um `<Canvas>` com:

- Esfera de raio 1 com material escuro quase preto e uma malha de wireframe fina em `--hairline`.
- Os dois marcadores como pequenas esferas, posicionados por `toVector`.
- O arco como `BufferGeometry` construído dos pontos de `greatCircle`, elevados progressivamente acima da superfície para o arco sair do globo — altura máxima proporcional à distância.
- `frameloop="demand"` e um `IntersectionObserver` que só pede quadro enquanto o canvas está visível; `document.visibilitychange` pausa junto.
- `dpr={[1, 2]}` para não renderizar em 3x num celular topo de linha.

Sem marcadores e sem arco enquanto o estado não for `ready`.

- [ ] **Step 4: Verificar o orçamento e o carregamento tardio**

```bash
npm run build
```

Expected: `check-budget` continua passando — a cena não pode entrar na conta crítica. Se entrar, o `lazy` não está isolando o chunk: confirme que `globe-scene.tsx` não é importado de forma estática em lugar nenhum.

- [ ] **Step 5: Commit**

```bash
npm run check
git add app package.json package-lock.json
git commit -m "feat: adiciona cena 3d do globo carregada sob demanda"
```

---

## Task 10: Movimento do hero — a câmera que procura e para

**Contexto:** o movimento com motivo narrativo que a regra 5 do spec pede. O globo entra girando devagar porque **ainda não sabe onde você está**; quando `/api/edge` responde, a câmera desacelera com inércia até parar na sua região, e só então o arco é desenhado.

**Files:**
- Create: `app/hero/camera-motion.ts`, `app/hero/camera-motion.test.ts`
- Modify: `app/hero/globe-scene.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: `targetRotation(coord: Coord): { x: number; y: number }` — a rotação que põe a coordenada de frente.
- Produces: `settleTween(from: { x: number; y: number }, to: { x: number; y: number }): { duration: number; ease: string }`

- [ ] **Step 1: Instalar**

```bash
npm install gsap@3.15.0
npm audit --omit=dev
```

- [ ] **Step 2: Testar a matemática da câmera, que é o que dá para testar**

Criar `app/hero/camera-motion.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { settleTween, targetRotation } from "./camera-motion";

describe("targetRotation", () => {
  it("should face the equator without tilting", () => {
    expect(targetRotation({ lat: 0, lon: 0 }).x).toBeCloseTo(0, 6);
  });

  it("should turn the globe by the longitude", () => {
    const rotation = targetRotation({ lat: 0, lon: 90 });

    expect(Math.abs(rotation.y)).toBeCloseTo(Math.PI / 2, 6);
  });

  it("should tilt toward the southern hemisphere for a southern visitor", () => {
    expect(targetRotation({ lat: -20, lon: -44 }).x).toBeLessThan(0);
  });
});

describe("settleTween", () => {
  it("should take longer for a longer way to travel", () => {
    const near = settleTween({ x: 0, y: 0 }, { x: 0, y: 0.1 });
    const far = settleTween({ x: 0, y: 0 }, { x: 0, y: 3 });

    expect(far.duration).toBeGreaterThan(near.duration);
  });

  it("should never take longer than the patience of a reader", () => {
    const across = settleTween({ x: 0, y: 0 }, { x: Math.PI, y: Math.PI });

    expect(across.duration).toBeLessThanOrEqual(2.4);
  });

  it("should ease out, because the globe is arriving and not leaving", () => {
    expect(settleTween({ x: 0, y: 0 }, { x: 0, y: 1 }).ease).toMatch(/out/);
  });
});
```

- [ ] **Step 3: Implementar**

Criar `app/hero/camera-motion.ts`:

```ts
import type { Coord } from "./projection";

const RAD = Math.PI / 180;

/** Rotação do globo que traz a coordenada para a frente da câmera. */
export function targetRotation(coord: Coord): { x: number; y: number } {
  return { x: coord.lat * RAD, y: -coord.lon * RAD };
}

const MIN_DURATION = 0.9;
const MAX_DURATION = 2.4;

/**
 * Inércia, não interpolação linear: a duração cresce com a distância angular e satura,
 * e a curva desacelera na chegada. É a diferença entre "a câmera parou" e "a câmera
 * encontrou".
 */
export function settleTween(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { duration: number; ease: string } {
  const travel = Math.hypot(to.x - from.x, to.y - from.y);
  const duration = Math.min(
    MAX_DURATION,
    MIN_DURATION + (travel / Math.PI) * 1.2,
  );

  return { duration, ease: "power3.out" };
}
```

- [ ] **Step 4: Ligar na cena**

Em `globe-scene.tsx`, quando o estado virar `ready` e houver coordenada do visitante:

1. Para a rotação contínua.
2. `gsap.to(globeRef.current.rotation, { ...settleTween(atual, alvo), ...alvo, onUpdate: invalidate })` — `invalidate` é necessário porque a cena usa `frameloop="demand"`.
3. Ao terminar, anima o arco de 0 a 1 com `gsap.to`, usando `setDrawRange` na geometria para o arco ser **desenhado** e não aparecer pronto.
4. Os marcadores entram com escala de 0 a 1, o do visitante primeiro e o do colo depois, com 120 ms de intervalo.

Sem coordenada do visitante, a rotação lenta continua e nada mais acontece.

- [ ] **Step 5: Verificação manual**

```bash
npm run dev
```

Abrir `/pt-br/`, confirmar: o globo entra girando, desacelera até parar, o arco é desenhado da sua posição até o datacenter, e o painel preenche. Depois abrir com movimento reduzido ligado no sistema operacional e confirmar que **nada disso acontece** e o SVG aparece.

- [ ] **Step 6: Commit**

```bash
npm run check
git add app/hero package.json package-lock.json
git commit -m "feat: anima a camera com inercia ate a regiao do visitante"
```

---

## Task 11: Revelação por scroll

**Contexto:** as seções da home entrando em cena. É o que evita que a página abaixo do hero pareça um documento estático depois de um hero vivo.

**Files:**
- Create: `app/motion/reveal.tsx`
- Modify: `app/routes/home.tsx`

- [ ] **Step 1: Componente**

`Reveal` recebe `children` e envolve numa `div`. No efeito, se `decide(readEnvironment()).motion` for falso, **não faz nada** — o conteúdo já está no estado final, porque o CSS inicial não esconde nada. Só quando o movimento está autorizado é que ele aplica o estado inicial e registra o ScrollTrigger.

Essa ordem importa e é o oposto do que se costuma escrever: **o estado final é o padrão do HTML**, e a animação é que retrocede para animar. Assim, sem JavaScript ou com movimento reduzido, a página está correta sem depender de nada.

```tsx
useEffect(() => {
  if (!decide(readEnvironment()).motion) return;

  void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(
        element.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: element.current, start: "top 85%" },
        },
      );
    },
  );
}, []);
```

- [ ] **Step 2: Aplicar**

Envolver as três seções da home — prova, caminhos por persona e escritos recentes. **Não envolver o hero**: ele já tem o próprio movimento e não deve depender de scroll.

- [ ] **Step 3: Commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: revela as secoes da home no scroll com o estado final como padrao"
```

---

## Task 12: Transição de rota

**Files:**
- Create: `app/motion/page-transition.tsx`
- Modify: `app/layouts/site.tsx`, `package.json`

- [ ] **Step 1: Instalar**

```bash
npm install motion@12.43.0
npm audit --omit=dev
```

- [ ] **Step 2: Componente**

Envolve o `<Outlet />` do layout. Usa `useLocation().pathname` como chave e anima opacidade e um deslocamento de 8 px na entrada, com 180 ms. Atrás do mesmo portão: sem movimento autorizado, renderiza os filhos direto, sem importar a biblioteca.

Deslocamento curto e rápido de propósito: transição de rota que chama atenção atrapalha a leitura, que é o objetivo do site.

- [ ] **Step 3: Commit**

```bash
npm run check && npm run build
git add app package.json package-lock.json
git commit -m "feat: adiciona transicao de rota curta atras do portao de movimento"
```

---

## Task 13: O site conta a escolha

**Contexto:** o colofão existe para explicar decisões, e esta fase tomou a mais cara do projeto. Omitir seria o tipo de silêncio que o próprio colofão critica.

**Files:**
- Modify: `app/content/pages/colophon.{pt-BR,pt-PT,en-US}.mdx`
- Modify: `docs/superpowers/specs/2026-07-31-site-dev-design.md`

- [ ] **Step 1: Nova seção no colofão**

Acrescentar, nos três idiomas, uma seção sobre o hero cobrindo: que os números vêm da própria requisição e não são armazenados; que a cena custa cerca de 175 KB e **não é baixada** por quem pede movimento reduzido nem por quem está em aparelho fraco; que essas pessoas recebem uma versão em SVG com o mesmo desenho; e que o orçamento do JavaScript crítico é verificado no build, com o número atual.

Escrever com o número real medido no fim da fase, não com o estimado aqui.

- [ ] **Step 2: Atualizar o spec do site**

Na seção 8 do spec principal, substituir as duas linhas de orçamento pelas três camadas da seção 7 do spec da Fase 2, com uma frase dizendo que a mudança foi consciente e por quê.

- [ ] **Step 3: Validar e commitar**

```bash
npx tsx scripts/validate-content.ts
npm run check && npm run build
git add app/content docs
git commit -m "docs: o colofao passa a contar o custo da cena e quem nao o paga"
```

---

## Task 14: Verificação da fase

**Files:**
- Create: `e2e/hero.spec.ts`
- Modify: `e2e/acessibilidade.spec.ts`

- [ ] **Step 1: Golden paths do hero**

Criar `e2e/hero.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const TELEMETRY = {
  visitor: { city: "Betim", region: "Minas Gerais", country: "BR", lat: -19.9678, lon: -44.1983 },
  colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
  httpProtocol: "HTTP/3",
  tlsVersion: "TLSv1.3",
};

test("should fill the panel with what the edge reported", async ({ page }) => {
  await page.route("**/api/edge", (route) =>
    route.fulfill({ json: TELEMETRY }),
  );

  await page.goto("/pt-br/");

  await expect(page.getByText("Betim")).toBeVisible();
  await expect(page.getByText("GIG")).toBeVisible();
});

test("should say it could not measure instead of showing a zero", async ({ page }) => {
  await page.route("**/api/edge", (route) => route.fulfill({ status: 500 }));

  await page.goto("/pt-br/");

  await expect(page.getByText("Não foi possível medir").first()).toBeVisible();
  await expect(page.getByText("0 km")).toHaveCount(0);
});

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("should never download the scene", async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });

    await page.goto("/pt-br/");
    await page.waitForLoadState("networkidle");

    expect(scripts.filter((url) => /three|gsap|motion/i.test(url))).toEqual([]);
  });

  test("should still draw the globe as svg", async ({ page }) => {
    await page.route("**/api/edge", (route) => route.fulfill({ json: TELEMETRY }));

    await page.goto("/pt-br/");

    await expect(page.locator('svg[role="img"]')).toBeVisible();
  });
});

test("should keep the headline as the largest paint, not the scene", async ({ page }) => {
  await page.goto("/pt-br/");

  const element = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1) as { element?: Element } | undefined;
          resolve(last?.element?.tagName ?? "none");
        }).observe({ type: "largest-contentful-paint", buffered: true });
      }),
  );

  expect(["H1", "P"]).toContain(element);
});
```

Acrescentar ao mesmo arquivo os dois caminhos que faltam:

```ts
test("should fall back to svg when webgl is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return original.call(this, type, ...(rest as []));
    } as typeof original;
  });

  await page.goto("/pt-br/");

  await expect(page.locator('svg[role="img"]')).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("should stop rendering when the scene leaves the viewport", async ({ page }) => {
  await page.route("**/api/edge", (route) => route.fulfill({ json: TELEMETRY }));
  await page.goto("/pt-br/");
  await page.waitForSelector("canvas");

  const before = await page.evaluate(
    () => (window as unknown as { __frames?: number }).__frames ?? 0,
  );
  await page.evaluate(() => window.scrollTo(0, 4000));
  await page.waitForTimeout(800);
  const after = await page.evaluate(
    () => (window as unknown as { __frames?: number }).__frames ?? 0,
  );

  // A cena expõe um contador de quadros em desenvolvimento para este teste.
  expect(after - before).toBeLessThan(3);
});
```

O contador `window.__frames` é incrementado no loop da cena e existe apenas quando `import.meta.env.DEV` — não vai para produção.

- [ ] **Step 2: axe no hero**

A lista de rotas do axe já sai do build e cobre a home automaticamente. Acrescentar um teste com `/api/edge` interceptado, para o axe rodar com o painel **preenchido** e não só no esqueleto.

- [ ] **Step 3: Medir em aparelho real**

Abrir a home num celular intermediário na mesma rede e confirmar: a cena carrega, o quadro não engasga visivelmente, e o aparelho não esquenta em trinta segundos de página aberta. Se engasgar, subir o limiar de `MIN_CORES` em `capability.ts` em vez de otimizar a cena — é mais honesto entregar o SVG a quem não aguenta.

Registrar o aparelho e o resultado nas notas de execução.

- [ ] **Step 4: Rodar tudo**

```bash
npm run check && npm run build && npx playwright test
```

- [ ] **Step 5: Commit**

```bash
git add e2e
git commit -m "test: cobre painel, falha da telemetria, movimento reduzido e lcp em texto"
```

---

## Definição de pronto da Fase 2

- [ ] `npm run check` verde, **verificado pelo código de saída**
- [ ] `npm run build` verde, com o portão de orçamento passando
- [ ] `npx playwright test` verde, incluindo axe com o painel preenchido
- [ ] CI verde no GitHub Actions
- [ ] JS crítico da home abaixo de 120 KB gzip, com o número no log do build
- [ ] `/api/edge` respondendo com `no-store` e sem IP, ASN ou organização no payload
- [ ] Nenhum log e nenhum armazenamento de dado de visitante em lugar nenhum
- [ ] Globo 3D com os dois pontos e o arco, para quem tem aparelho capaz
- [ ] SVG com o mesmo desenho, para movimento reduzido, sem WebGL e aparelho fraco
- [ ] Com movimento reduzido, **nenhuma** das três bibliotecas é baixada
- [ ] Falha da telemetria mostra "não foi possível medir", nunca zero
- [ ] LCP continua sendo o texto, verificado por teste
- [ ] Loop de render pausa fora do viewport e com a aba em segundo plano
- [ ] Colofão contando o custo da cena, com o número medido
- [ ] Medição em aparelho real registrada nas notas de execução

## Fora do escopo desta fase

Agente de IA e `/ia` (Fase 3). Formulário de contato, Cloudflare Email Service, OG images, PDF do CV, IndexNow, Search Console, política de privacidade, Web Analytics e deploy no domínio (Fase 4).

## Riscos conhecidos

| Risco | Sinal | O que fazer |
|---|---|---|
| A cena estoura o orçamento dela | Chunk do `globe-scene` acima de 200 KB gzip | Reduzir segmentos da esfera e do arco antes de mexer no teto. A projeção em SVG já existe e pode assumir |
| `import.meta.glob` da cena vazando para o crítico | `check-budget` falha logo após a Task 9 | Procurar import estático de `globe-scene`; só `lazy` pode alcançá-lo |
| `request.cf` sem coordenadas em algum caminho de rede | Painel com "não foi possível medir" em produção mas não local | Esperado e tratado. Se for frequente, mostrar só cidade e colo, que vêm com mais confiabilidade |
| Hidratação divergindo de novo | Erro #418 no console | O hero renderiza o SVG no primeiro quadro justamente para o servidor e o cliente concordarem. Se aparecer, é porque algo lê `window` durante o render |
| GSAP e Motion animando o mesmo elemento | Movimento brigando, jank | Fronteira explícita: GSAP só dentro de `app/hero/` e `app/motion/reveal.tsx`; Motion só em `page-transition.tsx` |
| Aparelho intermediário sofrendo | Frame acima de 16 ms no teste real | Subir o limiar em `capability.ts`. Entregar o SVG a quem não aguenta é melhor que entregar uma cena travada |

## Insumos que dependem do Diorgenes

1. **Um aparelho real** para a medição da Task 14, passo 3.
2. **Leitura do texto novo do colofão** antes do commit da Task 13.

