# Fase 0 — Fundação · Plano de Implementação

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para rastreamento.

**Goal:** Entregar a fundação do site pessoal de Diorgenes George no ar em um subdomínio — trilíngue, com dois temas, tipografia própria, CSP estrita e CI verde — sem conteúdo de página ainda.

**Architecture:** React Router v7 em framework mode com `ssr: true` e `prerender` explícito: toda rota de conteúdo vira HTML estático servido pelos Workers Static Assets sem invocar compute. Um Worker existe apenas para a raiz `/` (302 negociando `Accept-Language`) e, no futuro, `/api/*`. Headers de segurança chegam às páginas estáticas via arquivo `_headers`, gerado no pós-build com hashes SHA-256 dos scripts inline.

**Tech Stack:** React Router v7 · Vite · TypeScript strict · Tailwind CSS v4 · Vitest · Playwright · axe-core · Wrangler · Cloudflare Workers Static Assets.

**Spec:** `docs/superpowers/specs/2026-07-31-site-dev-design.md`

---

## Global Constraints

Aplicam-se a todas as tarefas. Não repetidas em cada uma.

- **Diretório do projeto:** `/home/dg/projetos/page-dev`
- **Gerenciador de pacotes:** `npm` (Node v24.16.0, npm 11.13.0)
- **TypeScript `strict: true`.** Sem `any` implícito. Sem `@ts-ignore` sem comentário justificando.
- **Branch:** todo o trabalho em `feature/fase-0-fundacao`. Nunca commitar na `main`.
- **Nunca** incluir `Co-Authored-By` em mensagem de commit.
- **Nunca** commitar `CLAUDE.md`, `.dev.vars`, `.superpowers/`, `node_modules`, `dist`, `.wrangler`.
- **Não fazer push nem abrir PR** sem pedido explícito do usuário.
- **Locales exatos:** `pt-BR`, `pt-PT`, `en-US`. Segmentos de URL exatos: `pt-br`, `pt-pt`, `en`.
- **Tokens de cor (tema escuro), valores exatos:** `--bg: #0A0908` · `--bg-raised: #1A1512` · `--fg: #F2EEE9` · `--fg-muted: #A8A099` · `--fg-subtle: #857E76` · `--accent: #FFA033` · `--accent-fg: #17120E` · `--signal: #4BE38A`
  - `--fg-subtle` era `#7D766F` na direção visual aprovada. A auditoria de contraste mediu 4.45:1 sobre `--bg` — reprovado em AA para texto normal. Corrigido para `#857E76` (4.97:1). Este é o processo do spec funcionando: medido, não estimado.
- **Fontes, versões exatas:** `@fontsource-variable/instrument-sans@5.3.0`, `@fontsource/instrument-serif@5.3.0`, `@fontsource/ibm-plex-mono@5.3.0`. Auto-hospedadas. Nenhuma requisição a CDN externo, em nenhuma circunstância.
- **Regra 5 do spec:** toda animação respeita `prefers-reduced-motion: reduce`.
- **Comentários:** só o porquê, nunca o quê. Máximo uma linha.
- Ao fim de cada tarefa: `npm run check` precisa passar antes do commit.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `app/i18n/config.ts` | Locales, segmentos de URL, mapa de caminhos por rota |
| `app/i18n/negotiate.ts` | Parsing de `Accept-Language` e escolha de locale |
| `app/i18n/format.ts` | Formatação de data e número por locale |
| `app/i18n/dictionary.ts` | Tipo do dicionário e carga por locale |
| `app/i18n/messages/{pt-BR,pt-PT,en-US}.ts` | Strings da interface |
| `app/design/tokens.css` | Custom properties dos dois temas |
| `app/design/contrast.ts` | Cálculo de razão de contraste WCAG |
| `app/design/theme.ts` | Tipo de tema e script de inicialização sem FOUC |
| `app/app.css` | Entrada Tailwind v4, `@theme inline`, fontes |
| `app/root.tsx` | Documento HTML, `lang`, script de tema |
| `app/routes.ts` | Definição de rotas com prefixo de locale |
| `app/layouts/site.tsx` | Shell: skip link, header, main, footer |
| `app/components/theme-toggle.tsx` | Alternador de tema |
| `app/components/locale-switcher.tsx` | Alternador de idioma preservando a rota |
| `app/routes/home.tsx` | Home (placeholder estruturado da Fase 0) |
| `app/routes/colophon.tsx` | Colofão |
| `workers/app.ts` | Redirect da raiz + handler do React Router |
| `scripts/build-headers.ts` | Gera `dist/client/_headers` com hashes CSP |
| `react-router.config.ts` | `ssr: true` + lista de prerender |
| `wrangler.jsonc` | Config do Worker e dos assets |
| `e2e/*.spec.ts` | Playwright: golden paths e a11y |

---

## Task 1: Repositório, scaffold e portão de qualidade

**Files:**
- Create: `/home/dg/projetos/page-dev/.gitignore`
- Create: todo o scaffold do React Router + Cloudflare
- Modify: `package.json`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: nada
- Produces: scripts npm `dev`, `build`, `typecheck`, `lint`, `test`, `check`; projeto compilando

- [ ] **Step 1: Inicializar git e proteger o que não pode vazar**

```bash
cd /home/dg/projetos/page-dev
git init -b main
```

Criar `.gitignore`:

```gitignore
node_modules/
dist/
.wrangler/
.superpowers/
.dev.vars
.env
.env.*
!.env.example
CLAUDE.md
worker-configuration.d.ts
playwright-report/
test-results/
.DS_Store
```

- [ ] **Step 2: Scaffold do React Router em Workers**

C3 exige diretório vazio, e este já tem `docs/`. Gerar fora e mover:

```bash
cd /tmp
rm -rf page-dev-scaffold
npm create cloudflare@latest -- page-dev-scaffold --framework=react-router --platform=workers --no-git --no-deploy
cd /tmp/page-dev-scaffold
rm -rf .git node_modules
cp -r . /home/dg/projetos/page-dev/
cd /home/dg/projetos/page-dev
npm install
```

- [ ] **Step 3: Verificar que o scaffold roda**

Run: `npm run build`
Expected: build conclui sem erro e cria `dist/client/` e `dist/page-dev/` (ou equivalente do template).

Se o template gerar nomes diferentes de `react-router.config.ts`, `vite.config.ts`, `wrangler.jsonc` ou `workers/app.ts`, **anote os caminhos reais** — as tarefas seguintes assumem esses nomes e precisam ser ajustadas para o que existe de fato.

- [ ] **Step 4: Instalar ferramentas de qualidade**

```bash
npm i -D vitest @vitest/coverage-v8 prettier eslint @eslint/js typescript-eslint eslint-plugin-react-hooks @playwright/test @axe-core/playwright
npx playwright install --with-deps chromium
```

- [ ] **Step 5: Escrever os scripts do portão de qualidade**

Em `package.json`, substituir/garantir a seção `scripts`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "react-router build",
    "preview": "npm run build && wrangler dev",
    "deploy": "npm run build && wrangler deploy",
    "typecheck": "react-router typegen && tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "check": "npm run lint && npm run typecheck && npm run test"
  }
}
```

- [ ] **Step 6: Garantir TypeScript estrito**

Em `tsconfig.json`, dentro de `compilerOptions`, garantir:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "verbatimModuleSyntax": true
}
```

- [ ] **Step 7: Criar a configuração do Vitest**

Criar `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
```

- [ ] **Step 8: Escrever um teste de fumaça para provar que o runner funciona**

Criar `app/i18n/config.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("ambiente de teste", () => {
  it("should run vitest when the suite is executed", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 9: Rodar o portão completo**

Run: `npm run check`
Expected: lint, typecheck e testes passam. Corrigir o que aparecer antes de seguir.

- [ ] **Step 10: Criar o workflow de CI**

Criar `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm run build
```

- [ ] **Step 11: Commit**

```bash
git checkout -b feature/fase-0-fundacao
git add -A
git commit -m "chore: scaffold react router em workers com portao de qualidade e CI"
```

---

## Task 2: Contraste WCAG como função testada

O spec exige contraste **medido, não estimado**. Esta função é a ferramenta de medição; a Task 4 a usa para auditar os tokens.

**Files:**
- Create: `app/design/contrast.ts`
- Test: `app/design/contrast.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `contrastRatio(hexA: string, hexB: string): number`

- [ ] **Step 1: Escrever o teste que falha**

Criar `app/design/contrast.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("should return 21 when comparing pure black and pure white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });

  it("should return 1 when both colors are identical", () => {
    expect(contrastRatio("#0A0908", "#0A0908")).toBeCloseTo(1, 5);
  });

  it("should return the documented 4.48 ratio for #777777 on white", () => {
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });

  it("should be symmetric regardless of argument order", () => {
    expect(contrastRatio("#FFA033", "#0A0908")).toBeCloseTo(
      contrastRatio("#0A0908", "#FFA033"),
      10,
    );
  });

  it("should accept three-digit shorthand hex", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 2);
  });

  it("should throw when given a value that is not a hex color", () => {
    expect(() => contrastRatio("rebeccapurple", "#FFFFFF")).toThrow();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run app/design/contrast.test.ts`
Expected: FAIL — `Failed to resolve import "./contrast"`.

- [ ] **Step 3: Implementar**

Criar `app/design/contrast.ts`:

```ts
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function parseHex(hex: string): [number, number, number] {
  if (!HEX.test(hex)) {
    throw new Error(`Cor inválida: ${hex}. Use hex de 3 ou 6 dígitos.`);
  }
  const raw = hex.slice(1);
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function channelLuminance(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/** Razão de contraste WCAG 2.1, de 1 (idênticas) a 21 (preto sobre branco). */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run app/design/contrast.test.ts`
Expected: PASS — 6 testes.

- [ ] **Step 5: Commit**

```bash
git add app/design/contrast.ts app/design/contrast.test.ts
git commit -m "feat: adiciona calculo de razao de contraste WCAG"
```

---

## Task 3: Núcleo de i18n — configuração e negociação

**Files:**
- Create: `app/i18n/config.ts`
- Create: `app/i18n/negotiate.ts`
- Test: `app/i18n/config.test.ts` (substituir o teste de fumaça), `app/i18n/negotiate.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `LOCALES: readonly ["pt-BR", "pt-PT", "en-US"]`
  - `type Locale = (typeof LOCALES)[number]`
  - `DEFAULT_LOCALE: Locale` (`"en-US"`)
  - `LOCALE_SEGMENTS: Record<Locale, string>` → `{ "pt-BR": "pt-br", "pt-PT": "pt-pt", "en-US": "en" }`
  - `SEGMENT_TO_LOCALE: Record<string, Locale>`
  - `type RouteKey = "home" | "colophon"`
  - `ROUTE_PATHS: Record<RouteKey, Record<Locale, string>>`
  - `localizedHref(routeKey: RouteKey, locale: Locale): string`
  - `negotiateLocale(header: string | null): Locale`

- [ ] **Step 1: Escrever o teste de configuração que falha**

Substituir todo o conteúdo de `app/i18n/config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  LOCALES,
  LOCALE_SEGMENTS,
  SEGMENT_TO_LOCALE,
  localizedHref,
} from "./config";

describe("configuração de locales", () => {
  it("should expose exactly the three supported locales", () => {
    expect(LOCALES).toEqual(["pt-BR", "pt-PT", "en-US"]);
  });

  it("should map each locale to its url segment", () => {
    expect(LOCALE_SEGMENTS).toEqual({
      "pt-BR": "pt-br",
      "pt-PT": "pt-pt",
      "en-US": "en",
    });
  });

  it("should invert the segment map without losing any locale", () => {
    expect(SEGMENT_TO_LOCALE).toEqual({
      "pt-br": "pt-BR",
      "pt-pt": "pt-PT",
      en: "en-US",
    });
  });
});

describe("localizedHref", () => {
  it("should return the locale root for the home route", () => {
    expect(localizedHref("home", "pt-BR")).toBe("/pt-br/");
  });

  it("should use the portuguese slug for the colophon in pt-BR", () => {
    expect(localizedHref("colophon", "pt-BR")).toBe("/pt-br/colofao");
  });

  it("should use the english slug for the colophon in en-US", () => {
    expect(localizedHref("colophon", "en-US")).toBe("/en/colophon");
  });

  it("should use the portuguese slug for the colophon in pt-PT", () => {
    expect(localizedHref("colophon", "pt-PT")).toBe("/pt-pt/colofao");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run app/i18n/config.test.ts`
Expected: FAIL — `Failed to resolve import "./config"`.

- [ ] **Step 3: Implementar a configuração**

Criar `app/i18n/config.ts`:

```ts
export const LOCALES = ["pt-BR", "pt-PT", "en-US"] as const;

export type Locale = (typeof LOCALES)[number];

/** Fallback para visitante sem idioma reconhecido — coerente com o x-default apontando para /en/. */
export const DEFAULT_LOCALE: Locale = "en-US";

export const LOCALE_SEGMENTS: Record<Locale, string> = {
  "pt-BR": "pt-br",
  "pt-PT": "pt-pt",
  "en-US": "en",
};

export const SEGMENT_TO_LOCALE: Record<string, Locale> = Object.fromEntries(
  LOCALES.map((locale) => [LOCALE_SEGMENTS[locale], locale]),
) as Record<string, Locale>;

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
  "pt-PT": "Português (Portugal)",
  "en-US": "English",
};

export type RouteKey = "home" | "colophon";

/** Slug por rota e por idioma. String vazia significa a raiz do idioma. */
export const ROUTE_PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { "pt-BR": "", "pt-PT": "", "en-US": "" },
  colophon: { "pt-BR": "colofao", "pt-PT": "colofao", "en-US": "colophon" },
};

export function localizedHref(routeKey: RouteKey, locale: Locale): string {
  const segment = LOCALE_SEGMENTS[locale];
  const slug = ROUTE_PATHS[routeKey][locale];
  return slug === "" ? `/${segment}/` : `/${segment}/${slug}`;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run app/i18n/config.test.ts`
Expected: PASS — 7 testes.

- [ ] **Step 5: Escrever o teste de negociação que falha**

Criar `app/i18n/negotiate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { negotiateLocale } from "./negotiate";

describe("negotiateLocale", () => {
  it("should return pt-BR when the browser asks for pt-BR explicitly", () => {
    expect(negotiateLocale("pt-BR,pt;q=0.9,en;q=0.8")).toBe("pt-BR");
  });

  it("should return pt-PT when the browser asks for pt-PT explicitly", () => {
    expect(negotiateLocale("pt-PT,pt;q=0.9,en;q=0.8")).toBe("pt-PT");
  });

  it("should return pt-BR for generic portuguese", () => {
    expect(negotiateLocale("pt")).toBe("pt-BR");
  });

  it("should return en-US for a non-US english variant", () => {
    expect(negotiateLocale("en-GB,en;q=0.9")).toBe("en-US");
  });

  it("should honour quality values over declaration order", () => {
    expect(negotiateLocale("en;q=0.4,pt-PT;q=0.9")).toBe("pt-PT");
  });

  it("should fall back to the default locale for an unsupported language", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9")).toBe("en-US");
  });

  it("should fall back to the default locale when the header is absent", () => {
    expect(negotiateLocale(null)).toBe("en-US");
  });

  it("should fall back to the default locale when the header is empty", () => {
    expect(negotiateLocale("")).toBe("en-US");
  });

  it("should ignore the wildcard entry", () => {
    expect(negotiateLocale("*")).toBe("en-US");
  });

  it("should match case-insensitively", () => {
    expect(negotiateLocale("PT-br")).toBe("pt-BR");
  });
});
```

- [ ] **Step 6: Rodar e confirmar que falha**

Run: `npx vitest run app/i18n/negotiate.test.ts`
Expected: FAIL — `Failed to resolve import "./negotiate"`.

- [ ] **Step 7: Implementar a negociação**

Criar `app/i18n/negotiate.ts`:

```ts
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

type Preference = { tag: string; quality: number };

/** Português genérico resolve para o Brasil, que concentra a maioria dos falantes. */
const BASE_LANGUAGE_FALLBACK: Record<string, Locale> = {
  pt: "pt-BR",
  en: "en-US",
};

function parseAcceptLanguage(header: string): Preference[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: (tag ?? "").trim().toLowerCase(), quality };
    })
    .filter((p) => p.tag !== "" && p.tag !== "*" && Number.isFinite(p.quality))
    .sort((a, b) => b.quality - a.quality);
}

export function negotiateLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  for (const { tag } of parseAcceptLanguage(header)) {
    const exact = LOCALES.find((locale) => locale.toLowerCase() === tag);
    if (exact) return exact;

    const base = tag.split("-")[0] ?? "";
    const fallback = BASE_LANGUAGE_FALLBACK[base];
    if (fallback) return fallback;
  }

  return DEFAULT_LOCALE;
}
```

- [ ] **Step 8: Rodar e confirmar que passa**

Run: `npx vitest run app/i18n/`
Expected: PASS — 17 testes ao todo.

- [ ] **Step 9: Commit**

```bash
git add app/i18n/
git commit -m "feat: adiciona nucleo de i18n com negociacao de accept-language"
```

---

## Task 4: Tokens de design, dois temas e auditoria de contraste

**Files:**
- Create: `app/design/tokens.css`
- Create: `app/design/tokens.ts`
- Test: `app/design/tokens.test.ts`
- Modify: `app/app.css`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `contrastRatio` da Task 2
- Produces: `DARK_TOKENS` e `LIGHT_TOKENS` (`Record<string, string>`); classes utilitárias Tailwind `bg-bg`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `bg-accent`, `text-accent`, `text-signal`, `border-hairline`

- [ ] **Step 1: Instalar Tailwind v4**

```bash
npm i tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Escrever a auditoria de contraste que falha**

Criar `app/design/tokens.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { DARK_TOKENS, LIGHT_TOKENS } from "./tokens";

const THEMES = [
  ["escuro", DARK_TOKENS],
  ["claro", LIGHT_TOKENS],
] as const;

/** Pares que carregam texto: exigem 4.5:1 (WCAG 2.1 AA, texto normal). */
const TEXT_PAIRS = [
  ["fg", "bg"],
  ["fg-muted", "bg"],
  ["fg-subtle", "bg"],
  ["fg", "bg-raised"],
  ["fg-muted", "bg-raised"],
  ["accent", "bg"],
  ["accent-fg", "accent"],
] as const;

describe.each(THEMES)("tema %s", (_name, tokens) => {
  it.each(TEXT_PAIRS)(
    "should meet 4.5:1 contrast when rendering %s on %s",
    (fg, bg) => {
      const fgValue = tokens[fg];
      const bgValue = tokens[bg];
      expect(fgValue, `token ausente: ${fg}`).toBeDefined();
      expect(bgValue, `token ausente: ${bg}`).toBeDefined();
      expect(contrastRatio(fgValue!, bgValue!)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("should meet 3:1 contrast when rendering the live-status signal on bg", () => {
    expect(contrastRatio(tokens.signal!, tokens.bg!)).toBeGreaterThanOrEqual(3);
  });

  it("should define exactly the same token names as the other theme", () => {
    expect(Object.keys(tokens).sort()).toEqual(
      Object.keys(DARK_TOKENS).sort(),
    );
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npx vitest run app/design/tokens.test.ts`
Expected: FAIL — `Failed to resolve import "./tokens"`.

- [ ] **Step 4: Implementar os tokens**

Criar `app/design/tokens.ts`:

```ts
export const DARK_TOKENS: Record<string, string> = {
  bg: "#0A0908",
  "bg-raised": "#1A1512",
  fg: "#F2EEE9",
  "fg-muted": "#A8A099",
  "fg-subtle": "#857E76",
  accent: "#FFA033",
  "accent-fg": "#17120E",
  signal: "#4BE38A",
};

/** "Papel Técnico": identidade irmã do tema escuro, não sua inversão. */
export const LIGHT_TOKENS: Record<string, string> = {
  bg: "#F5F2ED",
  "bg-raised": "#FBFAF7",
  fg: "#14110E",
  "fg-muted": "#57504A",
  "fg-subtle": "#645C55",
  accent: "#8A4A00",
  "accent-fg": "#FFF8EF",
  signal: "#1F7A45",
};
```

- [ ] **Step 5: Rodar a auditoria e ajustar até ficar verde**

Run: `npx vitest run app/design/tokens.test.ts`

Cada falha imprime a razão medida. Se algum par ficar abaixo do mínimo, **ajuste o token do tema em questão** (nunca o limiar do teste) e rode de novo até tudo passar. Os valores do tema escuro estão fixados nas Global Constraints e **não podem ser alterados** — se um par do tema escuro falhar, isso é achado de design e precisa ser levado ao usuário antes de seguir.

Expected ao final: PASS — 18 testes.

- [ ] **Step 6: Escrever o CSS dos temas**

Criar `app/design/tokens.css`:

```css
:root,
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0a0908;
  --bg-raised: #1a1512;
  --fg: #f2eee9;
  --fg-muted: #a8a099;
  --fg-subtle: #857e76;
  --accent: #ffa033;
  --accent-fg: #17120e;
  --signal: #4be38a;
  --hairline: rgb(242 238 233 / 0.1);
}

:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f5f2ed;
  --bg-raised: #fbfaf7;
  --fg: #14110e;
  --fg-muted: #57504a;
  --fg-subtle: #645c55;
  --accent: #8a4a00;
  --accent-fg: #fff8ef;
  --signal: #1f7a45;
  --hairline: rgb(20 17 14 / 0.12);
}
```

> Os valores do tema claro devem ser **os mesmos** que ficaram verdes no Step 5. Se você ajustou `tokens.ts`, copie os valores ajustados para cá.

- [ ] **Step 7: Ligar Tailwind aos tokens**

Substituir o conteúdo de `app/app.css`:

```css
@import "tailwindcss";
@import "./design/tokens.css";

@theme inline {
  --color-bg: var(--bg);
  --color-bg-raised: var(--bg-raised);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-fg-subtle: var(--fg-subtle);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-signal: var(--signal);
  --color-hairline: var(--hairline);
}

@layer base {
  html {
    background-color: var(--bg);
    color: var(--fg);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 8: Registrar o plugin do Tailwind no Vite**

Em `vite.config.ts`, adicionar o import e incluir `tailwindcss()` no array `plugins`, **antes** do plugin do React Router:

```ts
import tailwindcss from "@tailwindcss/vite";
```

- [ ] **Step 9: Verificar o build**

Run: `npm run build`
Expected: build conclui e o CSS gerado em `dist/client/assets/` contém `--bg: #0a0908`.

Run: `grep -r "0a0908" dist/client/assets/ | head -1`
Expected: pelo menos uma linha de resultado.

- [ ] **Step 10: Commit**

```bash
git add app/design/ app/app.css vite.config.ts package.json package-lock.json
git commit -m "feat: adiciona tokens dos dois temas com auditoria de contraste WCAG"
```

---

## Task 5: Fontes auto-hospedadas

**Files:**
- Modify: `app/app.css`
- Modify: `app/root.tsx`

**Interfaces:**
- Consumes: nada
- Produces: famílias `font-sans` (Instrument Sans Variable), `font-serif` (Instrument Serif), `font-mono` (IBM Plex Mono)

- [ ] **Step 1: Instalar as fontes**

```bash
npm i @fontsource-variable/instrument-sans@5.3.0 @fontsource/instrument-serif@5.3.0 @fontsource/ibm-plex-mono@5.3.0
```

- [ ] **Step 2: Importar e mapear no CSS**

Em `app/app.css`, adicionar **no topo, antes de `@import "tailwindcss"`**:

```css
@import "@fontsource-variable/instrument-sans/index.css";
@import "@fontsource/instrument-serif/400.css";
@import "@fontsource/instrument-serif/400-italic.css";
@import "@fontsource/ibm-plex-mono/400.css";
@import "@fontsource/ibm-plex-mono/500.css";
@import "@fontsource/ibm-plex-mono/600.css";
```

E dentro do bloco `@theme inline`, acrescentar:

```css
  --font-sans: "Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Instrument Serif", ui-serif, Georgia, serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

E dentro de `@layer base`, no seletor `html`, acrescentar:

```css
    font-family: var(--font-sans);
```

- [ ] **Step 3: Verificar que os woff2 entram no build**

Run: `npm run build && find dist/client -name "*.woff2" | wc -l`
Expected: número maior que zero.

- [ ] **Step 4: Verificar que nenhum CDN externo foi introduzido**

Run: `grep -rE "fonts\.(googleapis|gstatic)\.com" dist/client/ || echo "SEM CDN EXTERNO"`
Expected: `SEM CDN EXTERNO`

Este passo é obrigatório: uma referência externa quebra a CSP estrita da Task 9.

- [ ] **Step 5: Commit**

```bash
git add app/app.css package.json package-lock.json
git commit -m "feat: auto-hospeda instrument sans, instrument serif e ibm plex mono"
```

---

## Task 6: Rotas com prefixo de locale e pré-renderização

**Files:**
- Modify: `app/routes.ts`
- Modify: `react-router.config.ts`
- Create: `app/routes/home.tsx`
- Create: `app/routes/colophon.tsx`
- Create: `app/layouts/site.tsx`
- Test: `app/i18n/prerender.test.ts`
- Create: `app/i18n/prerender.ts`

**Interfaces:**
- Consumes: `LOCALES`, `LOCALE_SEGMENTS`, `ROUTE_PATHS`, `localizedHref` (Task 3)
- Produces: `prerenderPaths(): string[]`; rotas `home-<segmento>` e `colophon-<segmento>`

- [ ] **Step 1: Escrever o teste da lista de prerender**

Criar `app/i18n/prerender.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { prerenderPaths } from "./prerender";

describe("prerenderPaths", () => {
  it("should produce one path per route per locale", () => {
    expect(prerenderPaths()).toHaveLength(6);
  });

  it("should include the root of every locale", () => {
    const paths = prerenderPaths();
    expect(paths).toContain("/pt-br/");
    expect(paths).toContain("/pt-pt/");
    expect(paths).toContain("/en/");
  });

  it("should include the localized colophon slugs", () => {
    const paths = prerenderPaths();
    expect(paths).toContain("/pt-br/colofao");
    expect(paths).toContain("/pt-pt/colofao");
    expect(paths).toContain("/en/colophon");
  });

  it("should never include the bare root, which the worker redirects", () => {
    expect(prerenderPaths()).not.toContain("/");
  });

  it("should not contain duplicates", () => {
    const paths = prerenderPaths();
    expect(new Set(paths).size).toBe(paths.length);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run app/i18n/prerender.test.ts`
Expected: FAIL — `Failed to resolve import "./prerender"`.

- [ ] **Step 3: Implementar**

Criar `app/i18n/prerender.ts`:

```ts
import { LOCALES, ROUTE_PATHS, localizedHref, type RouteKey } from "./config";

export function prerenderPaths(): string[] {
  const keys = Object.keys(ROUTE_PATHS) as RouteKey[];
  return LOCALES.flatMap((locale) =>
    keys.map((key) => localizedHref(key, locale)),
  );
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run app/i18n/prerender.test.ts`
Expected: PASS — 5 testes.

- [ ] **Step 5: Declarar as rotas**

Substituir o conteúdo de `app/routes.ts`:

```ts
import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";
import { LOCALES, LOCALE_SEGMENTS, ROUTE_PATHS } from "./i18n/config";

export default LOCALES.flatMap((locale) => {
  const segment = LOCALE_SEGMENTS[locale];
  return prefix(segment, [
    layout("layouts/site.tsx", { id: `site-${segment}` }, [
      index("routes/home.tsx", { id: `home-${segment}` }),
      route(ROUTE_PATHS.colophon[locale], "routes/colophon.tsx", {
        id: `colophon-${segment}`,
      }),
    ]),
  ]);
}) satisfies RouteConfig;
```

- [ ] **Step 6: Configurar a pré-renderização**

Substituir o conteúdo de `react-router.config.ts`:

```ts
import type { Config } from "@react-router/dev/config";
import { prerenderPaths } from "./app/i18n/prerender";

export default {
  ssr: true,
  prerender: prerenderPaths(),
} satisfies Config;
```

- [ ] **Step 7: Criar o layout do site (versão mínima; o shell completo vem na Task 7)**

Criar `app/layouts/site.tsx`:

```tsx
import { Outlet } from "react-router";

export default function SiteLayout() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 8: Criar as duas páginas**

Criar `app/routes/home.tsx`:

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-5xl font-bold tracking-tight">
        Diorgenes George
      </h1>
    </main>
  );
}
```

Criar `app/routes/colophon.tsx`:

```tsx
export default function Colophon() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">Colofão</h1>
    </main>
  );
}
```

- [ ] **Step 9: Verificar que os seis HTML foram gerados**

Run: `npm run build && find dist/client -name "index.html" | sort`
Expected: exatamente seis arquivos, incluindo `dist/client/pt-br/index.html`, `dist/client/en/colophon/index.html` e `dist/client/pt-pt/colofao/index.html`.

Se a estrutura de diretórios de saída divergir, ajuste os caminhos esperados nos testes E2E da Task 10 — mas **a contagem precisa ser seis**.

- [ ] **Step 10: Commit**

```bash
git add app/routes.ts app/routes/ app/layouts/ app/i18n/prerender.ts app/i18n/prerender.test.ts react-router.config.ts
git commit -m "feat: adiciona rotas com prefixo de locale e pre-renderizacao estatica"
```

---

## Task 7: Shell do site — skip link, header, footer, dicionário

**Files:**
- Create: `app/i18n/dictionary.ts`
- Create: `app/i18n/messages/pt-BR.ts`, `pt-PT.ts`, `en-US.ts`
- Create: `app/i18n/use-locale.ts`
- Test: `app/i18n/dictionary.test.ts`
- Modify: `app/layouts/site.tsx`
- Modify: `app/root.tsx`

**Interfaces:**
- Consumes: `Locale`, `SEGMENT_TO_LOCALE`, `localizedHref` (Task 3)
- Produces:
  - `type Dictionary` com as chaves `nav.home`, `nav.colophon`, `a11y.skipToContent`, `theme.toggle`, `theme.dark`, `theme.light`, `locale.label`, `footer.builtWith`
  - `getDictionary(locale: Locale): Dictionary`
  - `useLocale(): Locale` — deriva o locale do primeiro segmento da URL

- [ ] **Step 1: Escrever o teste do dicionário que falha**

Criar `app/i18n/dictionary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LOCALES } from "./config";
import { getDictionary } from "./dictionary";

const REQUIRED_KEYS = [
  "nav.home",
  "nav.colophon",
  "a11y.skipToContent",
  "theme.toggle",
  "theme.dark",
  "theme.light",
  "locale.label",
  "footer.builtWith",
] as const;

describe("getDictionary", () => {
  it.each(LOCALES)("should define every required key for %s", (locale) => {
    const dict = getDictionary(locale);
    for (const key of REQUIRED_KEYS) {
      expect(dict[key], `chave ausente em ${locale}: ${key}`).toBeTruthy();
    }
  });

  it.each(LOCALES)("should not define extra keys for %s", (locale) => {
    expect(Object.keys(getDictionary(locale)).sort()).toEqual(
      [...REQUIRED_KEYS].sort(),
    );
  });

  it("should use distinct wording for pt-BR and en-US", () => {
    expect(getDictionary("pt-BR")["nav.colophon"]).not.toBe(
      getDictionary("en-US")["nav.colophon"],
    );
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run app/i18n/dictionary.test.ts`
Expected: FAIL — `Failed to resolve import "./dictionary"`.

- [ ] **Step 3: Implementar os dicionários**

Criar `app/i18n/messages/pt-BR.ts`:

```ts
import type { Dictionary } from "../dictionary";

export const ptBR: Dictionary = {
  "nav.home": "Início",
  "nav.colophon": "Colofão",
  "a11y.skipToContent": "Pular para o conteúdo",
  "theme.toggle": "Alternar tema",
  "theme.dark": "Escuro",
  "theme.light": "Claro",
  "locale.label": "Idioma",
  "footer.builtWith": "Construído na borda da Cloudflare",
};
```

Criar `app/i18n/messages/pt-PT.ts`:

```ts
import type { Dictionary } from "../dictionary";

export const ptPT: Dictionary = {
  "nav.home": "Início",
  "nav.colophon": "Colofão",
  "a11y.skipToContent": "Saltar para o conteúdo",
  "theme.toggle": "Alternar tema",
  "theme.dark": "Escuro",
  "theme.light": "Claro",
  "locale.label": "Idioma",
  "footer.builtWith": "Construído na periferia da Cloudflare",
};
```

Criar `app/i18n/messages/en-US.ts`:

```ts
import type { Dictionary } from "../dictionary";

export const enUS: Dictionary = {
  "nav.home": "Home",
  "nav.colophon": "Colophon",
  "a11y.skipToContent": "Skip to content",
  "theme.toggle": "Toggle theme",
  "theme.dark": "Dark",
  "theme.light": "Light",
  "locale.label": "Language",
  "footer.builtWith": "Built on Cloudflare's edge",
};
```

Criar `app/i18n/dictionary.ts`:

```ts
import type { Locale } from "./config";
import { enUS } from "./messages/en-US";
import { ptBR } from "./messages/pt-BR";
import { ptPT } from "./messages/pt-PT";

export type Dictionary = {
  "nav.home": string;
  "nav.colophon": string;
  "a11y.skipToContent": string;
  "theme.toggle": string;
  "theme.dark": string;
  "theme.light": string;
  "locale.label": string;
  "footer.builtWith": string;
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "en-US": enUS,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run app/i18n/dictionary.test.ts`
Expected: PASS — 7 testes.

- [ ] **Step 5: Implementar o hook de locale**

Criar `app/i18n/use-locale.ts`:

```ts
import { useLocation } from "react-router";
import { DEFAULT_LOCALE, SEGMENT_TO_LOCALE, type Locale } from "./config";

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1] ?? "";
  return SEGMENT_TO_LOCALE[segment] ?? DEFAULT_LOCALE;
}

export function useLocale(): Locale {
  return localeFromPathname(useLocation().pathname);
}
```

- [ ] **Step 6: Montar o shell**

Substituir o conteúdo de `app/layouts/site.tsx`:

```tsx
import { Link, Outlet } from "react-router";
import { LocaleSwitcher } from "../components/locale-switcher";
import { ThemeToggle } from "../components/theme-toggle";
import { localizedHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";

export default function SiteLayout() {
  const locale = useLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {t["a11y.skipToContent"]}
      </a>

      <header className="border-b border-hairline">
        <nav
          aria-label={t["nav.home"]}
          className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4"
        >
          <Link
            to={localizedHref("home", locale)}
            className="font-mono text-sm font-semibold tracking-widest text-accent"
          >
            DG
          </Link>
          <Link
            to={localizedHref("colophon", locale)}
            className="text-sm text-fg-muted hover:text-fg"
          >
            {t["nav.colophon"]}
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <div id="conteudo" className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-8 font-mono text-xs uppercase tracking-widest text-fg-subtle">
          {t["footer.builtWith"]}
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 7: Corrigir o `lang` do documento**

Em `app/root.tsx`, dentro do componente `Layout`, trocar `<html lang="en">` por:

```tsx
import { useLocation } from "react-router";
import { localeFromPathname } from "./i18n/use-locale";
```

e, no corpo do componente:

```tsx
  const locale = localeFromPathname(useLocation().pathname);
```

usando `<html lang={locale}>`.

- [ ] **Step 8: Verificar o `lang` no HTML gerado**

Run: `npm run build && grep -o 'lang="[^"]*"' dist/client/pt-pt/index.html`
Expected: `lang="pt-PT"`

- [ ] **Step 9: Commit**

```bash
git add app/i18n/ app/layouts/ app/root.tsx
git commit -m "feat: adiciona shell do site com dicionarios e lang por locale"
```

---

## Task 8: Alternador de tema sem FOUC e alternador de idioma

**Files:**
- Create: `app/design/theme.ts`
- Create: `app/components/theme-toggle.tsx`
- Create: `app/components/locale-switcher.tsx`
- Test: `app/design/theme.test.ts`, `app/i18n/switch-locale.test.ts`
- Create: `app/i18n/switch-locale.ts`
- Modify: `app/root.tsx`

**Interfaces:**
- Consumes: `Locale`, `LOCALE_SEGMENTS`, `SEGMENT_TO_LOCALE`, `ROUTE_PATHS`, `getDictionary`, `useLocale`
- Produces:
  - `type Theme = "dark" | "light"`
  - `THEME_INIT_SCRIPT: string`
  - `switchLocalePath(pathname: string, target: Locale): string`

- [ ] **Step 1: Escrever o teste da troca de idioma que falha**

Criar `app/i18n/switch-locale.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { switchLocalePath } from "./switch-locale";

describe("switchLocalePath", () => {
  it("should keep the user on the home page when switching locale", () => {
    expect(switchLocalePath("/pt-br/", "en-US")).toBe("/en/");
  });

  it("should translate the colophon slug when switching to english", () => {
    expect(switchLocalePath("/pt-br/colofao", "en-US")).toBe("/en/colophon");
  });

  it("should translate the colophon slug when switching to portuguese", () => {
    expect(switchLocalePath("/en/colophon", "pt-PT")).toBe("/pt-pt/colofao");
  });

  it("should return the target locale home for an unknown path", () => {
    expect(switchLocalePath("/pt-br/rota-inexistente", "en-US")).toBe("/en/");
  });

  it("should return the target locale home when the path has no locale prefix", () => {
    expect(switchLocalePath("/", "pt-BR")).toBe("/pt-br/");
  });

  it("should be a no-op when the target locale is the current one", () => {
    expect(switchLocalePath("/pt-br/colofao", "pt-BR")).toBe("/pt-br/colofao");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run app/i18n/switch-locale.test.ts`
Expected: FAIL — `Failed to resolve import "./switch-locale"`.

- [ ] **Step 3: Implementar a troca de idioma**

Criar `app/i18n/switch-locale.ts`:

```ts
import {
  ROUTE_PATHS,
  SEGMENT_TO_LOCALE,
  localizedHref,
  type Locale,
  type RouteKey,
} from "./config";

function routeKeyFromPath(pathname: string): RouteKey | null {
  const [, segment = "", ...rest] = pathname.split("/");
  const locale = SEGMENT_TO_LOCALE[segment];
  if (!locale) return null;

  const slug = rest.join("/").replace(/\/$/, "");
  const keys = Object.keys(ROUTE_PATHS) as RouteKey[];
  return keys.find((key) => ROUTE_PATHS[key][locale] === slug) ?? null;
}

/** Leva o visitante para a mesma página no idioma alvo; cai na home se não houver equivalente. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const key = routeKeyFromPath(pathname);
  return key ? localizedHref(key, target) : localizedHref("home", target);
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run app/i18n/switch-locale.test.ts`
Expected: PASS — 6 testes.

- [ ] **Step 5: Escrever o teste do script de tema que falha**

Criar `app/design/theme.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "./theme";

describe("THEME_INIT_SCRIPT", () => {
  it("should read the persisted theme from the documented storage key", () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_STORAGE_KEY);
  });

  it("should fall back to the system colour scheme preference", () => {
    expect(THEME_INIT_SCRIPT).toContain("prefers-color-scheme");
  });

  it("should be a single line so its CSP hash stays stable", () => {
    expect(THEME_INIT_SCRIPT).not.toContain("\n");
  });

  it("should guard against storage access throwing", () => {
    expect(THEME_INIT_SCRIPT).toContain("catch");
  });
});
```

- [ ] **Step 6: Rodar e confirmar que falha**

Run: `npx vitest run app/design/theme.test.ts`
Expected: FAIL — `Failed to resolve import "./theme"`.

- [ ] **Step 7: Implementar o tema**

Criar `app/design/theme.ts`:

```ts
export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "dg-theme";

/** Roda antes da primeira pintura para evitar flash do tema errado. Uma linha só: o hash da CSP depende disso. */
export const THEME_INIT_SCRIPT =
  `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");` +
  `if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}` +
  `document.documentElement.setAttribute("data-theme",t);}` +
  `catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Armazenamento indisponível (modo privado): o tema vale só para esta navegação.
  }
}
```

- [ ] **Step 8: Rodar e confirmar que passa**

Run: `npx vitest run app/design/theme.test.ts`
Expected: PASS — 4 testes.

- [ ] **Step 9: Injetar o script no documento**

Em `app/root.tsx`, dentro do `<head>` e **antes** de `<Links />`, adicionar:

```tsx
import { THEME_INIT_SCRIPT } from "./design/theme";
```

```tsx
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
```

- [ ] **Step 10: Criar os dois componentes**

Criar `app/components/theme-toggle.tsx`:

```tsx
import { useEffect, useState } from "react";
import { applyTheme, readStoredTheme, type Theme } from "../design/theme";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";

export function ThemeToggle() {
  const t = getDictionary(useLocale());
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(readStoredTheme() ?? (current === "light" ? "light" : "dark"));
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t["theme.toggle"]}
      aria-pressed={theme === "light"}
      className="rounded-md border border-hairline px-3 py-1.5 font-mono text-xs text-fg-muted hover:text-fg"
    >
      {theme === "dark" ? t["theme.light"] : t["theme.dark"]}
    </button>
  );
}
```

Criar `app/components/locale-switcher.tsx`:

```tsx
import { useLocation, useNavigate } from "react-router";
import { LOCALES, LOCALE_LABELS, type Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { switchLocalePath } from "../i18n/switch-locale";
import { useLocale } from "../i18n/use-locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{t["locale.label"]}</span>
      <select
        value={locale}
        onChange={(event) =>
          navigate(switchLocalePath(pathname, event.target.value as Locale))
        }
        className="rounded-md border border-hairline bg-bg px-2 py-1.5 font-mono text-xs text-fg-muted"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {LOCALE_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 11: Rodar o portão e o build**

Run: `npm run check && npm run build`
Expected: tudo passa.

- [ ] **Step 12: Commit**

```bash
git add app/design/theme.ts app/design/theme.test.ts app/components/ app/i18n/switch-locale.ts app/i18n/switch-locale.test.ts app/root.tsx
git commit -m "feat: adiciona alternador de tema sem flash e alternador de idioma"
```

---

## Task 9: Worker de raiz e headers de segurança com CSP por hash

O Worker **não roda** para páginas estáticas — por isso os headers vêm do arquivo `_headers`, suportado nativamente pelos Workers Static Assets. Os hashes SHA-256 são extraídos do HTML já construído, o que permite CSP sem `'unsafe-inline'` em `script-src`.

**Files:**
- Modify: `workers/app.ts`
- Modify: `wrangler.jsonc`
- Create: `scripts/build-headers.ts`
- Test: `scripts/build-headers.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `negotiateLocale` (Task 3), `LOCALE_SEGMENTS` (Task 3)
- Produces: `extractInlineScripts(html: string): string[]`, `sha256Base64(source: string): Promise<string>`, `renderHeadersFile(hashes: string[]): string`

- [ ] **Step 1: Escrever o teste do gerador de headers que falha**

Criar `scripts/build-headers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  extractInlineScripts,
  renderHeadersFile,
  sha256Base64,
} from "./build-headers";

describe("extractInlineScripts", () => {
  it("should return the body of an inline script", () => {
    expect(extractInlineScripts('<script>alert(1)</script>')).toEqual([
      "alert(1)",
    ]);
  });

  it("should ignore scripts loaded from a src attribute", () => {
    expect(extractInlineScripts('<script src="/a.js"></script>')).toEqual([]);
  });

  it("should return every inline script on the page", () => {
    const html = "<script>a()</script><p>x</p><script>b()</script>";
    expect(extractInlineScripts(html)).toEqual(["a()", "b()"]);
  });

  it("should handle attributes on the script tag", () => {
    expect(extractInlineScripts('<script type="module">c()</script>')).toEqual([
      "c()",
    ]);
  });

  it("should return an empty array when there is no script", () => {
    expect(extractInlineScripts("<p>nada</p>")).toEqual([]);
  });
});

describe("sha256Base64", () => {
  it("should produce the known digest for an empty string", async () => {
    await expect(sha256Base64("")).resolves.toBe(
      "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
    );
  });
});

describe("renderHeadersFile", () => {
  it("should forbid framing on every path", () => {
    expect(renderHeadersFile([])).toContain("frame-ancestors 'none'");
  });

  it("should never allow unsafe-inline in script-src", () => {
    const output = renderHeadersFile(["abc="]);
    const scriptSrc = output
      .split(";")
      .find((part) => part.includes("script-src"));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("should include every provided hash in script-src", () => {
    const output = renderHeadersFile(["abc=", "def="]);
    expect(output).toContain("'sha256-abc='");
    expect(output).toContain("'sha256-def='");
  });

  it("should set a long immutable cache policy for hashed assets", () => {
    expect(renderHeadersFile([])).toContain("/assets/*");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run scripts/build-headers.test.ts`
Expected: FAIL — `Failed to resolve import "./build-headers"`.

- [ ] **Step 3: Incluir `scripts/` na configuração do Vitest**

Já está incluído em `vitest.config.ts` pela Task 1 (`"scripts/**/*.test.ts"`). Confirmar.

- [ ] **Step 4: Implementar o gerador**

Criar `scripts/build-headers.ts`:

```ts
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CLIENT_DIR = "dist/client";

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

export function extractInlineScripts(html: string): string[] {
  return [...html.matchAll(INLINE_SCRIPT)]
    .map((match) => match[1] ?? "")
    .filter((body) => body.length > 0);
}

export async function sha256Base64(source: string): Promise<string> {
  return createHash("sha256").update(source, "utf8").digest("base64");
}

export function renderHeadersFile(hashes: string[]): string {
  const scriptHashes = hashes.map((h) => `'sha256-${h}'`).join(" ");
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  return `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return found.flat();
}

async function main(): Promise<void> {
  const files = await htmlFiles(CLIENT_DIR);
  const bodies = new Set<string>();

  for (const file of files) {
    const html = await readFile(file, "utf8");
    for (const body of extractInlineScripts(html)) bodies.add(body);
  }

  const hashes = await Promise.all([...bodies].map(sha256Base64));
  await writeFile(join(CLIENT_DIR, "_headers"), renderHeadersFile(hashes.sort()));

  console.log(
    `_headers gerado: ${files.length} páginas, ${hashes.length} scripts inline`,
  );
}

if (process.argv[1]?.endsWith("build-headers.ts")) {
  await main();
}
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run scripts/build-headers.test.ts`
Expected: PASS — 10 testes.

- [ ] **Step 6: Ligar o gerador ao build**

Em `package.json`, alterar o script `build`:

```json
    "build": "react-router build && tsx scripts/build-headers.ts",
```

E instalar o executor:

```bash
npm i -D tsx
```

- [ ] **Step 7: Implementar o Worker**

Substituir o conteúdo de `workers/app.ts`:

```ts
import { createRequestHandler } from "react-router";
import { LOCALE_SEGMENTS } from "../app/i18n/config";
import { negotiateLocale } from "../app/i18n/negotiate";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const locale = negotiateLocale(request.headers.get("accept-language"));
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/${LOCALE_SEGMENTS[locale]}/`,
          // Sem Vary o cache serviria o idioma do primeiro visitante para todos.
          Vary: "Accept-Language",
          "Cache-Control": "no-store",
        },
      });
    }

    return requestHandler(request, { cloudflare: { env, ctx } });
  },
} satisfies ExportedHandler<Env>;
```

- [ ] **Step 8: Configurar o Wrangler**

Garantir que `wrangler.jsonc` contenha:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "page-dev",
  "compatibility_date": "2026-07-31",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./workers/app.ts",
  "assets": {
    "binding": "ASSETS",
    "not_found_handling": "404-page",
    "run_worker_first": ["/api/*", "/"]
  },
  "observability": { "enabled": true }
}
```

- [ ] **Step 9: Verificar o comportamento da raiz contra o runtime real**

```bash
npm run build
npx wrangler dev --port 8788 &
sleep 8
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept-Language: pt-PT" http://localhost:8788/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept-Language: fr-FR" http://localhost:8788/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/pt-br/
kill %1
```

Expected:
```
302 http://localhost:8788/pt-pt/
302 http://localhost:8788/en/
200
```

**Se a raiz devolver 200 em vez de 302**, o padrão `"/"` em `run_worker_first` não casou apenas com a raiz. Correção: trocar por `"run_worker_first": true` e, no Worker, delegar tudo que não for `/` nem `/api/*` para `env.ASSETS.fetch(request)` antes de chamar o `requestHandler`. Rodar este passo de novo até os três resultados baterem.

- [ ] **Step 10: Verificar que a CSP não contém `unsafe-inline` em scripts**

Run: `grep -o "script-src[^;]*" dist/client/_headers`
Expected: uma linha com `'self'` e um ou mais `'sha256-...'`, **sem** `'unsafe-inline'`.

- [ ] **Step 11: Commit**

```bash
git add workers/app.ts wrangler.jsonc scripts/ package.json package-lock.json
git commit -m "feat: adiciona redirect de idioma na raiz e CSP por hash via _headers"
```

---

## Task 10: Golden paths e acessibilidade no Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/navegacao.spec.ts`
- Create: `e2e/acessibilidade.spec.ts`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: o site construído e servido por `wrangler dev`
- Produces: suíte E2E rodando via `npm run e2e`

- [ ] **Step 1: Configurar o Playwright**

Criar `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 8788;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx wrangler dev --port ${PORT}`,
    url: `http://localhost:${PORT}/en/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Escrever os golden paths**

Criar `e2e/navegacao.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("should redirect the bare root to the negotiated locale", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/$/);
});

test("should serve each locale root with the correct lang attribute", async ({
  page,
}) => {
  for (const [path, lang] of [
    ["/pt-br/", "pt-BR"],
    ["/pt-pt/", "pt-PT"],
    ["/en/", "en-US"],
  ] as const) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  }
});

test("should keep the user on the colophon when switching language", async ({
  page,
}) => {
  await page.goto("/pt-br/colofao");
  await page.getByRole("combobox").selectOption("en-US");
  await expect(page).toHaveURL(/\/en\/colophon$/);
});

test("should persist the chosen theme across a reload", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("should reach the skip link as the first keyboard stop", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
```

- [ ] **Step 3: Escrever a verificação de acessibilidade**

Criar `e2e/acessibilidade.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PATHS = ["/pt-br/", "/pt-pt/", "/en/", "/en/colophon"];

for (const path of PATHS) {
  for (const theme of ["dark", "light"] as const) {
    test(`should have no accessibility violations on ${path} in ${theme} theme`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.evaluate((value) => {
        document.documentElement.setAttribute("data-theme", value);
      }, theme);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
}
```

- [ ] **Step 4: Rodar a suíte**

Run: `npm run e2e`
Expected: PASS — 13 testes. Qualquer violação do axe é **defeito**, não ruído: corrigir o markup, nunca desligar a regra.

- [ ] **Step 5: Adicionar o E2E ao CI**

Em `.github/workflows/ci.yml`, acrescentar ao final do job `check`:

```yaml
      - run: npx playwright install --with-deps chromium
      - run: npm run e2e
```

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e/ .github/workflows/ci.yml package.json package-lock.json
git commit -m "test: adiciona golden paths e verificacao axe nos dois temas"
```

---

## Task 11: Publicar em subdomínio de pré-visualização

**Files:**
- Modify: `wrangler.jsonc`

**Interfaces:**
- Consumes: o build completo
- Produces: site acessível em `novo.diorgenesgeorge.dev`

- [ ] **Step 1: Autenticar (comando do usuário)**

O usuário roda no próprio terminal:

```
! npx wrangler login
```

- [ ] **Step 2: Publicar**

Run: `npm run deploy`
Expected: saída do Wrangler com a URL `*.workers.dev` do Worker publicado.

- [ ] **Step 3: Verificar em produção**

```bash
DEPLOY_URL="<url impressa no passo anterior>"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept-Language: pt-BR" "$DEPLOY_URL/"
curl -sI "$DEPLOY_URL/en/" | grep -i "content-security-policy"
curl -sI "$DEPLOY_URL/en/" | grep -i "strict-transport-security"
```

Expected: 302 para `/pt-br/`; header CSP presente **sem** `unsafe-inline` em `script-src`; HSTS presente.

Se os headers não aparecerem, confirmar que `dist/client/_headers` existe **antes** do `wrangler deploy` — o script de pós-build precisa ter rodado.

- [ ] **Step 4: Apontar o subdomínio (ação do usuário no painel)**

Adicionar a rota `novo.diorgenesgeorge.dev/*` ao Worker, via painel da Cloudflare ou acrescentando ao `wrangler.jsonc`:

```jsonc
  "routes": [
    { "pattern": "novo.diorgenesgeorge.dev", "custom_domain": true }
  ]
```

O domínio raiz **permanece intocado** até a Fase 4.

- [ ] **Step 5: Commit**

```bash
git add wrangler.jsonc
git commit -m "chore: publica fase 0 em subdominio de previsualizacao"
```

---

## Definição de pronto da Fase 0

- [ ] `npm run check` verde
- [ ] `npm run e2e` verde, incluindo axe nos dois temas
- [ ] CI verde no GitHub Actions
- [ ] Seis páginas HTML pré-renderizadas, uma por rota por idioma
- [ ] `/` redireciona 302 conforme `Accept-Language`, com `Vary` correto
- [ ] `lang` correto em cada idioma
- [ ] Tema persiste, sem flash na primeira pintura
- [ ] Troca de idioma preserva a página
- [ ] Zero requisição a domínio externo em qualquer página
- [ ] CSP sem `unsafe-inline` em `script-src`
- [ ] Todo par de cor com texto passa 4.5:1 nos dois temas, verificado por teste
- [ ] Publicado em `novo.diorgenesgeorge.dev`

## Fora do escopo desta fase

Conteúdo real das páginas, hero 3D, telemetria ao vivo, movimento GSAP, agente de IA, MDX/blog, JSON-LD, sitemap, `llms.txt`, feeds, OG images, formulário de contato. Cada um pertence às Fases 1–4 e terá plano próprio.

## Lacunas conhecidas, deliberadas

- **`style-src 'unsafe-inline'`** permanece nesta fase: o React Router injeta estilos inline durante a hidratação. A Fase 4 endurece isso com hashes, junto com o restante do trabalho de segurança.
- **Tokens do tema claro** são um ponto de partida. A Task 4 exige que sejam ajustados até passarem na auditoria de contraste; os valores finais podem divergir dos escritos aqui.
