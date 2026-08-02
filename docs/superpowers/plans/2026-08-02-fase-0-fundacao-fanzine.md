# Fase 0 do fanzine: fundacao

> **Para agentes executores:** SUB-SKILL OBRIGATORIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para rastreamento.

**Objetivo:** deixar o repositorio pronto para receber a identidade zine, removendo o globo 3D, a biblioteca de animacao, as duas fontes customizadas e o tema claro/escuro, sem mudar nada da identidade visual atual.

**Arquitetura:** subtracao pura. Nada de novo e construido nesta fase. Cada remocao e acompanhada do ajuste dos testes que a cobriam, para que o portao de qualidade continue significando alguma coisa. A transicao de rota deixa de ser uma biblioteca de 38,7 KB e passa a ser a View Transitions API nativa, acionada pela prop `viewTransition` do React Router.

**Stack:** React 19, React Router 8 em modo framework, Cloudflare Workers, Vite 8, Tailwind CSS 4, TypeScript 5.9, Vitest 4, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-02-fanzine-design.md`

## Restricoes globais

Valem para toda tarefa deste plano.

- Todo texto em pt-BR: codigo, comentarios, commits, documentos e interface.
- Sem emojis em lugar nenhum.
- Sem travessao e sem meia-risca em nenhum texto. Usar virgula, dois pontos ou parenteses.
- Conventional Commits em portugues (`feat`, `fix`, `refactor`, `perf`, `docs`, `chore`, `test`).
- Nunca adicionar trailer de co-autoria em commit.
- TypeScript com `strict: true`. Proibido `any` e `ts-ignore`. Usar `unknown` com narrowing.
- Nenhuma dependencia nova nesta fase. A fase so remove.
- Nenhuma mudanca de identidade visual. Paleta, tipografia e layout continuam os atuais menos o que for removido.
- Todo comando `gh` neste ambiente precisa do prefixo `GODEBUG=netdns=cgo`, senao a resolucao de DNS falha no WSL.
- Portao ao fim de cada tarefa: `npm run check` (lint, typecheck e vitest) verde.
- Portao ao fim da fase: `npm run build` e `npm run e2e` verdes, com o `check-budget` dentro do teto.

## Fluxo de git

A Fase 0 inteira e uma unica task no fluxo do projeto: uma issue, uma branch `feature/<numero>-fase-0-fundacao`, commits atomicos por tarefa deste plano, e um PR ao final. Abrir cinco PRs para uma fase de subtracao criaria revisao sem conteudo.

---

## Estrutura de arquivos

**Arquivos deletados nesta fase**

| Arquivo | Motivo |
|---|---|
| `app/hero/globe-scene.tsx` | Cena 3D |
| `app/hero/globe-static.tsx` | Fallback SVG da cena |
| `app/hero/graticule.ts` | Malha do globo |
| `app/hero/projection.ts` e `app/hero/projection.test.ts` | Projecao esferica, so serve ao globo |
| `app/hero/camera-motion.ts` e `app/hero/camera-motion.test.ts` | Movimento de camera 3D |
| `app/hero/scene-colors.ts` | Cores da cena 3D |
| `app/motion/animated-outlet.tsx` | Envelope do `motion` |
| `app/motion/page-transition.tsx` | Substituido pela prop `viewTransition` |
| `app/design/theme.ts` e `app/design/theme.test.ts` | Alternancia de tema |
| `app/components/theme-toggle.tsx` | Botao de alternar tema |

**Arquivos modificados**

| Arquivo | Responsabilidade apos a mudanca |
|---|---|
| `app/hero/hero.tsx` | Titulo, tagline, resposta direta e painel de telemetria. Sem cena |
| `app/hero/capability.ts` e `capability.test.ts` | Uma decisao so: se ha movimento autorizado |
| `app/design/tokens.ts` e `tokens.test.ts` | Um conjunto unico de tokens, com contraste validado |
| `app/design/tokens.css` | Um bloco `:root`, sem seletor de tema |
| `app/root.tsx` | Documento sem script inline de tema |
| `app/layouts/site.tsx` | Navegacao sem botao de tema, links com `viewTransition`, sem `PageTransition` |
| `app/app.css` | Fontes do sistema, guarda de movimento reduzido para View Transitions |
| `app/i18n/dictionary.ts` e os tres `messages/*.ts` | Sem as chaves `theme.*` e `hero.mapLabel` |
| `scripts/check-budget.ts` | Teto de 125 KB |
| `e2e/hero.spec.ts` | Sem os testes da cena |
| `package.json` | Sem `three`, `@react-three/fiber`, `@types/three`, `motion` e as duas fontes |

**Arquivos criados**

| Arquivo | Responsabilidade |
|---|---|
| `e2e/orcamento.spec.ts` | Garante que nenhuma fonte customizada e nenhum chunk de animacao pesada e baixado |
| `CLAUDE.md` | Contrato do projeto. Ja consta no `.gitignore`, entao nao e versionado |

---

## Tarefa 1: recriar o repositorio no GitHub e empurrar o historico

O repositorio `DiorgenesT/diorgenesgeorge.dev` foi deletado. O clone local tem os 45 commits, com 17 nunca empurrados, e a arvore esta limpa. Nada foi perdido, mas sem remote nao ha issue nem PR, e o resto do plano depende disso.

**Arquivos:** nenhum. Esta tarefa e so git e GitHub.

**Interfaces:**
- Consome: nada.
- Produz: o remote `origin` apontando para `https://github.com/DiorgenesT/diorgenesgeorge.dev.git`, e a branch `feature/<numero>-fase-0-fundacao` onde as tarefas 2 a 6 commitam.

- [ ] **Passo 1: confirmar que o repositorio realmente nao existe**

```bash
cd /home/dg/projetos/page-dev
GODEBUG=netdns=cgo gh api repos/DiorgenesT/diorgenesgeorge.dev 2>&1 | head -3
```

Esperado: `gh: Not Found (HTTP 404)`.

Se responder com JSON do repositorio, ele ja existe: pular para o Passo 4.

- [ ] **Passo 2: confirmar que o historico local esta intacto antes de qualquer coisa**

```bash
git status --porcelain | wc -l
git log --oneline | wc -l
```

Esperado: `0` (arvore limpa) e `46` ou `47`, conforme o commit deste plano ja tenha sido feito: sao os 45 commits originais, mais o commit da spec, mais o do plano.

Se a arvore nao estiver limpa, pare e resolva antes de continuar.

- [ ] **Passo 3: criar o repositorio e empurrar**

```bash
GODEBUG=netdns=cgo gh repo create DiorgenesT/diorgenesgeorge.dev \
  --public \
  --description "Portfolio de Diorgenes George. Fanzine em tres idiomas, SSR em Cloudflare Workers." \
  --source . \
  --remote origin \
  --push
```

Esperado: a saida termina confirmando a criacao, e o push envia todos os commits.

- [ ] **Passo 4: verificar que o remote responde e que o historico chegou inteiro**

```bash
GODEBUG=netdns=cgo gh api repos/DiorgenesT/diorgenesgeorge.dev --jq '.full_name'
git ls-remote --heads origin
git status -sb | head -1
```

Esperado: `DiorgenesT/diorgenesgeorge.dev`, uma linha com `refs/heads/main`, e `## main...origin/main` sem `ahead`.

- [ ] **Passo 5: abrir a issue da fase**

```bash
GODEBUG=netdns=cgo gh issue create \
  --title "Fase 0: fundacao do fanzine" \
  --body "Remove o globo 3D, a biblioteca motion, as duas fontes customizadas e o tema claro/escuro. Troca a transicao de rota pela View Transitions API nativa. Ajusta o teto do orcamento para 125 KB. Nenhuma mudanca de identidade visual.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-0-fundacao-fanzine.md"
```

Anote o numero da issue devolvido na URL.

- [ ] **Passo 6: criar a branch da fase**

```bash
git checkout -b feature/<numero>-fase-0-fundacao
git status -sb | head -1
```

Substitua `<numero>` pelo numero da issue do Passo 5.

Esperado: `## feature/<numero>-fase-0-fundacao`.

---

## Tarefa 2: remover o tema claro/escuro

O zine tem um tema so. Sair da alternancia elimina o script inline que roda antes da primeira pintura, um hash de CSP, o botao no cabecalho e tres chaves de dicionario em tres idiomas.

**Arquivos:**
- Deletar: `app/design/theme.ts`, `app/design/theme.test.ts`, `app/components/theme-toggle.tsx`
- Modificar: `app/design/tokens.ts`, `app/design/tokens.test.ts`, `app/design/tokens.css`, `app/root.tsx`, `app/layouts/site.tsx`, `app/i18n/dictionary.ts`, `app/i18n/messages/pt-BR.ts`, `app/i18n/messages/pt-PT.ts`, `app/i18n/messages/en-US.ts`

**Interfaces:**
- Consome: a branch criada na Tarefa 1.
- Produz: `TOKENS` exportado de `app/design/tokens.ts`, do tipo `Record<string, string>`, substituindo `DARK_TOKENS` e `LIGHT_TOKENS`. Nenhuma outra tarefa deste plano importa esse simbolo, mas a Fase 1 vai reescrever os valores dele.

- [ ] **Passo 1: reescrever o teste de tokens para um tema unico**

Substitua o conteudo inteiro de `app/design/tokens.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { TOKENS } from "./tokens";

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

describe("TOKENS", () => {
  it.each(TEXT_PAIRS)(
    "should meet 4.5:1 contrast when rendering %s on %s",
    (fg, bg) => {
      const fgValue = TOKENS[fg];
      const bgValue = TOKENS[bg];
      expect(fgValue, `token ausente: ${fg}`).toBeDefined();
      expect(bgValue, `token ausente: ${bg}`).toBeDefined();
      expect(contrastRatio(fgValue!, bgValue!)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("should meet 3:1 contrast when rendering the live-status signal on bg", () => {
    expect(contrastRatio(TOKENS.signal!, TOKENS.bg!)).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Passo 2: rodar o teste e ver falhar**

```bash
npx vitest run app/design/tokens.test.ts
```

Esperado: FAIL, porque `TOKENS` nao e exportado de `./tokens`.

- [ ] **Passo 3: reescrever os tokens**

Substitua o conteudo inteiro de `app/design/tokens.ts`:

```ts
/**
 * Tema unico. A alternancia claro/escuro saiu junto com a identidade "Papel Tecnico":
 * o fanzine e um so, e um site que se inverte nao e um fanzine, e um aplicativo.
 * Os valores abaixo sao os do tema escuro anterior e serao trocados pela paleta do
 * zine na Fase 1, quando o contraste de cada acento for revalidado por este teste.
 */
export const TOKENS: Record<string, string> = {
  bg: "#0A0908",
  "bg-raised": "#1A1512",
  fg: "#F2EEE9",
  "fg-muted": "#A8A099",
  "fg-subtle": "#857E76",
  accent: "#FFA033",
  "accent-fg": "#17120E",
  signal: "#4BE38A",
};
```

- [ ] **Passo 4: rodar o teste e ver passar**

```bash
npx vitest run app/design/tokens.test.ts
```

Esperado: PASS, 8 testes.

- [ ] **Passo 5: reduzir o CSS de tokens a um bloco so**

Substitua o conteudo inteiro de `app/design/tokens.css`:

```css
:root {
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
```

- [ ] **Passo 6: deletar os arquivos do tema**

```bash
git rm app/design/theme.ts app/design/theme.test.ts app/components/theme-toggle.tsx
```

- [ ] **Passo 7: tirar o script de tema do documento**

Em `app/root.tsx`, remova a linha de import:

```ts
import { THEME_INIT_SCRIPT } from "./design/theme";
```

E remova o bloco inteiro do `<head>`:

```tsx
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
```

O `<head>` fica com `<meta charSet>`, `<meta name="viewport">`, `<Meta />` e `<Links />`, nessa ordem.

- [ ] **Passo 8: tirar o botao de tema do cabecalho**

Em `app/layouts/site.tsx`, remova a linha de import:

```ts
import { ThemeToggle } from "../components/theme-toggle";
```

E troque o bloco:

```tsx
          <div className="ms-auto flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
```

por:

```tsx
          <div className="ms-auto flex items-center gap-3">
            <LocaleSwitcher />
          </div>
```

- [ ] **Passo 9: remover as chaves de tema do contrato de dicionario**

Em `app/i18n/dictionary.ts`, remova estas tres linhas do tipo `Dictionary`:

```ts
  "theme.toggle": string;
  "theme.dark": string;
  "theme.light": string;
```

- [ ] **Passo 10: remover as chaves de tema dos tres idiomas**

Em `app/i18n/messages/pt-BR.ts`, `app/i18n/messages/pt-PT.ts` e `app/i18n/messages/en-US.ts`, remova as tres linhas `"theme.toggle"`, `"theme.dark"` e `"theme.light"` de cada arquivo. Elas estao nas linhas 56 a 58 dos tres.

- [ ] **Passo 11: rodar o portao completo**

```bash
npm run check
```

Esperado: lint, typecheck e vitest verdes. O teste `dictionary.test.ts` continua passando porque a paridade entre idiomas se manteve: as tres chaves sairam dos tres.

- [ ] **Passo 12: commitar**

```bash
git add -A
git commit -m "refactor: remove a alternancia de tema claro e escuro

O fanzine tem um tema so. Sai o script inline que rodava antes da primeira
pintura, e com ele um hash da CSP, mais o botao do cabecalho e tres chaves
de dicionario nos tres idiomas. Os valores dos tokens continuam os mesmos
ate a Fase 1 trocar a paleta."
```

---

## Tarefa 3: remover o globo 3D e as dependencias de three

A cena custa 232 KB gzip em chunk lazy e nao existe no vocabulario do fanzine. O painel de telemetria e o endpoint `/api/edge` **permanecem**: a Fase 2 os reaproveita no carimbo de recepcao. O que sai e so o desenho.

**Arquivos:**
- Deletar: `app/hero/globe-scene.tsx`, `app/hero/globe-static.tsx`, `app/hero/graticule.ts`, `app/hero/projection.ts`, `app/hero/projection.test.ts`, `app/hero/camera-motion.ts`, `app/hero/camera-motion.test.ts`, `app/hero/scene-colors.ts`
- Modificar: `app/hero/capability.ts`, `app/hero/capability.test.ts`, `app/hero/hero.tsx`, `app/i18n/dictionary.ts`, os tres `app/i18n/messages/*.ts`, `e2e/hero.spec.ts`, `package.json`

**Interfaces:**
- Consome: nada da Tarefa 2.
- Produz: `decide(env: Environment): { motion: boolean }` em `app/hero/capability.ts`, e `Environment = { reducedMotion: boolean }`. O campo `scene` deixa de existir. `app/motion/reveal.tsx` ja consome `decide(readEnvironment()).motion` e continua funcionando sem alteracao. A Tarefa 4 tambem depende dessa assinatura.

- [ ] **Passo 1: reescrever o teste de capacidade**

Substitua o conteudo inteiro de `app/hero/capability.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { decide } from "./capability";

describe("decide", () => {
  it("should allow motion when the visitor did not ask for less", () => {
    expect(decide({ reducedMotion: false })).toEqual({ motion: true });
  });

  it("should turn off the motion layer when the visitor asked for less motion", () => {
    expect(decide({ reducedMotion: true })).toEqual({ motion: false });
  });
});
```

- [ ] **Passo 2: rodar o teste e ver falhar**

```bash
npx vitest run app/hero/capability.test.ts
```

Esperado: FAIL. O `decide` atual devolve `{ scene, motion }`, entao `toEqual({ motion: true })` nao casa.

- [ ] **Passo 3: reescrever a capacidade**

Substitua o conteudo inteiro de `app/hero/capability.ts`:

```ts
export type Environment = {
  reducedMotion: boolean;
};

/**
 * Uma decisao so. Movimento reduzido e preferencia declarada e vale para tudo.
 * A deteccao de WebGL e de aparelho fraco saiu com a cena 3D: o que restou de
 * movimento e transform e opacity, que nao pesam o bastante para justificar um portao.
 */
export function decide(env: Environment): { motion: boolean } {
  return { motion: !env.reducedMotion };
}

export function readEnvironment(): Environment {
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  };
}
```

- [ ] **Passo 4: rodar o teste e ver passar**

```bash
npx vitest run app/hero/capability.test.ts
```

Esperado: PASS, 2 testes.

- [ ] **Passo 5: deletar os arquivos da cena**

```bash
git rm app/hero/globe-scene.tsx app/hero/globe-static.tsx app/hero/graticule.ts \
       app/hero/projection.ts app/hero/projection.test.ts \
       app/hero/camera-motion.ts app/hero/camera-motion.test.ts \
       app/hero/scene-colors.ts
```

- [ ] **Passo 6: reescrever o hero sem a cena**

Substitua o conteudo inteiro de `app/hero/hero.tsx`:

```tsx
import { AnswerBlock } from "../components/answer-block";
import { AUTHOR } from "../config/site";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { TelemetryPanel } from "./telemetry-panel";
import { useEdgeTelemetry } from "./telemetry";
import { useEnvironment } from "./use-environment";

export function Hero() {
  const t = getDictionary(useLocale());

  // env e null no servidor e na primeira pintura do cliente: e o que faz os dois
  // concordarem antes de qualquer decisao que dependa do browser.
  const env = useEnvironment();

  const telemetry = useEdgeTelemetry(env !== null);

  return (
    <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <h1 className="font-sans text-5xl font-bold tracking-tight text-balance sm:text-6xl">
          {AUTHOR.name}
        </h1>

        {/* Enfase por peso e cor na mesma familia. Trocar de familia tipografica no
            meio da frase e o tique que mais denuncia pagina montada por maquina. */}
        <p className="mt-6 max-w-2xl text-2xl leading-snug text-fg-muted text-pretty">
          {t["home.taglineLead"]}
        </p>
        {/* Linha propria: inline, a enfase comecava no meio da linha e orfaos de uma
            letra apareciam antes dela. */}
        <p className="mt-2 max-w-2xl text-2xl font-semibold leading-snug text-fg text-pretty">
          {t["home.taglineAccent"]}
        </p>

        <AnswerBlock>{t["home.answer"]}</AnswerBlock>
      </div>

      {/* O painel fica. A Fase 2 troca esta lista por um carimbo de recepcao,
          alimentado pelo mesmo /api/edge. */}
      <TelemetryPanel state={telemetry} />
    </section>
  );
}
```

- [ ] **Passo 7: remover a chave de dicionario que so a cena usava**

Em `app/i18n/dictionary.ts`, remova a linha:

```ts
  "hero.mapLabel": string;
```

E remova a linha `"hero.mapLabel"` de `app/i18n/messages/pt-BR.ts`, `app/i18n/messages/pt-PT.ts` e `app/i18n/messages/en-US.ts`. Ela esta na linha 54 dos tres.

- [ ] **Passo 8: desinstalar as dependencias de 3D**

```bash
npm uninstall three @react-three/fiber @types/three
```

- [ ] **Passo 9: confirmar que nada mais referencia a cena**

```bash
grep -rn "three\|GlobeScene\|GlobeStatic\|graticule\|scene-colors\|camera-motion" \
  app/ workers/ scripts/ --include="*.ts" --include="*.tsx"
```

Esperado: nenhuma linha. Se aparecer algo, remova antes de seguir.

- [ ] **Passo 10: ajustar os testes de ponta a ponta do hero**

Em `e2e/hero.spec.ts`, faca quatro edicoes.

Primeiro, no teste `"should never download the scene or the motion libraries"`, troque o nome e a expressao regular. O `globe-scene` e o `animated-outlet` nao existem mais, entao verificar por eles nao prova nada:

```ts
  test("should never download the motion libraries", async ({ page }) => {
```

```ts
    expect(
      scripts.filter((url) => /gsap|ScrollTrigger/i.test(url)),
    ).toEqual([]);
```

Segundo, apague os dois testes inteiros que verificam o desenho da cena:

- `"should still draw the globe as svg"`, dentro do `describe("movimento reduzido")`
- `"should fall back to svg when webgl is unavailable"`

Terceiro, apague o teste `"should stop spinning the globe once it leaves the viewport"`, o ultimo do arquivo.

Quarto, no teste `"should keep the headline as the largest paint, not the scene"`, troque o nome e remova a ultima asercao, que aponta para um elemento que nao existe mais:

```ts
test("should keep the headline as the largest paint", async ({ page }) => {
```

Remova a linha:

```ts
  expect(tag).not.toBe("CANVAS");
```

- [ ] **Passo 11: rodar o portao**

```bash
npm run check
```

Esperado: lint, typecheck e vitest verdes.

- [ ] **Passo 12: commitar**

```bash
git add -A
git commit -m "perf: remove o globo 3D e as dependencias de three

A cena custava 232 KB gzip em chunk lazy e nao existe no vocabulario do
fanzine. O painel de telemetria e o /api/edge ficam: a Fase 2 os reaproveita
no carimbo de recepcao. Sem a cena, a deteccao de WebGL e de aparelho fraco
perde funcao, e a decisao de capacidade se reduz a movimento autorizado."
```

---

## Tarefa 4: trocar a biblioteca de transicao pela View Transitions API

O chunk `animated-outlet` custa 38,7 KB gzip para um fade com 8px de deslocamento. O navegador faz isso de graca, e o React Router 8 ja expoe o gancho pela prop `viewTransition` do `Link`.

**Arquivos:**
- Deletar: `app/motion/page-transition.tsx`, `app/motion/animated-outlet.tsx`
- Modificar: `app/layouts/site.tsx`, `app/app.css`, `e2e/hero.spec.ts`, `package.json`
- Preservar: `app/motion/reveal.tsx`, que usa GSAP e continua valendo ate a Fase 3 o substituir

**Interfaces:**
- Consome: `decide(env).motion` da Tarefa 3, indiretamente, atraves de `app/motion/reveal.tsx`, que nao muda.
- Produz: nenhum simbolo novo. O componente `PageTransition` deixa de existir e nao deve ser importado por nenhuma tarefa futura.

- [ ] **Passo 1: deletar os dois arquivos de transicao**

```bash
git rm app/motion/page-transition.tsx app/motion/animated-outlet.tsx
```

- [ ] **Passo 2: tirar o envelope de transicao do layout e marcar os links**

Em `app/layouts/site.tsx`, remova a linha de import:

```ts
import { PageTransition } from "../motion/page-transition";
```

Troque o bloco do conteudo:

```tsx
      <div id="conteudo" className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
```

por:

```tsx
      <div id="conteudo" className="flex-1">
        <Outlet />
      </div>
```

Agora marque as navegacoes que devem animar. Adicione `viewTransition` ao link da marca:

```tsx
          <Link
            to={localizedHref("home", locale)}
            viewTransition
            className="font-mono text-sm font-semibold tracking-widest text-accent"
          >
            DG
          </Link>
```

Ao link de cada item do menu:

```tsx
            <Link
              key={key}
              to={localizedHref(key, locale)}
              viewTransition
              className="text-sm text-fg-muted hover:text-fg"
            >
              {label}
            </Link>
```

E ao link do colofao no rodape:

```tsx
          <Link
            to={localizedHref("colophon", locale)}
            viewTransition
            className="ms-auto hover:text-fg"
          >
            {t["nav.colophon"]}
          </Link>
```

- [ ] **Passo 3: garantir que a transicao respeita movimento reduzido**

Em `app/app.css`, dentro do bloco `@media (prefers-reduced-motion: reduce)` que ja existe no fim do arquivo, adicione o seletor dos pseudo elementos de View Transition. O seletor universal `*` nao os alcanca, entao sem esta regra a transicao continuaria animando para quem pediu menos movimento:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* O seletor universal nao alcanca os pseudo elementos de View Transition:
     eles vivem fora da arvore do documento durante a troca de pagina. */
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

- [ ] **Passo 4: desinstalar a biblioteca**

```bash
npm uninstall motion
```

- [ ] **Passo 5: confirmar que nada mais a referencia**

```bash
grep -rn "\"motion\"\|from \"motion\|PageTransition\|animated-outlet" \
  app/ e2e/ scripts/ package.json --include="*.ts" --include="*.tsx" --include="*.json"
```

Esperado: nenhuma linha. A pasta `app/motion/` continua existindo com o `reveal.tsx` dentro, e isso e esperado: o nome da pasta descreve o assunto, nao a biblioteca.

- [ ] **Passo 6: rodar o portao**

```bash
npm run check
```

Esperado: lint, typecheck e vitest verdes.

- [ ] **Passo 7: verificar a transicao no navegador**

```bash
npm run dev
```

Abra `http://localhost:5173/pt-br/`, clique entre os itens do menu e confirme que a troca de pagina tem um esmaecimento curto. Depois ligue movimento reduzido no sistema operacional, recarregue e confirme que a troca passa a ser instantanea. Encerre o servidor com Ctrl+C.

- [ ] **Passo 8: commitar**

```bash
git add -A
git commit -m "perf: troca a biblioteca de transicao pela View Transitions API

O chunk animated-outlet custava 38,7 KB gzip para um esmaecimento com 8px de
deslocamento, que o navegador faz de graca. A prop viewTransition do Link
aciona a API nativa. O seletor universal do bloco de movimento reduzido nao
alcanca os pseudo elementos da transicao, entao a guarda foi escrita a parte."
```

---

## Tarefa 5: remover as fontes customizadas

Duas familias em quatro arquivos CSS de import, com dezenas de arquivos woff e woff2 no build, inclusive subconjuntos cirilicos que este site nunca serve. A display unica do zine entra na Fase 1, subsetada e sob controle.

**Arquivos:**
- Modificar: `app/app.css`, `package.json`
- Criar: `e2e/orcamento.spec.ts`

**Interfaces:**
- Consome: nada das tarefas anteriores.
- Produz: `e2e/orcamento.spec.ts`, arquivo de teste de ponta a ponta que a Fase 1 vai estender quando a display entrar, trocando a expectativa de zero fontes para exatamente uma.

- [ ] **Passo 1: escrever o teste que falha**

Crie `e2e/orcamento.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

/**
 * O orcamento da spec exige zero fonte customizada nesta fase. A Fase 1 troca esta
 * expectativa por exatamente uma, quando a display do zine entrar subsetada.
 */
test("should ship no custom font file", async ({ page }) => {
  const fonts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fonts.push(request.url());
  });

  await page.goto("/pt-br/");
  await page.waitForLoadState("networkidle");

  expect(fonts).toEqual([]);
});
```

- [ ] **Passo 2: rodar o teste e ver falhar**

```bash
npm run build && npx playwright test e2e/orcamento.spec.ts
```

Esperado: FAIL, com a lista de arquivos woff2 do Instrument Sans e do IBM Plex Mono no lugar do array vazio.

- [ ] **Passo 3: tirar as fontes do CSS**

Em `app/app.css`, remova as quatro primeiras linhas:

```css
@import "@fontsource-variable/instrument-sans/index.css";
@import "@fontsource/ibm-plex-mono/400.css";
@import "@fontsource/ibm-plex-mono/500.css";
@import "@fontsource/ibm-plex-mono/600.css";
```

O arquivo passa a comecar em `@import "tailwindcss" source(".");`.

Em seguida, troque as duas primeiras linhas do bloco `@theme inline`:

```css
  --font-sans: "Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

por:

```css
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
```

- [ ] **Passo 4: desinstalar os pacotes de fonte**

```bash
npm uninstall @fontsource-variable/instrument-sans @fontsource/ibm-plex-mono
```

- [ ] **Passo 5: rodar o teste e ver passar**

```bash
npm run build && npx playwright test e2e/orcamento.spec.ts
```

Esperado: PASS.

- [ ] **Passo 6: confirmar que o build nao emite mais arquivo de fonte**

```bash
find build/client/assets -name "*.woff*" | wc -l
```

Esperado: `0`.

- [ ] **Passo 7: rodar o portao**

```bash
npm run check
```

Esperado: lint, typecheck e vitest verdes.

- [ ] **Passo 8: commitar**

```bash
git add -A
git commit -m "perf: remove as duas fontes customizadas

Instrument Sans e IBM Plex Mono saem, e com elas dezenas de arquivos woff e
woff2 no build, inclusive subconjuntos cirilicos que este site nunca serve.
A pilha do sistema assume ate a Fase 1 trazer a display do zine, subsetada e
com font-display optional. O teste novo trava o zero."
```

---

## Tarefa 6: ajustar o orcamento e trazer o contrato do projeto

O teto de 132 KB foi calibrado para um site com globo, biblioteca de animacao e duas fontes. A spec fixa 125 KB, com a justificativa de que publicar os 30 documentos na Fase 4 vai empurrar o critico para perto de 122 KB.

**Arquivos:**
- Modificar: `scripts/check-budget.ts`
- Criar: `CLAUDE.md` (ja consta no `.gitignore`, entao nao entra em commit)

**Interfaces:**
- Consome: o estado do repositorio apos as Tarefas 2 a 5.
- Produz: `CRITICAL_BUDGET_BYTES = 125 * 1024` em `scripts/check-budget.ts`. A Fase 4 le esse valor e, se estourar, recorta o indice de conteudo por rota em vez de eleva-lo.

- [ ] **Passo 1: medir o critico antes de mexer no teto**

```bash
npm run build 2>&1 | tail -25
```

Anote o valor de `TOTAL`. Esperado: em torno de 117.500 bytes, abaixo dos 119.065 medidos antes da fase. A queda vem do tema e da deteccao de ambiente do globo, cerca de 1,5 KB. Se o valor tiver subido, pare e descubra por que antes de continuar.

- [ ] **Passo 2: apertar o teto**

Em `scripts/check-budget.ts`, substitua o bloco de comentario e a constante:

```ts
/**
 * Teto do JS que toda visita paga, gzipado. A cena 3D e as bibliotecas de movimento
 * ficam fora desta conta de propósito: carregam depois do LCP e só para quem as recebe.
 * Foi a ausência deste portão que deixou 34 KB de conteúdo desnecessário passarem na
 * Fase 1 — a home baixava o texto de todas as páginas do site.
 *
 * O teto existe para barrar **regressão**, não publicação. O índice de frontmatter
 * cresce cerca de 800 bytes por documento, e isso é conteúdo legítimo: com 30
 * documentos o crítico fica em ~122 KB. Um vazamento como o da Fase 1 chega de uma vez,
 * em dezenas de KB, e continua sendo pego. Ajustado de 120 para 132 KB em 2026-08-01,
 * quando publicar o quinto case deixou 280 bytes de folga.
 */
const CRITICAL_BUDGET_BYTES = 132 * 1024;
```

por:

```ts
/**
 * Teto do JS que toda visita paga, gzipado. Chunk que carrega depois do LCP e so para
 * quem o recebe fica fora desta conta, por decisao: e o caso do GSAP.
 *
 * O teto existe para barrar regressao, nao publicacao. O indice de frontmatter cresce
 * cerca de 800 bytes por documento, e isso e conteudo legitimo: com os 30 documentos da
 * Fase 4 o critico chega perto de 122 KB. Um vazamento chega de uma vez, em dezenas de
 * KB, e continua sendo pego.
 *
 * Ajustado de 132 para 125 KB em 2026-08-02, na Fase 0 do fanzine, depois que o globo
 * 3D, a biblioteca de transicao e as duas fontes sairam. Se a Fase 4 estourar este
 * valor, a saida nao e eleva-lo: e parar de mandar para a home o indice de todo o site.
 * A home precisa dos tres artigos mais recentes, nao do frontmatter de trinta
 * documentos.
 */
const CRITICAL_BUDGET_BYTES = 125 * 1024;
```

- [ ] **Passo 3: rodar o build e confirmar que o portao passa com o teto novo**

```bash
npm run build 2>&1 | tail -3
```

Esperado: a ultima linha mostra `TOTAL (teto 128000)` com o total abaixo desse valor, e o build conclui sem erro.

- [ ] **Passo 4: trazer o contrato do projeto**

```bash
cp /home/dg/projetos/site-dev/CLAUDE.md /home/dg/projetos/page-dev/CLAUDE.md
```

Agora edite `/home/dg/projetos/page-dev/CLAUDE.md` para refletir a realidade deste repositorio. Quatro trechos precisam mudar:

1. A frase sobre a stack. Onde estiver `React 18, Vite, TypeScript strict, Tailwind CSS v4, GSAP (so ScrollTrigger), Vitest, deploy em Cloudflare Pages`, escreva: `React 19, React Router 8 em modo framework, Vite 8, TypeScript strict, Tailwind CSS v4, GSAP (so ScrollTrigger), Vitest, Playwright, deploy em Cloudflare Workers`.

2. A lista de proibidos. Acrescente `motion (ex Framer Motion)` e `@react-three/fiber` a lista que ja proibe three.js, Lenis e CSS-in-JS de runtime.

3. A arquitetura de pastas. Troque a descricao de `src/` pela deste repositorio: `app/componentes/`, `app/secoes/`, `app/design/`, `app/hooks/`, `app/i18n/`, `app/seo/`, `app/content/`, `app/routes/`, `app/layouts/`, `workers/`, `scripts/`.

4. O orcamento. Troque `JS inicial < 150KB gzip` por `JS critico < 125KB gzip` e `zero fontes customizadas` por `no maximo uma fonte customizada, subsetada, com font-display optional`.

Acrescente ao final, como secao nova:

```markdown
## Estado do projeto

Fusao do site-dev neste repositorio, decidida em 2026-08-02. A spec esta em
`docs/superpowers/specs/2026-08-02-fanzine-design.md` e e a fonte da verdade sobre
identidade, rotas, orcamento e fases. O dominio canonico e diorgenesgeorge.dev.
```

- [ ] **Passo 5: confirmar que o contrato nao vai para o commit**

```bash
git status --porcelain | grep CLAUDE.md | wc -l
```

Esperado: `0`. O `.gitignore` ja lista `CLAUDE.md`. Se aparecer `1`, nao commite: verifique o `.gitignore` antes de seguir.

- [ ] **Passo 6: commitar o ajuste do orcamento**

```bash
git add scripts/check-budget.ts
git commit -m "chore: aperta o teto do JS critico de 132 para 125 KB

O teto anterior foi calibrado para um site com globo 3D, biblioteca de
transicao e duas fontes. Com os tres fora, 125 KB acomoda os 30 documentos
da Fase 4 com folga real e volta a barrar regressao de verdade."
```

---

## Tarefa 7: verificacao final e pull request

**Arquivos:** nenhum. Esta tarefa so verifica e integra.

**Interfaces:**
- Consome: todas as tarefas anteriores.
- Produz: o PR da Fase 0, e a `main` pronta para a Fase 1.

- [ ] **Passo 1: rodar o portao completo do projeto**

```bash
npm run check
```

Esperado: lint, typecheck e vitest verdes, sem aviso.

- [ ] **Passo 2: rodar o build inteiro**

```bash
npm run build
```

Esperado: valida conteudo, gera indice, constroi, gera 404, gera markdown, gera headers e passa no orcamento. A ultima linha mostra o total abaixo de 128000.

- [ ] **Passo 3: rodar os testes de ponta a ponta**

```bash
npm run e2e
```

Esperado: todos verdes, incluindo `e2e/orcamento.spec.ts`, `e2e/seo.spec.ts` e `e2e/navegacao.spec.ts`.

- [ ] **Passo 4: medir a queda no total baixado**

```bash
find build/client/assets -name "*.js" -exec sh -c 'gzip -c "$1" | wc -c' _ {} \; \
  | paste -sd+ | bc
```

Esperado: um total cerca de 270 KB menor que o de antes da fase, que era aproximadamente 460 KB somando todos os chunks. Confirme tambem que nao ha mais chunk de globo nem de transicao:

```bash
ls build/client/assets/ | grep -E "globe|animated-outlet|three" | wc -l
```

Esperado: `0`.

- [ ] **Passo 5: conferir que a identidade visual nao mudou**

```bash
npm run dev
```

Abra `http://localhost:5173/pt-br/` e confirme, uma a uma: o fundo continua escuro, os acentos continuam laranja, o cabecalho tem a marca DG, o menu e o seletor de idioma (sem o botao de tema), o hero mostra titulo, tagline, bloco de resposta e o painel de telemetria (sem o globo), e o rodape continua no lugar. Navegue por `sobre`, `cv`, `servicos`, `contato` e `colofao`. Encerre com Ctrl+C.

Qualquer diferenca alem do globo, do botao de tema e da familia tipografica e um defeito desta fase.

- [ ] **Passo 6: empurrar a branch e abrir o PR**

```bash
git push -u origin HEAD
GODEBUG=netdns=cgo gh pr create \
  --title "Fase 0: fundacao do fanzine" \
  --body "Fecha #<numero>

Subtracao pura, sem mudanca de identidade visual.

- Sai o globo 3D e as dependencias three e @react-three/fiber
- Sai a biblioteca motion, substituida pela View Transitions API nativa
- Saem as duas fontes customizadas, a pilha do sistema assume ate a Fase 1
- Sai a alternancia de tema claro e escuro
- Teto do JS critico apertado de 132 para 125 KB

O painel de telemetria e o /api/edge ficam: a Fase 2 os reaproveita no
carimbo de recepcao.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-0-fundacao-fanzine.md"
```

Substitua `<numero>` pelo numero da issue criada na Tarefa 1.

- [ ] **Passo 7: aguardar o CI e mergear**

```bash
GODEBUG=netdns=cgo gh pr checks --watch
```

Com o CI verde e apos o teste local aprovado pelo usuario, mergear:

```bash
GODEBUG=netdns=cgo gh pr merge --squash --delete-branch
git checkout main && git pull
```

---

## Criterio de aceite da fase

- [ ] O repositorio `DiorgenesT/diorgenesgeorge.dev` existe e tem todo o historico local
- [ ] `npm run check` verde
- [ ] `npm run build` verde, com o orcamento dentro dos 125 KB
- [ ] `npm run e2e` verde
- [ ] Zero arquivo `.woff` ou `.woff2` no build
- [ ] Zero chunk de globo, de three ou de transicao no build
- [ ] O total baixado numa visita caiu cerca de 270 KB
- [ ] `package.json` sem `three`, `@react-three/fiber`, `@types/three`, `motion`, `@fontsource-variable/instrument-sans` e `@fontsource/ibm-plex-mono`
- [ ] A identidade visual continua a atual, menos o globo, o botao de tema e a familia tipografica
- [ ] `CLAUDE.md` presente no repositorio e ausente do controle de versao
