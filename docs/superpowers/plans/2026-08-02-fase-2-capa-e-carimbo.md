# Fase 2 do fanzine: a capa e o carimbo de recepcao

> **Para agentes executores:** SUB-SKILL OBRIGATORIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para rastreamento.

**Objetivo:** transformar a home na capa de um fanzine e trocar o painel de telemetria de seis linhas pelo carimbo de recepcao, que e o elemento vivo do site.

**Arquitetura:** o dado nao muda. `workers/api/edge.ts`, `app/hero/telemetry.ts` e `app/hero/distance.ts` ficam intactos: o que muda e a apresentacao. A lista de rotulo e valor vira uma linha unica carimbada em tinta vermelha, e a decisao de qual texto sai continua num modulo puro e testado, separado da renderizacao, como ja era.

**Stack:** nada novo. Os cinco componentes de papel da Fase 1 e as duas fontes ja existem.

**Spec:** `docs/superpowers/specs/2026-08-02-fanzine-design.md`

## Restricoes globais

- Comentarios, commits, documentos e interface em pt-BR. Sem emojis. Sem travessao e sem meia-risca.
- Conventional Commits em portugues. Nunca adicionar trailer de co-autoria. Fechar issue com `Closes #N`, em ingles.
- Todo comando `gh` precisa do prefixo `GODEBUG=netdns=cgo`.
- **Verificar codigo de saida separado do texto impresso.** `npm run check 2>&1 | tail` mascara falha, porque o cano zera o codigo de saida. Usar `npm run check >/dev/null 2>&1; echo $?`.
- Piso de 13px na Special Elite, travado por `scripts/tipografia.test.ts`. O amarelo fita nunca carrega texto.
- Rotacao vem sempre de `obterRotacao`, nunca de `Math.random`.
- Toda string visivel nova entra nos tres idiomas, ou `dictionary.test.ts` reprova.

## Orcamento desta fase

| Metrica | Limite |
|---|---|
| JS critico | 125 KB (teto duro 128.000 bytes; hoje em 120.448) |
| LCP | menor que 2.0s, e o elemento continua sendo o `h1` |
| CLS | menor que 0.05 |
| Acessibilidade | axe sem violacao nas 59 paginas |

**O ponto de atencao desta fase e o CLS.** O carimbo chega depois do primeiro desenho, com dado que so existe no cliente. Se ele aparecer empurrando o que esta abaixo, o CLS estoura. A solucao no plano e reservar o espaco desde o servidor.

## Fluxo de git

Uma issue, uma branch `feature/<numero>-fase-2-capa-e-carimbo`, commits atomicos, um PR.

---

## Estrutura de arquivos

**Criados**

| Arquivo | Responsabilidade |
|---|---|
| `app/hero/carimbo-texto.ts` | Decide o que o carimbo diz em cada estado. Funcao pura |
| `app/hero/carimbo-texto.test.ts` | Trava as invariantes: nunca um zero, nunca posicao inventada |
| `app/hero/carimbo-de-recepcao.tsx` | Renderiza o carimbo, com espaco reservado |
| `app/hero/carimbo-de-recepcao.test.tsx` | Prova o espaco reservado e a degradacao silenciosa |

**Modificados**

| Arquivo | Mudanca |
|---|---|
| `app/hero/hero.tsx` | Vira a capa: cabecalho de edicao, titulo de cartaz, carimbo |
| `app/routes/home.tsx` | Sumario recortado e faixa de prova na linguagem do zine |
| `app/components/proof-strip.tsx` | Numeros grandes em Anton, entre bordas rasgadas |
| `app/i18n/dictionary.ts` e os tres `messages/*.ts` | Chaves do carimbo e do cabecalho de edicao |
| `e2e/hero.spec.ts` | Mesmos comportamentos, alvo novo |

**Deletados**

| Arquivo | Motivo |
|---|---|
| `app/hero/telemetry-panel.tsx` | Substituido pelo carimbo |
| `app/hero/describe-state.ts` e `describe-state.test.ts` | A lista de rotulo e valor deixa de existir; as invariantes migram para `carimbo-texto.test.ts` |

---

## Tarefa 0: issue e branch

- [ ] **Passo 1: partir da main limpa**

```bash
cd /home/dg/projetos/page-dev
git checkout main && GODEBUG=netdns=cgo git pull
git status --porcelain | grep -v CLAUDE.md | wc -l
```

Esperado: `0`.

- [ ] **Passo 2: abrir a issue e a branch**

```bash
GODEBUG=netdns=cgo gh issue create \
  --title "Fase 2: a capa e o carimbo de recepcao" \
  --body "A home vira capa de fanzine e o painel de telemetria de seis linhas vira o carimbo de recepcao, o elemento vivo do site. O dado nao muda: /api/edge e telemetry.ts ficam intactos.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-2-capa-e-carimbo.md"

git checkout -b feature/<numero>-fase-2-capa-e-carimbo
```

---

## Tarefa 1: o texto do carimbo

O carimbo diz uma coisa so, em ate tres linhas: de onde a copia veio, por onde passou e quanto demorou. A decisao de qual texto sai fica num modulo puro, testavel sem DOM, como `describe-state.ts` ja fazia.

**Arquivos:** criar `app/hero/carimbo-texto.ts` e `app/hero/carimbo-texto.test.ts`

**Interfaces:**
- Consome: `TelemetryState` de `./telemetry`, `distanceKm` de `./distance`, `Dictionary` e `Locale`.
- Produz:

```ts
export type TextoDoCarimbo = { titulo: string | null; linhas: string[] };
export function textoDoCarimbo(
  state: TelemetryState,
  locale: Locale,
  t: Dictionary,
): TextoDoCarimbo | null;
```

Devolve `null` enquanto nao houver o que carimbar. O `titulo` e `null` quando nao ha lugar: "Esta copia chegou em" seguido de nada seria texto quebrado, e o carimbo entao mostra so as linhas tecnicas. A Tarefa 3 consome exatamente esta assinatura.

- [ ] **Passo 1: escrever o teste**

Crie `app/hero/carimbo-texto.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { textoDoCarimbo } from "./carimbo-texto";
import type { TelemetryState } from "./telemetry";
import { ptBR } from "../i18n/messages/pt-BR";

const PRONTO: TelemetryState = {
  status: "ready",
  rttMs: 18,
  data: {
    visitor: {
      city: "Betim",
      region: "Minas Gerais",
      country: "BR",
      lat: -19.9678,
      lon: -44.1983,
    },
    colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
    httpProtocol: "HTTP/3",
    tlsVersion: "TLSv1.3",
  },
};

describe("textoDoCarimbo", () => {
  it("should stamp nothing while there is nothing to stamp", () => {
    for (const status of ["idle", "loading", "failed"] as const) {
      expect(textoDoCarimbo({ status }, "pt-BR", ptBR)).toBeNull();
    }
  });

  it("should name the city and the datacenter that served the page", () => {
    const carimbo = textoDoCarimbo(PRONTO, "pt-BR", ptBR);

    expect(carimbo?.linhas.join(" ")).toContain("Betim");
    expect(carimbo?.linhas.join(" ")).toContain("GIG");
  });

  it("should report the round trip it measured", () => {
    expect(textoDoCarimbo(PRONTO, "pt-BR", ptBR)?.linhas.join(" ")).toContain(
      "18 ms",
    );
  });

  it("should never invent a distance when the datacenter is unknown", () => {
    const semColo: TelemetryState = {
      ...PRONTO,
      data: { ...PRONTO.data, colo: null },
    };
    const texto = textoDoCarimbo(semColo, "pt-BR", ptBR)?.linhas.join(" ") ?? "";

    expect(texto).toContain("Betim");
    expect(texto).not.toContain("km");
  });

  it("should never invent a distance when the visitor has no coordinates", () => {
    const semCoordenada: TelemetryState = {
      ...PRONTO,
      data: {
        ...PRONTO.data,
        visitor: { city: "Betim", country: "BR" },
      },
    };

    expect(
      textoDoCarimbo(semCoordenada, "pt-BR", ptBR)?.linhas.join(" ") ?? "",
    ).not.toContain("km");
  });

  it("should never print a zero, because a zero reads as a real measurement", () => {
    const semNada: TelemetryState = {
      status: "ready",
      rttMs: 18,
      data: { visitor: {}, colo: null },
    };
    const carimbo = textoDoCarimbo(semNada, "pt-BR", ptBR);

    expect(carimbo?.linhas.join(" ") ?? "").not.toMatch(/\b0\s*(km|ms)\b/);
  });

  it("should still stamp the round trip when the location is unknown", () => {
    const semLugar: TelemetryState = {
      status: "ready",
      rttMs: 42,
      data: { visitor: {}, colo: null },
    };

    expect(textoDoCarimbo(semLugar, "pt-BR", ptBR)?.linhas.join(" ")).toContain(
      "42 ms",
    );
  });

  it("should drop the heading when there is no place to name", () => {
    const semLugar: TelemetryState = {
      status: "ready",
      rttMs: 42,
      data: { visitor: {}, colo: null },
    };

    // "Esta cópia chegou em" seguido de nada é texto quebrado.
    expect(textoDoCarimbo(semLugar, "pt-BR", ptBR)?.titulo).toBeNull();
  });

  it("should keep the heading when there is a place", () => {
    expect(textoDoCarimbo(PRONTO, "pt-BR", ptBR)?.titulo).not.toBeNull();
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

```bash
npx vitest run app/hero/carimbo-texto.test.ts
```

Esperado: FAIL, o modulo nao existe.

- [ ] **Passo 3: escrever o modulo**

Crie `app/hero/carimbo-texto.ts`:

```ts
import type { Locale } from "../i18n/config";
import type { Dictionary } from "../i18n/dictionary";
import { formatNumber } from "../i18n/format";
import { distanceKm } from "./distance";
import type { TelemetryState } from "./telemetry";

export type TextoDoCarimbo = { titulo: string; linhas: string[] };

/**
 * O que o carimbo diz, separado de como ele e desenhado, para poder ser testado sem DOM.
 *
 * Duas regras herdadas do painel que ele substitui, e que continuam valendo. Primeira:
 * nada de zero. Um "0 km" na tela e indistinguivel de uma medicao de verdade, entao o
 * dado ausente simplesmente nao vira linha. Segunda: distancia so existe quando os dois
 * pontos existem; sem coordenada do visitante ou sem datacenter conhecido, nao ha o que
 * medir, e inventar seria mentir com aparencia de precisao.
 */
export function textoDoCarimbo(
  state: TelemetryState,
  locale: Locale,
  t: Dictionary,
): TextoDoCarimbo | null {
  if (state.status !== "ready") return null;

  const { visitor, colo } = state.data;
  const linhas: string[] = [];

  const lugar = [visitor.city, visitor.country].filter(Boolean).join(", ");
  if (lugar !== "") linhas.push(lugar);

  if (colo !== null) {
    const podeMedir = visitor.lat !== undefined && visitor.lon !== undefined;
    const distancia = podeMedir
      ? ` ${formatNumber(
          locale,
          Math.round(
            distanceKm(
              { lat: visitor.lat as number, lon: visitor.lon as number },
              { lat: colo.lat, lon: colo.lon },
            ),
          ),
        )} km`
      : "";

    linhas.push(`${t["hero.servedBy"]} ${colo.code}${distancia}`);
  }

  linhas.push(`${formatNumber(locale, state.rttMs)} ms`);

  if (state.data.httpProtocol !== undefined) {
    linhas.push(state.data.httpProtocol);
  }

  // Sem lugar, o titulo sai: "Esta copia chegou em" seguido de nada e texto quebrado.
  return { titulo: lugar === "" ? null : t["hero.stamp"], linhas };
}
```

- [ ] **Passo 4: acrescentar a chave nova nos tres idiomas**

Em `app/i18n/dictionary.ts`, acrescente ao tipo `Dictionary`, logo apos `"hero.needsJs"`:

```ts
  "hero.stamp": string;
  "home.masthead": string;
```

Em `app/i18n/messages/pt-BR.ts`, apos a linha de `"hero.needsJs"`:

```ts
  "hero.stamp": "Esta cópia chegou em",
  "home.masthead": "Edição 01 · Betim, MG",
```

Em `app/i18n/messages/pt-PT.ts`:

```ts
  "hero.stamp": "Esta cópia chegou a",
  "home.masthead": "Edição 01 · Betim, Brasil",
```

Em `app/i18n/messages/en-US.ts`:

```ts
  "hero.stamp": "This copy arrived in",
  "home.masthead": "Issue 01 · Betim, Brazil",
```

- [ ] **Passo 5: rodar e ver passar**

```bash
npx vitest run app/hero/carimbo-texto.test.ts app/i18n/dictionary.test.ts
```

Esperado: PASS nos dois arquivos. O teste de dicionario prova que as duas chaves entraram nos tres idiomas.

- [ ] **Passo 6: commitar**

```bash
git add app/hero/carimbo-texto.ts app/hero/carimbo-texto.test.ts app/i18n/
git commit -m "feat: o texto do carimbo de recepcao

Decide o que o carimbo diz em cada estado, separado de como ele e desenhado,
para poder ser testado sem DOM. Herda as duas regras do painel que ele vai
substituir: nunca imprimir zero, porque zero na tela e indistinguivel de uma
medicao de verdade, e nunca calcular distancia sem os dois pontos."
```

---

## Tarefa 2: o carimbo, com espaco reservado

O componente. O ponto critico e o CLS: o carimbo so existe depois que o cliente busca `/api/edge`, e se ele aparecer empurrando o que esta abaixo, o layout salta.

**Arquivos:** criar `app/hero/carimbo-de-recepcao.tsx` e `app/hero/carimbo-de-recepcao.test.tsx`

**Interfaces:**
- Consome: `textoDoCarimbo` da Tarefa 1, `Carimbo` de `../components/carimbo`.
- Produz: `<CarimboDeRecepcao state={telemetry} />`, consumido pela Tarefa 3.

- [ ] **Passo 1: escrever o teste**

Crie `app/hero/carimbo-de-recepcao.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CarimboDeRecepcao } from "./carimbo-de-recepcao";
import type { TelemetryState } from "./telemetry";

afterEach(cleanup);

vi.mock("../i18n/use-locale", () => ({ useLocale: () => "pt-BR" }));

const PRONTO: TelemetryState = {
  status: "ready",
  rttMs: 18,
  data: {
    visitor: { city: "Betim", country: "BR", lat: -19.9678, lon: -44.1983 },
    colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
    httpProtocol: "HTTP/3",
  },
};

describe("CarimboDeRecepcao", () => {
  it("should reserve its space before there is anything to stamp", () => {
    const { container } = render(<CarimboDeRecepcao state={{ status: "loading" }} />);

    // O invólucro existe mesmo vazio: é ele que impede o layout de saltar quando
    // o dado chega depois do primeiro desenho.
    expect(container.querySelector("[data-carimbo]")).not.toBeNull();
  });

  it("should stamp nothing visible while it has nothing to say", () => {
    render(<CarimboDeRecepcao state={{ status: "failed" }} />);

    expect(screen.queryByText(/GIG/)).toBeNull();
  });

  it("should stamp what the edge reported", () => {
    render(<CarimboDeRecepcao state={PRONTO} />);

    expect(screen.getByText(/Betim, BR/)).not.toBeNull();
    expect(screen.getByText(/GIG/)).not.toBeNull();
  });

  it("should announce itself politely, because it arrives after the page is read", () => {
    const { container } = render(<CarimboDeRecepcao state={PRONTO} />);

    expect(
      container.querySelector("[data-carimbo]")?.getAttribute("aria-live"),
    ).toBe("polite");
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**

```bash
npx vitest run app/hero/carimbo-de-recepcao.test.tsx
```

Esperado: FAIL, o modulo nao existe.

- [ ] **Passo 3: escrever o componente**

Crie `app/hero/carimbo-de-recepcao.tsx`:

```tsx
import { Carimbo } from "../components/carimbo";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { textoDoCarimbo } from "./carimbo-texto";
import type { TelemetryState } from "./telemetry";

/**
 * O elemento vivo da capa: a pagina carimba de onde a copia veio, como uma marca postal.
 *
 * `min-h` no involucro e o que separa esta implementacao de um salto de layout. O dado
 * so existe depois que o cliente busca /api/edge, entao o espaco e reservado desde o
 * servidor e o carimbo cai dentro dele. Sem isso, todo visitante veria a pagina pular
 * uma vez, e o CLS medido seria o dobro do orcamento.
 *
 * Falha e silencio: sem dado, o involucro fica vazio e ninguem percebe que houve
 * medicao. Melhor um carimbo ausente do que um carimbo pela metade.
 */
export function CarimboDeRecepcao({ state }: { state: TelemetryState }) {
  const locale = useLocale();
  const t = getDictionary(locale);
  const carimbo = textoDoCarimbo(state, locale, t);

  return (
    <div
      data-carimbo
      aria-live="polite"
      className="mt-10 flex min-h-36 items-start"
    >
      {carimbo === null ? null : (
        <Carimbo indice={7}>
          {carimbo.titulo === null ? null : (
            <span className="block normal-case tracking-normal">
              {carimbo.titulo}
            </span>
          )}
          {carimbo.linhas.map((linha) => (
            <span key={linha} className="block">
              {linha}
            </span>
          ))}
        </Carimbo>
      )}
    </div>
  );
}
```

- [ ] **Passo 4: rodar e ver passar**

```bash
npx vitest run app/hero/carimbo-de-recepcao.test.tsx
```

Esperado: PASS, 4 testes.

- [ ] **Passo 5: commitar**

```bash
git add app/hero/carimbo-de-recepcao.tsx app/hero/carimbo-de-recepcao.test.tsx
git commit -m "feat: o carimbo de recepcao, com espaco reservado

O involucro reserva altura desde o servidor. O dado so existe depois que o
cliente busca /api/edge, e sem espaco reservado toda visita veria a pagina
saltar uma vez quando o carimbo cai. Falha e silencio: sem dado o involucro
fica vazio, porque carimbo pela metade e pior que carimbo ausente."
```

---

## Tarefa 3: a capa

O hero vira capa de fanzine, e o painel de seis linhas sai.

**Arquivos:**
- Modificar: `app/hero/hero.tsx`
- Deletar: `app/hero/telemetry-panel.tsx`, `app/hero/describe-state.ts`, `app/hero/describe-state.test.ts`

**Interfaces:**
- Consome: `CarimboDeRecepcao` da Tarefa 2, `FitaAdesiva` e `PapelRasgado` da Fase 1.
- Produz: nenhum simbolo novo. `Hero` mantem a assinatura sem props.

- [ ] **Passo 1: reescrever o hero**

Substitua o conteudo inteiro de `app/hero/hero.tsx`:

```tsx
import { AnswerBlock } from "../components/answer-block";
import { FitaAdesiva } from "../components/fita-adesiva";
import { PapelRasgado } from "../components/papel-rasgado";
import { AUTHOR } from "../config/site";
import { getDictionary } from "../i18n/dictionary";
import { useLocale } from "../i18n/use-locale";
import { CarimboDeRecepcao } from "./carimbo-de-recepcao";
import { useEdgeTelemetry } from "./telemetry";
import { useEnvironment } from "./use-environment";

export function Hero() {
  const t = getDictionary(useLocale());

  // env é null no servidor e na primeira pintura do cliente: é o que faz os dois
  // concordarem antes de qualquer decisão que dependa do browser.
  const env = useEnvironment();

  const telemetry = useEdgeTelemetry(env !== null);

  return (
    <section className="relative">
      {/* A fita é decoração e não carrega texto: o amarelo dá 1,58:1 sobre o papel. */}
      <span
        aria-hidden="true"
        className="absolute -left-10 -top-6 hidden h-7 w-36 bg-fita opacity-90 sm:block"
        style={{ transform: "rotate(-14deg)" }}
      />

      <p className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
        {t["home.masthead"]}
      </p>

      {/* O h1 é o elemento de LCP, e é por isso que ele não depende de nada que
          chegue depois: nem de fonte, que carrega em optional, nem de dado. */}
      <h1 className="mt-3 text-6xl leading-[0.92] text-balance sm:text-7xl lg:text-8xl">
        {AUTHOR.name}
      </h1>

      <PapelRasgado className="mt-4 h-3 w-full text-bg" />

      <div className="mt-8 max-w-2xl">
        <p className="font-sans text-2xl leading-snug text-fg-muted text-pretty">
          {t["home.taglineLead"]}
        </p>
        <p className="mt-2 font-sans text-2xl font-semibold leading-snug text-pretty">
          <FitaAdesiva indice={2}>{t["home.taglineAccent"]}</FitaAdesiva>
        </p>
      </div>

      <AnswerBlock>{t["home.answer"]}</AnswerBlock>

      <CarimboDeRecepcao state={telemetry} />
    </section>
  );
}
```

- [ ] **Passo 2: deletar o painel e o modulo que so ele usava**

```bash
git rm app/hero/telemetry-panel.tsx app/hero/describe-state.ts app/hero/describe-state.test.ts
```

- [ ] **Passo 3: confirmar que nada mais os referencia**

```bash
grep -rn "TelemetryPanel\|describe-state\|describeState\|noteFor" app/ e2e/ scripts/ --include="*.ts" --include="*.tsx" || echo "(nenhuma)"
```

Esperado: nenhuma linha.

- [ ] **Passo 4: remover as chaves de dicionario que so o painel usava**

O carimbo usa `hero.servedBy` e `hero.stamp`. Deixaram de ter consumidor: `hero.you`, `hero.distance`, `hero.rtt`, `hero.protocol`, `hero.tls`, `hero.measuring`, `hero.unavailable`, `hero.privacy` e `hero.needsJs`.

Antes de remover, confirme uma a uma:

```bash
for k in you servedBy distance rtt protocol tls measuring unavailable privacy needsJs stamp; do
  echo "hero.$k: $(grep -rn "hero\.$k" app/ --include="*.tsx" --include="*.ts" | grep -v "i18n/messages\|dictionary.ts" | wc -l) usos"
done
```

Remova do tipo `Dictionary` e dos tres arquivos de mensagem apenas as chaves com `0 usos`, **com uma excecao explicita: `hero.privacy` fica.**

Ela vai aparecer com zero usos neste momento, porque o painel que a exibia acabou de sair, mas a Tarefa 4 a devolve abaixo do carimbo. Remove-la aqui para recria-la tres passos adiante seria trabalho perdido, e pior: a nota e uma afirmacao sobre tratamento de dado pessoal, e uma afirmacao dessas nao pode desaparecer por descuido de refatoracao.

`hero.needsJs` pode sair de verdade. Ela dizia ao visitante sem JavaScript por que os numeros faltavam; com o carimbo, quem nao tem JavaScript nao ve carimbo nenhum, e nao ha numero faltando para explicar.

- [ ] **Passo 5: rodar o portao**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
```

Esperado: `0`.

- [ ] **Passo 6: commitar**

```bash
git add -A
git commit -m "feat: o hero vira a capa do fanzine

Cabecalho de edicao em datilografada, nome em cartaz ocupando a largura toda,
fita sobre a tagline e borda rasgada sob o titulo. O painel de telemetria de
seis linhas sai, e com ele o modulo que decidia seus rotulos: o carimbo diz a
mesma coisa em uma linha.

O h1 continua sendo o elemento de LCP, e continua nao dependendo de nada que
chegue depois: nem da fonte, que carrega em optional, nem do dado do edge."
```

---

## Tarefa 4: o sumario recortado e a faixa de prova

**Arquivos:** modificar `app/routes/home.tsx` e `app/components/proof-strip.tsx`

**Interfaces:**
- Consome: `Adesivo`, `PapelRasgado`, `obterRotacao`.
- Produz: nenhum simbolo novo.

- [ ] **Passo 1: a faixa de prova em numeros de cartaz**

Substitua o `return` de `app/components/proof-strip.tsx`:

```tsx
  return (
    <div className="mt-20">
      <PapelRasgado className="h-3 w-full rotate-180 text-bg" />
      <ul className="grid gap-8 border-y-2 border-fg bg-bg-raised px-6 py-10 sm:grid-cols-3">
        {proofs.map((proof, indice) => (
          <li
            key={proof.slug}
            style={{ transform: `rotate(${obterRotacao(indice + 3)}deg)` }}
          >
            <Link
              to={documentHref("work", locale, proof.slug)}
              className="group block"
            >
              <span className="block font-display text-6xl leading-none text-accent">
                {proof.value}
              </span>
              <span className="mt-3 block text-sm text-fg-muted group-hover:text-fg">
                {proof.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <PapelRasgado className="h-3 w-full text-bg" />
    </div>
  );
```

E acrescente os imports:

```ts
import { PapelRasgado } from "./papel-rasgado";
import { obterRotacao } from "../design/rotacao";
```

- [ ] **Passo 2: o sumario recortado**

Em `app/routes/home.tsx`, troque o bloco dos tres caminhos. O cartao arredondado com borda fina vira recorte com borda dura, sombra dura e numero de sumario:

```tsx
          <ul className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
            {paths.map(({ key, label, hint }, index) => (
              <li
                key={key}
                className={index === 0 ? "md:row-span-2" : ""}
                style={{ transform: `rotate(${obterRotacao(index)}deg)` }}
              >
                <Link
                  to={localizedHref(key, locale)}
                  viewTransition
                  className={`group flex h-full flex-col border-2 border-fg bg-bg-raised shadow-[4px_4px_0_var(--fg)] transition-transform hover:-translate-y-1 ${
                    index === 0 ? "p-8 sm:p-10" : "p-6 sm:p-7"
                  }`}
                >
                  <span className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`mt-2 font-display leading-tight group-hover:text-accent ${
                      index === 0 ? "text-4xl sm:text-5xl" : "text-2xl"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-fg-muted ${
                      index === 0 ? "mt-4 max-w-sm text-base" : "mt-3 text-sm"
                    }`}
                  >
                    {hint}
                  </span>
                  <span
                    aria-hidden
                    className="mt-auto pt-8 font-mono text-meta text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
```

Acrescente o import de `obterRotacao` em `home.tsx`.

- [ ] **Passo 3: devolver a nota de privacidade**

A nota de privacidade perdeu o lugar quando o painel saiu, e ela e uma afirmacao sobre tratamento de dado pessoal: nao pode simplesmente desaparecer. Ela volta logo abaixo do carimbo, em `app/hero/carimbo-de-recepcao.tsx`, dentro do involucro e visivel apenas quando ha carimbo:

```tsx
      {carimbo === null ? null : (
        <div className="flex flex-col gap-3">
          <Carimbo indice={7}>
            <span className="block normal-case tracking-normal">
              {carimbo.titulo}
            </span>
            {carimbo.linhas.map((linha) => (
              <span key={linha} className="block">
                {linha}
              </span>
            ))}
          </Carimbo>
          <p className="max-w-xs font-mono text-meta text-fg-subtle">
            {t["hero.privacy"]}
          </p>
        </div>
      )}
```

Isso devolve `hero.privacy` ao uso, e e por isso que a Tarefa 3 mandou preserva-la. A altura reservada ja e `min-h-36` desde a Tarefa 2, dimensionada para caber carimbo mais nota.

- [ ] **Passo 4: rodar o portao**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
```

Esperado: `0`.

- [ ] **Passo 5: commitar**

```bash
git add -A
git commit -m "feat: o sumario recortado e a faixa de prova em cartaz

Os tres caminhos viram recortes numerados, com borda e sombra duras e rotacao
deterministica. Os numeros de prova ganham a display e a faixa passa a viver
entre duas bordas rasgadas.

A nota de privacidade volta abaixo do carimbo: ela e uma afirmacao sobre
tratamento de dado pessoal e nao podia sair junto com o painel."
```

---

## Tarefa 5: os testes de ponta a ponta do carimbo

Os testes do hero verificavam o painel. Os comportamentos continuam valendo; o alvo muda.

**Arquivos:** modificar `e2e/hero.spec.ts`

- [ ] **Passo 1: reapontar os testes**

Em `e2e/hero.spec.ts`:

- `"should fill the panel with what the edge reported"` vira `"should stamp what the edge reported"`, e as asercoes passam a procurar `Betim, BR` e `GIG` dentro de `[data-carimbo]`.
- `"should say it could not measure instead of showing a zero"` vira `"should stamp nothing when the edge cannot answer"`: com a resposta em 500, `[data-carimbo]` existe e esta vazio de texto.
- `"should never invent a position when the colo is unknown"` continua igual em intencao: `Betim, BR` aparece e `km` nao.
- `"should tell a visitor without javascript why the numbers are missing"` **e removido**: sem JavaScript nao ha carimbo nenhum, e nao ha numero faltando para explicar. Em seu lugar entra um teste novo, `"should not shift the layout when the stamp lands"`, que mede CLS.

O teste de CLS:

```ts
test("should not shift the layout when the stamp lands", async ({ page }) => {
  await page.route("**/api/edge", (route) =>
    route.fulfill({ json: TELEMETRY }),
  );

  await page.goto("/pt-br/");

  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 3000);
      }),
  );

  // O orçamento da spec é 0.05. O espaço do carimbo é reservado desde o
  // servidor, então o valor esperado aqui é praticamente zero.
  expect(cls).toBeLessThan(0.05);
});
```

- [ ] **Passo 2: rodar**

```bash
npm run build >/dev/null 2>&1 && npx playwright test e2e/hero.spec.ts 2>&1 | tail -12
```

Esperado: todos verdes, incluindo o teste de CLS.

- [ ] **Passo 3: commitar**

```bash
git add e2e/hero.spec.ts
git commit -m "test: os testes do hero passam a mirar o carimbo

Os comportamentos continuam: nome da cidade, datacenter, nunca inventar
distancia sem os dois pontos, nunca imprimir zero. O teste do visitante sem
JavaScript sai, porque sem carimbo nao ha numero faltando para explicar, e no
lugar dele entra a medicao de CLS, que e o risco real desta fase."
```

---

## Tarefa 6: verificacao e pull request

- [ ] **Passo 1: portao completo**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
npm run build >/dev/null 2>&1; echo "build EXIT=$?"
npm run e2e >/dev/null 2>&1; echo "e2e EXIT=$?"
npm run build 2>&1 | tail -1
```

Esperado: `0` nos tres, e o JS critico abaixo de 128.000.

- [ ] **Passo 2: conferir no navegador**

```bash
npm run dev
```

Confirme: cabecalho de edicao, nome ocupando a largura, fita sobre a tagline, borda rasgada, e o **carimbo caindo depois** com a sua cidade e o datacenter. Recarregue algumas vezes e observe se a pagina salta quando o carimbo aparece: nao deve saltar. Encerre com Ctrl+C.

- [ ] **Passo 3: PR e merge**

```bash
git push -u origin HEAD
GODEBUG=netdns=cgo gh pr create --title "Fase 2: a capa e o carimbo de recepcao" --body "Closes #<numero>

A home vira capa de fanzine e o painel de telemetria de seis linhas vira o
carimbo de recepcao.

- Cabecalho de edicao, nome em cartaz, fita sobre a tagline, borda rasgada
- Carimbo com cidade, datacenter, distancia, ida e volta e protocolo
- Sumario recortado e numerado, faixa de prova com numeros de cartaz
- Espaco reservado desde o servidor: o carimbo cai sem mover nada

O dado nao mudou: /api/edge, telemetry.ts e distance.ts ficam intactos.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-2-capa-e-carimbo.md"

GODEBUG=netdns=cgo gh pr checks --watch
GODEBUG=netdns=cgo gh pr merge --squash --delete-branch
git checkout main && git pull
```

---

## Criterio de aceite da fase

- [ ] A home e uma capa de fanzine, e nao um cartao de apresentacao
- [ ] O carimbo mostra dado real do edge e nao aparece quando o edge falha
- [ ] CLS medido abaixo de 0.05 com o carimbo caindo, verificado por teste
- [ ] O `h1` continua sendo o elemento de LCP
- [ ] A nota de privacidade continua visivel onde ha medicao
- [ ] `npm run check`, `build` e `e2e` com codigo de saida 0
- [ ] axe sem violacao nas 59 paginas
- [ ] JS critico abaixo de 125 KB
