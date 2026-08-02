# Fase 4 do fanzine: publicar o conteudo

> **Para agentes executores:** SUB-SKILL OBRIGATORIA: use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa a tarefa. Os passos usam checkbox (`- [ ]`) para rastreamento.

**Objetivo:** tirar do rascunho os 21 documentos ja escritos, nomeando os dois sistemas que a propria prefeitura lancou publicamente, e deixar o site publicando 5 cases e 3 artigos em vez de tres paginas estaticas.

**Arquitetura:** nao ha codigo novo. A fase e edicao de conteudo mais a troca de um campo de frontmatter, e todo o resto (sitemap, feeds, `llms.txt`, espelho `.md`, indice do registro, menu) e derivado disso automaticamente pelo build. O trabalho de verificacao e conferir que os derivados acompanharam.

**Spec:** `docs/superpowers/specs/2026-08-02-fanzine-design.md`

## Decisoes que moldam esta fase

Tomadas com o usuario em 2026-08-02, e diferentes do que a spec previa:

1. **Sem link externo.** A spec previa nomear e linkar. O usuario quer conferir primeiro o que tem endereco publico, entao nesta fase nenhum case ganha link. Adicionar depois e acrescentar um campo, sem reescrever texto.
2. **So os dois sistemas publicos sao nomeados.** ODS Betim e UPA Agora foram lancados pela Prefeitura de Betim com nota oficial. Os outros tres cases (hub de 44 paineis, 468 acordos, planejamento de contratacao) descrevem sistemas internos que nao tem, e nao terao, face publica. Eles seguem descrevendo o trabalho sem batizar um produto interno, que e como ja estao escritos.
3. **O fornecedor do sistema de saude continua anonimo.** `insumos/termos-proibidos.txt` registra que ele e termo proibido. O case da UPA fala em "sistema de regulacao assistencial" sem nomear a origem, e isso **nao muda**.

## Restricoes globais

- Comentarios, commits, documentos e interface em pt-BR. Sem emojis. Sem travessao e sem meia-risca.
- Conventional Commits em portugues. Nunca adicionar trailer de co-autoria.
- Fechar issue em PR com a palavra-chave **em ingles** (`Closes #N`).
- Todo comando `gh` precisa do prefixo `GODEBUG=netdns=cgo`.
- **Nao inventar fato tecnico nem historico profissional.** Onde o rascunho e vago de proposito, ele continua vago.
- `title` entre 8 e 70 caracteres; `answer` entre 120 e 320. O Zod do build reprova fora disso.
- Portao ao fim de cada tarefa: `npm run check` verde, verificando o codigo de saida e nao so o texto impresso.
- Portao ao fim da fase: `npm run build` e `npm run e2e` verdes.

## Fluxo de git

Uma issue, uma branch `feature/<numero>-fase-4-conteudo`, commits atomicos, um PR.

## Orcamento, ja medido

Publicar os 21 leva o JS critico de **116.674 para 120.430 bytes**, medido em 2026-08-02 por simulacao. O teto e 128.000. A tarefa obrigatoria da spec, de recortar o indice de conteudo por rota caso estourasse, **nao e acionada**: sobram 7.570 bytes, cerca de quarenta documentos de folga.

---

## Estrutura de arquivos

**Modificados**

| Arquivo | Mudanca |
|---|---|
| `app/content/cases/painel-ods-de-betim.pt-BR.mdx` | Nomeia ODS Betim, troca municipio por Betim |
| `app/content/cases/painel-ods-de-betim.pt-PT.mdx` | Idem, em pt-PT |
| `app/content/cases/sdg-dashboard.en-US.mdx` | Idem, em ingles |
| `app/content/cases/painel-publico-de-filas-de-upa.pt-BR.mdx` | Nomeia UPA Agora |
| `app/content/cases/painel-publico-de-filas-de-upa.pt-PT.mdx` | Idem, em pt-PT |
| `app/content/cases/public-emergency-room-queues.en-US.mdx` | Idem, em ingles |
| Os 21 arquivos em rascunho | `status: rascunho` vira `status: publicado` |

Nenhum arquivo criado ou deletado.

---

## Tarefa 0: issue e branch

- [ ] **Passo 1: partir da main limpa**

```bash
cd /home/dg/projetos/page-dev
git checkout main && GODEBUG=netdns=cgo git pull
git status --porcelain | grep -v CLAUDE.md | wc -l
```

Esperado: `0`.

- [ ] **Passo 2: abrir a issue**

```bash
GODEBUG=netdns=cgo gh issue create \
  --title "Fase 4: publicar o conteudo" \
  --body "Tira do rascunho os 21 documentos ja escritos e nomeia os dois sistemas com lancamento publico: ODS Betim e UPA Agora. Sem link externo nesta fase. Os tres cases de sistema interno seguem sem batizar produto, e o fornecedor do sistema de saude continua anonimo.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-4-conteudo.md"
```

- [ ] **Passo 3: criar a branch**

```bash
git checkout -b feature/<numero>-fase-4-conteudo
```

---

## Tarefa 1: nomear o ODS Betim

Tres arquivos, mesma transformacao adaptada a cada idioma. O sistema passa a ser chamado pelo nome, e as tres esferas de comparacao deixam de ser genericas.

**Arquivos:** `app/content/cases/painel-ods-de-betim.pt-BR.mdx`, `painel-ods-de-betim.pt-PT.mdx`, `sdg-dashboard.en-US.mdx`

**Interfaces:**
- Consome: nada.
- Produz: `translationKey: ods` permanece o mesmo nos tres, que e o que mantem as traducoes ligadas entre si. Nenhum outro modulo depende do texto.

- [ ] **Passo 1: pt-BR**

Em `painel-ods-de-betim.pt-BR.mdx`:

`title` passa a:

```yaml
title: "ODS Betim: indicadores comparáveis com estado e país"
```

`answer` passa a:

```yaml
answer: "O desempenho de Betim nos Objetivos de Desenvolvimento Sustentável existia em relatórios anuais e em bases estatísticas que exigem saber navegar tabela para extrair. O ODS Betim é o painel público que reúne isso com série histórica, onde cada indicador aparece ao lado de Minas Gerais e do Brasil."
```

No corpo, quatro substituicoes:

| De | Para |
|---|---|
| `O desempenho do município nos Objetivos` | `O desempenho de Betim nos Objetivos` |
| `Cada indicador é importado em três níveis: município, estado e país.` | `Cada indicador é importado em três níveis: Betim, Minas Gerais e Brasil.` |
| `Ao lado do estado e do país, o mesmo número` | `Ao lado de Minas Gerais e do Brasil, o mesmo número` |
| `com série histórica e comparação contra o estado e o país` | `com série histórica e comparação contra Minas Gerais e o Brasil` |

E acrescente, logo apos o cabecalho `## O resultado`, uma primeira frase que da nome ao sistema:

```markdown
O painel foi ao ar como **ODS Betim**.
```

**Nao mexer** na frase sobre "o índice que consolida o desempenho dos municípios": o rascunho nao diz qual indice e, e adivinhar seria inventar fato.

- [ ] **Passo 2: pt-PT**

Mesmas quatro substituicoes, respeitando a ortografia do arquivo (`Objectivos`, `intermédia`). O `title` e o mesmo do pt-BR. O `answer` passa a:

```yaml
answer: "O desempenho de Betim nos Objectivos de Desenvolvimento Sustentável existia em relatórios anuais e em bases estatísticas que exigem saber navegar tabelas para extrair. O ODS Betim é o painel público que reúne isto com série histórica, onde cada indicador aparece ao lado de Minas Gerais e do Brasil."
```

Frase acrescentada apos `## O resultado`:

```markdown
O painel foi para o ar como **ODS Betim**.
```

- [ ] **Passo 3: en-US**

`title` passa a:

```yaml
title: "ODS Betim: sustainable development indicators, comparable"
```

`answer` passa a:

```yaml
answer: "Betim's performance against the Sustainable Development Goals existed in annual reports and in statistical databases that require knowing exactly which table to open. ODS Betim is the public dashboard that gathers it with historical series, where every indicator sits next to Minas Gerais and Brazil."
```

Substituicoes no corpo:

| De | Para |
|---|---|
| `Every indicator is imported at three levels: city, state and country.` | `Every indicator is imported at three levels: Betim, Minas Gerais and Brazil.` |
| `Next to the state and the country, the same number` | `Next to Minas Gerais and Brazil, the same number` |
| `with historical series and comparison against the state and the country` | `with historical series and comparison against Minas Gerais and Brazil` |

Frase acrescentada apos `## The result`:

```markdown
The dashboard shipped as **ODS Betim**.
```

- [ ] **Passo 4: verificar os limites do schema**

```bash
npx tsx -e '
import { readFileSync } from "node:fs";
import matter from "gray-matter";
for (const f of ["painel-ods-de-betim.pt-BR", "painel-ods-de-betim.pt-PT", "sdg-dashboard.en-US"]) {
  const { data } = matter(readFileSync(`app/content/cases/${f}.mdx`, "utf8"));
  const t = String(data.title).length;
  const a = String(data.answer).length;
  console.log(`${t >= 8 && t <= 70 ? "ok " : "RUIM"} title ${t}  ${a >= 120 && a <= 320 ? "ok " : "RUIM"} answer ${a}  ${f}`);
}'
```

Esperado: `ok` nos seis valores.

- [ ] **Passo 5: commitar**

```bash
git add app/content/cases/painel-ods-de-betim.pt-BR.mdx \
        app/content/cases/painel-ods-de-betim.pt-PT.mdx \
        app/content/cases/sdg-dashboard.en-US.mdx
git commit -m "docs: nomeia o ODS Betim no case dos indicadores

O sistema foi lancado publicamente pela Prefeitura de Betim, entao descreve-lo
como 'um municipio' escondia a unica coisa que torna o case verificavel. As
tres esferas de comparacao passam a ser Betim, Minas Gerais e Brasil.

O indice que consolida o desempenho dos municipios continua sem nome: o
rascunho nao diz qual e, e adivinhar seria inventar fato."
```

---

## Tarefa 2: nomear a UPA Agora

**Arquivos:** `app/content/cases/painel-publico-de-filas-de-upa.pt-BR.mdx`, `painel-publico-de-filas-de-upa.pt-PT.mdx`, `public-emergency-room-queues.en-US.mdx`

**Interfaces:**
- Consome: nada.
- Produz: `translationKey: upa-agora` permanece.

**Restricao que vale acima de tudo nesta tarefa:** a origem dos dados continua descrita como "sistema de regulacao assistencial", sem nome de fornecedor. Isso e termo proibido registrado em `insumos/termos-proibidos.txt`.

- [ ] **Passo 1: pt-BR**

`title` passa a:

```yaml
title: "UPA Agora: fila de pronto-atendimento em tempo quase real"
```

`answer` passa a:

```yaml
answer: "Para saber qual unidade de pronto-atendimento estava mais cheia, era preciso ir até lá e olhar a fila. O UPA Agora passou a mostrar espera e classificação de risco das quatro UPAs de Betim, sem que o acesso do cidadão gere carga no sistema assistencial de origem."
```

No corpo, uma substituicao:

| De | Para |
|---|---|
| `o sistema de regulação assistencial do município sabia` | `o sistema de regulação assistencial de Betim sabia` |

E acrescente, apos o cabecalho `## O resultado`:

```markdown
O painel foi ao ar como **UPA Agora**.
```

- [ ] **Passo 2: pt-PT**

`title`:

```yaml
title: "UPA Agora: fila de urgência em tempo quase real"
```

`answer`:

```yaml
answer: "Para saber qual unidade de urgência estava mais cheia, era preciso deslocar-se até lá e ver a fila. O UPA Agora passou a mostrar espera e triagem de risco das quatro unidades de Betim, sem que o acesso do cidadão gere carga no sistema assistencial de origem."
```

Substituicao no corpo: `o sistema de regulação assistencial do município sabia` vira `o sistema de regulação assistencial de Betim sabia`.

Frase apos `## O resultado`:

```markdown
O painel foi para o ar como **UPA Agora**.
```

- [ ] **Passo 3: en-US**

`title`:

```yaml
title: "UPA Agora: public emergency room queues in near real time"
```

`answer`:

```yaml
answer: "To find out which emergency room was busiest, people had to go there and look at the queue. UPA Agora now shows waiting times and triage counts for Betim's four units, without citizen traffic putting any load on the clinical system it reads from."
```

Substituicao no corpo: `the city's clinical regulation system knew` vira `Betim's clinical regulation system knew`.

Frase apos `## The result`:

```markdown
The dashboard shipped as **UPA Agora**.
```

- [ ] **Passo 4: verificar os limites e a ausencia de fornecedor**

```bash
npx tsx -e '
import { readFileSync } from "node:fs";
import matter from "gray-matter";
for (const f of ["painel-publico-de-filas-de-upa.pt-BR", "painel-publico-de-filas-de-upa.pt-PT", "public-emergency-room-queues.en-US"]) {
  const { data } = matter(readFileSync(`app/content/cases/${f}.mdx`, "utf8"));
  const t = String(data.title).length;
  const a = String(data.answer).length;
  console.log(`${t >= 8 && t <= 70 ? "ok " : "RUIM"} title ${t}  ${a >= 120 && a <= 320 ? "ok " : "RUIM"} answer ${a}  ${f}`);
}'
```

Esperado: `ok` nos seis valores.

- [ ] **Passo 5: commitar**

```bash
git add app/content/cases/painel-publico-de-filas-de-upa.pt-BR.mdx \
        app/content/cases/painel-publico-de-filas-de-upa.pt-PT.mdx \
        app/content/cases/public-emergency-room-queues.en-US.mdx
git commit -m "docs: nomeia o UPA Agora no case das filas

Sistema lancado publicamente pela Prefeitura de Betim, com nota oficial. As
quatro unidades passam a ser as quatro UPAs de Betim.

A origem dos dados continua descrita como sistema de regulacao assistencial,
sem nome de fornecedor: e termo proibido registrado em insumos."
```

---

## Tarefa 3: publicar os 21 documentos

A troca e de um campo. O que exige atencao e a consequencia: cinco cases e tres artigos entram no menu, no sitemap, nos feeds, no `llms.txt` e no espelho `.md`, e passam a ser pre-renderizados e varridos pelo axe.

**Arquivos:** os 21 `.mdx` com `status: rascunho`

**Interfaces:**
- Consome: as Tarefas 1 e 2, ja aplicadas.
- Produz: 30 documentos publicados. `listCaseIndex` e `listArticleIndex` deixam de devolver lista vazia, o que faz o menu do layout exibir os itens `trabalho` e `escritos`, que hoje estao ocultos.

- [ ] **Passo 1: conferir o inventario antes**

```bash
grep -c "^status: rascunho" app/content/*/*.mdx | grep -v ":0" | wc -l
grep -c "^status: publicado" app/content/*/*.mdx | grep -v ":0" | wc -l
```

Esperado: `21` e `9`.

- [ ] **Passo 2: publicar**

```bash
sed -i 's/^status: rascunho$/status: publicado/' app/content/*/*.mdx
grep -c "^status: rascunho" app/content/*/*.mdx | grep -v ":0" | wc -l
```

Esperado: `0` arquivos ainda em rascunho.

- [ ] **Passo 3: validar o conteudo e construir**

```bash
npm run build >/dev/null 2>&1; echo "build EXIT=$?"
npm run build 2>&1 | tail -1
```

Esperado: `build EXIT=0`, e o total abaixo de 128.000, na faixa de 120.430.

O `validate-content` roda primeiro dentro do build: se algum frontmatter dos 21 estiver fora do schema, e aqui que aparece, com o arquivo nomeado.

- [ ] **Passo 4: conferir que os derivados acompanharam**

```bash
echo "=== paginas pre-renderizadas ==="
find build/client -name "index.html" | wc -l
echo "=== espelhos markdown ==="
find build/client -name "*.md" | wc -l
echo "=== urls no sitemap ==="
grep -c "<loc>" build/client/sitemap.xml
echo "=== itens nos feeds pt-BR ==="
grep -c "<item>" build/client/pt-br/escritos/feed.xml
echo "=== llms.txt cita os cases? ==="
grep -c "\.md)" build/client/llms.txt
```

Esperado: todos os numeros bem acima do que eram, e o `llms.txt` citando dezenas de arquivos em vez de poucos.

- [ ] **Passo 5: rodar tudo**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
npm run e2e 2>&1 | tail -5
```

Esperado: `check EXIT=0` e todos os e2e verdes.

O `e2e/acessibilidade.spec.ts` deriva a lista de rotas do build, entao as paginas de case e de artigo entram automaticamente na varredura do axe. **E aqui que a Fase 1 e testada de verdade**: ate agora o axe so viu tres paginas de conteudo; agora ve trinta, com tabela, codigo, citacao e lista dentro do componente `prose`.

Se o axe reprovar, o defeito e de contraste ou de semantica dentro do `prose`, e ele deve ser corrigido, nunca silenciado.

- [ ] **Passo 6: commitar**

```bash
git add app/content/
git commit -m "feat: publica os 30 documentos de conteudo

Vinte e um documentos estavam escritos, traduzidos e presos em rascunho, e o
build os filtrava: o site tinha sitemap, feeds, llms.txt e espelho markdown
servindo tres paginas estaticas. Agora servem cinco cases e tres artigos, nos
idiomas em que cada um existe.

Os itens de trabalho e escritos aparecem no menu pela primeira vez: o layout
os esconde enquanto o indice esta vazio.

O JS critico sobe de 116.674 para cerca de 120.430 bytes, dentro do teto de
128.000. O indice de frontmatter cresce com o conteudo, e isso e legitimo."
```

---

## Tarefa 4: verificacao e pull request

- [ ] **Passo 1: portao completo, verificando codigo de saida**

```bash
npm run check >/dev/null 2>&1; echo "check EXIT=$?"
npm run build >/dev/null 2>&1; echo "build EXIT=$?"
npm run e2e >/dev/null 2>&1; echo "e2e EXIT=$?"
```

Esperado: `0` nos tres.

- [ ] **Passo 2: conferir o resultado no navegador**

```bash
npm run dev
```

Abra a URL impressa e confirme: o menu agora tem os itens de trabalho e escritos, a lista de cases mostra os cinco, o case do ODS e o da UPA trazem os nomes dos sistemas, e os tres cases internos seguem sem batizar produto. Troque de idioma e confirme que pt-PT nao oferece a secao de escritos, porque os artigos nao existem nesse idioma. Encerre com Ctrl+C.

- [ ] **Passo 3: abrir o PR**

```bash
git push -u origin HEAD
GODEBUG=netdns=cgo gh pr create \
  --title "Fase 4: publicar o conteudo" \
  --body "Closes #<numero>

Vinte e um documentos escritos e traduzidos saem do rascunho. O site passa a
publicar cinco cases e tres artigos.

- ODS Betim e UPA Agora nomeados: os dois foram lancados publicamente pela
  Prefeitura de Betim
- Os tres cases de sistema interno seguem sem batizar produto
- Sem link externo nesta fase, por decisao: falta conferir o que tem endereco
  publico. Adicionar depois e acrescentar campo, nao reescrever texto
- O fornecedor do sistema de saude continua anonimo, como manda o portao de
  termos proibidos

JS critico de 116.674 para cerca de 120.430 bytes, teto 128.000.

Spec: docs/superpowers/specs/2026-08-02-fanzine-design.md
Plano: docs/superpowers/plans/2026-08-02-fase-4-conteudo.md"
```

- [ ] **Passo 4: CI e merge**

```bash
GODEBUG=netdns=cgo gh pr checks --watch
GODEBUG=netdns=cgo gh pr merge --squash --delete-branch
git checkout main && git pull
```

---

## Criterio de aceite da fase

- [ ] Zero documentos em `status: rascunho`
- [ ] `npm run check`, `npm run build` e `npm run e2e` com codigo de saida 0
- [ ] O axe passa nas trinta paginas, e nao mais em tres
- [ ] JS critico abaixo de 125 KB
- [ ] Sitemap, feeds, `llms.txt` e espelhos `.md` refletindo os 30 documentos
- [ ] ODS Betim e UPA Agora nomeados nos tres idiomas
- [ ] Nenhum nome de sistema interno publicado
- [ ] Nenhum nome de fornecedor de sistema de saude publicado
- [ ] Nenhum link externo adicionado

## Bloqueado, nao esquecido

A spec inclui na Fase 4 mais dois itens, e os dois dependem de um fato que so o usuario tem:

**A rota `lab` e a fusao da Stack no CV.** Os dois repositorios se contradizem sobre a Monumental Assistencia 24h. O CV deste repositorio registra o cargo como "Gerente de atendimento", com um unico destaque, "Gestao da equipe de atendimento". O site-dev afirma que foi ali que DG "automatizou operacoes de atendimento usando LLMs (LangChain, LangGraph, RAG) e dashboards, reduzindo em 35% o tempo de atendimento".

As duas versoes podem ser verdadeiras ao mesmo tempo, mas o CV omite a parte tecnica por inteiro, e a rota `lab` existiria justamente para contar essa parte. Escrever historico profissional a partir de um palpite entre duas fontes que discordam nao e aceitavel, e o numero de 35 por cento e uma afirmacao verificavel sobre trabalho real.

Resolver isso e uma conversa, nao uma tarefa. Depois dela, `lab` e CV viram uma fase curta propria.
