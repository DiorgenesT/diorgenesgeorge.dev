# Fase 1 do fanzine: sistema visual

> **Para agentes executores:** SUB-SKILL OBRIGATORIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para rastreamento.

**Objetivo:** trocar a identidade visual do site pela do zine, em todas as rotas, sem tocar em conteudo, rota, SEO nem movimento.

**Arquitetura:** tres camadas independentes, montadas de baixo para cima. A paleta e as rotacoes deterministas sao funcoes puras testadas em `app/design/`. Os cinco componentes de papel sao UI pura que consome essas funcoes. O layout monta os componentes. Cada camada e testavel sozinha, e nenhuma delas conhece rota ou conteudo.

**Stack:** React 19, React Router 8, Tailwind CSS 4, TypeScript 5.9, Vitest 4, Playwright. Duas dependencias novas de desenvolvimento, aprovadas: `@testing-library/react` e `jsdom`.

**Spec:** `docs/superpowers/specs/2026-08-02-fanzine-design.md`

## Restricoes globais

Valem para toda tarefa deste plano.

- Comentarios, commits, documentos e interface em pt-BR. Identificadores em ingles, como o repositorio ja faz; componentes de vocabulario zine sem traducao natural ficam em pt-BR. Arquivos em kebab-case.
- Sem emojis. Sem travessao e sem meia-risca: usar virgula, dois pontos ou parenteses.
- Conventional Commits em portugues. Nunca adicionar trailer de co-autoria.
- Ao referenciar issue em corpo de PR, usar a palavra-chave em ingles (`Closes #N`). O GitHub nao reconhece `Fecha #N`, e a issue da Fase 0 teve de ser fechada a mao.
- TypeScript `strict: true`. Proibido `any` e `ts-ignore`.
- Todo comando `gh` precisa do prefixo `GODEBUG=netdns=cgo` neste ambiente.
- **Determinismo visual:** rotacao, jitter e desalinhamento vem sempre de tabela fixa indexada. `Math.random` em render e proibido, e ha teste que verifica isso.
- **Piso de 13px na Special Elite.** Ela nunca recebe texto longo: so rotulo, metadado, etiqueta, carimbo e rodape.
- **O amarelo fita nunca carrega texto.** Contraste medido de 1,58:1 sobre o papel. Ele so existe como preenchimento, sempre com tinta por cima (10,74:1).
- Portao ao fim de cada tarefa: `npm run check` verde.
- Portao ao fim da fase: `npm run build` e `npm run e2e` verdes, orcamento dentro do teto.

## Fluxo de git

Uma issue, uma branch `feature/<numero>-fase-1-sistema-visual`, commits atomicos por tarefa, um PR ao final.

---

## Estrutura de arquivos

**Criados**

| Arquivo | Responsabilidade |
|---|---|
| `app/design/rotacao.ts` | Tabelas fixas de rotacao e jitter, e os acessores indexados |
| `app/design/rotacao.test.ts` | Prova o determinismo: mesmo indice, mesmo valor, sempre |
| `app/design/fontes.css` | Os dois `@font-face`, com `font-display: optional` |
| `app/design/fontes/anton-latin-400.woff2` | Arquivo da fonte, versionado |
| `app/design/fontes/special-elite-latin-400.woff2` | Arquivo da fonte, versionado |
| `app/design/fontes/LICENSE-anton.txt` | Licenca OFL |
| `app/design/fontes/LICENSE-special-elite.txt` | Licenca OFL |
| `app/design/tipografia.test.ts` | Trava o piso de 13px varrendo o codigo-fonte |
| `app/components/adesivo.tsx` e `.test.tsx` | Recorte colado, com sombra dura |
| `app/components/fita-adesiva.tsx` e `.test.tsx` | Tira de fita crepe |
| `app/components/papel-rasgado.tsx` e `.test.tsx` | Borda rasgada em SVG inline |
| `app/components/carimbo.tsx` e `.test.tsx` | Carimbo de tinta vermelha |
| `app/components/nota-de-resgate.tsx` e `.test.tsx` | Letras recortadas de revista |
| `public/textura/granulacao.svg` | Tile de 64x64, 356 bytes |

**Modificados**

| Arquivo | Mudanca |
|---|---|
| `app/design/tokens.ts` e `tokens.test.ts` | Paleta do zine, sai `signal`, entra `fita` |
| `app/design/tokens.css` | Valores novos, `color-scheme: light` |
| `app/app.css` | Importa fontes, troca `--color-signal` por `--color-fita`, utilitario de granulacao |
| `app/layouts/site.tsx` | Cabecalho, navegacao e rodape na linguagem do zine |
| `vitest.config.ts` | Passa a incluir `*.test.tsx` |
| `package.json` | Duas devDependencies novas |

---

## Tarefa 0: issue e branch

**Arquivos:** nenhum.

**Interfaces:**
- Consome: a `main` com a Fase 0 mergeada.
- Produz: o numero da issue, usado no nome da branch e no corpo do PR da Tarefa 7.

- [ ] **Passo 1: confirmar que a main esta limpa e atualizada**

```bash
cd /home/dg/projetos/page-dev
git checkout main && GODEBUG=netdns=cgo git pull
git status --porcelain | grep -v CLAUDE.md | wc -l
```

Esperado: `0`. O `CLAUDE.md` e ignorado pelo git e pode aparecer como nao rastreado sem problema.

- [ ] **Passo 2: abrir a issue**

```bash
GODEBUG=netdns=cgo gh issue create \
  --title "Fase 1: sistema visual do fanzine" \
  --body "Troca a identidade visual pela do zine em todas as rotas: paleta de papel e tinta com contraste medido, tabelas deterministas de rotacao, os cinco componentes de papel, as duas fontes versionadas e a granulacao de fotocopia. Nao toca em conteudo, rota, SEO nem movimento.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-1-sistema-visual.md"
```

Anote o numero devolvido na URL.

- [ ] **Passo 3: criar a branch**

```bash
git checkout -b feature/<numero>-fase-1-sistema-visual
git status -sb | head -1
```

Esperado: `## feature/<numero>-fase-1-sistema-visual`.

---

## Tarefa 1: paleta do zine

A paleta ja foi medida contra a WCAG 2.1 AA antes de entrar no plano. Os numeros abaixo sao resultado, nao estimativa.

| Token | Valor | Contraste |
|---|---|---|
| `bg` | `#f2ede4` | fundo |
| `bg-raised` | `#faf7f1` | fundo de bloco de codigo |
| `fg` | `#0a0a0a` | 16,98:1 sobre `bg` |
| `fg-muted` | `#57504a` | 6,79:1 sobre `bg`, 7,41:1 sobre `bg-raised` |
| `fg-subtle` | `#645c55` | 5,62:1 sobre `bg` |
| `accent` | `#c81d25` | 4,92:1 sobre `bg` |
| `accent-fg` | `#ffffff` | 5,74:1 sobre `accent` |
| `fita` | `#e8b923` | 1,58:1 sobre `bg`, **reprova**. So preenchimento, com `fg` por cima em 10,74:1 |

O token `signal` sai: esta declarado em `app.css` e nunca e usado por nenhum componente.

**Arquivos:**
- Modificar: `app/design/tokens.test.ts`, `app/design/tokens.ts`, `app/design/tokens.css`, `app/app.css`

**Interfaces:**
- Consome: nada.
- Produz: `TOKENS` em `app/design/tokens.ts`, com as chaves `bg`, `bg-raised`, `fg`, `fg-muted`, `fg-subtle`, `accent`, `accent-fg`, `fita`. As variaveis CSS de mesmo nome, prefixadas com `--`. As classes Tailwind `bg-fita` e `text-fita` passam a existir; `bg-signal` deixa de existir.

- [ ] **Passo 1: escrever o teste da paleta nova**

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
  // A fita e preenchimento, nunca cor de texto. O que este par garante e o inverso:
  // que o texto posto **sobre** a fita continue legivel, e ele e sempre a tinta.
  ["fg", "fita"],
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

  it("should keep the paper lighter than the ink, because the zine is printed, not screened", () => {
    expect(contrastRatio(TOKENS.fg!, TOKENS.bg!)).toBeGreaterThan(15);
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

```bash
npx vitest run app/design/tokens.test.ts
```

Esperado: FAIL. O par `["fg", "fita"]` quebra porque o token `fita` ainda nao existe, e o teste do papel claro falha porque o `bg` atual e quase preto.

- [ ] **Passo 3: escrever a paleta**

Substitua o conteudo inteiro de `app/design/tokens.ts`:

```ts
/**
 * Paleta do zine, um tema so. Preto e branco de alto contraste como base, com dois
 * acentos: o vermelho punk carrega texto, o amarelo fita crepe nunca carrega.
 *
 * Cada valor entrou aqui depois de medido, nao antes. O teste ao lado e a autoridade
 * sobre estes numeros; este comentario so registra por que o amarelo e diferente dos
 * outros: sobre o papel ele da 1,58:1, longe dos 4,5:1 exigidos, entao ele existe como
 * preenchimento e recebe tinta por cima, o que da 10,74:1.
 */
export const TOKENS: Record<string, string> = {
  bg: "#f2ede4",
  "bg-raised": "#faf7f1",
  fg: "#0a0a0a",
  "fg-muted": "#57504a",
  "fg-subtle": "#645c55",
  accent: "#c81d25",
  "accent-fg": "#ffffff",
  fita: "#e8b923",
};
```

- [ ] **Passo 4: rodar e ver passar**

```bash
npx vitest run app/design/tokens.test.ts
```

Esperado: PASS, 9 testes.

- [ ] **Passo 5: espelhar em CSS**

Substitua o conteudo inteiro de `app/design/tokens.css`:

```css
:root {
  color-scheme: light;
  --bg: #f2ede4;
  --bg-raised: #faf7f1;
  --fg: #0a0a0a;
  --fg-muted: #57504a;
  --fg-subtle: #645c55;
  --accent: #c81d25;
  --accent-fg: #ffffff;
  --fita: #e8b923;
  --hairline: rgb(10 10 10 / 0.14);
}
```

- [ ] **Passo 6: trocar o token morto no tema do Tailwind**

Em `app/app.css`, dentro de `@theme inline`, troque a linha:

```css
  --color-signal: var(--signal);
```

por:

```css
  --color-fita: var(--fita);
```

- [ ] **Passo 7: rodar o portao**

```bash
npm run check
```

Esperado: verde. Se o typecheck reclamar de `bg-signal` em algum componente, o token estava em uso e o levantamento errou: pare e reavalie.

- [ ] **Passo 8: commitar**

```bash
git add -A
git commit -m "feat: troca a paleta pelo preto e branco do zine

Papel, tinta, vermelho punk e amarelo fita crepe, com o contraste de cada par
medido antes de entrar. O amarelo reprova sobre o papel em 1,58:1, entao ele
deixa de ser candidato a cor de texto e passa a existir so como preenchimento,
com tinta por cima. O token signal sai: estava declarado e nunca foi usado."
```

---

## Tarefa 2: rotacoes deterministas

A regra de identidade do projeto: o caos e projetado. Rotacao e jitter vem de tabela fixa indexada, nunca de `Math.random` em render, para o site parecer feito a mao e se comportar de forma estavel entre servidor e cliente. Num site com SSR isso nao e so estetica: rotacao aleatoria produziria HTML diferente no servidor e no cliente, e quebraria a hidratacao.

**Arquivos:**
- Criar: `app/design/rotacao.ts`, `app/design/rotacao.test.ts`

**Interfaces:**
- Consome: nada.
- Produz: `obterRotacao(indice: number): number`, `obterJitter(indice: number): Jitter` e `type Jitter = { x: number; y: number }`, todos exportados de `app/design/rotacao.ts`. Os cinco componentes da Tarefa 4 consomem exatamente estas assinaturas.

- [ ] **Passo 1: escrever o teste**

Crie `app/design/rotacao.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { JITTER, obterJitter, obterRotacao, ROTACOES } from "./rotacao";

describe("obterRotacao", () => {
  it("should return the same angle for the same index, always", () => {
    expect(obterRotacao(3)).toBe(obterRotacao(3));
    expect(obterRotacao(3)).toBe(obterRotacao(3 + ROTACOES.length));
  });

  it("should wrap around instead of running off the table", () => {
    expect(obterRotacao(ROTACOES.length)).toBe(obterRotacao(0));
  });

  it("should accept a negative index, because a caller may count backwards", () => {
    expect(obterRotacao(-1)).toBe(obterRotacao(ROTACOES.length - 1));
  });

  it("should keep every angle small enough to read as handmade, not as broken", () => {
    for (const angulo of ROTACOES) {
      expect(Math.abs(angulo)).toBeLessThanOrEqual(6);
    }
  });

  it("should offer more than one angle, or nothing looks collaged", () => {
    expect(new Set(ROTACOES).size).toBeGreaterThan(4);
  });
});

describe("obterJitter", () => {
  it("should return the same offset for the same index, always", () => {
    expect(obterJitter(2)).toEqual(obterJitter(2));
    expect(obterJitter(2)).toEqual(obterJitter(2 + JITTER.length));
  });

  it("should wrap around instead of running off the table", () => {
    expect(obterJitter(JITTER.length)).toEqual(obterJitter(0));
  });

  it("should accept a negative index", () => {
    expect(obterJitter(-1)).toEqual(obterJitter(JITTER.length - 1));
  });

  it("should keep every offset within a few pixels", () => {
    for (const { x, y } of JITTER) {
      expect(Math.abs(x)).toBeLessThanOrEqual(5);
      expect(Math.abs(y)).toBeLessThanOrEqual(5);
    }
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

```bash
npx vitest run app/design/rotacao.test.ts
```

Esperado: FAIL, o modulo `./rotacao` nao existe.

- [ ] **Passo 3: escrever o modulo**

Crie `app/design/rotacao.ts`:

```ts
/**
 * O caos visual do zine e projetado, nao sorteado. Estas tabelas sao fixas e indexadas
 * pelo elemento, o que da tres garantias: o site parece feito a mao, se comporta igual
 * a cada render, e o HTML do servidor bate com o do cliente. Rotacao sorteada em render
 * quebraria a hidratacao, alem de fazer a pagina tremer a cada visita.
 */
export const ROTACOES = [
  -3, 2.5, -1.5, 4, -2.5, 1, 3.5, -4, 0.5, 2, -5, 5.5,
] as const;

export function obterRotacao(indice: number): number {
  const posicao = normalizar(indice, ROTACOES.length);
  const valor = ROTACOES[posicao];
  // O modulo acima ja garante a faixa; a guarda existe so para o verificador de tipos.
  if (valor === undefined) {
    throw new Error(`indice de rotacao fora da faixa: ${posicao}`);
  }
  return valor;
}

export type Jitter = { x: number; y: number };

/** Deslocamento em pixels, mesmo principio das rotacoes. */
export const JITTER: readonly Jitter[] = [
  { x: -2, y: 1 },
  { x: 3, y: -2 },
  { x: -1, y: 3 },
  { x: 2, y: 2 },
  { x: -3, y: -1 },
  { x: 1, y: -3 },
  { x: 4, y: 0 },
  { x: -4, y: 2 },
] as const;

export function obterJitter(indice: number): Jitter {
  const posicao = normalizar(indice, JITTER.length);
  const valor = JITTER[posicao];
  if (valor === undefined) {
    throw new Error(`indice de jitter fora da faixa: ${posicao}`);
  }
  return valor;
}

/** Modulo que trata indice negativo, que o operador `%` de JavaScript nao trata. */
function normalizar(indice: number, tamanho: number): number {
  return ((indice % tamanho) + tamanho) % tamanho;
}
```

- [ ] **Passo 4: rodar e ver passar**

```bash
npx vitest run app/design/rotacao.test.ts
```

Esperado: PASS, 9 testes.

- [ ] **Passo 5: commitar**

```bash
git add app/design/rotacao.ts app/design/rotacao.test.ts
git commit -m "feat: tabelas deterministas de rotacao e jitter

O caos do zine e projetado. Tabela fixa indexada pelo elemento, nunca sorteio
em render: alem de fazer a pagina tremer a cada visita, rotacao aleatoria
produziria HTML diferente no servidor e no cliente e quebraria a hidratacao."
```

---

## Tarefa 3: infraestrutura de teste de componente

O vitest deste repositorio roda em `environment: "node"` e so inclui `*.test.ts`. Os componentes da Tarefa 4 precisam renderizar.

A escolha aqui e por duas dependencias, nao tres: `@testing-library/jest-dom` foi dispensado escrevendo as asercoes com os matchers nativos do vitest, o que tambem evita mexer em `setupFiles` e evita carregar matchers de DOM nos testes que rodam em node.

O ambiente e escolhido por arquivo, com o comentario `// @vitest-environment jsdom` no topo. Isso mantem os 250 testes de logica rodando em node, que e mais rapido, e evita configuracao de projeto que muda entre versoes do vitest.

**Arquivos:**
- Modificar: `vitest.config.ts`, `package.json`

**Interfaces:**
- Consome: nada.
- Produz: a capacidade de escrever `app/**/*.test.tsx`. Todo arquivo desses precisa comecar com `// @vitest-environment jsdom` na primeira linha.

- [ ] **Passo 1: instalar as duas dependencias**

```bash
npm i -D @testing-library/react jsdom
```

- [ ] **Passo 2: incluir os testes de componente**

Em `vitest.config.ts`, troque o bloco `include`:

```ts
    include: [
      "app/**/*.test.ts",
      "scripts/**/*.test.ts",
      "workers/**/*.test.ts",
    ],
```

por:

```ts
    include: [
      "app/**/*.test.ts",
      // Componente renderiza, entao roda em jsdom. O ambiente e declarado por arquivo,
      // com `// @vitest-environment jsdom` no topo, para os testes de logica seguirem
      // em node, que e mais rapido.
      "app/**/*.test.tsx",
      "scripts/**/*.test.ts",
      "workers/**/*.test.ts",
    ],
```

- [ ] **Passo 3: provar que a infraestrutura funciona antes de depender dela**

Crie `app/components/ambiente-de-teste.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

/**
 * Guarda de infraestrutura, nao de produto: se este arquivo falhar, o problema esta no
 * vitest ou no jsdom, e nao no componente que o autor estava escrevendo.
 */
describe("ambiente de teste de componente", () => {
  it("should render a react element into a dom", () => {
    render(<p>fanzine</p>);

    expect(screen.getByText("fanzine")).not.toBeNull();
  });
});
```

- [ ] **Passo 4: rodar e ver passar**

```bash
npx vitest run app/components/ambiente-de-teste.test.tsx
```

Esperado: PASS, 1 teste.

- [ ] **Passo 5: rodar o portao**

```bash
npm run check
```

Esperado: verde, com um teste a mais que antes.

- [ ] **Passo 6: commitar**

```bash
git add -A
git commit -m "test: habilita teste de componente com jsdom

O vitest rodava so em node e so incluia .test.ts. Duas dependencias de
desenvolvimento, nao tres: jest-dom foi dispensado usando os matchers nativos
do vitest, o que evita mexer em setupFiles e carregar matchers de DOM nos
testes de logica. O ambiente e declarado por arquivo, entao os testes em node
seguem rapidos."
```

---

## Tarefa 4: os cinco componentes de papel

UI pura, sem estado, sem rota, sem conteudo. Cada um consome `obterRotacao` da Tarefa 2 e os tokens da Tarefa 1.

**Arquivos:**
- Criar: `app/components/adesivo.tsx`, `fita-adesiva.tsx`, `papel-rasgado.tsx`, `carimbo.tsx`, `nota-de-resgate.tsx`, e o `.test.tsx` de cada um
- Deletar: `app/components/ambiente-de-teste.test.tsx`, que ja cumpriu o papel na Tarefa 3

**Interfaces:**
- Consome: `obterRotacao`, `obterJitter` e `Jitter` de `app/design/rotacao.ts`. Os tokens `bg`, `bg-raised`, `fg`, `accent` e `fita` como classes Tailwind.
- Produz: `Adesivo`, `FitaAdesiva`, `PapelRasgado`, `Carimbo` e `NotaDeResgate`. As assinaturas estao em cada passo. A Tarefa 5 monta o layout com eles.

- [ ] **Passo 1: escrever o teste do adesivo**

Crie `app/components/adesivo.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Adesivo } from "./adesivo";

describe("Adesivo", () => {
  it("should render what it was given", () => {
    render(<Adesivo indice={0}>Python</Adesivo>);

    expect(screen.getByText("Python")).not.toBeNull();
  });

  it("should rotate, because a sticker pressed by hand never lands straight", () => {
    render(<Adesivo indice={2}>Python</Adesivo>);

    expect(screen.getByText("Python").style.transform).toMatch(/rotate\(/);
  });

  it("should give the same index the same angle across separate renders", () => {
    const primeiro = render(<Adesivo indice={5}>A</Adesivo>);
    const anguloUm = screen.getByText("A").style.transform;
    primeiro.unmount();

    render(<Adesivo indice={5}>A</Adesivo>);

    expect(screen.getByText("A").style.transform).toBe(anguloUm);
  });

  it("should give different indexes different angles, or the collage looks printed", () => {
    render(
      <>
        <Adesivo indice={0}>um</Adesivo>
        <Adesivo indice={1}>dois</Adesivo>
      </>,
    );

    expect(screen.getByText("um").style.transform).not.toBe(
      screen.getByText("dois").style.transform,
    );
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

```bash
npx vitest run app/components/adesivo.test.tsx
```

Esperado: FAIL, o modulo `./adesivo` nao existe.

- [ ] **Passo 3: escrever o adesivo**

Crie `app/components/adesivo.tsx`:

```tsx
import type { ReactNode } from "react";
import { obterRotacao } from "../design/rotacao";

/**
 * Recorte colado na pagina. A sombra e dura e sem desfoque de proposito: sombra suave
 * pertence a interface de aplicativo, sombra dura pertence a papel sobre papel.
 */
export function Adesivo({
  indice,
  children,
}: {
  indice: number;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-block border-2 border-fg bg-bg-raised px-3 py-1 font-semibold shadow-[3px_3px_0_var(--fg)]"
      style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Passo 4: rodar e ver passar**

```bash
npx vitest run app/components/adesivo.test.tsx
```

Esperado: PASS, 4 testes.

- [ ] **Passo 5: escrever o teste da fita adesiva**

Crie `app/components/fita-adesiva.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FitaAdesiva } from "./fita-adesiva";

describe("FitaAdesiva", () => {
  it("should render what it was given", () => {
    render(<FitaAdesiva indice={0}>Sobre</FitaAdesiva>);

    expect(screen.getByText("Sobre")).not.toBeNull();
  });

  it("should rotate, because tape is torn by hand", () => {
    render(<FitaAdesiva indice={1}>Sobre</FitaAdesiva>);

    expect(screen.getByText("Sobre").style.transform).toMatch(/rotate\(/);
  });

  it("should put ink on the tape, never the tape colour on the page", () => {
    render(<FitaAdesiva indice={0}>Sobre</FitaAdesiva>);
    const classe = screen.getByText("Sobre").className;

    // O amarelo da 1,58:1 sobre o papel: ele so pode ser fundo, e o texto so pode
    // ser a tinta. Esta asercao e o que impede a regra de virar recomendacao.
    expect(classe).toContain("bg-fita");
    expect(classe).toContain("text-fg");
  });
});
```

- [ ] **Passo 6: rodar e ver falhar, depois escrever a fita**

```bash
npx vitest run app/components/fita-adesiva.test.tsx
```

Esperado: FAIL. Em seguida crie `app/components/fita-adesiva.tsx`:

```tsx
import type { ReactNode } from "react";
import { obterRotacao } from "../design/rotacao";

/**
 * Tira de fita crepe. O amarelo nunca carrega texto por conta propria: sobre o papel
 * ele da 1,58:1. Aqui ele e fundo, e o texto e sempre a tinta, o que da 10,74:1.
 */
export function FitaAdesiva({
  indice,
  children,
}: {
  indice: number;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-block bg-fita px-4 py-1 font-bold text-fg"
      style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
    >
      {children}
    </span>
  );
}
```

Rode de novo e espere PASS, 3 testes.

- [ ] **Passo 7: escrever o teste do papel rasgado**

Crie `app/components/papel-rasgado.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PapelRasgado } from "./papel-rasgado";

describe("PapelRasgado", () => {
  it("should hide itself from assistive technology, because it carries no meaning", () => {
    const { container } = render(<PapelRasgado />);
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
  });

  it("should accept a class, so the caller decides colour and height", () => {
    const { container } = render(<PapelRasgado className="h-4 text-accent" />);

    expect(container.querySelector("svg")?.className.baseVal).toContain(
      "text-accent",
    );
  });

  it("should stretch instead of keeping its ratio, because it is an edge and not a drawing", () => {
    const { container } = render(<PapelRasgado />);

    expect(container.querySelector("svg")?.getAttribute("preserveAspectRatio")).toBe(
      "none",
    );
  });
});
```

- [ ] **Passo 8: rodar e ver falhar, depois escrever o papel rasgado**

```bash
npx vitest run app/components/papel-rasgado.test.tsx
```

Esperado: FAIL. Em seguida crie `app/components/papel-rasgado.tsx`:

```tsx
/**
 * Borda rasgada em SVG inline, reutilizavel e sem custo de imagem por elemento.
 * `preserveAspectRatio: none` porque isto e uma borda que se estica, nao um desenho
 * que precisa manter proporcao.
 */
export function PapelRasgado({
  className = "h-3 w-full text-bg",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className={`block ${className}`}
    >
      <path
        d="M0,20 L20,8 L40,24 L60,4 L80,18 L100,10 L120,26 L140,6 L160,20 L180,12 L200,22 L220,8 L240,18 L260,4 L280,24 L300,10 L320,20 L340,6 L360,22 L380,12 L400,20 L400,40 L0,40 Z"
        fill="currentColor"
      />
    </svg>
  );
}
```

Rode de novo e espere PASS, 3 testes.

- [ ] **Passo 9: escrever o teste do carimbo**

Crie `app/components/carimbo.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Carimbo } from "./carimbo";

describe("Carimbo", () => {
  it("should render what it was given", () => {
    render(<Carimbo indice={0}>Betim, MG</Carimbo>);

    expect(screen.getByText("Betim, MG")).not.toBeNull();
  });

  it("should rotate, because a stamp is pressed by hand", () => {
    render(<Carimbo indice={3}>Betim, MG</Carimbo>);

    expect(screen.getByText("Betim, MG").style.transform).toMatch(/rotate\(/);
  });

  it("should never drop below the 13px floor of the typewriter face", () => {
    render(<Carimbo indice={0}>Betim, MG</Carimbo>);
    const classe = screen.getByText("Betim, MG").className;

    expect(classe).toContain("text-meta");
    expect(classe).not.toContain("text-xs");
  });
});
```

- [ ] **Passo 10: rodar e ver falhar, depois escrever o carimbo**

```bash
npx vitest run app/components/carimbo.test.tsx
```

Esperado: FAIL. Em seguida crie `app/components/carimbo.tsx`:

```tsx
import type { ReactNode } from "react";
import { obterRotacao } from "../design/rotacao";

/**
 * Carimbo de tinta vermelha. Usa a datilografada, entao respeita o piso de 13px:
 * `text-meta` existe exatamente para isso, e `text-xs` (12px) e proibido aqui.
 */
export function Carimbo({
  indice,
  children,
}: {
  indice: number;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-block border-2 border-accent px-2 py-0.5 font-mono text-meta uppercase tracking-widest text-accent"
      style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
    >
      {children}
    </span>
  );
}
```

Rode de novo e espere PASS, 3 testes. O utilitario `text-meta` e criado na Tarefa 5; ate la o teste passa porque verifica a classe, e o Tailwind so a resolve em build.

- [ ] **Passo 11: escrever o teste da nota de resgate**

Crie `app/components/nota-de-resgate.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotaDeResgate } from "./nota-de-resgate";

describe("NotaDeResgate", () => {
  it("should read as one word to a screen reader, not as loose letters", () => {
    render(<NotaDeResgate texto="DG" />);

    // O texto real vive no rotulo: letra a letra, um leitor de tela soletraria.
    expect(screen.getByLabelText("DG")).not.toBeNull();
  });

  it("should hide every cut letter from assistive technology", () => {
    const { container } = render(<NotaDeResgate texto="DG" />);
    const letras = container.querySelectorAll("span[aria-hidden='true']");

    expect(letras.length).toBeGreaterThanOrEqual(2);
  });

  it("should give each letter its own angle, because each was cut from a different page", () => {
    const { container } = render(<NotaDeResgate texto="DG" />);
    const letras = [...container.querySelectorAll("span[aria-hidden='true']")];
    const angulos = letras.map((letra) => (letra as HTMLElement).style.transform);

    expect(new Set(angulos).size).toBeGreaterThan(1);
  });

  it("should keep a space as a gap, never as a cut letter", () => {
    const { container } = render(<NotaDeResgate texto="a b" />);
    const comTexto = [...container.querySelectorAll("span[aria-hidden='true']")].filter(
      (letra) => letra.textContent !== "",
    );

    expect(comTexto).toHaveLength(2);
  });
});
```

- [ ] **Passo 12: rodar e ver falhar, depois escrever a nota de resgate**

```bash
npx vitest run app/components/nota-de-resgate.test.tsx
```

Esperado: FAIL. Em seguida crie `app/components/nota-de-resgate.tsx`:

```tsx
import { obterJitter, obterRotacao } from "../design/rotacao";

/**
 * Letras recortadas de revista, uma a uma. O texto real vive no `aria-label`: sem isso,
 * um leitor de tela soletraria a palavra letra por letra, porque cada uma e um elemento.
 */
export function NotaDeResgate({ texto }: { texto: string }) {
  return (
    <span role="img" aria-label={texto} className="inline-flex gap-1">
      {[...texto].map((letra, indice) => {
        if (letra.trim() === "") {
          return (
            <span
              key={`espaco-${indice}`}
              aria-hidden="true"
              className="inline-block w-2"
            />
          );
        }

        const jitter = obterJitter(indice);

        return (
          <span
            key={`${letra}-${indice}`}
            aria-hidden="true"
            className="inline-block bg-fg px-1.5 font-black text-bg"
            style={{
              transform: `rotate(${obterRotacao(indice)}deg) translate(${jitter.x}px, ${jitter.y}px)`,
            }}
          >
            {letra}
          </span>
        );
      })}
    </span>
  );
}
```

Rode de novo e espere PASS, 4 testes.

- [ ] **Passo 13: remover a guarda de infraestrutura e rodar o portao**

```bash
git rm app/components/ambiente-de-teste.test.tsx
npm run check
```

Esperado: verde, com 17 testes de componente a mais que no inicio da tarefa.

- [ ] **Passo 14: commitar**

```bash
git add -A
git commit -m "feat: os cinco componentes de papel do zine

Adesivo, fita adesiva, papel rasgado, carimbo e nota de resgate. UI pura, sem
estado nem rota, consumindo as tabelas deterministas de rotacao.

Duas regras da spec deixam de depender de disciplina e passam a ser teste: a
fita so aceita tinta por cima, porque o amarelo da 1,58:1 sobre o papel, e o
carimbo nunca desce do piso de 13px da datilografada."
```

---

## Tarefa 5: as duas fontes e a granulacao

As fontes sao versionadas no repositorio, nao instaladas como dependencia. Sao dois arquivos estaticos que nunca mudam, e versiona-los da controle total sobre `font-display`, que os pacotes do fontsource fixam em `swap`. A spec exige `optional`, que e mais forte: `swap` ainda troca a fonte depois de pintar, o que desloca texto; `optional` desiste em vez de deslocar.

**Arquivos:**
- Criar: `app/design/fontes.css`, `app/design/fontes/anton-latin-400.woff2`, `app/design/fontes/special-elite-latin-400.woff2`, `app/design/fontes/LICENSE-anton.txt`, `app/design/fontes/LICENSE-special-elite.txt`, `app/design/tipografia.test.ts`, `public/textura/granulacao.svg`
- Modificar: `app/app.css`
- Atualizar: `e2e/orcamento.spec.ts`

**Interfaces:**
- Consome: nada das tarefas anteriores.
- Produz: os utilitarios Tailwind `font-display` (Anton), `font-mono` (Special Elite), `text-meta` (13px) e `textura-granulada`. O `Carimbo` da Tarefa 4 ja usa `font-mono` e `text-meta`.

- [ ] **Passo 1: trazer os arquivos das fontes**

```bash
cd /tmp && rm -rf fontes-fanzine && mkdir fontes-fanzine && cd fontes-fanzine
npm init -y >/dev/null 2>&1
npm i @fontsource/anton @fontsource/special-elite

cd /home/dg/projetos/page-dev
mkdir -p app/design/fontes
cp /tmp/fontes-fanzine/node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2 \
   app/design/fontes/anton-latin-400.woff2
cp /tmp/fontes-fanzine/node_modules/@fontsource/special-elite/files/special-elite-latin-400-normal.woff2 \
   app/design/fontes/special-elite-latin-400.woff2
cp /tmp/fontes-fanzine/node_modules/@fontsource/anton/LICENSE \
   app/design/fontes/LICENSE-anton.txt
cp /tmp/fontes-fanzine/node_modules/@fontsource/special-elite/LICENSE \
   app/design/fontes/LICENSE-special-elite.txt
rm -rf /tmp/fontes-fanzine
```

- [ ] **Passo 2: conferir o peso contra o teto da spec**

```bash
stat -c "%s %n" app/design/fontes/*.woff2
```

Esperado: `18612` para a Anton e `53296` para a Special Elite, somando 71.908 contra o teto de 75.000 da spec.

- [ ] **Passo 3: declarar as fontes**

Crie `app/design/fontes.css`:

```css
/*
 * font-display: optional, e nao swap. A diferenca importa: swap pinta com a fonte do
 * sistema e troca quando a customizada chega, o que desloca texto ja lido e conta como
 * CLS. optional desiste da troca se a fonte nao chegou a tempo, entao o visitante em
 * rede ruim le na fonte do sistema aquele carregamento inteiro, sem nada pular.
 *
 * Os arquivos sao versionados em vez de instalados: sao dois binarios que nunca mudam,
 * e os pacotes do fontsource fixam font-display em swap, que e o que nao queremos.
 * Licencas OFL ao lado dos arquivos.
 */
@font-face {
  font-family: "Anton";
  font-style: normal;
  font-weight: 400;
  font-display: optional;
  src: url("./fontes/anton-latin-400.woff2") format("woff2");
}

@font-face {
  font-family: "Special Elite";
  font-style: normal;
  font-weight: 400;
  font-display: optional;
  src: url("./fontes/special-elite-latin-400.woff2") format("woff2");
}
```

- [ ] **Passo 4: trazer a granulacao**

```bash
mkdir -p public/textura
cp /home/dg/projetos/site-dev/public/textura/granulacao.svg public/textura/granulacao.svg
stat -c "%s %n" public/textura/granulacao.svg
```

Esperado: `356`, muito abaixo do limite de 8 KB da spec.

- [ ] **Passo 5: ligar tudo no CSS**

Em `app/app.css`, troque a primeira linha:

```css
@import "tailwindcss" source(".");
```

por:

```css
@import "./design/fontes.css";
@import "tailwindcss" source(".");
```

Em seguida, dentro de `@theme inline`, troque as duas linhas de familia:

```css
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
```

por:

```css
  /* Tres papeis sem sobreposicao: cartaz, legenda datilografada e leitura. */
  --font-display: "Anton", Impact, "Haettenschweiler", sans-serif;
  --font-mono: "Special Elite", ui-monospace, Courier, monospace;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;

  /* Piso da datilografada. Medido no navegador: em 11,5px ela desmonta. */
  --text-meta: 0.8125rem;
  --text-meta--line-height: 1.45;
```

Por fim, acrescente ao final do arquivo:

```css
/*
 * Granulacao de fotocopia: um tile de 64x64 com 356 bytes, repetido, em multiply.
 * Nunca uma imagem de textura em tela cheia.
 */
@utility textura-granulada {
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image: url("/textura/granulacao.svg");
    background-repeat: repeat;
    mix-blend-mode: multiply;
  }
}
```

- [ ] **Passo 6: escrever o teste que trava o piso de 13px**

Crie `app/design/tipografia.test.ts`:

```ts
import { globSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A regra da spec: a Special Elite (`font-mono`) nunca desce de 13px, porque em 11,5px
 * ela desmonta e leva junto o alvo de acessibilidade. Uma regra que depende de alguem
 * lembrar nao e uma regra, entao ela e varrida no codigo-fonte.
 *
 * `text-xs` do Tailwind vale 12px e `text-sm` vale 14px; nao ha degrau de 13px por
 * padrao, e por isso `text-meta` existe.
 */
const PEQUENO_DEMAIS =
  /\btext-(xs|\[(?:[0-9]|1[0-2])(?:\.\d+)?px\]|\[0\.[0-7]\d*rem\])/;

function arquivosDeUi(): string[] {
  return globSync("app/**/*.tsx").filter((caminho) => !caminho.endsWith(".test.tsx"));
}

describe("piso de 13px da datilografada", () => {
  it("should never put the typewriter face below 13px", () => {
    const infratores = arquivosDeUi().filter((caminho) => {
      const fonte = readFileSync(caminho, "utf8");
      return [...fonte.matchAll(/className=\{?["'`]([^"'`]*)["'`]/g)].some(
        ([, classes]) =>
          (classes ?? "").includes("font-mono") && PEQUENO_DEMAIS.test(classes ?? ""),
      );
    });

    expect(infratores).toEqual([]);
  });

  it("should have something to scan, or the guard is worthless", () => {
    expect(arquivosDeUi().length).toBeGreaterThan(5);
  });
});
```

- [ ] **Passo 7: rodar o teste de tipografia**

```bash
npx vitest run app/design/tipografia.test.ts
```

Esperado: PASS, 2 testes. Se falhar apontando um arquivo, ele tem `font-mono` junto de um tamanho abaixo de 13px: troque o tamanho por `text-meta`.

- [ ] **Passo 8: atualizar o teste de orcamento de fontes**

Em `e2e/orcamento.spec.ts`, substitua o teste inteiro:

```ts
import { expect, test } from "@playwright/test";

/** Teto da spec para as duas fontes somadas, em bytes. */
const TETO_DE_FONTES = 75_000;

test("should ship exactly the two fonts the spec allows", async ({ page }) => {
  const fontes: { url: string; bytes: number }[] = [];

  page.on("response", async (response) => {
    if (response.request().resourceType() !== "font") return;
    const corpo = await response.body().catch(() => null);
    if (corpo) fontes.push({ url: response.url(), bytes: corpo.length });
  });

  await page.goto("/pt-br/");
  await page.waitForLoadState("networkidle");

  expect(fontes.map((fonte) => fonte.url).sort()).toHaveLength(2);
  expect(fontes.every((fonte) => fonte.url.endsWith(".woff2"))).toBe(true);

  const total = fontes.reduce((soma, fonte) => soma + fonte.bytes, 0);
  expect(total).toBeLessThanOrEqual(TETO_DE_FONTES);
});

test("should never fetch a font from another origin", async ({ page }) => {
  const externas: string[] = [];

  page.on("request", (request) => {
    if (request.resourceType() !== "font") return;
    if (!request.url().startsWith("http://localhost")) externas.push(request.url());
  });

  await page.goto("/pt-br/");
  await page.waitForLoadState("networkidle");

  expect(externas).toEqual([]);
});
```

- [ ] **Passo 9: construir e rodar os testes de orcamento**

```bash
npm run build && npx playwright test e2e/orcamento.spec.ts
```

Esperado: PASS, 2 testes.

Se o primeiro falhar por trazer zero fontes, o `font-display: optional` desistiu de baixar por o texto nao estar visivel no momento certo. Nesse caso, o teste deve rolar a pagina antes de medir, e nao afrouxar a asercao.

- [ ] **Passo 10: rodar o portao**

```bash
npm run check
```

Esperado: verde.

- [ ] **Passo 11: commitar**

```bash
git add -A
git commit -m "feat: as duas fontes do zine e a granulacao de fotocopia

Anton no cartaz e Special Elite na legenda datilografada, versionadas no
repositorio com as licencas OFL ao lado. Versionar em vez de instalar da
controle sobre font-display: os pacotes do fontsource fixam swap, e a spec
exige optional, que desiste da troca em vez de deslocar texto ja pintado.

O piso de 13px vira teste que varre o codigo-fonte, e o teste de orcamento
passa a exigir exatamente duas fontes woff2, de origem propria, somando no
maximo 75.000 bytes.

A granulacao e um tile de 64x64 com 356 bytes, repetido em multiply."
```

---

## Tarefa 6: o layout de fanzine

Ate aqui nada mudou de aparencia nas rotas: os componentes existem mas ninguem os usa. Esta tarefa monta o layout.

**Arquivos:**
- Modificar: `app/layouts/site.tsx`

**Interfaces:**
- Consome: `Adesivo`, `FitaAdesiva`, `PapelRasgado` e `NotaDeResgate` da Tarefa 4, e os utilitarios da Tarefa 5.
- Produz: o layout que todas as nove rotas herdam. A Fase 2 troca o miolo da home; este cabecalho e rodape permanecem.

- [ ] **Passo 1: reescrever o layout**

Em `app/layouts/site.tsx`, troque o `return` inteiro por:

```tsx
  return (
    <div className="textura-granulada flex min-h-dvh flex-col bg-bg text-fg">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-fg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {t["a11y.skipToContent"]}
      </a>

      <header className="relative z-2 border-b-2 border-fg">
        <nav
          aria-label={t["nav.home"]}
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-5"
        >
          <Link to={localizedHref("home", locale)} viewTransition>
            <NotaDeResgate texto="DG" />
          </Link>

          {links.map(({ key, label }, indice) => (
            <Link
              key={key}
              to={localizedHref(key, locale)}
              viewTransition
              className="font-mono text-meta uppercase tracking-widest text-fg-muted hover:text-accent"
              style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
            >
              {label}
            </Link>
          ))}

          <div className="ms-auto flex items-center gap-3">
            <LocaleSwitcher />
          </div>
        </nav>
        <PapelRasgado className="h-3 w-full text-bg" />
      </header>

      <div id="conteudo" className="relative z-2 flex-1">
        <Outlet />
      </div>

      <footer className="relative z-2 border-t-2 border-fg">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-8 font-mono text-meta text-fg-subtle">
          <span>{t["footer.builtWith"]}</span>
          <Link
            to={localizedHref("colophon", locale)}
            viewTransition
            className="ms-auto hover:text-accent"
          >
            {t["nav.colophon"]}
          </Link>
        </div>
      </footer>
    </div>
  );
```

E acrescente os dois imports no topo do arquivo:

```ts
import { NotaDeResgate } from "../components/nota-de-resgate";
import { PapelRasgado } from "../components/papel-rasgado";
import { obterRotacao } from "../design/rotacao";
```

O `z-2` no cabecalho, no conteudo e no rodape existe porque a granulacao aplica um `::after` com `z-index: 1` sobre a pagina inteira: sem isso, os links ficariam abaixo do veu e deixariam de receber clique.

- [ ] **Passo 2: rodar o portao**

```bash
npm run check
```

Esperado: verde, incluindo o teste de tipografia da Tarefa 5, que agora tem `font-mono` de verdade para varrer.

- [ ] **Passo 3: conferir no navegador**

```bash
npm run dev
```

Abra a URL que o vite imprimir. Confirme, um a um: fundo de papel claro, tinta preta, marca DG em letras recortadas, itens do menu levemente tortos e em datilografada, borda rasgada abaixo do cabecalho, granulacao visivel mas discreta, e **todo link continua clicavel**. Navegue por `sobre`, `cv`, `servicos`, `contato` e `colofao`. Encerre com Ctrl+C.

- [ ] **Passo 4: commitar**

```bash
git add -A
git commit -m "feat: o layout ganha a linguagem do fanzine

Marca em letras recortadas, menu torto em datilografada, borda rasgada sob o
cabecalho e granulacao de fotocopia sobre a pagina. As nove rotas herdam.

O empilhamento e explicito: a granulacao e um veu em z-index 1 sobre a pagina
inteira, entao cabecalho, conteudo e rodape sobem para z-index 2, ou os links
deixariam de receber clique."
```

---

## Tarefa 7: verificacao e pull request

**Arquivos:** nenhum.

- [ ] **Passo 1: portao completo**

```bash
npm run check && npm run build && npm run e2e
```

Esperado: tudo verde. O `e2e/acessibilidade.spec.ts` varre todas as rotas pre-renderizadas com o axe: e ele que prova que o contraste medido na Tarefa 1 sobreviveu a aplicacao.

- [ ] **Passo 2: conferir o orcamento**

```bash
npm run build 2>&1 | tail -3
stat -c "%s %n" build/client/assets/*.woff2
```

Esperado: JS critico abaixo de 128.000, e exatamente dois arquivos woff2 somando 71.908 bytes.

- [ ] **Passo 3: abrir a issue e o PR**

A issue foi aberta no inicio da fase. Empurre e abra o PR:

```bash
git push -u origin HEAD
GODEBUG=netdns=cgo gh pr create \
  --title "Fase 1: sistema visual do fanzine" \
  --body "Closes #<numero>

Troca a identidade visual pela do zine, sem tocar em conteudo, rota, SEO nem
movimento.

- Paleta de papel e tinta, com o contraste de cada par medido antes de entrar
- Tabelas deterministas de rotacao e jitter
- Os cinco componentes de papel, com teste de componente habilitado
- Anton e Special Elite versionadas, com font-display optional
- Granulacao de fotocopia em tile de 356 bytes
- O layout das nove rotas na linguagem do fanzine

Duas regras da spec deixaram de depender de disciplina e viraram teste: o
amarelo fita nunca carrega texto, e a datilografada nunca desce de 13px.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-1-sistema-visual.md"
```

Note a palavra-chave em ingles: `Closes`, e nao `Fecha`. O GitHub nao reconhece a forma em portugues, e foi por isso que a issue da Fase 0 precisou ser fechada a mao.

- [ ] **Passo 4: aguardar o CI e mergear**

```bash
GODEBUG=netdns=cgo gh pr checks --watch
```

Com o CI verde e apos o teste local aprovado pelo usuario:

```bash
GODEBUG=netdns=cgo gh pr merge --squash --delete-branch
git checkout main && git pull
```

---

## Criterio de aceite da fase

- [ ] As nove rotas renderizam na identidade zine
- [ ] `npm run check`, `npm run build` e `npm run e2e` verdes
- [ ] Acessibilidade sem violacao do axe em todas as rotas pre-renderizadas
- [ ] Contraste de todo par de texto em 4,5:1, verificado por teste e nao presumido
- [ ] O amarelo fita nao aparece como cor de texto em lugar nenhum
- [ ] Nenhum `font-mono` abaixo de 13px, verificado por varredura do codigo-fonte
- [ ] Exatamente duas fontes woff2, de origem propria, somando no maximo 75.000 bytes
- [ ] JS critico abaixo de 125 KB
- [ ] Nenhuma rotacao vem de `Math.random`: todas saem de tabela indexada
- [ ] Nada de conteudo, rota, SEO ou movimento foi tocado nesta fase

## Adiado de proposito

Dois itens que a spec associa a esta fase e que ficam para depois, com motivo:

- **`IconesRedesSociais`**, o sexto componente do site-dev. A rota de contato deste repositorio hoje oferece um link de texto para o WhatsApp e nao usa icone nenhum. Portar o componente agora criaria codigo sem consumidor. Ele entra junto com a reescrita da rota de contato.
- **Sumario e numeracao de pagina.** A spec descreve cada rota como uma pagina numerada do fanzine. A numeracao exige decidir a ordem editorial das nove rotas, que e uma decisao de conteudo e nao de sistema visual, e a Fase 4 e quem define essa ordem. Nesta fase a navegacao ja funciona como sumario; o numero entra depois, sem retrabalho, porque e so um adorno no cabecalho de cada rota.
