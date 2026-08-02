# Fase 2b: o miolo das rotas, em Impresso

> **Para agentes executores:** SUB-SKILL OBRIGATORIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa a tarefa.

> **Reescrito em 2026-08-02.** A primeira versao deste plano mandava por adesivo no contato, nota de resgate na 404 e fita nos rotulos de secao. Aqueles componentes foram deletados quando o fanzine foi abandonado. Nada daquela versao vale.

**Objetivo:** vestir por dentro as oito rotas e as trinta paginas de conteudo, que ate agora so herdaram paleta, fontes e chrome.

**Arquitetura:** nenhuma rota ganha logica nova. A mudanca e de apresentacao, e esta concentrada em dois componentes compartilhados que desenham quase tudo: `document-header.tsx`, que abre todo case e artigo, e `prose.tsx`, que desenha todo corpo de markdown. Corrigir os dois muda trinta paginas de uma vez. Depois, cada rota indice recebe seu tratamento.

**Spec:** `docs/superpowers/specs/2026-08-02-fanzine-design.md`, secao 3 (identidade Impresso).

## O diagnostico

Levantado em 2026-08-02, com o codigo na mao:

| Alvo | Problema |
|---|---|
| `document-header.tsx` | `font-sans` no `h1` sobrescreve a display que ele herdaria da camada base. Afeta as 30 paginas de conteudo |
| `work.tsx`, `contact.tsx`, `not-found.tsx` | Mesmo `font-sans` no `h1` |
| `prose.tsx` | `rounded-lg` no bloco de codigo, `border-hairline` em tabela e citacao, `italic` na citacao |
| `work.tsx` | Cada case e um cartao `rounded-xl` com borda em volta, e cada tecnologia uma pilula `rounded-full` |
| `contact.tsx` | Botao `rounded-md` |
| `about`, `services`, `colophon` | Nenhuma referencia a display ou monoespacada: prose puro |
| `cv.tsx` | A rota mais longa do site, so com `font-mono` solto |

## O vocabulario de Impresso

Esta secao e a parte mais importante do plano: e ela que faz as seis tarefas produzirem um resultado unico em vez de seis interpretacoes.

**Reguas no lugar de caixas.** E a transformacao que carrega quase todo o trabalho. Nada e cercado por borda em volta: os itens sao separados por fio horizontal, como linhas de uma pagina impressa. Cartao com borda fechada e vocabulario de interface; fio e vocabulario de editorial.

**Zero arredondamento.** Nenhum `rounded-*` sobrevive. Papel nao tem canto arredondado.

**Zero sombra, zero rotacao.** As duas sairam junto com o fanzine e nao voltam.

**Escala violenta.** Rotulo tecnico em 13px com entreletra larga, titulo em display grande. Nada no meio do caminho, e nada de `font-bold` na pilha do sistema tentando imitar display.

**Uma cor de acento, usada uma vez por tela.** O vermelho marca o link ativo, o numero de prova ou o estado de erro. Nao decora.

**O corpo de texto nao muda.** Mesma familia, mesmo tamanho, mesma entrelinha do que esta no ar hoje. Os trinta documentos existem para serem lidos, e a identidade entra na moldura, nunca no paragrafo.

**O desregistro nao se repete.** O eco de chapa e o gesto assinatura da marca, e vive so nela. Espalha-lo pelo site o gastaria.

## Restricoes globais

- Comentarios, commits, documentos e interface em pt-BR. Sem emojis, travessao ou meia-risca.
- Conventional Commits em portugues. `Closes #N` em ingles no corpo do PR.
- `GODEBUG=netdns=cgo` em todo comando `gh`.
- **Verificar codigo de saida separado do texto impresso.** `npm run check 2>&1 | tail` mascara falha.
- **Encerrar servidores de dev antes de rodar `npm run e2e`.** Servidor de dev vivo derruba o servidor de teste, e o sintoma e uma enxurrada de falhas que nao sao regressao.
- Piso de 13px na monoespacada, travado por `scripts/tipografia.test.ts`.
- Todo par de cor que carrega texto passa por `app/design/tokens.test.ts`.
- O axe varre as 59 paginas. Nenhuma violacao entra.

## Fluxo de git

Uma issue, uma branch `feature/<numero>-fase-2b-miolo-das-rotas`, commits atomicos, um PR.

---

## Tarefa 0: issue e branch

- [ ] **Passo 1**

```bash
cd /home/dg/projetos/page-dev
git checkout main && GODEBUG=netdns=cgo git pull
git status --porcelain | grep -v CLAUDE.md | wc -l   # esperado: 0

GODEBUG=netdns=cgo gh issue create \
  --title "Fase 2b: o miolo das rotas" \
  --body "As oito rotas e as trinta paginas de conteudo so herdaram paleta, fontes e chrome. Esta fase veste o interior delas no vocabulario de Impresso: reguas no lugar de caixas, zero arredondamento, escala violenta, e o corpo de texto intocado.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-2b-miolo-das-rotas.md"

git checkout -b feature/<numero>-fase-2b-miolo-das-rotas
```

---

## Tarefa 1: o cabecalho de documento

Abre os 5 cases e os 3 artigos, em cada idioma. Maior ganho por linha alterada da fase.

**Arquivos:** modificar `app/components/document-header.tsx`

**Interfaces:**
- Consome: nada.
- Produz: mesma assinatura de hoje, `{ title, answer, meta? }`. Nenhuma rota muda.

- [ ] **Passo 1: reescrever**

```tsx
import { AnswerBlock } from "./answer-block";

/**
 * Abre todo case e todo artigo. O `font-sans` que estava aqui sobrescrevia a display
 * que o h1 herda da camada base, e era por isso que trinta paginas de conteudo abriam
 * com titulo na fonte do sistema enquanto a capa abria em display.
 *
 * Os metadados sobem para cima do titulo e viram rotulo tecnico entre dois fios: numa
 * pagina impressa a procedencia vem antes do texto, nao depois.
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
      {meta && meta.length > 0 && (
        <p className="border-y border-hairline py-3 font-mono text-meta uppercase tracking-widest text-fg-subtle">
          {meta.join(" · ")}
        </p>
      )}

      <h1 className="mt-8 text-4xl leading-[1.05] text-balance sm:text-5xl">
        {title}
      </h1>

      <AnswerBlock>{answer}</AnswerBlock>
    </header>
  );
}
```

- [ ] **Passo 2: portao e commit**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/components/document-header.tsx
git commit -m "feat: o cabecalho de documento em display e rotulo tecnico

O font-sans daqui sobrescrevia a display que o h1 herda da camada base, e era
por isso que trinta paginas de conteudo abriam com titulo na fonte do sistema
enquanto a capa abria em display. Os metadados sobem para cima do titulo e
viram rotulo entre dois fios: numa pagina impressa a procedencia vem antes do
texto, nao depois."
```

---

## Tarefa 2: o corpo do markdown

Desenha o texto dos 30 documentos. Aqui a regra do paragrafo manda: o texto corrido nao muda, so a moldura em volta.

**Arquivos:** modificar `app/components/prose.tsx`

- [ ] **Passo 1: substituir o bloco de classes**

```
        mt-12 max-w-prose text-fg-muted
        [&_h2]:mt-16 [&_h2]:text-2xl [&_h2]:text-fg
        [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg
        [&_p]:mt-5 [&_p]:leading-relaxed
        [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6
        [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6
        [&_a]:text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4
        [&_code]:font-mono [&_code]:text-meta [&_code]:text-fg
        [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:border-y [&_pre]:border-fg [&_pre]:bg-bg-raised [&_pre]:px-5 [&_pre]:py-4
        [&_blockquote]:mt-8 [&_blockquote]:border-s-2 [&_blockquote]:border-accent [&_blockquote]:ps-6 [&_blockquote]:text-lg [&_blockquote]:text-fg
        [&_table]:mt-8 [&_table]:w-full [&_table]:text-sm
        [&_th]:border-b-2 [&_th]:border-fg [&_th]:py-2 [&_th]:text-start [&_th]:font-mono [&_th]:text-meta [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-fg
        [&_td]:border-b [&_td]:border-hairline [&_td]:py-3 [&_td]:align-top
        [&_strong]:font-semibold [&_strong]:text-fg
```

Cinco decisoes carregam esse bloco:

1. **`h2` sem `font-semibold`.** Ele ja herda a display da camada base, e peso extra sobre uma display pesada empasta.
2. **Bloco de codigo entre dois fios, sem `rounded-lg` e sem caixa.** Regua em cima e embaixo, sem borda lateral: o codigo pertence a coluna de texto, nao flutua nela.
3. **Cabecalho de tabela vira rotulo tecnico**, em monoespacada de 13px com entreletra larga, sob um fio grosso. E o gesto de tabela de relatorio impresso.
4. **Citacao com fio de acento fino e sem italico.** O italico saiu porque impresso destaca por posicao e por regua, nao por inclinacao de letra.
5. **`strong` sem fundo.** A versao anterior deste plano punha marcador amarelo por cima da palavra; o amarelo nao existe mais, e destaque por cor de fundo e o gesto mais fanzine que havia.

- [ ] **Passo 2: rodar o axe nas 59 paginas**

```bash
pkill -f "react-router dev"; sleep 2
npm run build >/dev/null 2>&1 && npx playwright test e2e/acessibilidade.spec.ts 2>&1 | tail -5
```

Esperado: todos verdes. **Se reprovar, o defeito e desta tarefa e deve ser corrigido, nunca silenciado.**

- [ ] **Passo 3: commitar**

```bash
git add app/components/prose.tsx
git commit -m "feat: o corpo do markdown em vocabulario de impresso

Titulo de secao sem peso extra sobre a display, codigo entre dois fios no
lugar do bloco arredondado, cabecalho de tabela como rotulo tecnico sob regua
grossa, e citacao com fio de acento sem italico.

O paragrafo nao muda: mesma fonte, mesmo tamanho, mesma entrelinha. A
identidade entra na moldura, nunca no texto corrido, porque as trinta paginas
existem para serem lidas."
```

---

## Tarefa 3: as listas de trabalho e de escritos

**Arquivos:** modificar `app/routes/work.tsx` e `app/routes/writing.tsx`

**Interfaces:**
- Consome: nada das tarefas anteriores.
- Produz: nenhum simbolo novo.

- [ ] **Passo 1: a lista de trabalho**

Em `app/routes/work.tsx`, troque o `h1` e a lista.

O `h1` perde o `font-sans`:

```tsx
      <h1 className="text-4xl leading-tight sm:text-5xl">{t["nav.work"]}</h1>
```

E cada item deixa de ser cartao e vira linha. O cartao com borda em volta e pilula arredondada por tecnologia sao vocabulario de interface; a linha separada por fio e de indice impresso:

```tsx
        <ul className="mt-16">
          {cases.map(({ slug, frontmatter }, index) => (
            <li key={slug} className="border-t border-hairline last:border-b">
              {/* group para a linha inteira reagir ao ponteiro, nao so o titulo. */}
              <article className="group relative grid gap-x-6 py-8 sm:grid-cols-[4rem_1fr]">
                <span
                  aria-hidden
                  className="font-mono text-meta tabular-nums text-fg-subtle"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h2 className="text-2xl leading-tight text-balance sm:text-3xl">
                    <Link
                      to={documentHref("work", locale, slug)}
                      viewTransition
                      className="after:absolute after:inset-0 group-hover:text-accent"
                    >
                      {frontmatter.title}
                    </Link>
                  </h2>

                  <p className="mt-4 max-w-prose text-fg-muted">
                    {frontmatter.outcome}
                  </p>

                  <p className="mt-6 font-mono text-meta uppercase tracking-widest text-fg-subtle">
                    {frontmatter.org} · {frontmatter.period} ·{" "}
                    {frontmatter.stack.join(", ")}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
```

A pilha de tecnologias vira uma linha de texto separada por virgula, junto da organizacao e do periodo: e a mesma informacao, sem doze pilulas competindo com o titulo.

- [ ] **Passo 2: a lista de escritos**

Aplicar o mesmo padrao em `app/routes/writing.tsx`, adaptando aos campos que a rota ja usa: a data publicada entra na linha de rotulo tecnico junto das etiquetas. **Nao remover nenhuma informacao que ja aparece hoje** para caber no desenho.

- [ ] **Passo 3: portao e commit**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/routes/work.tsx app/routes/writing.tsx
git commit -m "feat: trabalho e escritos como indices impressos

Cada item deixa de ser cartao com borda em volta e vira linha separada por
fio, com o numero de ordem na coluna da margem. A pilha de tecnologias vira
uma linha de rotulo tecnico junto da organizacao e do periodo: mesma
informacao, sem doze pilulas arredondadas competindo com o titulo."
```

---

## Tarefa 4: o CV

A rota mais longa do site, e a que mais ganha: curriculo impresso e exatamente uma sequencia de blocos separados por regua, com rotulo na margem.

**Arquivos:** modificar `app/routes/cv.tsx`

- [ ] **Passo 1**

Aplicar, mantendo toda a informacao que ja existe:

- O `h1` perde qualquer `font-sans` e fica na display.
- Cada rotulo de secao (experiencia, formacao, habilidades) vira monoespacada de 13px, caixa alta, entreletra larga, sob um fio grosso (`border-b-2 border-fg`).
- Cada cargo e um bloco separado por `border-t border-hairline`, com o periodo em rotulo tecnico na coluna da esquerda e o cargo em display na direita, no mesmo padrao de grade da Tarefa 3.
- As habilidades viram listas de texto separadas por virgula sob o rotulo do grupo, e nao pilulas.

- [ ] **Passo 2: portao e commit**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/routes/cv.tsx
git commit -m "feat: o CV como ficha impressa

Rotulos de secao em monoespacada sob regua grossa, periodo na coluna da
margem, cargo em display, e cada vinculo separado por fio. As habilidades
viram texto corrido sob o rotulo do grupo, em vez de pilulas."
```

---

## Tarefa 5: contato, 404, sobre, servicos e colofao

**Arquivos:** modificar `app/routes/contact.tsx`, `not-found.tsx`, `about.tsx`, `services.tsx`, `colophon.tsx`

- [ ] **Passo 1: contato**

O `h1` perde o `font-sans`. O botao de WhatsApp perde o `rounded-md` e vira bloco reto de acento. Os links de LinkedIn e GitHub deixam de ser lista solta e viram linhas separadas por fio, no mesmo padrao do sumario da capa:

```tsx
      <a
        href={whatsappHref(t["contact.whatsappGreeting"])}
        className="mt-10 inline-block bg-accent px-7 py-4 font-semibold text-accent-fg hover:bg-fg"
      >
        {t["contact.whatsapp"]}
      </a>

      <ul className="mt-14">
        {[
          { nome: "LinkedIn", href: AUTHOR.linkedin },
          { nome: "GitHub", href: AUTHOR.github },
        ].map(({ nome, href }) => (
          <li key={nome} className="border-t border-hairline last:border-b">
            <a
              href={href}
              rel="me noopener"
              target="_blank"
              className="group flex items-baseline justify-between py-4 hover:text-accent"
            >
              <span className="text-lg font-medium">{nome}</span>
              <span
                aria-hidden
                className="font-mono text-meta text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent"
              >
                &rarr;
              </span>
            </a>
          </li>
        ))}
      </ul>
```

- [ ] **Passo 2: a 404**

O `h1` perde o `font-sans`. O "404" sobe para display em corpo grande, que e o unico numero da pagina e merece o peso:

```tsx
      <p aria-hidden className="font-display text-8xl leading-none text-accent">
        404
      </p>
```

**A rota continua respondendo status 404**, e ha teste e2e que verifica isso.

- [ ] **Passo 3: sobre, servicos e colofao**

As tres sao prose puro e ja herdam as Tarefas 1 e 2. Confirmar que usam `DocumentHeader` e que o `main` tem o mesmo respiro das outras rotas. **Nao inventar elemento novo aqui:** o valor destas paginas e o texto.

- [ ] **Passo 4: portao e commit**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
git add app/routes/
git commit -m "feat: contato, 404 e as tres paginas de prose em Impresso

Contato perde o botao arredondado e ganha linhas separadas por fio no lugar da
lista solta de perfis. A 404 poe o numero em display, que e o unico numero da
pagina. Sobre, servicos e colofao herdam o cabecalho e o corpo novos, e nao
ganham elemento nenhum: o valor delas e o texto."
```

---

## Tarefa 6: verificacao e pull request

- [ ] **Passo 1: portao completo, com o ambiente limpo**

```bash
pkill -f "react-router dev"; pkill -f workerd; sleep 3
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
npm run build >/dev/null 2>&1; echo "build EXIT=$?"
npm run e2e >/dev/null 2>&1; echo "e2e EXIT=$?"
npm run build 2>&1 | tail -1
```

Esperado: `0` nos tres, e JS critico abaixo de 128.000.

- [ ] **Passo 2: a varredura que originou a fase**

```bash
echo "=== sobrou vocabulario de interface? ==="
grep -rn "rounded-\|shadow-\|italic" app/components/ app/routes/ --include="*.tsx" | grep -v "\.test\." || echo "(nenhum)"

echo "=== sobrou h1 fora da display? ==="
grep -rn "h1" app/components/ app/routes/ --include="*.tsx" | grep "font-sans" || echo "(nenhum)"

echo "=== display e rotulo tecnico por rota ==="
for f in about cv services contact work writing colophon not-found; do
  printf "%-11s " "$f"
  grep -o "font-display\|font-mono" app/routes/$f.tsx 2>/dev/null | sort -u | tr '\n' ' '
  echo
done
```

Esperado: nenhum arredondamento, nenhuma sombra, nenhum italico, nenhum `h1` com `font-sans`. As rotas de prose puro (`about`, `services`, `colophon`) podem aparecer vazias na terceira varredura, porque quem desenha o interior delas e o `DocumentHeader` e o `Prose`.

- [ ] **Passo 3: conferir no navegador**

```bash
npm run dev
```

Percorrer as nove rotas e um case e um artigo em cada idioma. Confirmar que **o texto corrido continua confortavel de ler**: se algum paragrafo ficou dificil, a moldura passou do ponto e deve recuar. Encerrar com Ctrl+C, e encerrar de fato antes de rodar e2e de novo.

- [ ] **Passo 4: PR e merge**

Corpo do PR com `Closes #<numero>`, em ingles. Aguardar o CI, que roda limpo e e o veredito real, e mergear com squash apos aprovacao do usuario.

---

## Criterio de aceite da fase

- [ ] Nenhum `rounded-*`, `shadow-*` ou `italic` em componente ou rota
- [ ] Nenhum `h1` com `font-sans`: os 30 documentos abrem na display
- [ ] Listas de trabalho e escritos como linhas separadas por fio, sem cartao
- [ ] O paragrafo de leitura continua na pilha do sistema, no mesmo tamanho de hoje
- [ ] Nenhuma informacao que aparecia antes foi removida para caber no desenho
- [ ] axe sem violacao nas 59 paginas
- [ ] `check`, `build` e `e2e` com codigo de saida 0
- [ ] JS critico abaixo de 125 KB
- [ ] A 404 continua respondendo status 404
- [ ] O desregistro de chapa continua exclusivo do monograma da capa

## Fora de escopo

- **Numeracao de pagina por rota.** Exige decidir a ordem editorial das nove rotas, que e decisao de conteudo. A navegacao ja cumpre o papel de sumario.
- **`og:image` por rota.** E da Fase 5.
- **Qualquer movimento novo.** E da Fase 3, e ela precisa decidir antes se o `Reveal` com GSAP fica, muda ou sai.
