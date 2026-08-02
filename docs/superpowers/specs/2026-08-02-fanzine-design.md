# Impresso: fusao do site-dev no diorgenesgeorge.dev

Data: 2026-08-02
Status: desenho aprovado, aguardando plano de implementacao

## 1. Contexto

Dois portfolios existiam em paralelo:

- **page-dev** (este repositorio, diorgenesgeorge.dev): React Router 8 em modo framework, SSR e prerender em Cloudflare Workers, tres idiomas, 30 documentos MDX, infraestrutura completa de SEO, AEO e GEO. Identidade visual "Papel Tecnico", com tema claro e escuro, duas fontes customizadas e um globo 3D com telemetria ao vivo.
- **site-dev** (diorgenes.dev): SPA Vite de pagina unica com seis secoes, identidade zine e punk (colagem, fita adesiva, papel rasgado, carimbo, nota de resgate), sem rotas, sem i18n e praticamente sem SEO.

O page-dev tem 4.983 linhas de fonte, das quais 2.516 sao infraestrutura de i18n, SEO, conteudo e rotas. O site-dev tem 1.065 linhas, quase todas de identidade visual. Reconstruir a infraestrutura dentro do site-dev custaria muito mais do que trazer a identidade visual para ca.

**Decisao central:** os dois portfolios viram um so. O codigo deste repositorio e a base, a identidade visual do site-dev e a pele, e o resultado fica no ar em `diorgenesgeorge.dev`.

## 2. Decisoes tomadas

| Questao | Decisao |
|---|---|
| Fusao | Um site unico, neste repositorio |
| Dominio canonico | `diorgenesgeorge.dev`, sem mudanca de `SITE_URL` |
| Repositorio GitHub | Recriar `DiorgenesT/diorgenesgeorge.dev` (foi deletado; o clone local tem os 45 commits, com 17 nunca empurrados) |
| Idiomas | Os tres ja existentes: pt-BR, pt-PT, en-US |
| Escopo visual | Identidade unica em todas as rotas. Reescrita em 2026-08-02: era zine, virou "Impresso" (ver secao 3.1) |
| Tema | Um so. O tema claro e escuro sai |
| Tipografia | Duas customizadas com papeis distintos (Archivo Black e Space Mono). Corpo na fonte do sistema |
| Movimento | Um gesto assinatura: a marca chega impressa, fora de registro |
| Elemento vivo da home | O desregistro do monograma, alimentado pela latencia do `/api/edge` |
| Rotas | As oito atuais mais uma nova, `lab` |
| Cases | Nomeiam os sistemas e linkam para producao e para as noticias oficiais |
| MCP Motion | Fora do escopo do site. E gerador de video, nao biblioteca de animacao |

## 3. Identidade: Impresso

**Reescrita em 2026-08-02**, depois de nove rodadas de prototipo. A identidade original era fanzine xerocado, com colagem, papel rasgado, fita adesiva, carimbo e nota de resgate. Ela foi abandonada, e a razao esta registrada na secao 3.1.

O site se comporta como um **objeto impresso**, nao como uma pagina que rola: papel, tinta, chapa e registro. Editorial minimo, muito ar, escala violenta entre o rotulo de 9px e a display de 300px, reguas e fios em vez de molduras fechando caixa, e uma unica cor de acento usada pouco.

**Um gesto assinatura, e so um: a marca chega impressa.** O monograma DG e recebido em chapas fora de registro, e a intensidade do desregistro vem da latencia real medida pelo `/api/edge`. Isso nao e decoracao: a tese do site e a borda, e a marca mostra a borda acontecendo. Fora dele, o site e quieto.

**Regra de identidade:** a imperfeicao e projetada, nunca sorteada. Deslocamento, fatia e desregistro vem de tabela fixa indexada em `app/design/desregistro.ts`, nunca de `Math.random` em render. Alem de o site tremer a cada visita, valor aleatorio produziria HTML diferente no servidor e no cliente e quebraria a hidratacao. **Esta regra sobreviveu inteira a troca de identidade, e e a melhor regra do projeto.**

**Paleta:** papel `#f2ede4`, tinta `#0a0a0a`, cinzas de leitura e um unico acento vermelho `#c81d25`. O contraste de cada par que carrega texto e validado em 4.5:1 por `app/design/tokens.test.ts`, nunca presumido. Uma cor de destaque so, e usada pouco, e o que separa impresso de interface.

**Tipografia:** duas familias customizadas, com papeis distintos.

| Familia | Papel | Onde entra | Piso de tamanho |
|---|---|---|---|
| **Archivo Black** | A display | Monograma, titulos, numeros grandes. Token `--font-display` | sem piso |
| **Space Mono** | O rotulo tecnico | Metadado, numeracao de sumario, rodape. Token `--font-mono` | **13px** |
| Pilha do sistema | A leitura | Todo corpo de texto: paragrafo, artigo, case, CV. Token `--font-sans` | sem piso |

As duas sao self-hosted em woff2 latin, nunca por CDN: a CSP declara `connect-src 'self'` e `font-src 'self'`, e o site nao faz requisicao a dominio externo. As duas usam `font-display: optional`, entao nenhuma segura o LCP em hipotese alguma: em rede ruim o visitante ve a pilha do sistema naquele carregamento, e o custo e de dados, nao de tempo de pintura.

Peso medido em 2026-08-02: Archivo Black 18.604 bytes e Space Mono 16.520 bytes, somando 35.124, com teto de 40.000. As duas primeiras escolhas, Anton e Special Elite, custavam 71.908 juntas e sairam quando o fanzine foi abandonado: Anton era condensada demais para um monograma que precisa dominar a tela, e a Special Elite pagava 53 KB por um desgaste datilografado que deixou de fazer sentido.

**Duas regras duras sobre o rotulo tecnico:**

1. Nunca abaixo de 13px. A regra nasceu com a Special Elite, que desmontava em 11,5px; com a Space Mono a razao passa a ser consistencia e conforto de leitura, e o valor fica.
2. Nunca recebe texto longo. So rotulo, metadado, numeracao e rodape. Frase corrida e paragrafo sao sempre da pilha do sistema.

A Fase 1 trava as duas regras em teste, para que nao dependam de disciplina.

### 3.1 Por que o fanzine foi abandonado

Registrado para que a decisao nao seja revertida por engano, e para que ninguem refaca o caminho.

A identidade original era fanzine xerocado. Ao longo de nove rodadas de prototipo, cada rodada removeu um sinal de fanzine a pedido do usuario, e cada remocao melhorou o desenho: saiu a rotacao, saiu a sombra dura, saiu a fita, saiu o papel rasgado, saiu o adesivo, saiu o carimbo, saiu a marca de corte, saiu a grade visivel, saiu o numero de pagina gigante.

O levantamento em 2026-08-02 mostrou o resultado no codigo, e ele foi o argumento decisivo:

| Componente construido na Fase 1 | Usos no site |
|---|---|
| `Adesivo` | 0 |
| `FitaAdesiva` | 0 |
| `Carimbo` | 0 |
| `PapelRasgado` | 3 |
| `NotaDeResgate` | 1 |

Tres dos cinco componentes eram codigo morto, e o token de cor `fita` nao pintava nada em lugar nenhum. Nove rodadas na mesma direcao nao e ruido, e tendencia: o que emergiu nao era um fanzine mal executado, era outra ideia, melhor, e mais adequada a um site com trinta documentos longos, que colagem nunca escalaria.

**O que morreu:** adesivo, fita adesiva, papel rasgado, carimbo, nota de resgate, o amarelo fita, a rotacao de elemento, a sombra dura, a colagem no scroll e a palavra fanzine.

**O que sobreviveu:** a regra do determinismo, a granulacao, o papel, a tinta, o alto contraste, as duas fontes, e toda a infraestrutura de tokens, contraste validado e teste de componente que a Fase 1 produziu. **A Fase 1 nao foi desperdicio:** foi ela que construiu a base sobre a qual esta identidade roda. So a camada de enfeite caiu.

**O que nao foi tocado:** conteudo, i18n, SEO, rotas, testes de conteudo e orcamento.

**Estrutura de pagina:** a capa carrega o monograma e o sumario da publicacao; nas outras rotas o cabecalho e a navegacao, e o corpo e editorial e quieto.

## 4. Arquitetura

Base preservada: React Router 8 em modo framework, SSR e prerender em Cloudflare Workers, MDX versionado, Vitest, Playwright, CI no GitHub.

### Sai

| Item | Motivo |
|---|---|
| `three`, `@react-three/fiber`, `app/hero/globe-scene.tsx`, `globe-static.tsx`, `graticule.ts`, `projection.ts`, `camera-motion.ts`, `scene-colors.ts` | 232 KB gzip em chunk lazy, e o globo nao existe no vocabulario do zine |
| `motion` e `app/motion/animated-outlet.tsx` | 38,7 KB gzip em chunk lazy, para um fade de 24px. Substituido por View Transitions API nativa |

Atencao ao ler os numeros acima: os 232 KB e os 38,7 KB estao em chunks lazy. Removidos, eles saem do **total baixado numa visita tipica**, cerca de 270 KB a menos, e nao do **JS critico**, que quase nao se mexe. O critico e React, router, i18n e o indice de conteudo. Ver a secao 8.
| `@fontsource-variable/instrument-sans`, `@fontsource/ibm-plex-mono` | Substituidas por uma unica display subsetada |
| `app/design/theme.ts`, `theme-toggle.tsx` e os dois conjuntos de tokens | O zine tem um tema so |

### Entra, vindo do site-dev

`Adesivo`, `FitaAdesiva`, `PapelRasgado`, `Carimbo`, `NotaDeResgate`, `IconesRedesSociais`, os tokens deterministas de rotacao (`obterRotacao`) e o hook `useAnimacaoColagem`. Os testes que acompanham cada um vem junto.

### Permanece intacto

Todo o `app/i18n`, todo o `app/seo`, o registry de conteudo em `app/content`, os scripts de build (`build-content-index`, `build-markdown`, `build-headers`, `build-404`, `check-budget`, `validate-content`, `prerender-paths`) e o endpoint `workers/api/edge.ts`.

### Dependencias apos a fusao

Ficam: `react`, `react-dom`, `react-router`, `gsap`, `isbot`, `zod`. Saem: `three`, `@react-three/fiber`, `@types/three`, `motion`, as duas fontes do fontsource.

## 5. Movimento

**Um gesto assinatura, e o resto quieto.** A pagina nao tem varios elementos animados: tem a recepcao da marca, e nada mais compete com ela.

| Gesto | Implementacao | Custo |
|---|---|---|
| Recepcao da marca | Seis fatias por letra em `clip-path`, mais a chapa de acento fora de registro. A intensidade sai de `cargaDeLatencia(rttMs)`, a duracao e fixa em 900ms | CSS puro, tabela em `app/design/desregistro.ts` |
| Transicao de pagina | View Transitions API nativa, via a prop `viewTransition` do React Router | 0 KB |
| Sumario da capa | Deslocamento do rotulo e troca de cor no hover e no `:focus-visible` | CSS puro |
| Colagem no scroll | **Removida** junto com o fanzine. O `Reveal` com GSAP permanece por ora e sera reavaliado na fase de movimento | GSAP em chunk lazy, fora do critico |

**Duracao fixa, intensidade variavel.** Ligar as duas coisas a latencia castigava duas vezes quem esta em conexao ruim: marca mais quebrada **e** espera mais longa ate a pagina assentar. So a corrupcao varia.

**Piso de corrupcao alto de proposito.** Em rede local o RTT e de um a tres milissegundos, e com piso baixo a marca chegava praticamente limpa, o que apagava o gesto justamente para quem esta perto do datacenter, que e o caso que o site quer celebrar. O piso garante que toda visita veja a impressao acontecer.

Sob `prefers-reduced-motion: reduce`, todo o movimento desliga e a marca **aparece assentada**, e nao ausente. Nada e escondido por CSS a espera de animacao: sem JavaScript a pagina ja esta correta.

## 6. Rotas e conteudo

Nove rotas mais a 404, em tres idiomas, com slugs localizados como ja acontece hoje.

| Rota | Origem | Situacao |
|---|---|---|
| `home` | page-dev | Recomposta: monograma recebido, sumario da publicacao, faixa de prova |
| `sobre` | page-dev, publicado | Pele nova |
| `cv` | page-dev, estruturado em TS | Recebe as skills agrupadas, absorvendo a secao Stack do site-dev |
| `servicos` | page-dev, publicado | Pele nova |
| `trabalho` | page-dev, 5 cases em rascunho | Reescrever nomeando os sistemas, publicar |
| `escritos` | page-dev, 3 artigos em rascunho | Revisar e publicar. Mantem tags e feeds |
| `lab` | **nova**, herda o LabIA do site-dev | Escrever: automacao de atendimento com LLM, LangChain, LangGraph e RAG |
| `contato` | page-dev | Pele nova |
| `colofao` | page-dev, publicado | Reescrever contando o custo real do site novo |
| `404` | page-dev | Ganha minigame e mural de recados |

### Estado do conteudo

Levantamento em 2026-08-02: **9 documentos publicados** (as tres paginas estaticas nos tres idiomas) e **21 em rascunho** (5 cases e 3 artigos, nos idiomas em que existem). O build filtra rascunho, entao o site publica hoje zero cases e zero artigos. Este e o maior buraco de SEO do projeto, maior que qualquer questao tecnica.

Os cases passam a nomear e linkar: Fundacao Beta, UPA Agora, IEGM Betim, Portal do Servidor e ODS Betim, cada um com link para o sistema no ar e, quando existir, para a noticia oficial da prefeitura. Prova externa verificavel e o que mais pesa em E-E-A-T e o que mais leva um assistente a citar a fonte.

## 7. SEO, AEO e GEO

### Ja existe e permanece

Canonical absoluta, Open Graph, hreflang reciproco com `x-default`, `sitemap.xml`, `robots.txt`, RSS e JSON Feed por idioma, JSON-LD (`Person` com `alternateName` para desambiguacao de entidade, `WebSite`, `ProfilePage`, `BreadcrumbList`, `TechArticle`, `SoftwareApplication`, `Service`), o componente `AnswerBlock` de resposta direta citavel, espelho `.md` de cada pagina publicada, `llms.txt` e `llms-full.txt`.

### Falta

1. **Publicar os 21 rascunhos.** Sem isso, nada mais importa.
2. `og:image` real. Hoje o card e `summary` sem imagem. Gerar uma capa por rota, em build, no vocabulario de impresso.
3. `ItemList` nas paginas indice (`trabalho`, `escritos`, `lab`).
4. `FAQPage` onde a pergunta surgir naturalmente, sem forcar.
5. `llms.txt` revisado para citar as nove rotas, incluindo a nova `lab`.
6. Verificar que a rota `lab` entra no sitemap, nos feeds quando fizer sentido, e no espelho `.md`.

Nao ha migracao de dominio: `SITE_URL` continua `https://diorgenesgeorge.dev`.

## 8. Orcamento de performance

Bloqueia merge se estourar.

| Metrica | Alvo |
|---|---|
| JS critico da home, gzip | teto duro 125 KB |
| JS total baixado numa visita tipica | queda de cerca de 270 KB em relacao a hoje |
| Lighthouse mobile, Performance | maior ou igual a 95 |
| Lighthouse, Acessibilidade | 100 |
| LCP | menor que 2.0s |
| CLS | menor que 0.05 |
| Long tasks durante scroll | zero acima de 50ms |
| Fontes customizadas | duas (Archivo Black e Space Mono), self-hosted, latin, `font-display: optional`, teto de 40.000 bytes |

Baseline medido em 2026-08-02: **119.065 bytes** de JS critico com 9 documentos publicados, contra o teto de 132 KB que vigorava.

### Por que o teto e 125 KB e nao menos

O JS critico e composto de React, router, i18n, tratamento de erro e o indice de frontmatter do conteudo. Remover o globo e o `motion` **nao** o reduz, porque os dois vivem em chunks lazy: o ganho deles esta no total baixado, nao no critico. A Fase 0 economiza no critico apenas o tema e a deteccao de ambiente do globo, cerca de 1,5 KB.

Na direcao oposta, **publicar conteudo aumenta o critico**. O indice de frontmatter entra no bundle da home e ocupa hoje 5.326 bytes de fonte para 9 documentos publicados. Com os 30 publicados na Fase 4, o proprio comentario do `check-budget.ts` ja projeta cerca de 122 KB. Um teto de 120 KB reprovaria a propria Fase 4.

O teto de 125 KB acomoda os 30 documentos com folga real e continua barrando regressao de verdade, que e o proposito do portao: um vazamento chega de uma vez, em dezenas de KB.

### Tarefa obrigatoria da Fase 4

Se o critico passar de 125 KB ao publicar os 30 documentos, a solucao **nao** e elevar o teto: e parar de mandar para a home o indice de todo o site. A home precisa dos tres artigos mais recentes, nao do frontmatter de trinta documentos. A correcao e recortar o indice por rota, ou carregar o indice completo sob demanda apenas nas paginas que o listam.

GSAP, o carimbo de recepcao e qualquer coisa relacionada carregam depois do first paint. O `check-budget.ts` continua sendo o portao, com o teto ajustado para 125 KB.

## 9. Acessibilidade

WCAG 2.1 AA e eMAG como referencia. Navegacao completa por teclado. O monograma e decoracao e leva aria-hidden: quem diz de quem e a pagina e o h1 com o nome completo. Contraste minimo 4.5:1, validado em teste e nao presumido: o alto contraste ajuda, mas o acento vermelho precisa ser verificado sobre cada fundo. Texto real em HTML, nunca texto importante dentro de imagem. Foco visivel em todo elemento interativo. `axe-core` no Playwright continua rodando.

## 10. Convencoes

Todo texto em pt-BR: codigo, comentarios, commits, documentos e interface. Sem emojis. Sem travessao e sem meia-risca em nenhum texto; usar virgula, dois pontos ou parenteses. Conventional Commits em portugues. Nunca adicionar co-author trailers. TypeScript com `strict: true`, proibido `any` e `ts-ignore`, usar `unknown` com narrowing.

O `CLAUDE.md` do site-dev migra para este repositorio na Fase 0, atualizado com as decisoes acima, e entra no `.gitignore`.

## 11. Fases

Cada fase termina com `npm run check`, `npm run e2e` e `check-budget` passando, e com o orcamento revalidado.

### Fase 0: fundacao

Recriar `DiorgenesT/diorgenesgeorge.dev` no GitHub e empurrar os 45 commits locais. Arrancar `three`, `@react-three/fiber`, `motion`, as duas fontes e o tema claro/escuro. Substituir a transicao de pagina por View Transitions. Trazer o `CLAUDE.md`. Ajustar o teto do `check-budget` de 132 para 125 KB.

Criterio de aceite: o site continua funcionando identico ao atual menos o globo, o tema e as fontes; o total baixado numa visita cai cerca de 270 KB; o JS critico fica em torno de 117,5 KB, abaixo do novo teto; todos os testes verdes. Nenhuma mudanca de identidade visual ainda.

### Fase 1: sistema visual (entregue, PR #4)

Paleta com contraste medido, as duas fontes versionadas, granulacao, e os cinco componentes de papel com seus testes.

**Nota de 2026-08-02:** os cinco componentes de papel foram removidos quando o fanzine foi abandonado (secao 3.1). O que a fase produziu e continua valendo: os tokens, o teste de contraste, as duas fontes, a granulacao e a infraestrutura de teste de componente com jsdom.

### Fase 2: a capa (em andamento)

O monograma DG recebido em chapas fora de registro, o sumario da publicacao ao lado, e a faixa de prova abaixo. O cabecalho esconde os proprios links na capa, porque ali o sumario ja e o indice; nas outras oito rotas ele permanece, e e a unica navegacao que existe.

Criterio de aceite: LCP abaixo de 2.0s medido, CLS abaixo de 0.05 com a marca sendo recebida, o `h1` continua sendo o nome completo, o monograma continua fora da arvore de acessibilidade, e nenhum dado de telemetria aparece na tela.

### Fase 3: movimento

Reavaliar o `Reveal` com GSAP. Com a identidade nova, entrada por scroll pode ser ruido em vez de gesto, e a fase precisa decidir se ele fica, muda ou sai. Se ficar, `ScrollTrigger.batch` em chunk lazy, desligado sob `prefers-reduced-motion`.

Criterio de aceite: zero long task acima de 50ms durante scroll, medido; GSAP fora do bundle critico; a pagina correta com JavaScript desativado. **Se a decisao for remover o GSAP, o criterio passa a ser a queda do chunk e um site sem biblioteca de animacao nenhuma.**

### Fase 4: conteudo

Reescrever os 5 cases nomeando os sistemas e linkando, revisar os 3 artigos, publicar os 21 documentos nos tres idiomas. Escrever a rota `lab`. Migrar a Stack do site-dev para as skills agrupadas do CV.

Criterio de aceite: `validate-content` verde, os 30 documentos publicados, sitemap e feeds refletindo tudo, `llms.txt` citando as nove rotas, e o JS critico ainda abaixo de 125 KB (ver a tarefa obrigatoria na secao 8: se estourar, recortar o indice de conteudo por rota em vez de elevar o teto).

### Fase 5: SEO e AEO

`og:image` gerada em build por rota, `ItemList` nas paginas indice, `FAQPage` onde couber, e2e de SEO ampliado para cobrir a rota `lab` e as novas estruturas.

Criterio de aceite: `e2e/seo.spec.ts` verde e ampliado, JSON-LD validado, todas as rotas com card de imagem.

### Fase 6: 404 e mural

Minigame na 404 e mural de recados com recortes arrastaveis e posicao em `localStorage`.

Criterio de aceite: a 404 continua respondendo status 404, e nada do minigame entra no bundle das outras rotas.

## 12. Questoes em aberto

Nao ha questoes em aberto no momento. As duas anteriores foram resolvidas: o `dev-portifolio` foi confirmado morto e a tipografia foi decidida em 2026-08-02 (ver a secao 3).
- **Restricao institucional**: nomear os sistemas da prefeitura no portfolio foi aprovado. Se surgir qualquer restricao da Fundacao Beta, o conteudo volta ao formato anonimizado que ja esta escrito nos rascunhos.

## 13. Fora de escopo

- MCP Motion no site. E gerador de video por IA, nao biblioteca de animacao. Pode virar tarefa separada de divulgacao (video curto para LinkedIn e Instagram, hospedado fora do site).
- Marcador de cursor que rabisca a pagina. Avaliado e descartado.
- Scroll sequestrado, parallax pesado, video e WebGL. Incompativeis com o orcamento.
- O repositorio `site-dev` no GitHub, que fica como arquivo.
- O repositorio `DiorgenesT/dev-portifolio`, confirmado morto em 2026-08-02. Nada dele e aproveitado.
