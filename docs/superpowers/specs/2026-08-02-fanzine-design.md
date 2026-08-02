# Fanzine: fusao do site-dev no diorgenesgeorge.dev

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
| Escopo visual | Zine total, em todas as rotas, inclusive corpo de texto |
| Tema | Um so. O tema claro e escuro sai |
| Tipografia | Uma display subsetada, apenas em titulos. Corpo na fonte do sistema |
| Movimento | Direcao "papel na sua mao", sem marcador de cursor |
| Elemento vivo da home | Carimbo de recepcao, alimentado por `/api/edge` |
| Rotas | As oito atuais mais uma nova, `lab` |
| Cases | Nomeiam os sistemas e linkam para producao e para as noticias oficiais |
| MCP Motion | Fora do escopo do site. E gerador de video, nao biblioteca de animacao |

## 3. Identidade

Estetica DIY, zine e punk dos anos 90 e 2000: fanzine xerocado, colagem manual, recortes de papel rasgado, fita adesiva, carimbos, letras de nota de resgate, rabiscos, textura de fotocopia com granulacao, elementos levemente rotacionados e desalinhados de proposito.

**Regra de identidade:** o caos visual e cuidadosamente projetado. Rotacoes, jitter e desalinhamentos vem de tokens deterministas, valores fixos por elemento, nunca `Math.random` em render. O site parece feito a mao e se comporta de forma estavel.

**Paleta:** papel `#f4f1ea`, tinta `#12100e`, vermelho punk, amarelo fita crepe. O contraste de cada acento sobre cada fundo e validado em 4.5:1 por teste automatizado, nunca presumido. Os tokens de `app/design/contrast.ts` ja fazem essa checagem e sao reaproveitados.

**Tipografia:** uma display condensada ou stencil, subsetada em woff2 latin, aplicada apenas a titulos, com `font-display: optional` para que jamais segure o LCP. O corpo do texto usa a pilha sans-serif do sistema. A escolha da display acontece na Fase 1, com opcoes comparadas no navegador.

**Estrutura de pagina:** cada rota e uma pagina numerada do fanzine, com sumario no cabecalho.

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

Direcao "o papel na sua mao", sem marcador de cursor. O marcador foi avaliado e descartado por tres motivos: risca por cima de texto real e derruba contraste, gasta CPU durante o scroll, e nao existe em toque.

| Gesto | Implementacao | Custo |
|---|---|---|
| Colagem no scroll | GSAP `ScrollTrigger.batch` em chunk lazy, dois rAF encadeados apos o mount. O elemento assenta na rotacao deterministica que os tokens ja definem, nunca numa rotacao aleatoria nova | GSAP 27 KB + ScrollTrigger 17 KB, fora do critico |
| Adesivo que descola | `transform: rotateY` mais sombra, em `:hover` e `:focus-visible` | CSS puro |
| Fita que levanta | `transform: rotateY` com origem na ponta | CSS puro |
| Vinco no canto da folha | Gradiente em `::after`, cresce no hover da pagina | CSS puro |
| Recorte arrastavel | Pointer events, apenas no mural do rodape e na 404. Posicao guardada em `localStorage` | JS local, poucas linhas |
| Transicao de pagina | View Transitions API nativa, via a prop `viewTransition` do React Router | 0 KB |
| Carimbo de recepcao | `fetch('/api/edge')` depois do LCP, batendo cidade, colo, RTT e protocolo em tinta vermelha torta | Endpoint ja existe |

Sob `prefers-reduced-motion: reduce`, todo o movimento desliga e o estado final e o padrao do HTML. Nada e escondido por CSS a espera de animacao: sem JavaScript a pagina ja esta correta.

O carimbo degrada em silencio. Se `/api/edge` falhar ou estourar o timeout, ele simplesmente nao aparece, e o layout nao se mexe (espaco reservado, sem CLS).

## 6. Rotas e conteudo

Nove rotas mais a 404, em tres idiomas, com slugs localizados como ja acontece hoje.

| Rota | Origem | Situacao |
|---|---|---|
| `home` | page-dev | Recomposta: capa de fanzine, carimbo de recepcao, sumario, faixa de prova |
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
2. `og:image` real. Hoje o card e `summary` sem imagem. Gerar uma capa de zine por rota, em build.
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
| Fontes customizadas | uma, subsetada, `font-display: optional` |

Baseline medido em 2026-08-02: **119.065 bytes** de JS critico com 9 documentos publicados, contra o teto de 132 KB que vigorava.

### Por que o teto e 125 KB e nao menos

O JS critico e composto de React, router, i18n, tratamento de erro e o indice de frontmatter do conteudo. Remover o globo e o `motion` **nao** o reduz, porque os dois vivem em chunks lazy: o ganho deles esta no total baixado, nao no critico. A Fase 0 economiza no critico apenas o tema e a deteccao de ambiente do globo, cerca de 1,5 KB.

Na direcao oposta, **publicar conteudo aumenta o critico**. O indice de frontmatter entra no bundle da home e ocupa hoje 5.326 bytes de fonte para 9 documentos publicados. Com os 30 publicados na Fase 4, o proprio comentario do `check-budget.ts` ja projeta cerca de 122 KB. Um teto de 120 KB reprovaria a propria Fase 4.

O teto de 125 KB acomoda os 30 documentos com folga real e continua barrando regressao de verdade, que e o proposito do portao: um vazamento chega de uma vez, em dezenas de KB.

### Tarefa obrigatoria da Fase 4

Se o critico passar de 125 KB ao publicar os 30 documentos, a solucao **nao** e elevar o teto: e parar de mandar para a home o indice de todo o site. A home precisa dos tres artigos mais recentes, nao do frontmatter de trinta documentos. A correcao e recortar o indice por rota, ou carregar o indice completo sob demanda apenas nas paginas que o listam.

GSAP, o carimbo de recepcao e qualquer coisa relacionada carregam depois do first paint. O `check-budget.ts` continua sendo o portao, com o teto ajustado para 125 KB.

## 9. Acessibilidade

WCAG 2.1 AA e eMAG como referencia. Navegacao completa por teclado, incluindo o recorte arrastavel, que precisa de alternativa por teclado ou de ser explicitamente marcado como enriquecimento dispensavel. Contraste minimo 4.5:1, validado em teste e nao presumido: o alto contraste do zine ajuda, mas os acentos vermelho e amarelo precisam ser verificados sobre cada fundo. Texto real em HTML, nunca texto importante dentro de imagem de colagem. Foco visivel em todo elemento interativo. `axe-core` no Playwright continua rodando.

## 10. Convencoes

Todo texto em pt-BR: codigo, comentarios, commits, documentos e interface. Sem emojis. Sem travessao e sem meia-risca em nenhum texto; usar virgula, dois pontos ou parenteses. Conventional Commits em portugues. Nunca adicionar co-author trailers. TypeScript com `strict: true`, proibido `any` e `ts-ignore`, usar `unknown` com narrowing.

O `CLAUDE.md` do site-dev migra para este repositorio na Fase 0, atualizado com as decisoes acima, e entra no `.gitignore`.

## 11. Fases

Cada fase termina com `npm run check`, `npm run e2e` e `check-budget` passando, e com o orcamento revalidado.

### Fase 0: fundacao

Recriar `DiorgenesT/diorgenesgeorge.dev` no GitHub e empurrar os 45 commits locais. Arrancar `three`, `@react-three/fiber`, `motion`, as duas fontes e o tema claro/escuro. Substituir a transicao de pagina por View Transitions. Trazer o `CLAUDE.md`. Ajustar o teto do `check-budget` de 132 para 125 KB.

Criterio de aceite: o site continua funcionando identico ao atual menos o globo, o tema e as fontes; o total baixado numa visita cai cerca de 270 KB; o JS critico fica em torno de 117,5 KB, abaixo do novo teto; todos os testes verdes. Nenhuma mudanca de identidade visual ainda.

### Fase 1: sistema visual

Portar os seis componentes de papel do site-dev com seus testes. Portar os tokens deterministas de rotacao. Escolher a display (opcoes comparadas no navegador). Redesenhar o layout de pagina como pagina de fanzine, com sumario e numeracao. Validar contraste por teste.

Criterio de aceite: todas as nove rotas renderizam na identidade zine, contraste 4.5:1 verificado, acessibilidade 100, orcamento intacto.

### Fase 2: home

Capa de fanzine, sumario recortado, faixa de prova e carimbo de recepcao alimentado por `/api/edge`, batido apos o LCP, com espaco reservado para nao gerar CLS e degradacao silenciosa em caso de falha.

Criterio de aceite: LCP abaixo de 2.0s medido, CLS abaixo de 0.05, o carimbo aparece com dado real e o site nao quebra com o endpoint fora do ar.

### Fase 3: movimento

Hook `useAnimacaoColagem` com GSAP `ScrollTrigger.batch` em chunk lazy. Adesivo que descola, fita que levanta, vinco no canto. Recorte arrastavel no rodape. Tudo desligado sob `prefers-reduced-motion`.

Criterio de aceite: zero long task acima de 50ms durante scroll, medido; GSAP fora do bundle critico; a pagina esta correta com JavaScript desativado.

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

- **Qual display**: decidido na Fase 1, com opcoes comparadas no navegador.
- **Restricao institucional**: nomear os sistemas da prefeitura no portfolio foi aprovado. Se surgir qualquer restricao da Fundacao Beta, o conteudo volta ao formato anonimizado que ja esta escrito nos rascunhos.

## 13. Fora de escopo

- MCP Motion no site. E gerador de video por IA, nao biblioteca de animacao. Pode virar tarefa separada de divulgacao (video curto para LinkedIn e Instagram, hospedado fora do site).
- Marcador de cursor que rabisca a pagina. Avaliado e descartado.
- Scroll sequestrado, parallax pesado, video e WebGL. Incompativeis com o orcamento.
- O repositorio `site-dev` no GitHub, que fica como arquivo.
- O repositorio `DiorgenesT/dev-portifolio`, confirmado morto em 2026-08-02. Nada dele e aproveitado.
