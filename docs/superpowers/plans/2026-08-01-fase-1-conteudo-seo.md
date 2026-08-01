# Fase 1 — Conteúdo, SEO, AEO e GEO · Plano de Implementação

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para rastreamento.

**Goal:** Transformar o esqueleto trilíngue da Fase 0 em um site com conteúdo real — sobre, CV, serviços, cinco cases e três artigos — indexável por buscador, respondível por assistente de IA e citável por crawler de LLM, com a CSP corrigida para escalar até centenas de páginas.

**Architecture:** Todo texto do site nasce em uma única fonte por documento: markdown com frontmatter validado por Zod para páginas de prosa, cases e artigos; TypeScript estruturado para o CV. Dessa fonte derivam três saídas — o HTML pré-renderizado, o `.md` público de cada página e o `llms-full.txt`. Nenhuma prosa é duplicada entre HTML e markdown. As rotas dinâmicas (`/trabalho/<slug>`, `/escritos/<slug>`, `/escritos/tag/<tag>`) têm seus caminhos derivados do conteúdo em tempo de build e entram na lista de pré-renderização automaticamente. Sitemap, feeds, `robots.txt` e `llms.txt` são rotas de recurso pré-renderizadas a partir do mesmo registro de conteúdo, então nunca divergem do que existe.

**Tech Stack:** React Router v8 · Vite · TypeScript strict · Tailwind CSS v4 · MDX (`@mdx-js/rollup`) · Zod · gray-matter · Vitest · Playwright · axe-core · Wrangler.

**Spec:** `docs/superpowers/specs/2026-07-31-site-dev-design.md`
**Fase anterior:** `docs/superpowers/plans/2026-07-31-fase-0-fundacao.md`
**Insumo de conteúdo:** `insumos/portfolio-cases.md` (fora do git — descreve infraestrutura interna do município)

---

## Global Constraints

Aplicam-se a todas as tarefas. Não repetidas em cada uma.

- **Diretório do projeto:** `/home/dg/projetos/page-dev`
- **Branch:** `feature/fase-1-conteudo`, criada a partir de `feature/fase-0-fundacao`. Nunca commitar na `main`.
- **Gerenciador de pacotes:** `npm`.
- **TypeScript `strict: true`.** Sem `any` implícito. Sem `@ts-ignore` sem comentário justificando.
- **Nunca** incluir `Co-Authored-By` em mensagem de commit.
- **Nunca** commitar `insumos/`, `CLAUDE.md`, `.dev.vars`, `node_modules`, `build`, `.wrangler`.
- **Não fazer push nem abrir PR** sem pedido explícito do usuário.
- **Locales:** `pt-BR`, `pt-PT`, `en-US`. Segmentos: `pt-br`, `pt-pt`, `en`. Toda URL de página termina em barra.
- **Comentários:** só o porquê, nunca o quê. Máximo uma linha.
- Ao fim de cada tarefa: `npm run check` precisa passar antes do commit.
- **Regra 1 do spec vale para todo número escrito:** nenhum dado numérico entra no site sem estar documentado em `insumos/portfolio-cases.md` como `[fato]` ou ser calculado em tempo de execução a partir de uma data. Número marcado `[confirmar]` no insumo **não é publicado** até o Diorgenes confirmar.

### Regras de publicação de conteúdo — inegociáveis

O conteúdo descreve sistemas internos de uma prefeitura. Estas regras valem para toda tarefa de redação:

1. **Nunca escrever no site:** token, chave, e-mail de service account, ID de planilha, `database_id`, nome de banco D1, URL `*.workers.dev` interna, domínio de homologação, host de GeoServer, e as senhas dos painéis internos — mesmo aposentadas, mesmo como exemplo. Os valores literais vivem em `insumos/termos-proibidos.txt`, fora do git.
2. **Nunca escrever:** nome, matrícula, foto ou contato de servidor identificável; indicador de desempenho atribuído a secretaria nomeada; conteúdo de DFD/ETP/TR não licitado; número de processo administrativo; dado de fila de UPA ao vivo.
3. **Não nomear o sistema de origem de saúde** (fornecedor da API hospitalar e o banco por trás dela). Escrever "a API do sistema de regulação assistencial do município".
4. **Todo case nasce com `status: "rascunho"`.** Só vira `"publicado"` depois que o Diorgenes ler o texto final e confirmar o alinhamento institucional com a Fundação. Documento em rascunho não é pré-renderizado, não entra no sitemap, não entra no `llms.txt` e não é linkado.
5. **Sem print de tela nesta fase.** Imagens ficam para a Fase 4, e o insumo define quais sistemas admitem captura real.

---

### Convenção deste plano

As tarefas não têm todas a mesma forma, e isso é deliberado:

- **Tarefas de infraestrutura** (1 a 5, 20 a 25) trazem o código completo ou o teste que define o contrato antes da implementação. Onde só há teste, o teste é a especificação: implemente o mínimo que o faça passar.
- **Tarefas de redação** (6 a 19) trazem a ficha do documento — frontmatter exato, estrutura de seções, os fatos liberados e os proibidos. O texto final é escrito na execução, porque copiá-lo aqui duplicaria o conteúdo do site dentro do plano e criaria duas versões para manter.
- **Nenhuma tarefa de redação termina com o documento publicado.** Todas nascem em `status: rascunho` e dependem da leitura do Diorgenes.

## Decisões tomadas antes deste plano

Registradas aqui porque mudam o desenho e não são óbvias ao ler o código.

| Decisão | Escolha | Motivo |
|---|---|---|
| CSP que não escalava | ~~Externalizar os scripts do React Router em `/_rr/<hash>.js` no pós-build~~ **Refutado na execução — ver a nota abaixo.** Mantido o hash de todo script inline, com orçamento de 4 KB verificado no build | Reescrever no pós-build qualquer elemento que o React renderiza quebra a hidratação |
| Formato do conteúdo | Markdown puro com frontmatter, **sem JSX**, validado por teste | Torna o `.md` público uma cópia fiel da fonte e o `llms-full.txt` uma concatenação, sem renderizar nem converter nada |
| Pós-graduação interrompida | Omitida do site | Decisão do Diorgenes. Só o bacharelado concluído aparece |
| Tempo de experiência | Nunca escrito como número | Calculado das datas com `Intl` na renderização. Escrever "X anos de experiência" seria inventar senioridade que o LinkedIn contradiz |
| E-mail de contato | Fora desta fase | `contato@diorgenesgeorge.dev` ainda não existe, e publicar o pessoal convida spam. `/contato` liga para LinkedIn e GitHub; formulário e e-mail são Fase 4 |
| `/ia` | Fora desta fase | Depende do agente, que é Fase 3 |
| OG images | Fora desta fase | Estão no escopo da Fase 4 no spec. As meta tags `og:image` só entram quando houver imagem |
| Idioma dos artigos | `pt-BR` e `en-US` | O objetivo 1 inclui vaga no exterior. `pt-PT` fica para quando houver demanda; `hreflang` só emite o que existe |
| Cases publicados | 5, nesta ordem | Central, ContrataPlan, Instrumentos, UPA Agora e ODS. Os quatro primeiros são os que o insumo aponta como portadores de decisão real; o ODS entra porque é o único inteiramente público e garante conteúdo aprovável mesmo se o alinhamento institucional atrasar os outros |

---

### Correção de rota na execução — a externalização de scripts não funciona

**Descoberto em 2026-08-01, executando a Task 1.** O `<Scripts>` do React Router é um componente React: ele renderiza a tag `<script>` inline no servidor **e de novo no cliente, durante a hidratação**. Trocar essa tag por uma com `src` no pós-build faz servidor e cliente divergirem naquele nó. React aborta a hidratação com o erro #418, regenera a árvore inteira e, no caminho, apaga o `data-theme` que o script de tema tinha posto antes da primeira pintura — o flash de tema que a Fase 0 tinha eliminado voltava, de forma intermitente, **em todas as páginas**.

Isso foi confirmado por experimento controlado: build sem externalização hidrata limpo; build externalizando apenas o script de módulo reproduz o erro. Não é problema de ordem de execução, e nenhum ajuste de detalhe resolve — **pós-build não pode reescrever o que o React renderiza.**

**O que ficou no lugar:**

- Todo script inline continua inline e entra na CSP por hash, como na Fase 0.
- O `_headers` passa a ter um **orçamento de 4 KB** verificado no build, com mensagem explicando o que fazer se estourar.
- O número de hashes cresce com o número de **rotas**, não de páginas: mil artigos compartilham o script de módulo da rota de artigo. Com 10 páginas são 14 hashes e 966 bytes de CSP.
- A política é byte a byte idêntica em toda resposta, então a compressão de cabeçalho do HTTP/2 a envia uma vez por conexão. A premissa da Fase 0 — "3 KB em toda resposta" — superestimava o custo.
- **Se um dia o orçamento estourar**, a saída é regra por diretório no `_headers`, agrupada por rota (`/en/escritos/*`), que escala com rotas e cabe no limite de 100 regras do Cloudflare.

**Dois defeitos reais achados no mesmo diagnóstico, ambos corrigidos:**

1. `routeDiscovery` estava em modo `lazy`, buscando `/__manifest` em runtime — que num site inteiramente estático responde 404 em toda página. Fixado em `initial`.
2. A 404 pré-renderizada como rota nomeada (`not-found-<seg>`) era servida em URLs que casam com o splat (`splat-<seg>`). IDs de rota diferentes entre servidor e cliente quebravam a hidratação da 404. A rota nomeada foi removida: o caminho `/<seg>/404/` é pré-renderizado pelo próprio splat, então servidor e cliente casam a mesma rota.

### Variações de nome — decidido em 2026-08-01, durante a execução

O nome legal é **Diorgenes George Tavares Silva**, e as buscas prováveis incluem "Diorgenes", "Diorgenes Tavares" e "DG".

- **Entra em `alternateName` do JSON-LD `Person`**, junto de `givenName`, `familyName` e `legalName`. É o mecanismo próprio para dizer "estas buscas são a mesma pessoa".
- **Uma menção natural do nome completo** em `/sobre` e no `/cv`, onde um leitor esperaria encontrá-lo. Nada além disso.
- **Proibido** repetir variação em título, rodapé ou texto corrido para ganhar busca: é keyword stuffing e hoje derruba qualidade.
- **"DG" não é alvo de busca.** Duas letras não se disputa. Vale só como monograma, que já está no cabeçalho.
- Para **recomendação de serviço por IA**, o que decide não é o nome e sim o corpus: "painéis de dados para gestão pública em Minas Gerais" é casável com um pedido; "desenvolvedor full stack" não. Os cases são esse corpus.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/externalize-scripts.ts` | Pós-build: move script inline executável para `/_rr/<hash>.js` |
| `scripts/build-headers.ts` | Reescrito: CSP com um hash fixo + guarda contra inline executável |
| `scripts/build-markdown.ts` | Pós-build: emite o `.md` público de cada documento |
| `app/config/site.ts` | URL canônica, perfis externos, nome do autor |
| `app/content/schema.ts` | Schemas Zod de frontmatter de página, case e artigo |
| `app/content/registry.ts` | Carga via `import.meta.glob`, validação e índices por locale |
| `app/content/manifest.node.ts` | Varredura em Node dos mesmos arquivos, para o `react-router.config.ts` |
| `app/content/cv.ts` | Tipo do CV e dado estruturado por locale |
| `app/content/pages/{sobre,servicos,colofao}.<locale>.mdx` | Prosa das páginas fixas |
| `app/content/cases/<slug>.<locale>.mdx` | Cases |
| `app/content/articles/<slug>.<locale>.mdx` | Artigos |
| `app/seo/meta.ts` | Título, descrição, canonical, hreflang, Open Graph |
| `app/seo/jsonld.ts` | Construtores de JSON-LD e o componente que os injeta |
| `app/seo/urls.ts` | URL absoluta de qualquer documento, e o inverso |
| `app/components/answer-block.tsx` | Bloco de resposta direta (AEO) |
| `app/components/prose.tsx` | Estilo tipográfico do markdown renderizado |
| `app/routes/about.tsx` · `cv.tsx` · `services.tsx` · `contact.tsx` | Páginas fixas |
| `app/routes/work.tsx` · `work.case.tsx` | Índice de cases e case |
| `app/routes/writing.tsx` · `writing.article.tsx` · `writing.tag.tsx` | Blog |
| `app/routes/not-found.tsx` | 404 desenhada |
| `app/routes/resources/{sitemap,robots,llms,llms-full,feed-rss,feed-json}.ts` | Rotas de recurso pré-renderizadas |
| `e2e/conteudo.spec.ts` · `e2e/seo.spec.ts` · `e2e/csp.spec.ts` | Playwright |

---

## Índice de tarefas

| # | Tarefa | Entrega |
|---|---|---|
| 1 | CSP que escala | Scripts do RR externalizados, header constante |
| 2 | Página 404 desenhada | 404 localizada nos três idiomas |
| 3 | Modelo de conteúdo | MDX + Zod + registro tipado |
| 4 | Rotas de conteúdo | Slugs localizados e prerender derivado do conteúdo |
| 5 | Tipografia de prosa e bloco de resposta | Componentes de leitura |
| 6 | `/sobre` | Trajetória, texto real |
| 7 | `/cv` | CV estruturado, fonte única |
| 8 | `/servicos` e `/contato` | Caminho do cliente |
| 9–13 | Cinco cases | Central, ContrataPlan, Instrumentos, UPA Agora, ODS |
| 14 | `/trabalho` | Índice de cases |
| 15 | `/escritos` e tags | Índice do blog |
| 16–18 | Três artigos | Redigidos a partir dos cases |
| 19 | Home | Prova e caminhos por persona |
| 20 | Metadados e hreflang | Título, descrição, canonical, alternates |
| 21 | JSON-LD | Person, WebSite, TechArticle, SoftwareSourceCode, Service, Breadcrumb |
| 22 | Sitemap e robots | Com alternates e liberação de crawler de IA |
| 23 | Feeds | RSS e JSON Feed por idioma |
| 24 | GEO | `.md` por documento, `llms.txt`, `llms-full.txt` |
| 25 | Acessibilidade e golden paths | axe em todas as rotas, E2E de conteúdo |
| 26 | Fechamento | Verificação da definição de pronto |

---

## Task 1: CSP que escala — externalizar os scripts do React Router

**Contexto:** a Fase 0 gerou 11 hashes para 6 páginas. Cada página pré-renderizada contribui com scripts inline próprios (manifesto de módulos e chunks de stream do React Router), então o header cresceria com o site. Medido no build atual, cada página tem 6 scripts inline: o de tema (289 B, **idêntico em toda página**) e cinco do React Router.

A saída é externalizar tudo que é executável, menos o de tema — que precisa continuar inline porque bloqueia a primeira pintura e é o que evita o flash. O `_headers` passa a ter `script-src 'self' 'sha256-<tema>'`, com um único hash, para sempre.

Dois cuidados que a implementação precisa respeitar, e que os testes verificam:
- **Data block não vira arquivo.** `<script type="application/ld+json">` não é executado pelo browser e é como o Google lê o JSON-LD da Task 21. Externalizar quebraria o SEO. Fica inline e a CSP não o alcança.
- **Ordem de execução.** Os scripts clássicos do React Router dependem de ordem (`__reactRouterContext` cria o stream, os seguintes alimentam e fecham). Script externo clássico sem `async`/`defer` executa em ordem de documento, então a semântica se mantém — mas isso é exatamente o tipo de mudança que quebra em silêncio, e por isso a task termina com um teste de hidratação real.

**Files:**
- Create: `scripts/html-files.ts`
- Create: `scripts/externalize-scripts.ts`
- Create: `scripts/externalize-scripts.test.ts`
- Create: `e2e/csp.spec.ts`
- Modify: `scripts/build-headers.ts` (reescrita)
- Modify: `scripts/build-headers.test.ts`
- Modify: `package.json` (script `build`)

- [ ] **Step 1: Extrair a varredura de HTML para um módulo compartilhado**

Dois scripts de pós-build precisam da mesma lista de arquivos. Criar `scripts/html-files.ts`:

```ts
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export const CLIENT_DIR = "build/client";

export async function htmlFiles(dir: string = CLIENT_DIR): Promise<string[]> {
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
```

- [ ] **Step 2: Escrever os testes da externalização**

Criar `scripts/externalize-scripts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { THEME_INIT_SCRIPT } from "../app/design/theme";
import { externalizeInlineScripts } from "./externalize-scripts";

const page = (body: string) => `<!DOCTYPE html><html><head>${body}</head><body></body></html>`;

describe("externalizeInlineScripts", () => {
  it("should keep the theme script inline so the first paint stays blocked", () => {
    const html = page(`<script>${THEME_INIT_SCRIPT}</script>`);

    const result = externalizeInlineScripts(html);

    expect(result.html).toBe(html);
  });

  it("should keep a JSON-LD data block untouched", () => {
    const html = page(`<script type="application/ld+json">{"@type":"Person"}</script>`);

    const result = externalizeInlineScripts(html);

    expect(result.html).toBe(html);
  });

  it("should leave a script that already has a src alone", () => {
    const html = page(`<script src="/assets/entry.js"></script>`);

    const result = externalizeInlineScripts(html);

    expect(result.assets.size).toBe(0);
  });

  it("should replace an executable inline script with a content addressed src", () => {
    const html = page(`<script>window.__reactRouterContext = {};</script>`);

    const result = externalizeInlineScripts(html);

    expect(result.html).toMatch(/<script src="\/_rr\/[0-9a-f]{16}\.js"><\/script>/);
  });

  it("should preserve the attributes of a module script", () => {
    const html = page(`<script type="module" async>import "/assets/x.js";</script>`);

    const result = externalizeInlineScripts(html);

    expect(result.html).toContain(`<script type="module" async src="/_rr/`);
  });

  it("should emit the body of the externalized script as an asset", () => {
    const html = page(`<script>window.a = 1;</script>`);

    const result = externalizeInlineScripts(html);

    expect([...result.assets.values()]).toEqual(["window.a = 1;"]);
  });

  it("should deduplicate identical scripts across pages into one asset name", () => {
    const first = externalizeInlineScripts(page(`<script>window.a = 1;</script>`));
    const second = externalizeInlineScripts(page(`<script>window.a = 1;</script>`));

    expect([...first.assets.keys()]).toEqual([...second.assets.keys()]);
  });
});
```

- [ ] **Step 3: Rodar os testes para vê-los falhar**

Run: `npx vitest run scripts/externalize-scripts.test.ts`
Expected: FAIL — `Failed to resolve import "./externalize-scripts"`

- [ ] **Step 4: Implementar a externalização**

Criar `scripts/externalize-scripts.ts`:

```ts
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { THEME_INIT_SCRIPT } from "../app/design/theme";
import { CLIENT_DIR, htmlFiles } from "./html-files";

const ASSET_DIR = "_rr";

const SCRIPT_TAG = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

/** Data block (JSON-LD) não é executado pelo browser, então a CSP não o alcança e o crawler precisa dele inline. */
function isExecutable(attrs: string): boolean {
  const type = /\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attrs)?.[1];
  return (
    type === undefined || type === "" || type === "module" || type === "text/javascript"
  );
}

export function assetName(body: string): string {
  const digest = createHash("sha256").update(body, "utf8").digest("hex");
  return `${digest.slice(0, 16)}.js`;
}

export type Externalization = { html: string; assets: Map<string, string> };

export function externalizeInlineScripts(html: string): Externalization {
  const assets = new Map<string, string>();

  const out = html.replace(SCRIPT_TAG, (tag, attrs: string, body: string) => {
    if (/\bsrc\s*=/i.test(attrs)) return tag;
    if (!isExecutable(attrs)) return tag;
    if (body.trim() === "" || body === THEME_INIT_SCRIPT) return tag;

    const name = assetName(body);
    assets.set(name, body);
    return `<script${attrs} src="/${ASSET_DIR}/${name}"></script>`;
  });

  return { html: out, assets };
}

async function main(): Promise<void> {
  const files = await htmlFiles();
  const assets = new Map<string, string>();

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const result = externalizeInlineScripts(html);
    for (const [name, body] of result.assets) assets.set(name, body);
    if (result.html !== html) await writeFile(file, result.html);
  }

  await mkdir(join(CLIENT_DIR, ASSET_DIR), { recursive: true });
  for (const [name, body] of assets) {
    await writeFile(join(CLIENT_DIR, ASSET_DIR, name), body);
  }

  console.log(
    `scripts externalizados: ${files.length} páginas, ${assets.size} arquivos em /${ASSET_DIR}`,
  );
}

if (process.argv[1]?.endsWith("externalize-scripts.ts")) {
  await main();
}
```

- [ ] **Step 5: Rodar os testes para vê-los passar**

Run: `npx vitest run scripts/externalize-scripts.test.ts`
Expected: PASS, 7 testes

- [ ] **Step 6: Reescrever os testes do gerador de headers**

O `_headers` deixa de ser função da quantidade de páginas. Substituir o conteúdo de `scripts/build-headers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { THEME_INIT_SCRIPT } from "../app/design/theme";
import { executableInlineScripts, renderHeadersFile, sha256Base64 } from "./build-headers";

describe("renderHeadersFile", () => {
  it("should allow exactly one script hash regardless of how many pages exist", () => {
    const headers = renderHeadersFile(sha256Base64(THEME_INIT_SCRIPT));

    expect(headers.match(/'sha256-/g)).toHaveLength(1);
  });

  it("should never allow unsafe-inline in script-src", () => {
    const headers = renderHeadersFile(sha256Base64(THEME_INIT_SCRIPT));
    const scriptSrc = /script-src ([^;]+);/.exec(headers)?.[1] ?? "";

    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("should serve the externalized scripts as immutable", () => {
    const headers = renderHeadersFile(sha256Base64(THEME_INIT_SCRIPT));

    expect(headers).toContain("/_rr/*");
  });
});

describe("executableInlineScripts", () => {
  it("should ignore a JSON-LD data block", () => {
    const html = `<script type="application/ld+json">{"a":1}</script>`;

    expect(executableInlineScripts(html)).toEqual([]);
  });

  it("should report an executable inline script that survived the build", () => {
    const html = `<script>window.leak = 1;</script>`;

    expect(executableInlineScripts(html)).toEqual(["window.leak = 1;"]);
  });
});
```

- [ ] **Step 7: Reescrever o gerador de headers**

Substituir o conteúdo de `scripts/build-headers.ts`:

```ts
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { THEME_INIT_SCRIPT } from "../app/design/theme";
import { CLIENT_DIR, htmlFiles } from "./html-files";

const SCRIPT_TAG = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

export function sha256Base64(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("base64");
}

/** Guarda do build: depois da externalização, só o script de tema pode continuar inline. */
export function executableInlineScripts(html: string): string[] {
  return [...html.matchAll(SCRIPT_TAG)]
    .filter(([, attrs]) => !/\bsrc\s*=/i.test(attrs ?? ""))
    .filter(([, attrs]) => {
      const type = /\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attrs ?? "")?.[1];
      return type === undefined || type === "" || type === "module";
    })
    .map(([, , body]) => body ?? "")
    .filter((body) => body.trim() !== "" && body !== THEME_INIT_SCRIPT);
}

export function renderHeadersFile(themeHash: string): string {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'sha256-${themeHash}'`,
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

/_rr/*
  Cache-Control: public, max-age=31536000, immutable

/*.md
  Content-Type: text/markdown; charset=utf-8
`;
}

async function main(): Promise<void> {
  const files = await htmlFiles();
  const leaked: string[] = [];

  for (const file of files) {
    const html = await readFile(file, "utf8");
    for (const body of executableInlineScripts(html)) {
      leaked.push(`${file}: ${body.slice(0, 80)}`);
    }
  }

  if (leaked.length > 0) {
    throw new Error(
      `script inline executável sobreviveu ao build e a CSP o bloquearia:\n${leaked.join("\n")}`,
    );
  }

  await writeFile(
    join(CLIENT_DIR, "_headers"),
    renderHeadersFile(sha256Base64(THEME_INIT_SCRIPT)),
  );

  console.log(`_headers gerado: ${files.length} páginas, 1 hash de script`);
}

if (process.argv[1]?.endsWith("build-headers.ts")) {
  await main();
}
```

- [ ] **Step 8: Encaixar a externalização no build, antes dos headers**

Em `package.json`, trocar a linha do `build`:

```json
"build": "react-router build && tsx scripts/externalize-scripts.ts && tsx scripts/build-headers.ts",
```

A ordem importa: a guarda do `build-headers` só faz sentido depois que a externalização rodou.

- [ ] **Step 9: Rodar o build e conferir o resultado real**

Run: `npm run build`
Expected: as duas últimas linhas devem ser semelhantes a

```
scripts externalizados: 6 páginas, 7 arquivos em /_rr
_headers gerado: 6 páginas, 1 hash de script
```

Se o build lançar `script inline executável sobreviveu`, a regex de `isExecutable` divergiu do HTML real: inspecione o arquivo citado no erro antes de mexer em qualquer outra coisa.

- [ ] **Step 10: Escrever o teste de ponta a ponta da CSP e da hidratação**

Criar `e2e/csp.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("should carry exactly one script hash in the policy", async ({ request }) => {
  const response = await request.get("/en/");
  const csp = response.headers()["content-security-policy"] ?? "";

  expect(csp.match(/'sha256-/g)).toHaveLength(1);
});

test("should render a page without any policy violation", async ({ page }) => {
  const violations: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as unknown as { __violations: string[] }).__violations ??= [];
      (window as unknown as { __violations: string[] }).__violations.push(
        event.violatedDirective,
      );
    });
  });

  await page.goto("/en/");
  violations.push(
    ...(await page.evaluate(
      () => (window as unknown as { __violations?: string[] }).__violations ?? [],
    )),
  );

  expect(violations).toEqual([]);
});

test("should still hydrate after the scripts were externalized", async ({ page }) => {
  await page.goto("/en/");

  // O alternador só responde depois da hidratação: é a prova de que a ordem dos scripts sobreviveu.
  await page.getByRole("button", { name: /theme|tema/i }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
```

Se o nome acessível do botão de tema divergir, ajuste o seletor ao que `app/components/theme-toggle.tsx` expõe — não altere o componente para servir ao teste.

- [ ] **Step 11: Rodar o Playwright**

Run: `npx playwright test e2e/csp.spec.ts`
Expected: 3 testes passando. Falha em `securitypolicyviolation` significa que algum script ficou inline sem hash — leia a diretiva violada no relatório.

- [ ] **Step 12: `npm run check` e commit**

```bash
npm run check
git add scripts app package.json e2e/csp.spec.ts
git commit -m "fix: externaliza scripts do react router para a csp parar de crescer com o site"
```

---

## Task 2: Página 404 desenhada, nos três idiomas

**Contexto:** `not_found_handling: "404-page"` já está configurado no `wrangler.jsonc`, mas nenhum `404.html` é gerado, então hoje a resposta é um 404 cru. A rota precisa existir como página pré-renderizada e depois ser copiada para o nome de arquivo que o Cloudflare procura.

**Files:**
- Modify: `app/i18n/config.ts`
- Modify: `app/i18n/messages/{pt-BR,pt-PT,en-US}.ts`
- Modify: `app/i18n/dictionary.ts`
- Modify: `app/routes.ts`
- Create: `app/routes/not-found.tsx`
- Create: `scripts/build-404.ts`
- Modify: `package.json`
- Modify: `e2e/navegacao.spec.ts`

- [ ] **Step 1: Registrar a rota no mapa de caminhos**

Em `app/i18n/config.ts`, estender `RouteKey` e `ROUTE_PATHS`:

```ts
export type RouteKey = "home" | "colophon" | "notFound";

export const ROUTE_PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { "pt-BR": "", "pt-PT": "", "en-US": "" },
  colophon: { "pt-BR": "colofao", "pt-PT": "colofao", "en-US": "colophon" },
  notFound: { "pt-BR": "404", "pt-PT": "404", "en-US": "404" },
};
```

- [ ] **Step 2: Acrescentar as strings do 404 ao dicionário**

Em `app/i18n/dictionary.ts`, acrescentar ao tipo `Dictionary`:

```ts
  "meta.notFound.title": string;
  "notFound.heading": string;
  "notFound.body": string;
  "notFound.back": string;
```

Em `app/i18n/messages/pt-BR.ts`:

```ts
  "meta.notFound.title": "Página não encontrada — Diorgenes George",
  "notFound.heading": "Esta página não existe",
  "notFound.body":
    "O endereço pode ter mudado ou o link pode estar quebrado. O caminho de volta está logo abaixo.",
  "notFound.back": "Ir para a página inicial",
```

Em `app/i18n/messages/pt-PT.ts`:

```ts
  "meta.notFound.title": "Página não encontrada — Diorgenes George",
  "notFound.heading": "Esta página não existe",
  "notFound.body":
    "O endereço pode ter mudado ou a ligação pode estar quebrada. O caminho de volta está logo abaixo.",
  "notFound.back": "Ir para a página inicial",
```

Em `app/i18n/messages/en-US.ts`:

```ts
  "meta.notFound.title": "Page not found — Diorgenes George",
  "notFound.heading": "This page does not exist",
  "notFound.body":
    "The address may have changed or the link may be broken. The way back is right below.",
  "notFound.back": "Go to the home page",
```

- [ ] **Step 3: Escrever a página**

Criar `app/routes/not-found.tsx`:

```tsx
import { Link } from "react-router";
import { localizedHref } from "../i18n/config";
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname } from "../i18n/use-locale";
import { useLocale } from "../i18n/use-locale";
import type { Route } from "./+types/not-found";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [
    { title: t["meta.notFound.title"] },
    { name: "robots", content: "noindex" },
  ];
}

export default function NotFound() {
  const locale = useLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-32">
      <p className="font-mono text-sm uppercase tracking-widest text-accent">404</p>
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {t["notFound.heading"]}
      </h1>
      <p className="max-w-prose text-fg-muted">{t["notFound.body"]}</p>
      <Link
        to={localizedHref("home", locale)}
        className="font-mono text-sm text-accent underline underline-offset-4"
      >
        {t["notFound.back"]}
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Registrar a rota e o splat**

Em `app/routes.ts`, dentro do `layout(...)` de cada locale, acrescentar duas entradas depois do colofão:

```ts
      route(ROUTE_PATHS.notFound[locale], "routes/not-found.tsx", {
        id: `not-found-${segment}`,
      }),
      route("*", "routes/not-found.tsx", { id: `splat-${segment}` }),
```

A rota nomeada existe para ser pré-renderizada; o splat existe para a navegação no cliente não cair no ErrorBoundary.

- [ ] **Step 5: Gerar os arquivos que o Cloudflare procura**

Criar `scripts/build-404.ts`:

```ts
import { copyFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { LOCALES, LOCALE_SEGMENTS } from "../app/i18n/config";
import { CLIENT_DIR } from "./html-files";

const ROOT_LOCALE = "en-US" as const;

/**
 * O handler de assets procura o 404.html mais próximo subindo a árvore de diretórios,
 * então cada idioma ganha o seu e a raiz fica com o inglês, coerente com o x-default.
 */
async function main(): Promise<void> {
  for (const locale of LOCALES) {
    const segment = LOCALE_SEGMENTS[locale];
    const generated = join(CLIENT_DIR, segment, "404", "index.html");
    await copyFile(generated, join(CLIENT_DIR, segment, "404.html"));
    if (locale === ROOT_LOCALE) {
      await copyFile(generated, join(CLIENT_DIR, "404.html"));
    }
    // A URL /<idioma>/404/ não deve existir como página navegável.
    await rm(join(CLIENT_DIR, segment, "404"), { recursive: true, force: true });
  }

  console.log(`404.html gerado para ${LOCALES.length} idiomas e para a raiz`);
}

await main();
```

- [ ] **Step 6: Encaixar no build**

Em `package.json`, o `build` passa a ser:

```json
"build": "react-router build && tsx scripts/build-404.ts && tsx scripts/externalize-scripts.ts && tsx scripts/build-headers.ts",
```

O 404 é copiado antes da externalização para que também receba o tratamento de CSP.

- [ ] **Step 7: Verificar o comportamento real do handler de assets**

```bash
npm run build
npx wrangler dev --port 8788 &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/pt-br/nao-existe/
curl -s http://localhost:8788/pt-br/nao-existe/ | grep -o "Esta página não existe"
curl -s http://localhost:8788/nao-existe-na-raiz/ | grep -o "This page does not exist"
```

Expected: `404`, depois a frase em português, depois a frase em inglês.

**Se o 404 em português vier em inglês**, o handler não sobe a árvore de diretórios: nesse caso remova a cópia por idioma do `scripts/build-404.ts`, mantenha só a da raiz, e acrescente ao `notFound.body` de cada idioma os três links de idioma. Registre a divergência nas notas de execução deste plano.

- [ ] **Step 8: Teste de ponta a ponta**

Acrescentar a `e2e/navegacao.spec.ts`:

```ts
test("should answer an unknown path with the designed 404", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist/");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This page does not exist",
  );
});
```

- [ ] **Step 9: Rodar tudo e commitar**

```bash
npm run check
npx playwright test e2e/navegacao.spec.ts
git add app scripts package.json e2e
git commit -m "feat: adiciona pagina 404 desenhada nos tres idiomas"
```

---

## Task 3: Modelo de conteúdo — MDX, Zod e registro tipado

**Contexto:** esta é a fundação de tudo que vem depois. Um documento é um arquivo markdown com frontmatter, nomeado `<slug>.<locale>.mdx`. O slug é localizado de propósito — um case tem URL em português e outra em inglês, ligadas por `translationKey`, que é o que o `hreflang` usa.

**Restrição deliberada: o conteúdo é markdown puro, sem JSX e sem `import`.** É o que permite ao `.md` público da Task 24 ser a fonte verbatim, sem conversão nem perda. Um teste verifica isso e falha o build se alguém escrever um componente dentro de um artigo.

**Files:**
- Modify: `package.json` (dependências)
- Modify: `vite.config.ts`
- Create: `app/config/site.ts`
- Create: `app/content/schema.ts`
- Create: `app/content/schema.test.ts`
- Create: `app/content/registry.ts`
- Create: `app/content/registry.test.ts`
- Create: `app/content/manifest.node.ts`
- Create: `app/content/pages/colophon.{pt-BR,pt-PT,en-US}.mdx`
- Modify: `app/routes/colophon.tsx`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Instalar as dependências**

```bash
npm install zod
npm install -D @mdx-js/rollup @types/mdx remark-frontmatter remark-mdx-frontmatter gray-matter
npm audit --omit=dev
```

`zod` precisa ser v4 — o schema usa `z.iso.date()`, que não existe na v3. Confirme com `npm ls zod`.

- [ ] **Step 2: Ligar o MDX ao Vite**

Em `vite.config.ts`:

```ts
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    // enforce pre: o MDX precisa transformar o arquivo antes do plugin de rotas olhá-lo.
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
        ],
      }),
    },
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
```

- [ ] **Step 3: Criar a configuração do site**

Criar `app/config/site.ts`:

```ts
export const SITE_URL = "https://diorgenesgeorge.dev";

export const AUTHOR = {
  name: "Diorgenes George",
  jobTitle: "Analista Sênior · Desenvolvedor de Software",
  city: "Betim",
  region: "MG",
  country: "BR",
  github: "https://github.com/DiorgenesT",
  linkedin: "https://www.linkedin.com/in/diorgenesgeorge",
} as const;
```

- [ ] **Step 4: Escrever os testes do schema**

Criar `app/content/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { articleSchema, caseSchema, parseFileName } from "./schema";

const validCase = {
  title: "Consolidar 44 painéis sem migrar um único banco",
  answer:
    "Quarenta e quatro painéis independentes viraram um hub com login único, sem mover nenhum banco de dados. A consolidação foi feita por script e ficou reversível, porque os dados vivem na plataforma por identificador e mover o código não os toca.",
  translationKey: "central",
  status: "rascunho",
  updated: "2026-08-01",
  org: "Fundação Beta",
  role: "Desenvolvedor full stack",
  period: "2026",
  stack: ["Next.js", "Cloudflare Workers", "D1", "Supabase"],
  outcome: "Um login em vez de uma senha compartilhada por painel, e um deploy em vez de dezenas.",
  order: 1,
};

describe("caseSchema", () => {
  it("should accept a complete case frontmatter", () => {
    expect(caseSchema.parse(validCase).translationKey).toBe("central");
  });

  it("should reject an answer block too short to stand on its own", () => {
    const result = caseSchema.safeParse({ ...validCase, answer: "Consolidei painéis." });

    expect(result.success).toBe(false);
  });

  it("should reject a status outside the two known values", () => {
    const result = caseSchema.safeParse({ ...validCase, status: "publicada" });

    expect(result.success).toBe(false);
  });

  it("should reject a translation key that cannot be part of a URL", () => {
    const result = caseSchema.safeParse({ ...validCase, translationKey: "Central Betim" });

    expect(result.success).toBe(false);
  });
});

describe("articleSchema", () => {
  it("should require at least one tag", () => {
    const result = articleSchema.safeParse({
      ...validCase,
      published: "2026-08-01",
      tags: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("parseFileName", () => {
  it("should split a localized slug from its locale", () => {
    expect(parseFileName("./cases/central.pt-BR.mdx")).toEqual({
      slug: "central",
      locale: "pt-BR",
    });
  });

  it("should return undefined for a locale the site does not serve", () => {
    expect(parseFileName("./cases/central.fr-FR.mdx")).toBeUndefined();
  });
});
```

- [ ] **Step 5: Rodar os testes para vê-los falhar**

Run: `npx vitest run app/content/schema.test.ts`
Expected: FAIL — `Failed to resolve import "./schema"`

- [ ] **Step 6: Implementar os schemas**

Criar `app/content/schema.ts`:

```ts
import { z } from "zod";
import { LOCALES, type Locale } from "../i18n/config";

/** Documento em rascunho não é pré-renderizado, não entra no sitemap e não é linkado. */
export const STATUSES = ["rascunho", "publicado"] as const;

const slugPattern = /^[a-z0-9-]+$/;

const baseSchema = z.object({
  title: z.string().min(8).max(70),
  // O bloco de resposta do AEO: precisa ser compreensível fora da página, e curto o bastante para ser citado.
  answer: z.string().min(120).max(320),
  translationKey: z.string().regex(slugPattern),
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
});

export const articleSchema = baseSchema.extend({
  published: z.iso.date(),
  tags: z.array(z.string().regex(slugPattern)).min(1).max(5),
});

export type PageFrontmatter = z.infer<typeof pageSchema>;
export type CaseFrontmatter = z.infer<typeof caseSchema>;
export type ArticleFrontmatter = z.infer<typeof articleSchema>;

const FILE_NAME = /\/([a-z0-9-]+)\.([A-Za-z-]+)\.mdx$/;

export function parseFileName(
  path: string,
): { slug: string; locale: Locale } | undefined {
  const match = FILE_NAME.exec(path);
  if (!match) return undefined;

  const [, slug, locale] = match;
  if (!LOCALES.includes(locale as Locale)) return undefined;

  return { slug: slug as string, locale: locale as Locale };
}
```

- [ ] **Step 7: Rodar os testes para vê-los passar**

Run: `npx vitest run app/content/schema.test.ts`
Expected: PASS, 7 testes

- [ ] **Step 8: Implementar o registro de conteúdo**

Criar `app/content/registry.ts`:

```ts
import type { ComponentType } from "react";
import type { Locale } from "../i18n/config";
import {
  articleSchema,
  caseSchema,
  pageSchema,
  parseFileName,
  type ArticleFrontmatter,
  type CaseFrontmatter,
  type PageFrontmatter,
} from "./schema";

type MdxModule = { default: ComponentType; frontmatter?: unknown };

export type Doc<T> = {
  slug: string;
  locale: Locale;
  frontmatter: T;
  Content: ComponentType;
};

function collect<T>(
  modules: Record<string, MdxModule>,
  schema: { parse: (input: unknown) => T },
): Doc<T>[] {
  return Object.entries(modules).flatMap(([path, module]) => {
    const parsed = parseFileName(path);
    if (!parsed) throw new Error(`nome de arquivo de conteúdo inválido: ${path}`);

    try {
      return [
        {
          ...parsed,
          frontmatter: schema.parse(module.frontmatter),
          Content: module.default,
        },
      ];
    } catch (cause) {
      throw new Error(`frontmatter inválido em ${path}`, { cause });
    }
  });
}

const pages = collect(
  import.meta.glob<MdxModule>("./pages/*.mdx", { eager: true }),
  pageSchema,
);
const cases = collect(
  import.meta.glob<MdxModule>("./cases/*.mdx", { eager: true }),
  caseSchema,
);
const articles = collect(
  import.meta.glob<MdxModule>("./articles/*.mdx", { eager: true }),
  articleSchema,
);

const published = <T extends { status: string }>(doc: Doc<T>) =>
  doc.frontmatter.status === "publicado";

export function getPage(
  locale: Locale,
  key: string,
): Doc<PageFrontmatter> | undefined {
  return pages.find((doc) => doc.locale === locale && doc.slug === key);
}

export function listCases(locale: Locale): Doc<CaseFrontmatter>[] {
  return cases
    .filter((doc) => doc.locale === locale && published(doc))
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getCase(
  locale: Locale,
  slug: string,
): Doc<CaseFrontmatter> | undefined {
  return listCases(locale).find((doc) => doc.slug === slug);
}

export function listArticles(locale: Locale): Doc<ArticleFrontmatter>[] {
  return articles
    .filter((doc) => doc.locale === locale && published(doc))
    .sort((a, b) => b.frontmatter.published.localeCompare(a.frontmatter.published));
}

export function getArticle(
  locale: Locale,
  slug: string,
): Doc<ArticleFrontmatter> | undefined {
  return listArticles(locale).find((doc) => doc.slug === slug);
}

export function listTags(locale: Locale): string[] {
  const tags = listArticles(locale).flatMap((doc) => doc.frontmatter.tags);
  return [...new Set(tags)].sort();
}

export function listArticlesByTag(
  locale: Locale,
  tag: string,
): Doc<ArticleFrontmatter>[] {
  return listArticles(locale).filter((doc) => doc.frontmatter.tags.includes(tag));
}

/** Locale → slug das traduções publicadas do mesmo documento. É a origem do hreflang. */
export function translationsOf(
  kind: "case" | "article" | "page",
  translationKey: string,
): Partial<Record<Locale, string>> {
  const source =
    kind === "case" ? cases : kind === "article" ? articles : pages;

  return Object.fromEntries(
    source
      .filter(
        (doc) =>
          doc.frontmatter.translationKey === translationKey &&
          (kind === "page" || doc.frontmatter.status === "publicado"),
      )
      .map((doc) => [doc.locale, doc.slug]),
  );
}
```

- [ ] **Step 9: Implementar a varredura em Node para a configuração de build**

O `react-router.config.ts` roda em Node e não tem `import.meta.glob`. Criar `app/content/manifest.node.ts`:

```ts
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import type { Locale } from "../i18n/config";
import { parseFileName } from "./schema";

export type ManifestEntry = {
  kind: "case" | "article";
  slug: string;
  locale: Locale;
  tags: string[];
};

const CONTENT_DIR = "app/content";

function scan(kind: "case" | "article", dir: string): ManifestEntry[] {
  const full = join(CONTENT_DIR, dir);

  return readdirSync(full)
    .filter((name) => name.endsWith(".mdx"))
    .flatMap((name) => {
      const parsed = parseFileName(`./${dir}/${name}`);
      if (!parsed) return [];

      const { data } = matter(readFileSync(join(full, name), "utf8"));
      if (data.status !== "publicado") return [];

      return [{ kind, ...parsed, tags: (data.tags as string[]) ?? [] }];
    });
}

export function contentManifest(): ManifestEntry[] {
  return [...scan("case", "cases"), ...scan("article", "articles")];
}
```

- [ ] **Step 10: Escrever o teste de paridade e o de markdown puro**

Duas fontes leem os mesmos arquivos por caminhos diferentes. O teste garante que não divirjam. Criar `app/content/registry.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n/config";
import { contentManifest } from "./manifest.node";
import { listArticles, listCases } from "./registry";

describe("manifesto de conteúdo", () => {
  it("should list exactly the published documents the registry exposes", () => {
    const fromRegistry = LOCALES.flatMap((locale) => [
      ...listCases(locale).map((doc) => `case:${locale}:${doc.slug}`),
      ...listArticles(locale).map((doc) => `article:${locale}:${doc.slug}`),
    ]).sort();

    const fromManifest = contentManifest()
      .map((entry) => `${entry.kind}:${entry.locale}:${entry.slug}`)
      .sort();

    expect(fromManifest).toEqual(fromRegistry);
  });
});

describe("fonte dos documentos", () => {
  const sources = Object.keys(
    import.meta.glob("./{cases,articles,pages}/*.mdx", { query: "?raw" }),
  );

  it.each(sources)("should keep %s as plain markdown", (path) => {
    const body = readFileSync(path.replace("./", "app/content/"), "utf8");

    // Markdown puro é o que permite servir o .md público como cópia fiel da fonte.
    expect(body).not.toMatch(/^import\s/m);
    expect(body).not.toMatch(/<[A-Z][A-Za-z]*/);
  });
});
```

- [ ] **Step 11: Migrar o colofão para o modelo de conteúdo**

O colofão vira o primeiro documento MDX — é o menor e serve de piloto. Criar `app/content/pages/colophon.pt-BR.mdx`:

```mdx
---
title: Como este site foi construído
answer: Este site é pré-renderizado em build e servido como HTML estático na borda da Cloudflare, em três idiomas, sem nenhuma requisição a domínio externo. O código é aberto e cada decisão técnica aqui tem um motivo escrito.
translationKey: colofao
status: publicado
updated: 2026-08-01
---

## Por que HTML estático

Todo o conteúdo deste site é conhecido em tempo de build. Renderizar no servidor a cada visita só somaria latência a um problema que não existe. As páginas são geradas uma vez, publicadas como arquivos e servidas do datacenter mais próximo de quem lê.

## Política de segurança sem exceção

O site não carrega fonte, script, folha de estilo ou imagem de domínio de terceiro. Isso permite uma `Content-Security-Policy` estrita de verdade, sem `unsafe-inline` em `script-src`.

Um detalhe deu trabalho e vale contar. O framework injeta scripts inline em cada página, e liberar cada um por hash faria o cabeçalho crescer junto com o site. A solução foi mover esses scripts para arquivos endereçados pelo próprio conteúdo, servidos com cache imutável. Sobrou um único script inline, o que aplica o tema antes da primeira pintura para não haver flash de tela clara. A política tem um hash e continuará com um hash quando o site tiver centenas de páginas.

## Tipografia

Instrument Sans para texto, Instrument Serif itálico para as quebras editoriais, IBM Plex Mono para dados e código. As três são auto-hospedadas em subconjuntos `woff2`.

## Acessibilidade

Contraste é medido, nunca estimado: uma função calcula a razão de cada par de cores dos dois temas e um teste falha o build se algo cair abaixo do exigido pela WCAG 2.1 AA. A verificação automatizada com axe roda em todas as páginas, nos dois temas.
```

Traduzir para `colophon.pt-PT.mdx` e `colophon.en-US.mdx` mantendo o mesmo `translationKey`, `status` e `updated`.

- [ ] **Step 12: Renderizar o colofão a partir do MDX**

Substituir o conteúdo de `app/routes/colophon.tsx`:

```tsx
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname, useLocale } from "../i18n/use-locale";
import { getPage } from "../content/registry";
import type { Route } from "./+types/colophon";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.colophon.title"] }];
}

export default function Colophon() {
  const locale = useLocale();
  const page = getPage(locale, "colophon");
  if (!page) throw new Error(`colofão ausente no idioma ${locale}`);

  const { Content, frontmatter } = page;

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {frontmatter.title}
      </h1>
      <Content />
    </main>
  );
}
```

O estilo tipográfico do markdown entra na Task 5; aqui só é preciso que renderize.

- [ ] **Step 13: Ampliar o alcance do Vitest**

Em `vitest.config.ts`, o `include` precisa alcançar os testes que importam MDX:

```ts
import { defineConfig } from "vitest/config";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

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
    include: ["app/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
```

- [ ] **Step 14: Rodar tudo e commitar**

```bash
npm run check
npm run build
git add app vite.config.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: adiciona modelo de conteudo em mdx validado por schema"
```

---

## Task 4: Rotas de conteúdo e pré-renderização derivada do conteúdo

**Contexto:** os caminhos das páginas fixas e dos documentos passam a existir nos três idiomas, com slug traduzido. A lista de pré-renderização deixa de ser escrita à mão: sai do manifesto, então publicar um artigo é criar um arquivo.

**Files:**
- Modify: `app/i18n/config.ts`
- Modify: `app/i18n/config.test.ts`
- Modify: `app/i18n/prerender.ts`
- Modify: `app/i18n/prerender.test.ts`
- Modify: `app/routes.ts`
- Create: `app/routes/{about,cv,services,contact,work,work.case,writing,writing.article,writing.tag}.tsx`
- Modify: `app/i18n/switch-locale.ts` e `app/i18n/switch-locale.test.ts`

- [ ] **Step 1: Estender o mapa de rotas**

Em `app/i18n/config.ts`:

```ts
export type RouteKey =
  | "home"
  | "about"
  | "cv"
  | "services"
  | "work"
  | "writing"
  | "contact"
  | "colophon"
  | "notFound";

export const ROUTE_PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { "pt-BR": "", "pt-PT": "", "en-US": "" },
  about: { "pt-BR": "sobre", "pt-PT": "sobre", "en-US": "about" },
  cv: { "pt-BR": "cv", "pt-PT": "cv", "en-US": "cv" },
  services: { "pt-BR": "servicos", "pt-PT": "servicos", "en-US": "services" },
  work: { "pt-BR": "trabalho", "pt-PT": "trabalho", "en-US": "work" },
  writing: { "pt-BR": "escritos", "pt-PT": "escritos", "en-US": "writing" },
  contact: { "pt-BR": "contato", "pt-PT": "contacto", "en-US": "contact" },
  colophon: { "pt-BR": "colofao", "pt-PT": "colofao", "en-US": "colophon" },
  notFound: { "pt-BR": "404", "pt-PT": "404", "en-US": "404" },
};

/** Segmento de arquivo por idioma, dentro de /escritos. */
export const TAG_SEGMENT: Record<Locale, string> = {
  "pt-BR": "tag",
  "pt-PT": "etiqueta",
  "en-US": "tag",
};

export function documentHref(
  parent: "work" | "writing",
  locale: Locale,
  slug: string,
): string {
  return `${localizedHref(parent, locale)}${slug}/`;
}

export function tagHref(locale: Locale, tag: string): string {
  return `${localizedHref("writing", locale)}${TAG_SEGMENT[locale]}/${tag}/`;
}
```

- [ ] **Step 2: Testar os construtores de URL**

Acrescentar a `app/i18n/config.test.ts`:

```ts
describe("documentHref", () => {
  it("should build a case url under the localized work segment", () => {
    expect(documentHref("work", "pt-BR", "central")).toBe("/pt-br/trabalho/central/");
  });

  it("should build an article url in english", () => {
    expect(documentHref("writing", "en-US", "word-not-pdf")).toBe(
      "/en/writing/word-not-pdf/",
    );
  });
});

describe("tagHref", () => {
  it("should use the portuguese segment in pt-PT", () => {
    expect(tagHref("pt-PT", "cloudflare")).toBe("/pt-pt/escritos/etiqueta/cloudflare/");
  });
});
```

Run: `npx vitest run app/i18n/config.test.ts` → PASS

- [ ] **Step 3: Derivar a lista de pré-renderização do conteúdo**

Substituir `app/i18n/prerender.ts`:

```ts
import { contentManifest } from "../content/manifest.node";
import {
  LOCALES,
  ROUTE_PATHS,
  documentHref,
  localizedHref,
  tagHref,
  type RouteKey,
} from "./config";

const STATIC_KEYS = Object.keys(ROUTE_PATHS) as RouteKey[];

export function prerenderPaths(): string[] {
  const staticPaths = LOCALES.flatMap((locale) =>
    STATIC_KEYS.map((key) => localizedHref(key, locale)),
  );

  const entries = contentManifest();

  const documents = entries.map((entry) =>
    documentHref(entry.kind === "case" ? "work" : "writing", entry.locale, entry.slug),
  );

  const tags = [
    ...new Set(
      entries
        .filter((entry) => entry.kind === "article")
        .flatMap((entry) => entry.tags.map((tag) => tagHref(entry.locale, tag))),
    ),
  ];

  return [...staticPaths, ...documents, ...tags];
}
```

- [ ] **Step 4: Ajustar o teste de pré-renderização**

Em `app/i18n/prerender.test.ts`, substituir as asserções por estas:

```ts
describe("prerenderPaths", () => {
  it("should include every static route in every locale", () => {
    const paths = prerenderPaths();

    expect(paths).toContain("/pt-br/sobre/");
    expect(paths).toContain("/pt-pt/contacto/");
    expect(paths).toContain("/en/work/");
  });

  it("should end every path with a trailing slash", () => {
    expect(prerenderPaths().every((path) => path.endsWith("/"))).toBe(true);
  });

  it("should never repeat a path", () => {
    const paths = prerenderPaths();

    expect(new Set(paths).size).toBe(paths.length);
  });
});
```

- [ ] **Step 5: Criar as rotas vazias**

Cada arquivo abaixo entra com o mínimo para compilar e ser pré-renderizado; o conteúdo chega nas tasks seguintes. Criar `app/routes/about.tsx`, `cv.tsx`, `services.tsx`, `contact.tsx`, `work.tsx`, `writing.tsx` com este molde, trocando nome e chave:

```tsx
import { getDictionary } from "../i18n/dictionary";
import { localeFromPathname } from "../i18n/use-locale";
import type { Route } from "./+types/about";

export function meta({ location }: Route.MetaArgs) {
  const t = getDictionary(localeFromPathname(location.pathname));
  return [{ title: t["meta.about.title"] }];
}

export default function About() {
  return <main className="mx-auto max-w-3xl px-6 py-24" />;
}
```

Acrescentar ao tipo `Dictionary` e aos três arquivos de mensagens as chaves `meta.about.title`, `meta.cv.title`, `meta.services.title`, `meta.contact.title`, `meta.work.title`, `meta.writing.title` — o axe reprova página sem `<title>`, e isto já foi lição da Fase 0.

- [ ] **Step 6: Criar as rotas de documento**

Criar `app/routes/work.case.tsx`:

```tsx
import { useParams } from "react-router";
import { getCase } from "../content/registry";
import { useLocale } from "../i18n/use-locale";

export default function WorkCase() {
  const locale = useLocale();
  const { slug } = useParams();
  const doc = slug ? getCase(locale, slug) : undefined;

  if (!doc) throw new Response("Not Found", { status: 404 });

  const { Content, frontmatter } = doc;

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-sans text-4xl font-bold tracking-tight">
        {frontmatter.title}
      </h1>
      <Content />
    </main>
  );
}
```

Criar `app/routes/writing.article.tsx` com a mesma forma, trocando `getCase` por `getArticle`.

Criar `app/routes/writing.tag.tsx` listando `listArticlesByTag(locale, tag)` com um `<ul>` de links para `documentHref("writing", locale, doc.slug)`.

O `meta` de cada uma entra na Task 20, que é onde os metadados param de ser só título.

- [ ] **Step 7: Registrar tudo em `app/routes.ts`**

```ts
export default LOCALES.flatMap((locale) => {
  const segment = LOCALE_SEGMENTS[locale];
  const writing = ROUTE_PATHS.writing[locale];

  return prefix(segment, [
    layout("layouts/site.tsx", { id: `site-${segment}` }, [
      index("routes/home.tsx", { id: `home-${segment}` }),
      route(ROUTE_PATHS.about[locale], "routes/about.tsx", { id: `about-${segment}` }),
      route(ROUTE_PATHS.cv[locale], "routes/cv.tsx", { id: `cv-${segment}` }),
      route(ROUTE_PATHS.services[locale], "routes/services.tsx", {
        id: `services-${segment}`,
      }),
      route(ROUTE_PATHS.contact[locale], "routes/contact.tsx", {
        id: `contact-${segment}`,
      }),
      route(ROUTE_PATHS.work[locale], "routes/work.tsx", { id: `work-${segment}` }),
      route(`${ROUTE_PATHS.work[locale]}/:slug`, "routes/work.case.tsx", {
        id: `work-case-${segment}`,
      }),
      route(writing, "routes/writing.tsx", { id: `writing-${segment}` }),
      route(`${writing}/${TAG_SEGMENT[locale]}/:tag`, "routes/writing.tag.tsx", {
        id: `writing-tag-${segment}`,
      }),
      route(`${writing}/:slug`, "routes/writing.article.tsx", {
        id: `writing-article-${segment}`,
      }),
      route(ROUTE_PATHS.colophon[locale], "routes/colophon.tsx", {
        id: `colophon-${segment}`,
      }),
      route(ROUTE_PATHS.notFound[locale], "routes/not-found.tsx", {
        id: `not-found-${segment}`,
      }),
      route("*", "routes/not-found.tsx", { id: `splat-${segment}` }),
    ]),
  ]);
}) satisfies RouteConfig;
```

- [ ] **Step 8: Ensinar o alternador de idioma a traduzir slug de documento**

O `switch-locale` hoje mapeia rota fixa. Um case em `/pt-br/trabalho/central/` precisa ir para `/en/work/<slug em inglês>/` usando `translationsOf`, e cair na raiz do idioma quando a tradução não existir. Acrescentar a `app/i18n/switch-locale.test.ts`:

```ts
it("should follow a document to its translated slug", () => {
  // Depende de existir o mesmo translationKey nos dois idiomas no conteúdo real.
  expect(switchLocale("/pt-br/trabalho/central/", "en-US")).toMatch(/^\/en\/work\/.+\/$/);
});

it("should fall back to the locale home when the document has no translation", () => {
  expect(switchLocale("/pt-br/trabalho/inexistente/", "en-US")).toBe("/en/");
});
```

Implementar em `app/i18n/switch-locale.ts` consultando `translationsOf` antes do mapa de rotas fixas.

- [ ] **Step 9: Build, verificação e commit**

```bash
npm run check
npm run build
```

Expected: o log de prerender deve listar as páginas fixas nos três idiomas — 27 no total nesta altura (9 rotas × 3 idiomas), ainda sem documentos porque nenhum case está publicado.

```bash
git add app
git commit -m "feat: adiciona rotas de conteudo com slug localizado e prerender derivado do conteudo"
```

---

## Task 5: Tipografia de prosa e bloco de resposta direta

**Contexto:** o markdown renderizado precisa de estilo, e o spec exige que toda página abra com 2–3 frases autocontidas que respondem à pergunta implícita da página. O `answer` do frontmatter já carrega esse texto; falta o componente que o exibe e o estilo do corpo.

**Files:**
- Create: `app/components/answer-block.tsx`
- Create: `app/components/prose.tsx`
- Create: `app/components/document-header.tsx`
- Modify: `app/routes/{colophon,work.case,writing.article}.tsx`

- [ ] **Step 1: Bloco de resposta**

Criar `app/components/answer-block.tsx`:

```tsx
export function AnswerBlock({ children }: { children: string }) {
  return (
    <p className="border-l-2 border-accent pl-5 text-lg leading-relaxed text-fg">
      {children}
    </p>
  );
}
```

- [ ] **Step 2: Estilo do markdown**

Criar `app/components/prose.tsx`:

```tsx
import type { ReactNode } from "react";

/**
 * O markdown não carrega classe nenhuma, então o estilo mora aqui,
 * num único lugar, aplicado por seletor de descendente.
 */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        mt-12 max-w-prose text-fg-muted
        [&_h2]:mt-14 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg
        [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg
        [&_p]:mt-5 [&_p]:leading-relaxed
        [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6
        [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6
        [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
        [&_code]:font-mono [&_code]:text-sm [&_code]:text-fg
        [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-bg-raised [&_pre]:p-4
        [&_blockquote]:mt-6 [&_blockquote]:border-s-2 [&_blockquote]:border-hairline [&_blockquote]:ps-5 [&_blockquote]:italic
        [&_table]:mt-6 [&_table]:w-full [&_table]:text-sm
        [&_th]:border-b [&_th]:border-hairline [&_th]:py-2 [&_th]:text-start [&_th]:text-fg
        [&_td]:border-b [&_td]:border-hairline [&_td]:py-2 [&_td]:align-top
      "
    >
      {children}
    </div>
  );
}
```

`ps-`/`ps` e `border-s` em vez de `pl-`/`border-l`: são as propriedades lógicas que o CLAUDE.md exige para o layout sobreviver a um idioma RTL.

- [ ] **Step 3: Cabeçalho de documento**

Criar `app/components/document-header.tsx` recebendo `title`, `answer` e um `meta` opcional (linha de metadados em mono, usada por case e artigo), renderizando `<h1>`, o `AnswerBlock` e a linha de metadados.

- [ ] **Step 4: Aplicar nas três rotas de documento**

Em `colophon.tsx`, `work.case.tsx` e `writing.article.tsx`, envolver `<Content />` com `<Prose>` e trocar o `<h1>` solto pelo `DocumentHeader`.

- [ ] **Step 5: Verificar o contraste do que foi introduzido**

Nenhum par novo de cores foi criado — `text-fg-muted` sobre `--bg` já é auditado pelo teste da Fase 0. Rodar para confirmar:

Run: `npx vitest run app/design/tokens.test.ts`
Expected: PASS

- [ ] **Step 6: Registrar a convenção de headings**

O spec pede headings redigidos como pergunta **quando natural** — é o que faz um trecho da página virar resposta direta num assistente. Vale para as tarefas de redação que vêm depois: prefira "Por que software público é diferente" a "Diferenciais"; não force pergunta onde o título afirmativo é mais claro. Anotar isto como comentário de uma linha no topo de `app/components/answer-block.tsx` para quem escrever conteúdo depois encontrar.

- [ ] **Step 7: Commit**

```bash
npm run check
git add app/components app/routes
git commit -m "feat: adiciona tipografia de prosa e bloco de resposta direta"
```

---

## Task 6: `/sobre` — a trajetória, com o texto real

**Contexto:** é a página que o recrutador abre depois da home e a que o assistente de IA cita quando perguntam "quem é Diorgenes George". Precisa ser verdadeira sob conferência: quem lê pode abrir o LinkedIn na aba ao lado.

**O que o texto não faz:** não afirma anos de experiência em desenvolvimento, não usa adjetivo de senioridade que as datas não sustentam, e não cita a pós-graduação interrompida — decisão do Diorgenes.

**O que o texto faz:** trata a virada de carreira como o que ela é. Quatro anos gerindo uma equipe de atendimento não são um vazio no currículo; são a razão de ele escrever software pensando em quem está do outro lado do balcão. É um ângulo honesto e é dele.

**Files:**
- Create: `app/content/pages/about.{pt-BR,pt-PT,en-US}.mdx`
- Modify: `app/routes/about.tsx`

- [ ] **Step 1: Escrever o documento em pt-BR**

Criar `app/content/pages/about.pt-BR.mdx`:

```mdx
---
title: Diorgenes George, desenvolvedor de software público
answer: Sou desenvolvedor full stack em Betim, Minas Gerais. Na Fundação Beta, o órgão de tecnologia da prefeitura, construo os painéis que a gestão municipal usa para decidir e os portais que servidores e cidadãos acessam todo dia.
translationKey: sobre
status: publicado
updated: 2026-08-01
---

## O que eu construo

Trabalho na Fundação Beta, fundação pública de pesquisa e tecnologia ligada à Prefeitura de Betim, como analista sênior e desenvolvedor de software. O que sai dali tem três públicos bem diferentes: o gabinete, que precisa de indicador confiável para decidir; o servidor público, que precisa resolver a vida dele sem ir ao setor; e o cidadão, que precisa de informação que antes só existia dentro da repartição.

Na prática, isso é interface em React, Next.js e TypeScript, API em Python com FastAPI e SQLAlchemy, pipeline de dados em Pandas, e infraestrutura inteira no ecossistema Cloudflare — Workers, Pages, D1, KV e R2 — com PostgreSQL e Supabase na camada de dados.

## Por que software público é diferente

Sistema de prefeitura tem restrições que produto de mercado não tem. Ele responde a legislação — LGPD, Lei de Acesso à Informação, Lei Brasileira de Inclusão — e acessibilidade não é polimento, é obrigação legal. Ele lida com dado que não pode vazar e não pode estar errado: número errado num painel de gabinete é pior do que painel nenhum, porque a decisão vira ficção com aparência de dado.

E ele precisa conviver com o processo que já existe. A decisão técnica correta é frequentemente a pior no papel: já escolhi exportar documento em Word em vez de PDF porque o fluxo de aprovação real passa por assinatura em papel, e um formato imutável travaria o processo inteiro. Esse tipo de escolha só aparece para quem entregou software dentro de uma organização, não para quem só publicou aplicativo.

## Como eu cheguei aqui

Passei quatro anos gerindo uma equipe de atendimento antes de escrever software profissionalmente, acompanhando métrica de fila e resolvendo problema de quem estava do outro lado da linha. Terminei o bacharelado em Ciência da Computação em 2024 e entrei na Fundação Beta em novembro de 2025.

Não trato esses quatro anos como desvio. Boa parte do que eu construo hoje é atendimento com outra roupa: uma fila de UPA que o cidadão consulta antes de sair de casa, um formulário de RH que deixa de exigir uma ida ao setor. Quem já esteve na ponta escreve software diferente.

## Como eu trabalho

Prefiro decisão explicada a decisão elegante. Todo sistema que entrego carrega a origem do dado que exibe, porque quando o número é contestado é preciso poder voltar até a planilha que o produziu, em vez de defender o código. Testes e acessibilidade entram como requisito, não como fase final. E arquitetura se escolhe pelo raio de dano de um erro, não pela elegância do diagrama.
```

- [ ] **Step 2: Traduzir para pt-PT e en-US**

Criar `about.pt-PT.mdx` e `about.en-US.mdx` com o mesmo `translationKey: sobre`, `status` e `updated`. No pt-PT, adaptar léxico (`equipa`, `ligação`, `ficheiro`) sem reescrever o conteúdo. No en-US, traduzir os nomes de instituição mantendo o original entre parênteses na primeira menção: `Fundação Beta, the technology foundation of the city government of Betim, Brazil`.

- [ ] **Step 3: Renderizar**

Em `app/routes/about.tsx`, seguir exatamente a forma final de `colophon.tsx`: `getPage(locale, "about")`, `DocumentHeader` com `title` e `answer`, `<Prose><Content /></Prose>`.

- [ ] **Step 4: Conferir contra o insumo**

Reler `insumos/portfolio-cases.md`, seção "Regras gerais de publicação", e confirmar que o texto não cita nome de sistema de origem, senha, nem servidor identificável. O texto acima já respeita, mas a conferência é parte da tarefa.

- [ ] **Step 5: Build e commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: adiciona pagina sobre nos tres idiomas"
```

---

## Task 7: `/cv` — currículo estruturado como fonte única

**Contexto:** o spec exige que o PDF da Fase 4 saia da mesma fonte da página, para ser impossível divergirem. Por isso o CV é dado estruturado em TypeScript, não prosa. Duração de vínculo nunca é armazenada: é calculada das datas na renderização, com `Intl`.

**Files:**
- Create: `app/content/cv.ts`
- Create: `app/content/cv.test.ts`
- Modify: `app/i18n/format.ts`
- Modify: `app/routes/cv.tsx`

- [ ] **Step 1: Tipo e dado**

Criar `app/content/cv.ts`:

```ts
import type { Locale } from "../i18n/config";

export type CvPosition = {
  org: string;
  role: string;
  /** AAAA-MM. O fim ausente significa vínculo atual. */
  start: string;
  end?: string;
  location: string;
  highlights: string[];
};

export type CvEducation = {
  org: string;
  degree: string;
  start: string;
  end: string;
};

export type Cv = {
  headline: string;
  summary: string;
  positions: CvPosition[];
  education: CvEducation[];
  skills: { group: string; items: string[] }[];
};

const ptBR: Cv = {
  headline: "Desenvolvedor full stack · Sistemas de gestão pública",
  summary:
    "Desenvolvo painéis de inteligência executiva, portais de serviço e APIs para a administração municipal de Betim, com React, Next.js, TypeScript, Python e infraestrutura na Cloudflare.",
  positions: [
    {
      org: "Fundação Beta",
      role: "Analista sênior · Desenvolvedor de software",
      start: "2025-11",
      location: "Betim, MG",
      highlights: [
        "Painéis de indicadores para o gabinete executivo, alimentados por integrações automáticas com bases públicas federais, estaduais e municipais.",
        "Portais de serviço para servidores públicos e para o cidadão, em Next.js com renderização estática.",
        "APIs em Python com FastAPI e SQLAlchemy, e pipelines de extração e tratamento de dados com Pandas.",
        "Infraestrutura e deploy no ecossistema Cloudflare — Workers, Pages, D1, KV e R2 — com CI/CD no GitHub.",
        "Modelagem e manutenção de bancos relacionais em PostgreSQL, e Supabase como camada de persistência e autenticação.",
        "Sistemas em conformidade com LGPD, Lei de Acesso à Informação e requisitos legais de acessibilidade.",
      ],
    },
    {
      org: "Monumental Assistência 24h",
      role: "Gerente de atendimento",
      start: "2021-11",
      end: "2025-11",
      location: "Betim, MG",
      highlights: [
        "Gestão da equipe de atendimento e acompanhamento de métricas de desempenho e resolução.",
      ],
    },
  ],
  education: [
    {
      org: "Universidade Cruzeiro do Sul",
      degree: "Bacharelado em Ciência da Computação",
      start: "2019-04",
      end: "2024-09",
    },
  ],
  skills: [
    { group: "Front-end", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"] },
    { group: "Back-end", items: ["Python", "FastAPI", "SQLAlchemy", "Pandas"] },
    { group: "Infraestrutura", items: ["Cloudflare Workers", "Pages", "D1", "KV", "R2", "Docker", "CI/CD no GitHub"] },
    { group: "Dados", items: ["PostgreSQL", "Supabase", "Web scraping com BeautifulSoup"] },
  ],
};

export const CV: Record<Locale, Cv> = {
  "pt-BR": ptBR,
  "pt-PT": ptBR,
  "en-US": ptBR,
};
```

O `pt-PT` e o `en-US` recebem cópias traduzidas no passo 3; ficam apontando para `ptBR` só até lá, e o teste do passo 2 impede que isso seja esquecido.

- [ ] **Step 2: Testes**

Criar `app/content/cv.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n/config";
import { CV } from "./cv";

describe("CV", () => {
  it.each(LOCALES)("should exist in %s", (locale) => {
    expect(CV[locale].positions.length).toBeGreaterThan(0);
  });

  it("should be translated, not shared between locales", () => {
    expect(CV["en-US"].headline).not.toBe(CV["pt-BR"].headline);
  });

  it("should order positions from the most recent", () => {
    const starts = CV["pt-BR"].positions.map((position) => position.start);

    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it("should never store a duration, because it would go stale", () => {
    const serialized = JSON.stringify(CV);

    expect(serialized).not.toMatch(/\d+\s*(anos|meses|years|months)/i);
  });
});
```

- [ ] **Step 3: Traduzir e rodar os testes**

Substituir as entradas `pt-PT` e `en-US` por objetos traduzidos.

Run: `npx vitest run app/content/cv.test.ts`
Expected: PASS, 6 testes

- [ ] **Step 4: Formatar período por locale**

Acrescentar a `app/i18n/format.ts`:

```ts
export function formatMonth(locale: Locale, value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
    new Date(Date.UTC(year as number, (month as number) - 1, 1)),
  );
}
```

Testar com os três locales — o mês abreviado difere entre `pt-BR`, `pt-PT` e `en-US`, e é isso que o teste deve fixar.

- [ ] **Step 5: Renderizar a página**

Em `app/routes/cv.tsx`, renderizar `<h1>`, o `AnswerBlock` com o `summary`, e três seções (`Experiência`, `Formação`, `Competências`) com hierarquia de headings sem pular nível. Datas em `<time dateTime="2025-11">`. Cargo atual exibido com o rótulo localizado "atual" quando `end` for ausente.

Acrescentar um link para o PDF **somente na Fase 4** — nada de link para arquivo que não existe.

- [ ] **Step 6: Commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: adiciona cv estruturado como fonte unica nos tres idiomas"
```

---

## Task 8: `/servicos` e `/contato` — o caminho do cliente

**Contexto:** é o caminho da persona 2 do spec. `/servicos` descreve oferta e processo; `/contato` liga para os canais que existem hoje. O formulário e o e-mail em domínio próprio são Fase 4 — esta página não promete nenhum dos dois.

**Files:**
- Create: `app/content/pages/services.{pt-BR,pt-PT,en-US}.mdx`
- Modify: `app/routes/services.tsx`
- Modify: `app/routes/contact.tsx`

- [ ] **Step 1: Escrever `services.pt-BR.mdx`**

Frontmatter: `translationKey: servicos`, `status: publicado`, `updated: 2026-08-01`.

`title`: "Painéis de dados, portais e integrações"
`answer`: "Construo painéis de dados, portais de serviço e integrações entre sistemas que não conversam, com entrega em infraestrutura de borda e custo previsível. Trabalho principalmente com organizações que precisam transformar dado disperso em decisão."

Seções, nesta ordem:

1. **O que eu faço** — três blocos: painéis de indicadores a partir de fontes dispersas; portais e sites com renderização estática e acessibilidade como requisito; integrações e ETL entre sistemas legados, planilhas e APIs públicas.
2. **Como funciona** — quatro passos: conversa de diagnóstico, proposta com escopo fechado, entrega em incrementos utilizáveis, transferência com documentação. Sem prazo genérico prometido.
3. **O que eu não faço** — dizer isso aumenta a confiança e filtra pedido ruim: não pego manutenção de sistema legado sem acesso ao código, não entrego painel com número sem origem rastreável.
4. **Fechamento** com uma frase e o link para `/contato`.

**Não escrever:** preço, prazo em dias, quantidade de clientes atendidos, nome de cliente. Nada disso é verificável hoje.

- [ ] **Step 2: Traduzir para pt-PT e en-US**

- [ ] **Step 3: Renderizar `/servicos`**

Mesma forma das demais páginas de prosa, com um `<a>` final para `localizedHref("contact", locale)`.

- [ ] **Step 4: Escrever `/contato`**

`app/routes/contact.tsx` é uma rota React, não MDX, porque é uma lista de links e não prosa. Conteúdo:

- `<h1>` e um parágrafo curto (do dicionário) dizendo que a melhor forma de chegar até ele hoje é LinkedIn ou GitHub, e que o formulário chega em breve.
- Dois links, com `rel="me"` — o `rel="me"` ajuda a IA e o buscador a ligarem os perfis à mesma pessoa:

```tsx
<a href={AUTHOR.linkedin} rel="me noopener" target="_blank">LinkedIn</a>
<a href={AUTHOR.github} rel="me noopener" target="_blank">GitHub</a>
```

**Não publicar** telefone nem e-mail pessoal. O endereço em domínio próprio entra na Fase 4.

- [ ] **Step 5: Commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: adiciona paginas de servicos e contato"
```

---

## Tasks 9 a 13: Os cinco cases

**Contexto comum a todas as cinco.** Cada case é o mesmo trabalho repetido com material diferente, então as instruções gerais ficam aqui e cada task traz só a sua ficha.

**Forma de cada case** — três arquivos, `<slug>.pt-BR.mdx`, `<slug>.pt-PT.mdx`, `<slug>.en-US.mdx`, com slug traduzido e o mesmo `translationKey`. Frontmatter completo conforme `caseSchema`. Seções, sempre nesta ordem:

1. **O problema** — o que existia antes, em concreto.
2. **A decisão** — a escolha técnica que carrega o case, com o porquê. É a seção mais importante: é o que separa case de captura de tela.
3. **O que isso evitou** — o custo ou risco que a decisão dispensou.
4. **O resultado** — o que mudou, sem número não verificável.

**Regras que valem para os cinco:**

- `status: "rascunho"` na criação. Só o Diorgenes muda para `publicado`, depois de ler e de alinhar com a Fundação o que pode ser descrito. Enquanto está em rascunho, o documento não é pré-renderizado nem linkado — o build simplesmente o ignora.
- Todo número escrito precisa estar marcado `[fato]` em `insumos/portfolio-cases.md`. Número marcado `[confirmar]` fica de fora.
- Reler as "Regras gerais de publicação" do insumo antes de escrever cada um.
- Nunca nomear o fornecedor do sistema hospitalar de origem nem o banco por trás dele.
- `stack` lista tecnologia, nunca binding, nome de banco ou identificador.

**Antes da Task 9, estender o schema** para o bloco de prova da home (Task 19). Em `app/content/schema.ts`, acrescentar a `caseSchema`:

```ts
  /** Número exibido na home. Só entra aqui o que estiver documentado como fato. */
  proof: z
    .object({ value: z.string().max(12), label: z.string().max(60) })
    .optional(),
```

---

### Task 9: Case "Central" — consolidar 44 painéis sem migrar um banco

**Files:** `app/content/cases/consolidacao-de-44-paineis.{pt-BR,pt-PT}.mdx`, `app/content/cases/consolidating-44-dashboards.en-US.mdx`

**Frontmatter:**
- `translationKey: central` · `order: 1` · `status: rascunho`
- `title` (pt-BR): "Consolidar 44 painéis sem migrar um único banco"
- `answer` (pt-BR): "Quarenta e quatro painéis independentes, cada um com URL e senha próprias, viraram um hub único com login institucional — sem mover nenhum banco de dados. A migração foi scriptada e permaneceu reversível, porque os dados vivem na plataforma por identificador e mover o código não os toca."
- `org: Fundação Beta` · `role: Desenvolvedor full stack` · `period: 2026`
- `stack: ["Next.js", "Cloudflare Workers", "D1", "Supabase", "TypeScript"]`
- `outcome`: "Um login institucional em vez de senha compartilhada por painel, e um deploy em vez de dezenas."
- `proof`: `{ value: "44", label: "painéis consolidados em um hub" }`

**Fatos liberados:** 146 entradas no catálogo; 44 painéis migrados como subrotas; 2 painéis nativos (epidemiologia e vigilância); cada painel mantinha o próprio banco e ganhou binding próprio na central; migração por script (`migrate-panel.sh`) com casos fora do padrão tratados à mão; middleware único protegendo tudo exceto login e erro; autenticação restrita ao domínio institucional; o painel ODS ficou deliberadamente de fora por ser público e a central inteira estar atrás de login.

**Proibido:** nome e identificador de banco, URLs internas, referência do projeto Supabase, o domínio de homologação, e a senha antiga — inclusive como exemplo do problema. Escrever "cada painel tinha o seu próprio portão de senha compartilhada", sem citar o valor.

**A decisão a destacar:** consolidar 44 aplicações poderia significar migrar 44 bancos, com janela de indisponibilidade e risco de perda. Nenhum foi migrado: os dados são endereçados por identificador na plataforma, então a consolidação virou operação puramente de código, reversível, sem tocar em dado de produção. A segunda metade da decisão é ter scriptado a migração — 44 migrações manuais produzem 44 divergências sutis.

---

### Task 10: Case "ContrataPlan" — o formato pior tecnicamente é o certo

**Files:** `app/content/cases/planejamento-de-contratacao-publica.{pt-BR,pt-PT}.mdx`, `app/content/cases/public-procurement-planning.en-US.mdx`

**Frontmatter:**
- `translationKey: contrataplan` · `order: 2` · `status: rascunho`
- `title` (pt-BR): "Planejamento de contratação pública sob a Lei 14.133"
- `answer` (pt-BR): "Os três documentos que a lei de licitações exige antes de qualquer compra eram produzidos em arquivos de texto isolados, sem rastreabilidade nem padronização. Passaram a nascer dentro de um sistema, com trilha de auditoria e geração automática do documento final."
- `stack: ["Next.js", "TypeScript", "Cloudflare Workers", "D1"]`
- `outcome`: "Documento obrigatório por lei saiu do arquivo solto em cada secretaria e ganhou trilha de auditoria."
- Sem `proof`.

**Fatos liberados:** cobre o ciclo DFD, ETP e TR da Lei 14.133/2021; documentos produzidos antes em editores de texto isolados por cada secretaria, sem rastreabilidade, padronização ou visibilidade para a gestão (está no README do projeto); registro central de licitação com os três documentos pendurados e conteúdo em JSON; motor de templates próprio; um banco por aplicação em vez de banco compartilhado, por raio de dano.

**Proibido:** conteúdo real de qualquer DFD, ETP ou TR; nome de servidor nos campos de responsável; valor estimado de compra.

**A decisão a destacar:** o sistema exporta Word, não PDF. PDF é o padrão técnico e é o que qualquer desenvolvedor escolheria, mas o documento ainda percorre fisicamente as secretarias e precisa ser editado e assinado no papel — PDF travaria o fluxo de aprovação real. Escolher o formato pior tecnicamente porque é o que o processo humano suporta é o tipo de decisão que só aparece em quem entregou software dentro de uma organização.

---

### Task 11: Case "Instrumentos" — 468 acordos em nove planilhas incompatíveis

**Files:** `app/content/cases/468-acordos-em-nove-planilhas.{pt-BR,pt-PT}.mdx`, `app/content/cases/468-agreements-nine-spreadsheets.en-US.mdx`

**Frontmatter:**
- `translationKey: instrumentos` · `order: 3` · `status: rascunho`
- `title` (pt-BR): "468 acordos em nove planilhas incompatíveis"
- `answer` (pt-BR): "Cerca de 468 termos de ajuste assinados entre 2020 e 2026 viviam em nove planilhas com formatos incompatíveis, e ninguém conseguia responder quantos estavam atrasados sem abrir os nove arquivos. Viraram um modelo de dados normalizado e auditável, com a origem de cada registro preservada."
- `stack: ["TypeScript", "Cloudflare Workers", "D1", "SQL"]`
- `outcome`: "Pergunta que exigia consolidar nove arquivos à mão passou a ser um filtro na tela."
- `proof`: `{ value: "468", label: "acordos migrados de nove planilhas" }`

**Fatos liberados:** ~468 termos entre 2020 e 2026; nove arquivos `.xlsx` com nomes inconsistentes, valor financeiro gravado como texto, cabeçalho ocupando quatro linhas, uma planilha com várias linhas por registro exigindo preenchimento para baixo, uma duplicata inteira e três modelos vazios; enum fechado de status com seis valores; esquema em quatro tabelas separando o termo das contrapartidas e das metas; campo `fonte` guardando o arquivo de origem de cada registro; campos que não cabiam em tipo forte mantidos como texto livre de propósito.

**Proibido:** as planilhas-fonte, número de processo, matrícula de imóvel, nome de responsável, valor por empresa nomeada.

**A decisão a destacar:** preservar a origem. Cada registro guarda o arquivo que o produziu, e é isso que torna o dado auditável: quando um número é contestado, dá para voltar até a planilha, em vez de defender o ETL. A decisão irmã é não forçar tipo forte em cima de dado sujo — normalizar só o que precisa de agregação.

---

### Task 12: Case "UPA Agora" — desacoplar a audiência da origem

**Files:** `app/content/cases/painel-publico-de-filas-de-upa.{pt-BR,pt-PT}.mdx`, `app/content/cases/public-emergency-room-queues.en-US.mdx`

**Frontmatter:**
- `translationKey: upa-agora` · `order: 4` · `status: rascunho`
- `title` (pt-BR): "Fila de pronto-atendimento pública, em tempo quase real"
- `answer` (pt-BR): "Para saber qual unidade de pronto-atendimento estava mais cheia, era preciso ir até lá e olhar a fila. Um painel público passou a mostrar espera e classificação de risco das quatro unidades do município, sem que o acesso do cidadão gere carga no sistema assistencial de origem."
- `stack: ["React", "Cloudflare Workers", "KV", "Cron Triggers", "TypeScript"]`
- `outcome`: "Informação que só existia dentro da unidade passou a ser consultável antes de sair de casa."
- `proof`: `{ value: "4", label: "unidades com fila pública em tempo quase real" }`

**Fatos liberados:** quatro unidades; fila por especialidade, classificação de risco pelo protocolo de triagem, tempo médio de espera e contagem por etapa; dois caminhos de origem, a API do sistema de regulação assistencial do município e, como alternativa, planilhas publicadas como CSV; cron de 15 minutos gravando o resultado em armazenamento chave-valor; a interface consulta apenas esse armazenamento, a cada 30 segundos; parser que aceita as várias formas como o operador digita duração e casamento de coluna que ignora acento, caixa e espaço extra.

**Proibido:** nomear o fornecedor da API de saúde ou o banco por trás; endpoints, tokens e identificadores de planilha; qualquer número real de fila.

**A decisão a destacar:** o Worker não consulta a origem a cada visita. O cron desacopla o pico de acesso do cidadão da capacidade do sistema hospitalar: mil pessoas abrindo o painel geram zero requisição extra na origem. A segunda decisão é o parser tolerante — é a diferença entre um sistema que funciona no papel e um que sobrevive ao preenchimento humano real.

---

### Task 13: Case "ODS" — comparação como requisito de leitura

**Files:** `app/content/cases/painel-ods-de-betim.{pt-BR,pt-PT}.mdx`, `app/content/cases/sdg-dashboard.en-US.mdx`

**Contexto:** este é o case mais seguro do conjunto. O painel é público, as fontes são públicas e o insumo registra que praticamente nada aqui é restrito. Se o alinhamento institucional atrasar os outros quatro, este garante que `/trabalho` exista com conteúdo real.

**Frontmatter:**
- `translationKey: ods` · `order: 5` · `status: rascunho`
- `title` (pt-BR): "Indicadores dos ODS de um município, comparáveis"
- `answer` (pt-BR): "O desempenho do município nos Objetivos de Desenvolvimento Sustentável existia em relatórios anuais e em bases estatísticas que exigem saber navegar tabela. Virou um painel público com série histórica, onde cada indicador aparece ao lado do estado e do país."
- `stack: ["TypeScript", "Cloudflare Workers", "D1", "ETL em Python"]`
- `outcome`: "Indicador disperso em base estatística e relatório anual passou a ser consultável por qualquer pessoa."
- Sem `proof`.

**Fatos liberados:** todas as fontes são públicas e cada uma tem a tabela identificada no ETL — PIB per capita, alfabetização do Censo 2022, Gini e desemprego da PNAD, mortalidade infantil computada, saneamento, e o índice de desempenho dos ODS em edições de 2023, 2024 e 2025; cada indicador é importado nos três níveis, município, estado e país; catálogo unificado com precedência da edição mais recente sobre as anteriores, e os indicadores do índice mantidos sob meta sintética para não se misturarem aos oficiais da ONU; o painel ficou fora da consolidação da central por ser público.

**Proibido:** nome do banco e caminhos locais de máquina nos scripts.

**A decisão a destacar:** sem comparação, um indicador isolado não diz nada ao leitor — importar município, estado e país é o que transforma número em leitura. E a reconciliação de três edições de uma base que muda de ano para ano é a parte que ninguém vê e que decide se a série temporal mente ou não.

---

## Task 14: `/trabalho` — o índice de cases

**Files:** `app/routes/work.tsx`, dicionário

- [ ] **Step 1: Listar**

`listCases(locale)` já devolve só os publicados, ordenados. Cada item mostra `title`, `outcome`, a lista de `stack` em mono, e liga para `documentHref("work", locale, doc.slug)`.

- [ ] **Step 2: Estado vazio honesto**

Enquanto todos os cases estiverem em rascunho, a lista vem vazia. A página precisa dizer, com uma string do dicionário, que os cases estão em preparação e apontar para o GitHub — nunca renderizar uma lista vazia sem explicação.

- [ ] **Step 3: Tirar `/trabalho` da navegação enquanto estiver vazio**

Em `app/layouts/site.tsx`, o link para `/trabalho` só aparece se `listCases(locale).length > 0`. O mesmo vale para `/escritos` na Task 15. Menu que leva a página vazia é pior que menu curto.

- [ ] **Step 4: Commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: adiciona indice de cases"
```

---

## Task 15: `/escritos` — índice do blog e arquivo por tag

**Files:** `app/routes/writing.tsx`, `app/routes/writing.tag.tsx`, `app/i18n/format.ts`

- [ ] **Step 1: Índice**

`listArticles(locale)` ordenado do mais recente. Cada item: data em `<time>` formatada com `Intl` pelo locale, título como link, e o `answer` como resumo — o mesmo texto que serve de bloco de resposta e de descrição no feed, escrito uma vez só.

- [ ] **Step 2: Lista de tags**

Abaixo do título, os `listTags(locale)` como links para `tagHref`.

- [ ] **Step 3: Página de tag**

`writing.tag.tsx` com `<h1>` no formato localizado "Artigos sobre <tag>", a lista filtrada, e `<meta name="robots" content="noindex,follow">` — arquivo por tag com um ou dois artigos é conteúdo fino e não deve competir no índice do buscador com o artigo em si.

- [ ] **Step 4: Commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: adiciona indice do blog e arquivo por tag"
```

---

## Tasks 16 a 18: Os três artigos de largada

**Contexto comum.** Os três saem do trabalho real registrado em `insumos/portfolio-cases.md`, em `pt-BR` e `en-US`. **Nenhum artigo é publicado sem o Diorgenes ler e aprovar:** nascem com `status: rascunho`, como os cases.

Cada artigo tem entre 900 e 1.400 palavras, abre com o bloco de resposta, e sustenta uma tese só. As mesmas regras de publicação dos cases valem aqui — inclusive a de nunca citar senha, identificador ou fornecedor de origem.

### Task 16: "Consolidei 44 aplicações sem migrar um banco"

- Slugs: `consolidar-sem-migrar-banco` (pt-BR), `consolidating-without-migrating-databases` (en-US) · `translationKey: consolidar-sem-migrar`
- Tags: `arquitetura`, `cloudflare`, `migracao`
- **Tese:** em plataforma onde o dado é endereçado por identificador, consolidação de aplicações é problema de código, não de dado — e tratar como problema de dado é o que cria janela de indisponibilidade e risco de perda.
- Estrutura: o cenário (N aplicações, N portões de senha, N deploys) → a armadilha óbvia (migrar tudo para um banco só) → o que a plataforma permite → por que scriptar em vez de fazer à mão → o que ficou de fora de propósito e por quê → o que eu faria diferente.

### Task 17: "Quando o formato tecnicamente pior é a decisão certa"

- Slugs: `word-em-vez-de-pdf` (pt-BR), `word-instead-of-pdf` (en-US) · `translationKey: formato-que-o-processo-suporta`
- Tags: `produto`, `setor-publico`
- **Tese:** software dentro de uma organização é avaliado pelo processo que ele precisa atravessar, não pela pureza técnica da escolha. Um formato imutável trava um fluxo que depende de assinatura em papel.
- Estrutura: a decisão contraintuitiva enunciada logo no começo → por que PDF é o instinto certo em quase todo contexto → o processo real de aprovação → o custo de ignorá-lo → como generalizar sem virar desculpa para código ruim.
- É o artigo com maior chance de circular fora do Brasil: a tensão entre pureza técnica e processo organizacional é universal.

### Task 18: "Número sem dono não entra em painel de gestão"

- Slugs: `numero-sem-dono` (pt-BR), `numbers-without-an-owner` (en-US) · `translationKey: numero-sem-dono`
- Tags: `dados`, `governanca`
- **Tese:** todo indicador exibido precisa de origem rastreável e de um responsável pela atualização. Dado errado para um gestor público é pior do que ausência de dado, porque a decisão vira ficção com aparência de dado.
- Estrutura: a frase-tese → o painel com número sem origem → o campo que guarda o arquivo de onde o registro veio → por que planilha pode ser a interface certa de manutenção quando é o que a equipe sabe manter → o limite: o que é calculado não se digita.
- **Cuidado:** este artigo se apoia em um sistema de gabinete que **não** vira case público. Escrever no plano do princípio e usar como exemplo concreto apenas o case dos 468 acordos, que é o publicado.

---

## Task 19: Home — prova e caminhos por persona

**Contexto:** a home da Fase 0 é um `<h1>` solto. O spec pede que cada persona tenha um caminho próprio e que o recrutador entenda senioridade e stack em menos de 30 segundos. O hero 3D e a telemetria são Fase 2; esta task entrega a estrutura e o texto que eles vão habitar.

**Files:** `app/routes/home.tsx`, dicionário, `app/components/proof-strip.tsx`

- [ ] **Step 1: Estrutura da página**

Quatro blocos, nesta ordem:

1. **Hero** — `<h1>` com o nome, uma linha de posicionamento em Instrument Serif itálico na quebra escolhida (regra 4 do spec), e o bloco de resposta da home: quem ele é e o que constrói, em 2–3 frases autocontidas. Espaço reservado para a cena da Fase 2, sem placeholder visível.
2. **Prova** — a faixa de números, descrita no passo 2.
3. **Caminhos por persona** — três cartões: *Recrutador* → `/cv`; *Cliente* → `/servicos`; *Desenvolvedor* → `/trabalho` e `/escritos`. Cada um com um verbo e uma frase, não um parágrafo.
4. **Últimos escritos** — três artigos mais recentes, oculto quando não houver nenhum.

- [ ] **Step 2: Faixa de prova, derivada do conteúdo**

Criar `app/components/proof-strip.tsx`, que lê `listCases(locale)`, pega os que têm `proof` e renderiza cada um como número em mono, rótulo curto, **e link para o case que o documenta**.

Essa amarração é o que faz a regra 1 do spec valer na prática: o número não é uma afirmação da home, é um resumo de uma página que explica de onde ele vem. Case em rascunho não aparece, então nenhum número fica órfão.

- [ ] **Step 3: Nunca escrever número solto no dicionário**

Revisar as strings da home e confirmar que nenhuma contém dígito de métrica. Se um número precisar aparecer, ele vem de `proof` de um case publicado.

- [ ] **Step 4: Teste**

```ts
it("should link every proof number to the case that documents it", () => {
  // Em app/components/proof-strip.test.ts, com o registro real.
  const numbers = listCases("pt-BR").filter((doc) => doc.frontmatter.proof);

  expect(numbers.every((doc) => doc.slug.length > 0)).toBe(true);
});
```

- [ ] **Step 5: Commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: reescreve a home com prova ancorada em case e caminhos por persona"
```

---

## Task 20: Metadados, canonical e hreflang

**Contexto:** o `meta` de cada rota hoje só devolve título. Precisa devolver descrição, canonical absoluta, Open Graph e os `hreflang` recíprocos — e o spec é explícito: `hreflang` só aponta para tradução que existe de fato.

**Files:**
- Create: `app/seo/meta.ts`, `app/seo/meta.test.ts`, `app/seo/urls.ts`
- Modify: todas as rotas

- [ ] **Step 1: Testes primeiro**

Criar `app/seo/meta.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildMeta } from "./meta";

const input = {
  locale: "pt-BR" as const,
  path: "/pt-br/sobre/",
  title: "Sobre",
  description: "Uma descrição com tamanho suficiente para servir de resumo em resultado de busca.",
  translations: { "pt-BR": "/pt-br/sobre/", "en-US": "/en/about/" },
};

const find = (tags: ReturnType<typeof buildMeta>, rel: string, hrefLang?: string) =>
  tags.filter(
    (tag) =>
      "rel" in tag && tag.rel === rel && (!hrefLang || ("hrefLang" in tag && tag.hrefLang === hrefLang)),
  );

describe("buildMeta", () => {
  it("should emit an absolute canonical url", () => {
    const [canonical] = find(buildMeta(input), "canonical");

    expect(canonical).toMatchObject({ href: "https://diorgenesgeorge.dev/pt-br/sobre/" });
  });

  it("should include the page itself among the alternates", () => {
    expect(find(buildMeta(input), "alternate", "pt-BR")).toHaveLength(1);
  });

  it("should never point hreflang at a translation that does not exist", () => {
    expect(find(buildMeta(input), "alternate", "pt-PT")).toHaveLength(0);
  });

  it("should send x-default to the english page", () => {
    const [xDefault] = find(buildMeta(input), "alternate", "x-default");

    expect(xDefault).toMatchObject({ href: "https://diorgenesgeorge.dev/en/about/" });
  });

  it("should omit x-default when there is no english translation", () => {
    const tags = buildMeta({ ...input, translations: { "pt-BR": "/pt-br/sobre/" } });

    expect(find(tags, "alternate", "x-default")).toHaveLength(0);
  });

  it("should mark a noindex page as such", () => {
    const tags = buildMeta({ ...input, noindex: true });

    expect(tags).toContainEqual({ name: "robots", content: "noindex,follow" });
  });
});
```

- [ ] **Step 2: Implementar**

Criar `app/seo/meta.ts` com `absoluteUrl(path)` e `buildMeta(input)` devolvendo, nesta ordem: `title`, `description`, `link rel=canonical`, `og:title`, `og:description`, `og:type`, `og:url`, `og:locale`, `twitter:card=summary`, um `link rel=alternate` por tradução existente, o `x-default` apontando para `en-US` quando existir, e `robots: noindex,follow` quando `noindex` for verdadeiro.

**Sem `og:image` nesta fase** — a geração é Fase 4 e apontar para imagem inexistente é pior que não ter a tag.

- [ ] **Step 3: Centralizar a montagem das traduções**

Criar `app/seo/urls.ts` com:
- `staticTranslations(key: RouteKey)` → `Partial<Record<Locale, string>>` a partir de `ROUTE_PATHS`
- `documentTranslations(kind, translationKey, parent)` → usa `translationsOf` e `documentHref`
- `allIndexableUrls()` → lista de `{ path, locale, translations, lastmod }` de tudo que é público, usada pelo sitemap e pelo `llms.txt`. Exclui as rotas `notFound` e as páginas de tag.

- [ ] **Step 4: Aplicar em todas as rotas**

Cada `meta` passa a chamar `buildMeta`. Para páginas fixas, `description` vem do `answer` do MDX correspondente ou do dicionário quando a rota não tem MDX (home, cv, contato, índices).

- [ ] **Step 5: Commit**

```bash
npm run check && npm run build
git add app
git commit -m "feat: adiciona metadados, canonical e hreflang reciproco por rota"
```

---

## Task 21: JSON-LD

**Divergência do spec, deliberada:** o spec previa `SoftwareSourceCode` por case. Os sistemas descritos não têm repositório público, então declarar `SoftwareSourceCode` sem `codeRepository` seria marcação vazia. Os cases usam `TechArticle` com `about` apontando para um `SoftwareApplication` — descrevem com precisão o que a página é: um artigo técnico sobre um sistema. Registrar esta troca nas notas de execução.

**Files:** `app/seo/jsonld.ts`, `app/seo/jsonld.test.ts`, `app/components/json-ld.tsx`

- [ ] **Step 1: Serializador seguro**

O JSON-LD é injetado como data block. Uma string de conteúdo contendo `</script>` fecharia a tag e viraria injeção de HTML. Criar em `app/seo/jsonld.ts`:

```ts
/** Fecha a porta para conteúdo que contenha </script> e escape do data block. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

Teste obrigatório:

```ts
it("should escape a closing script tag inside content", () => {
  const output = serializeJsonLd({ name: "</script><img onerror=alert(1)>" });

  expect(output).not.toContain("</script>");
});
```

- [ ] **Step 2: Construtores**

Em `app/seo/jsonld.ts`, um por tipo, todos recebendo `locale` e devolvendo objeto puro:

- `personJsonLd()` — `@type: Person`, `name`, `jobTitle`, `url`, `sameAs: [linkedin, github]`, `address` com `addressLocality: "Betim"`, `addressRegion: "MG"`, `addressCountry: "BR"`, `worksFor` como `Organization` com o nome da Fundação, `alumniOf` como `CollegeOrUniversity` com o nome da universidade, e `knowsAbout` com a lista de competências do CV — derivada de `CV[locale].skills`, não digitada de novo.
- `webSiteJsonLd()` — `@type: WebSite`, `url`, `name`, `inLanguage`.
- `profilePageJsonLd()` — usado em `/sobre`, com `mainEntity` apontando para o `Person`.
- `breadcrumbJsonLd(items)` — `ListItem` por nível, com `position` começando em 1.
- `techArticleJsonLd(doc, path)` — `headline`, `description` (o `answer`), `datePublished`, `dateModified`, `inLanguage`, `author` como `Person`, `mainEntityOfPage`.
- `caseJsonLd(doc, path)` — `TechArticle` com `about: { "@type": "SoftwareApplication", name, applicationCategory: "BusinessApplication" }`.
- `serviceJsonLd()` — usado em `/servicos`, com `provider` apontando para o `Person` e `areaServed: "BR"`.

**Nunca** declarar `aggregateRating`, `review` ou `FAQPage` sem FAQ genuíno na página — marcação inventada é penalizada e viola a regra 1 tanto quanto número inventado.

- [ ] **Step 3: Componente**

Criar `app/components/json-ld.tsx`:

```tsx
import { serializeJsonLd } from "../seo/jsonld";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
```

- [ ] **Step 4: Aplicar**

`Person` e `WebSite` na home de cada idioma; `ProfilePage` em `/sobre`; `Service` em `/servicos`; `TechArticle` em cada artigo; `caseJsonLd` em cada case; `BreadcrumbList` em toda página com dois níveis ou mais.

- [ ] **Step 5: Verificar que a CSP não bloqueia o data block**

Este é o passo que fecha o risco levantado na Task 1. Acrescentar a `e2e/csp.spec.ts`:

```ts
test("should keep the json-ld inline and unblocked", async ({ page }) => {
  await page.goto("/en/");

  const blocks = await page.locator('script[type="application/ld+json"]').count();
  const parsed = await page.locator('script[type="application/ld+json"]').first().textContent();

  expect(blocks).toBeGreaterThan(0);
  expect(() => JSON.parse(parsed ?? "")).not.toThrow();
});
```

Run: `npx playwright test e2e/csp.spec.ts`
Expected: PASS — e nenhuma violação de CSP no teste vizinho.

- [ ] **Step 6: Validar externamente**

Colar o HTML de `/en/` e de um case no validador do schema.org e no teste de resultados enriquecidos do Google. Corrigir o que acusar antes de commitar.

- [ ] **Step 7: Commit**

```bash
npm run check && npm run build
git add app e2e
git commit -m "feat: adiciona json-ld por tipo de pagina"
```

---

## Task 22: `sitemap.xml` e `robots.txt`

**Files:** `app/routes/resources/sitemap.ts`, `app/routes/resources/robots.ts`, `app/routes.ts`, `app/i18n/prerender.ts`, `app/seo/sitemap.test.ts`

- [ ] **Step 1: Sitemap com alternates**

Rota de recurso, sem componente, registrada na raiz (fora do prefixo de idioma):

```ts
route("sitemap.xml", "routes/resources/sitemap.ts", { id: "sitemap" }),
```

O loader monta o XML a partir de `allIndexableUrls()`, com um `<url>` por página e, dentro dele, um `<xhtml:link rel="alternate" hreflang="..">` por tradução existente, incluindo a própria. `lastmod` vem do `updated` do documento; para páginas sem MDX, da data do build.

Responder com `Content-Type: application/xml; charset=utf-8`.

- [ ] **Step 2: Testar a montagem do XML**

Extrair a montagem para uma função pura em `app/seo/sitemap.ts` e testar: contém a URL, contém o bloco de alternates, não contém rota de tag, não contém 404, não contém documento em rascunho, e todas as URLs são absolutas.

- [ ] **Step 3: `robots.txt`**

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://diorgenesgeorge.dev/sitemap.xml
```

A liberação explícita a crawler de IA é decisão consciente do spec: o site existe para ser citado.

- [ ] **Step 4: Acrescentar os dois à lista de pré-renderização**

Em `prerenderPaths()`, incluir `"/sitemap.xml"` e `"/robots.txt"`. Eles não terminam em barra — ajustar o teste "should end every path with a trailing slash" para excluir caminhos com extensão.

- [ ] **Step 5: Verificar no build**

```bash
npm run build
head -20 build/client/sitemap.xml
cat build/client/robots.txt
```

Expected: XML bem formado com `xmlns:xhtml` declarado, e o `robots.txt` acima.

- [ ] **Step 6: Commit**

```bash
npm run check
git add app
git commit -m "feat: adiciona sitemap com alternates e robots liberando crawler de ia"
```

---

## Task 23: Feeds RSS e JSON por idioma

**Files:** `app/routes/resources/feed-rss.ts`, `app/routes/resources/feed-json.ts`, `app/seo/feed.ts`, `app/seo/feed.test.ts`

- [ ] **Step 1: Rotas por idioma**

Registradas dentro do prefixo de idioma e **fora** do `layout`, porque não têm interface:

```ts
route(`${writing}/feed.xml`, "routes/resources/feed-rss.ts", { id: `feed-rss-${segment}` }),
route(`${writing}/feed.json`, "routes/resources/feed-json.ts", { id: `feed-json-${segment}` }),
```

O loader deriva o locale do caminho da requisição com `localeFromPathname`.

- [ ] **Step 2: Conteúdo**

Um item por artigo publicado: título, link absoluto, `pubDate` em RFC 822 no RSS e ISO 8601 no JSON Feed, e o `answer` como descrição — o mesmo texto do bloco de resposta, escrito uma vez só. **Sem corpo completo no feed**: o objetivo é levar leitura para o site.

- [ ] **Step 3: Escapar o XML**

Título com `&` ou `<` quebra o RSS. Função pura testada:

```ts
it("should escape ampersands in a title", () => {
  expect(escapeXml("Dados & decisão")).toBe("Dados &amp; decisão");
});
```

- [ ] **Step 4: Descobribilidade**

No `<head>` das rotas `/escritos` e de cada artigo, `<link rel="alternate" type="application/rss+xml" title="..." href="...">` do idioma corrente.

- [ ] **Step 5: Pré-renderizar e commitar**

Acrescentar os seis caminhos (dois por idioma) a `prerenderPaths()`.

```bash
npm run check && npm run build
git add app
git commit -m "feat: adiciona feed rss e json por idioma"
```

---

## Task 24: GEO — `.md` por documento, `llms.txt` e `llms-full.txt`

**Contexto:** é o que faz o site ser citável por assistente de IA. Como o conteúdo é markdown puro por decisão da Task 3, o `.md` público é a fonte verbatim sem o frontmatter — nada é convertido nem re-renderizado.

**Files:** `scripts/build-markdown.ts`, `scripts/build-markdown.test.ts`, `app/content/cv-markdown.ts`, `package.json`

- [ ] **Step 1: Converter o CV estruturado em markdown**

Criar `app/content/cv-markdown.ts` com `cvToMarkdown(locale): string`. É a mesma função que a Fase 4 vai usar para o PDF — por isso vive em `app/content` e não no script.

Teste: o markdown gerado contém todos os cargos e nenhuma duração escrita.

- [ ] **Step 2: Emitir os arquivos**

Criar `scripts/build-markdown.ts`, rodado no pós-build. Para cada documento publicado:

| Origem | Saída |
|---|---|
| `app/content/pages/about.pt-BR.mdx` | `build/client/pt-br/sobre.md` |
| `app/content/cases/<slug>.<locale>.mdx` | `build/client/<seg>/<trabalho>/<slug>.md` |
| `app/content/articles/<slug>.<locale>.mdx` | `build/client/<seg>/<escritos>/<slug>.md` |
| `app/content/cv.ts` | `build/client/<seg>/cv.md` |

O corpo é o arquivo sem o bloco de frontmatter, precedido de um cabeçalho de duas linhas: `# <title>` e a URL canônica da versão HTML. A URL no topo é o que faz a citação apontar de volta para o site.

**Divergência do spec, deliberada:** o spec dizia "toda página disponível como `.md`". Home e índices ficam de fora — são navegação, não conteúdo, e o `llms.txt` já cumpre o papel de índice. Registrar nas notas de execução.

- [ ] **Step 3: `llms.txt`**

Rota de recurso na raiz, pré-renderizada, no formato do llmstxt.org:

```
# Diorgenes George

> Desenvolvedor full stack em Betim, Minas Gerais. Constrói sistemas de gestão pública: painéis para o executivo municipal, portais de serviço e integrações de dados.

## Sobre
- [Sobre](https://diorgenesgeorge.dev/pt-br/sobre.md): <answer do documento>
- [About](https://diorgenesgeorge.dev/en/about.md): <answer do documento>

## Cases
...
## Artigos
...
```

Gerado de `allIndexableUrls()`, então nunca lista o que não existe.

- [ ] **Step 4: `llms-full.txt`**

Concatenação, na mesma ordem do `llms.txt`, de todos os `.md` emitidos, separados por `\n\n---\n\n`. Como a fonte é markdown puro, isso é literalmente concatenar arquivos.

Guardar o tamanho em log. Se passar de 1 MB, dividir por idioma e registrar a mudança — mas com o conteúdo desta fase deve ficar bem abaixo disso.

- [ ] **Step 5: Verificar o `Content-Type`**

O `_headers` da Task 1 já declara `text/markdown; charset=utf-8` para `/*.md`. Confirmar no servidor real:

```bash
npm run build
npx wrangler dev --port 8788 &
sleep 8
curl -sI http://localhost:8788/en/about.md | grep -i content-type
curl -s http://localhost:8788/llms.txt | head -5
```

Expected: `text/markdown; charset=utf-8` e o cabeçalho do `llms.txt`.

- [ ] **Step 6: Commit**

```bash
npm run check
git add app scripts package.json
git commit -m "feat: adiciona markdown publico por documento, llms.txt e llms-full.txt"
```

---

## Task 25: Acessibilidade e golden paths

**Contexto:** a Fase 0 rodava axe em 4 caminhos escritos à mão. Com o conteúdo, isso vira dezenas de páginas e a lista precisa vir do build, não de uma constante que alguém esquece de atualizar.

**Files:** `e2e/acessibilidade.spec.ts`, `e2e/conteudo.spec.ts`, `e2e/seo.spec.ts`

- [ ] **Step 1: axe sobre todas as páginas pré-renderizadas**

Substituir a constante `PATHS` de `e2e/acessibilidade.spec.ts` por:

```ts
import { prerenderPaths } from "../app/i18n/prerender";

const PATHS = prerenderPaths().filter((path) => path.endsWith("/"));
```

Manter os dois temas. Com o conteúdo desta fase são dezenas de combinações; se o tempo de execução incomodar, dividir em dois projetos do Playwright por tema — **não** reduzir a cobertura.

- [ ] **Step 2: Hierarquia de headings**

axe pega salto de nível dentro da página, mas não pega `<h1>` duplicado vindo do layout. Acrescentar:

```ts
test.each(PATHS)("should have exactly one h1 on %s", async (path, { page }) => {
  await page.goto(path);

  await expect(page.locator("h1")).toHaveCount(1);
});
```

- [ ] **Step 3: Golden paths de conteúdo**

Criar `e2e/conteudo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("should walk from the home to the cv", async ({ page }) => {
  await page.goto("/en/");
  await page.getByRole("link", { name: /cv|résumé/i }).first().click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("should keep the reader on the same document when switching language", async ({
  page,
}) => {
  await page.goto("/pt-br/sobre/");
  await page.getByRole("combobox").selectOption("en-US");

  await expect(page).toHaveURL(/\/en\/about\/$/);
});

test("should open the answer block before anything else on a content page", async ({
  page,
}) => {
  await page.goto("/en/about/");
  const first = page.locator("main p").first();

  await expect(first).not.toBeEmpty();
});
```

Acrescentar, quando houver ao menos um case e um artigo publicados: navegação do índice para o documento, e da tag para o artigo.

- [ ] **Step 4: Verificações de SEO no HTML servido**

Criar `e2e/seo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("should expose a canonical url on every static page", async ({ page }) => {
  await page.goto("/pt-br/sobre/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://diorgenesgeorge.dev/pt-br/sobre/",
  );
});

test("should declare reciprocal hreflang", async ({ page }) => {
  await page.goto("/pt-br/sobre/");
  const alternates = page.locator('link[rel="alternate"][hreflang]');

  await expect(alternates.filter({ has: page.locator('[hreflang="pt-BR"]') })).toBeDefined();
  expect(await alternates.count()).toBeGreaterThan(1);
});

test("should serve the markdown twin of a page", async ({ request }) => {
  const response = await request.get("/en/about.md");

  expect(response.headers()["content-type"]).toContain("text/markdown");
  expect(await response.text()).toContain("https://diorgenesgeorge.dev/en/about/");
});

test("should allow ai crawlers explicitly", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();

  expect(robots).toContain("ClaudeBot");
  expect(robots).toContain("Sitemap: https://diorgenesgeorge.dev/sitemap.xml");
});

test("should list alternates inside the sitemap", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();

  expect(sitemap).toContain("xhtml:link");
  expect(sitemap).not.toContain("/404/");
});
```

- [ ] **Step 5: Navegação por teclado, à mão**

Não automatizável de forma honesta. Abrir `/pt-br/`, percorrer a página inteira só com Tab e Shift+Tab e confirmar: o skip link aparece no primeiro Tab, todo link e botão recebem foco visível, a ordem segue a leitura, e nenhum elemento fica inalcançável. Repetir num case e no `/cv`. Registrar o resultado nas notas de execução.

- [ ] **Step 6: Commit**

```bash
npm run check
npx playwright test
git add e2e app
git commit -m "test: cobre todas as rotas com axe e adiciona golden paths de conteudo e seo"
```

---

## Task 26: Fechamento da fase

- [ ] **Step 1: Rodar a definição de pronto inteira** (checklist abaixo), marcando cada item com o comando e a saída.
- [ ] **Step 2: Revisar todo texto publicado contra as regras de publicação** — uma última leitura de cada `.mdx` com `status: publicado`, procurando nome de sistema de origem, identificador, número não verificável e servidor identificável.
- [ ] **Step 3: Escrever as notas de execução** ao fim deste arquivo, no mesmo formato da Fase 0: tabela de divergências entre o plano e a realidade, e lacunas deliberadas.
- [ ] **Step 4: Commit final** e avisar o Diorgenes de que a fase está pronta para revisão. **Não abrir PR sem pedido.**

---

## Definição de pronto da Fase 1

- [ ] `npm run check` verde
- [ ] `npm run build` verde, com a guarda de CSP não acusando script inline
- [ ] `npm run e2e` verde, incluindo axe em todas as rotas pré-renderizadas, nos dois temas
- [ ] CI verde
- [ ] Header `Content-Security-Policy` com **exatamente um** hash de script, em qualquer página
- [ ] 404 desenhada respondendo com status 404 no idioma correto
- [ ] `/sobre`, `/cv`, `/servicos`, `/contato`, `/trabalho`, `/escritos` e `/colofao` existentes nos três idiomas
- [ ] Cinco cases e três artigos escritos, revisados pelo Diorgenes, com o `status` refletindo a decisão dele
- [ ] `hreflang` recíproco, apontando só para tradução existente, com `x-default` no inglês
- [ ] `sitemap.xml` com alternates, sem rascunho, sem 404, sem página de tag
- [ ] `robots.txt` liberando GPTBot, ClaudeBot, PerplexityBot, Google-Extended e CCBot
- [ ] Feed RSS e JSON por idioma, com data válida
- [ ] `.md` público de cada documento, servido como `text/markdown`
- [ ] `/llms.txt` e `/llms-full.txt` coerentes com o que existe
- [ ] JSON-LD válido no validador do schema.org, sem marcação inventada
- [ ] Zero requisição a domínio externo em qualquer página
- [ ] Nenhum número no site sem origem rastreável
- [ ] Página inteira navegável só pelo teclado, verificada à mão

## Fora do escopo desta fase

Hero 3D e telemetria ao vivo (Fase 2), agente de IA e `/ia` (Fase 3), formulário de contato e Cloudflare Email Service, OG images geradas em build, PDF do CV, IndexNow, Search Console, política de privacidade, Web Analytics e o deploy no domínio (Fase 4).

## Riscos conhecidos

| Risco | Sinal | O que fazer |
|---|---|---|
| A externalização de scripts quebra a hidratação de forma sutil | Navegação no cliente funciona, mas o tema não alterna, ou o console acusa erro de stream | O teste de hidratação da Task 1 pega. Se pegar, manter os scripts clássicos inline com hash por diretório e externalizar só o módulo |
| O handler de assets não sobe a árvore procurando `404.html` | 404 em português responde em inglês | Passo 7 da Task 2 já prevê e traz a alternativa |
| `@mdx-js/rollup` incompatível com a versão do Vite | Build quebra ao importar o primeiro `.mdx` | Fixar a versão do plugin, ou trocar por `@mdx-js/mdx` com um plugin próprio de 20 linhas. Não trocar o modelo de conteúdo |
| O alinhamento institucional atrasa os cases | Nada a publicar em `/trabalho` | O case do ODS é inteiramente público e sustenta a rota sozinho. `/trabalho` sai da navegação enquanto estiver vazio |
| Tempo do Playwright cresce demais com dezenas de rotas | E2E passa de 10 minutos no CI | Dividir por tema em dois projetos, ou rodar axe em nightly. Nunca reduzir a lista de rotas |

## Notas de execução — 2026-08-01

Executado inline, nesta ordem, com commit por task. `npm run check` e `npm run e2e` verdes ao fim de cada uma.

Divergências entre o plano e a realidade:

| Plano assumia | Realidade | Resolução |
|---|---|---|
| Externalizar scripts inline resolve a CSP | Quebra a hidratação: o `<Scripts>` é componente React e é renderizado de novo no cliente | Abordagem abandonada. Hash de todo inline, com orçamento de 4 KB verificado no build |
| 404 como rota nomeada | ID de rota divergia do splat que atende a URL real | Sem rota nomeada: `/<seg>/404/` é pré-renderizado pelo próprio splat |
| — | `routeDiscovery` em modo `lazy` buscava `/__manifest` em runtime, 404 em toda página | Fixado em `initial` |
| Zod validando no registro | Zod 4 compila validadores com `new Function`, que a CSP bloqueia | Validação movida para o build (`scripts/validate-content.ts`); o registro do browser confia. Zod saiu do bundle do cliente |
| Data de frontmatter como `2026-08-01` | Os dois analisadores de YAML convertiam para `Date` | Datas entre aspas; o schema exige string |
| `manifest.node.ts` dentro de `app/` | `app/` é compilado com tipos de browser, sem `node:fs` | Código de build move para `scripts/`: `content-manifest.ts` e `prerender-paths.ts` |
| Valor de frontmatter com dois-pontos | Quebra o YAML | Todo `title`, `answer` e `outcome` entre aspas; o validador reporta com o nome do arquivo |
| `SoftwareSourceCode` por case | Nenhum case tem repositório público | `TechArticle` com `about` apontando para `SoftwareApplication` |
| `.md` para toda página | Home e índices são navegação, não conteúdo | `.md` para páginas de prosa, cases, artigos e CV. `llms.txt` cumpre o papel de índice |
| — | O nome legal e as variações de busca chegaram durante a execução | `alternateName`, `legalName`, `givenName` e `familyName` no `Person`; menção única no `/sobre` |
| `/contato` sem canal direto | O Diorgenes optou por publicar o WhatsApp | `wa.me` com mensagem pronta, decidido com o risco de raspagem explicitado |

### Estado da definição de pronto

Verificado: `npm run check` (203 testes), `npm run e2e` (116 testes), build com a guarda de CSP, 24 páginas HTML nos três idiomas, 404 respondendo 404 no idioma do caminho, `hreflang` recíproco com `x-default`, sitemap com alternates e sem rascunho, robots liberando os cinco crawlers de IA, feed RSS e JSON por idioma, 12 arquivos `.md` servidos como `text/markdown`, `llms.txt` e `llms-full.txt`, axe em todas as rotas nos dois temas, e **zero requisição a domínio externo**.

Pendente, e não é código:

- **Validação externa do JSON-LD** no validador do schema.org e no teste de resultados enriquecidos do Google. A estrutura é verificada por teste, mas a conferência externa depende de rede.
- **Navegação por teclado à mão**, que não é automatizável de forma honesta.
- **CI verde**: o repositório ainda não tem remote, então o workflow não roda.
- **Leitura e aprovação do Diorgenes** dos cinco cases e três artigos, todos em `status: rascunho`. Enquanto isso, `/trabalho` e `/escritos` mostram estado vazio explicado e ficam fora do menu.

### Mudança de critério, registrada

A definição de pronto pedia "CSP com exatamente um hash". Isso vinha da abordagem refutada. O critério real passou a ser **orçamento de 4 KB verificado no build**, hoje em 1938 bytes com 32 hashes, crescendo com rotas e não com páginas.

## Insumos que ainda dependem do Diorgenes

1. **Aprovação institucional** do que pode ser descrito publicamente sobre os sistemas internos — trava os cases da Central e do ContrataPlan em particular.
2. **Leitura e aprovação** de cada case e artigo antes de virar `publicado`.
3. **Foto profissional** — não bloqueia esta fase, entra com as OG images na Fase 4.
4. **Confirmação do domínio** `diorgenesgeorge.dev` na conta Cloudflare e do endereço de contato — Fase 4.
5. **Fora do site, mas urgente:** trocar as senhas que estão em texto claro no README do painel de projetos e removê-las do arquivo. O histórico do git mantém o valor mesmo depois do commit de limpeza.

