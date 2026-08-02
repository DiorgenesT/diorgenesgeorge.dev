# Fase 2b do fanzine: o miolo das rotas

> **Para agentes executores:** SUB-SKILL OBRIGATORIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa a tarefa.

**Objetivo:** vestir por dentro as oito rotas e as trinta paginas de conteudo, que ate agora so herdaram paleta e chrome.

**Por que esta fase existe:** o criterio de aceite da Fase 1 dizia "as nove rotas renderizam na identidade zine". Elas herdaram fundo de papel, tinta, cabecalho e rodape, e isso foi tratado como cumprido. Nao estava: o levantamento em 2026-08-02 encontrou **zero componentes de papel dentro de qualquer rota**. Nenhum adesivo, fita, papel rasgado, carimbo, nota de resgate ou uso de `obterRotacao`. Esta fase paga essa divida.

**Arquitetura:** nenhuma rota ganha logica nova. A mudanca e de apresentacao, e concentrada em dois componentes compartilhados que desenham quase tudo: `document-header.tsx`, que abre todo case e todo artigo, e `prose.tsx`, que desenha todo o corpo de markdown. Corrigir os dois muda trinta paginas de uma vez. Depois disso, cada rota indice recebe seu tratamento.

**Spec:** `docs/superpowers/specs/2026-08-02-fanzine-design.md`

## O diagnostico que originou o plano

| Alvo | Problema medido |
|---|---|
| `document-header.tsx` | Forca `font-sans` no `h1` e sobrescreve a Anton que ele herdaria da camada base. Afeta as 30 paginas de conteudo |
| `prose.tsx` | `rounded-lg` no bloco de codigo, `border-hairline` em tabela e citacao, `italic` na citacao. Arredondado, fio fino e italico sao vocabulario de aplicativo |
| `about`, `services`, `colophon` | Prose puro, sem nenhum elemento de papel |
| `cv` | 117 linhas de lista sobria, sendo que ficha datilografada e o formato natural dela no zine |
| `work`, `writing` | Listas de link, sem recorte nem numeracao |
| `contact` | Link de texto, sem adesivo |
| `not-found` | Sobria, sendo a pagina com mais liberdade do site |

## Restricoes globais

- Comentarios, commits, documentos e interface em pt-BR. Sem emojis, sem travessao, sem meia-risca.
- Conventional Commits em portugues. `Closes #N` em ingles no PR.
- `GODEBUG=netdns=cgo` em todo comando `gh`.
- Verificar codigo de saida separado do texto impresso.
- Piso de 13px na Special Elite. O amarelo fita nunca carrega texto. Rotacao sempre de `obterRotacao`.
- **Legibilidade acima de decoracao.** O corpo de texto de case e artigo continua na pilha do sistema, em tamanho de leitura. O zine entra na moldura, nos titulos, nas reguas e nos destaques, nunca no paragrafo corrido.
- **O axe varre 59 paginas.** Toda mudanca de cor ou de semantica passa por ele antes do merge.

## Fluxo de git

Uma issue, uma branch `feature/<numero>-fase-2b-miolo-das-rotas`, commits atomicos, um PR.

---

## Tarefa 0: issue e branch

- [ ] **Passo 1**

```bash
cd /home/dg/projetos/page-dev
git checkout main && GODEBUG=netdns=cgo git pull
GODEBUG=netdns=cgo gh issue create \
  --title "Fase 2b: o miolo das rotas" \
  --body "As oito rotas e as trinta paginas de conteudo so herdaram paleta e chrome: nao ha um unico componente de papel dentro de nenhuma delas. Esta fase paga a divida da Fase 1.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-2b-miolo-das-rotas.md"
git checkout -b feature/<numero>-fase-2b-miolo-das-rotas
```

---

## Tarefa 1: o cabecalho de documento

Abre os 5 cases e os 3 artigos, em cada idioma. E o maior ganho por linha alterada da fase.

**Arquivos:** modificar `app/components/document-header.tsx`

**Interfaces:**
- Consome: `Carimbo` de `./carimbo`, `PapelRasgado` de `./papel-rasgado`, `AnswerBlock`.
- Produz: mesma assinatura de hoje, `{ title, answer, meta? }`. Nenhuma rota muda.

- [ ] **Passo 1: reescrever**

```tsx
import { Carimbo } from "./carimbo";
import { PapelRasgado } from "./papel-rasgado";
import { AnswerBlock } from "./answer-block";

/**
 * Abre todo case e todo artigo. O `font-sans` que estava aqui sobrescrevia a Anton que
 * o h1 herda da camada base, e era por isso que trinta paginas de conteudo abriam com
 * titulo em fonte de sistema enquanto a home abria em cartaz.
 *
 * Os metadados viram carimbo em vez de linha de texto: e a mesma informacao, no
 * vocabulario certo, e ganha a rotacao deterministica de graca.
 */
export function DocumentHeader({
  title,
  answer,
  meta,
}: {
  title: string;
  answer: string;
  meta?: string[];
}) {
  return (
    <header>
      <h1 className="text-3xl leading-tight text-balance sm:text-4xl">
        {title}
      </h1>

      <PapelRasgado className="mt-3 h-2 w-full text-bg" />

      {meta && meta.length > 0 && (
        <p className="mt-5">
          <Carimbo indice={5}>{meta.join(" · ")}</Carimbo>
        </p>
      )}

      <AnswerBlock>{answer}</AnswerBlock>
    </header>
  );
}
```

- [ ] **Passo 2: verificar no navegador e commitar**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/components/document-header.tsx
git commit -m "feat: o cabecalho de documento em cartaz e carimbo

O font-sans daqui sobrescrevia a Anton que o h1 herda da camada base, e era
por isso que trinta paginas de conteudo abriam com titulo em fonte de sistema
enquanto a home abria em cartaz. Os metadados viram carimbo: mesma informacao,
vocabulario certo, e a rotacao deterministica vem de graca."
```

---

## Tarefa 2: o corpo do markdown

Desenha o texto de todos os 30 documentos. Aqui a regra de legibilidade manda: o paragrafo nao muda de fonte nem de tamanho, so a moldura em volta dele.

**Arquivos:** modificar `app/components/prose.tsx`

- [ ] **Passo 1: reescrever o bloco de classes**

Troque o conteudo do `className`:

```
        mt-12 max-w-prose text-fg-muted
        [&_h2]:mt-14 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-fg
        [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg
        [&_p]:mt-5 [&_p]:leading-relaxed
        [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6
        [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6
        [&_a]:text-accent [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4
        [&_code]:font-mono [&_code]:text-meta [&_code]:text-fg
        [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-fg [&_pre]:bg-bg-raised [&_pre]:p-4 [&_pre]:shadow-[3px_3px_0_var(--fg)]
        [&_blockquote]:mt-6 [&_blockquote]:border-s-4 [&_blockquote]:border-fita [&_blockquote]:ps-5 [&_blockquote]:text-fg
        [&_table]:mt-6 [&_table]:w-full [&_table]:text-sm
        [&_th]:border-b-2 [&_th]:border-fg [&_th]:py-2 [&_th]:text-start [&_th]:font-display [&_th]:text-fg
        [&_td]:border-b [&_td]:border-hairline [&_td]:py-2 [&_td]:align-top
        [&_strong]:bg-fita [&_strong]:px-1 [&_strong]:font-semibold [&_strong]:text-fg
```

Quatro decisoes carregam esse bloco, e cada uma tem motivo:

1. **`h2` em Anton.** O titulo de secao passa a ser recorte de cartaz, como na home. O `h3` fica na pilha do sistema: e pequeno e vive dentro de texto corrido, onde condensada pesada atrapalha.
2. **Bloco de codigo com borda dura e sombra dura, em vez de `rounded-lg`.** Codigo passa a parecer papel colado na folha.
3. **Citacao com regua de fita amarela grossa, sem italico.** O italico saiu porque fanzine destaca por bloco e por cor, nao por inclinacao de letra. A fita aqui e regua, nao fundo de texto, entao a regra do amarelo continua respeitada.
4. **`strong` sobre fita amarela.** E o gesto mais reconhecivel de zine: o marcador passado por cima da palavra. O texto continua sendo a tinta sobre o amarelo, que da 10,74:1.

- [ ] **Passo 2: conferir o contraste do destaque**

```bash
npx tsx -e '
import { contrastRatio } from "./app/design/contrast.ts";
import { TOKENS } from "./app/design/tokens.ts";
console.log("tinta sobre fita:", contrastRatio(TOKENS.fg!, TOKENS.fita!).toFixed(2));
'
```

Esperado: `10.74`, muito acima do minimo.

- [ ] **Passo 3: rodar o axe nas 59 paginas**

```bash
npm run build >/dev/null 2>&1 && npx playwright test e2e/acessibilidade.spec.ts 2>&1 | tail -5
```

Esperado: todos verdes. **Se reprovar, o defeito e desta tarefa e deve ser corrigido, nunca silenciado.**

- [ ] **Passo 4: commitar**

```bash
git add app/components/prose.tsx
git commit -m "feat: o corpo do markdown em vocabulario de fanzine

Titulo de secao em cartaz, codigo em papel colado com borda e sombra duras no
lugar do arredondado, citacao com regua de fita no lugar do fio fino e do
italico, e destaque com marcador amarelo por cima da palavra.

O paragrafo nao muda: mesma fonte, mesmo tamanho, mesma entrelinha. O zine
entra na moldura, nunca no texto corrido, porque as trinta paginas existem
para serem lidas."
```

---

## Tarefa 3: as listas de trabalho e de escritos

**Arquivos:** modificar `app/routes/work.tsx` e `app/routes/writing.tsx`

- [ ] **Passo 1**

Em ambas, cada item da lista vira recorte, com o mesmo vocabulario do sumario da home: borda de 2px, sombra dura, rotacao deterministica por indice, numeracao em datilografada e titulo em Anton. O resumo continua na pilha do sistema.

O padrao a aplicar em cada `<li>`:

```tsx
<li style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}>
  <Link
    to={...}
    viewTransition
    className="group block border-2 border-fg bg-bg-raised p-6 shadow-[4px_4px_0_var(--fg)] transition-transform hover:-translate-y-1"
  >
    <span className="font-mono text-meta uppercase tracking-widest text-fg-subtle">
      {String(indice + 1).padStart(2, "0")}
    </span>
    <h2 className="mt-2 text-2xl leading-tight group-hover:text-accent">
      {frontmatter.title}
    </h2>
    <p className="mt-3 text-sm text-fg-muted">{frontmatter.answer}</p>
  </Link>
</li>
```

Ajuste os nomes de campo ao que cada rota ja usa, e preserve toda a informacao que ja aparece hoje: data, etiquetas e o resumo. **Nao remover dado para caber no desenho.**

- [ ] **Passo 2: portao e commit**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/routes/work.tsx app/routes/writing.tsx
git commit -m "feat: trabalho e escritos como recortes numerados

As duas listas passam a usar o mesmo vocabulario do sumario da home: borda e
sombra duras, rotacao deterministica e numeracao em datilografada. Nenhum dado
que ja aparecia foi removido para caber no desenho."
```

---

## Tarefa 4: o CV como ficha datilografada

A rota mais longa do site, e a que mais se beneficia: curriculo e, no mundo fisico, exatamente uma ficha batida a maquina.

**Arquivos:** modificar `app/routes/cv.tsx`

- [ ] **Passo 1**

Aplicar: rotulos de secao em `Carimbo`, cargo e organizacao em Anton, periodo em datilografada, cada bloco de experiencia separado por `PapelRasgado`, e os grupos de skills como `Adesivo`, que e o formato que a secao Stack do site-dev ja usava.

O grupo de skills vira:

```tsx
<ul className="mt-4 flex flex-wrap gap-3">
  {group.items.map((item, indice) => (
    <li key={item}>
      <Adesivo indice={indice}>{item}</Adesivo>
    </li>
  ))}
</ul>
```

- [ ] **Passo 2: portao e commit**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/routes/cv.tsx
git commit -m "feat: o CV como ficha datilografada

Rotulos em carimbo, cargo em cartaz, periodo em datilografada, blocos de
experiencia separados por papel rasgado e cada habilidade como adesivo, que e
o formato que a secao Stack do site-dev ja usava."
```

---

## Tarefa 5: sobre, servicos, contato, colofao e 404

As cinco rotas restantes. Tratamento mais leve, porque quatro delas sao prose puro e ja herdam a Tarefa 2.

**Arquivos:** modificar `app/routes/about.tsx`, `services.tsx`, `contact.tsx`, `colophon.tsx`, `not-found.tsx`

- [ ] **Passo 1**

- `about`, `services`, `colophon`: acrescentar `DocumentHeader` onde ainda nao existir, e uma `FitaAdesiva` no rotulo de secao. O corpo ja vem da Tarefa 2.
- `contact`: os links de WhatsApp, LinkedIn e GitHub viram `Adesivo`, com rotacao propria cada um.
- `not-found`: a pagina com mais liberdade do site. `NotaDeResgate` no "404", carimbo vermelho de "pagina nao encontrada" e papel rasgado. **Continua respondendo status 404**, e ha teste e2e que verifica isso.

- [ ] **Passo 2: portao e commit**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/routes/
git commit -m "feat: sobre, servicos, contato, colofao e 404 no vocabulario do zine

Contato ganha adesivos no lugar de links de texto, e a 404 ganha nota de
resgate e carimbo, que e a pagina com mais liberdade do site. As tres de prose
puro herdam o corpo novo e ganham fita no rotulo de secao."
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

Esperado: `0` nos tres e JS critico abaixo de 128.000.

- [ ] **Passo 2: varrer o resultado**

```bash
for f in about cv services contact work writing colophon not-found; do
  printf "%-12s " "$f"
  grep -o "Adesivo\|FitaAdesiva\|PapelRasgado\|Carimbo\|NotaDeResgate\|font-display\|obterRotacao" app/routes/$f.tsx | sort -u | tr '\n' ' '
  echo
done
```

Esperado: nenhuma rota vazia. Esta e a mesma varredura que originou a fase, e ela e o criterio.

- [ ] **Passo 3: conferir no navegador**

```bash
npm run dev
```

Percorra as nove rotas e um case e um artigo em cada idioma. Confirme que o texto corrido continua confortavel de ler: se algum paragrafo ficou dificil, a decoracao passou do ponto e deve recuar.

- [ ] **Passo 4: PR e merge**

---

## Criterio de aceite da fase

- [ ] Nenhuma das oito rotas fica sem componente de papel
- [ ] Os 30 documentos abrem com titulo em Anton
- [ ] Nenhum `rounded-*` sobrou no corpo do markdown
- [ ] O paragrafo de leitura continua na pilha do sistema, no mesmo tamanho de hoje
- [ ] axe sem violacao nas 59 paginas
- [ ] `check`, `build` e `e2e` com codigo de saida 0
- [ ] JS critico abaixo de 125 KB
- [ ] A 404 continua respondendo status 404
