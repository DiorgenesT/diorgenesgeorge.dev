# Site pessoal de Diorgenes George — Design

**Data:** 2026-07-31
**Status:** aprovado, pronto para plano de implementação
**Domínio final:** `diorgenesgeorge.dev`

---

## 1. Objetivo

Site pessoal de desenvolvedor que atende quatro objetivos, nesta ordem de prioridade:

1. **Conseguir vaga** (Brasil e exterior) — recrutadores e tech leads
2. **Atrair clientes** de freelance/consultoria
3. **Construir autoridade técnica** — blog indexável
4. **Vitrine de portfólio**

Cada persona tem um caminho próprio a partir da home. O site não tenta falar com todas ao mesmo tempo na mesma tela.

### Critério de sucesso

- Buscar "Diorgenes George" no Google retorna o site em primeiro lugar
- Perguntar a um assistente de IA "quem é Diorgenes George" retorna uma resposta correta, atribuída ao site
- Um recrutador entende senioridade e stack em menos de 30 segundos na home
- Core Web Vitals verdes em campo (não só em laboratório)

---

## 2. Direção visual

**Conceito: "Edge / Rede" — a borda como estética.** Escuro, alto contraste, linguagem de painel de operação.

### As cinco regras (critério de aceite, não sugestão)

O risco desta direção é parecer template. Cinco regras a evitam. Violar qualquer uma é bug de design:

1. **Zero número falso.** Todo dado exibido vem de `request.cf` no Worker, de medição real no browser, ou de um fato verificável. Métrica sem origem não entra.
2. **O globo não gira à toa.** Ele exibe dois pontos — o visitante e o datacenter que serviu a página — ligados por um arco. Cada visitante vê uma imagem diferente. É a propriedade que nenhum template consegue reproduzir.
3. **Paleta com autoria.** Preto de subtom quente, não cinza neutro. Âmbar, não o laranja da Cloudflare. Um acento, com disciplina.
4. **Tipografia que não é Inter.**
5. **Movimento com física.** Inércia e massa via GSAP, não `fade-in 0.3s`. Sempre com `prefers-reduced-motion` respeitado.

### Paleta — Ônix + Âmbar

**Tema escuro (padrão):**

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0A0908` | Fundo base (preto de subtom quente) |
| `--bg-raised` | `#1a1512` | Gradiente radial do hero, superfícies elevadas |
| `--fg` | `#F2EEE9` | Texto principal (branco osso) |
| `--fg-muted` | `#a8a099` | Texto secundário |
| `--fg-subtle` | `#857E76` | Rótulos, metadados (corrigido de `#7D766F`, que media 4.45:1 e reprovava em AA) |
| `--accent` | `#FFA033` | Âmbar — ações, destaques |
| `--accent-fg` | `#17120E` | Texto sobre âmbar |
| `--signal` | `#4BE38A` | Verde — **exclusivamente** status ao vivo |
| `--hairline` | `rgba(242,238,233,.08)` | Divisórias |

**Tema claro — "Papel Técnico":** não é o escuro invertido. Fundo osso (`#F5F2ED`), tinta quase preta, mesmo âmbar recalibrado para contraste. Duas identidades irmãs.

Todo par de cores usado em texto é medido contra WCAG 2.1 AA (4.5:1 texto normal, 3:1 texto grande e elementos gráficos) **nos dois temas**. Contraste é medido, nunca estimado.

### Tipografia

| Papel | Fonte |
|---|---|
| Títulos, corpo | **Instrument Sans** |
| Destaque editorial (itálico em quebra de frase) | **Instrument Serif Italic** |
| Dados, telemetria, rótulos, código | **IBM Plex Mono** |

Todas com licença aberta, **auto-hospedadas** em `woff2` subsetado. Sem Google Fonts CDN — melhora performance e permite CSP estrita. `font-display: swap`, com métricas de fallback (`size-adjust`) para CLS zero.

O itálico serif é usado com parcimônia e sempre numa quebra de frase escolhida — é uma decisão editorial deliberada, e é o principal antídoto contra aparência gerada.

### Movimento

- **GSAP + ScrollTrigger** — cenas e narrativa de scroll
- **Motion** — estado de componente e transição de rota
- Sem sobreposição de responsabilidade entre as duas
- `prefers-reduced-motion: reduce` → toda animação vai direto ao estado final; nada de movimento residual

---

## 3. Arquitetura de sistema

### Stack

React Router v7 (framework mode) · Vite 7 · TypeScript `strict` · Tailwind CSS v4 (config CSS-first) · GSAP · Motion · Three.js via React Three Fiber · MDX (`@mdx-js/rollup`) · Zod · Vitest · Playwright · Wrangler.

### Renderização e deploy

Todas as rotas de conteúdo são **pré-renderizadas em build** (`prerender` do React Router v7) e servidas como HTML estático pelos **Workers Static Assets**. Nenhuma página de conteúdo executa compute em runtime.

Um único Worker atende:

| Rota | Responsabilidade |
|---|---|
| `/` (exata) | 302 negociando `Accept-Language` para o locale apropriado |
| `/api/edge` | Telemetria do visitante a partir de `request.cf` |
| `/api/chat` | Agente de IA (streaming) |
| `/api/contato` | Formulário → Cloudflare Email Service |
| (todas) | Injeção de headers de segurança |

**Justificativa:** o conteúdo é estático. SSR só adicionaria latência e complexidade. HTML pronto no edge dá o melhor LCP e o melhor SEO possíveis, com custo próximo de zero.

### Telemetria do hero (`/api/edge`)

O HTML estático renderiza imediatamente com o painel em estado de esqueleto. Ao montar, o cliente busca `/api/edge`, que devolve, a partir de `request.cf`: cidade e país do visitante, colo que serviu, protocolo HTTP, versão TLS e distância calculada entre visitante e colo. O RTT é medido no browser (tempo da própria requisição).

Isso preserva SSG e LCP e mantém a regra 1: nenhum número do hero é inventado.

**Privacidade:** os dados são apresentados ao próprio visitante e descartados. Nada de geolocalização é armazenado ou logado.

### Agente de IA — RAG sem Vectorize

**Restrição verificada:** Vectorize só existe no plano Workers Paid. Workers AI dá 10.000 Neurons/dia no Free. Modelos disponíveis no Free incluem `glm-4.7-flash`, `gemma-4-26b-a4b-it` e `nemotron-3-120b-a12b`.

**Pipeline de build** (`scripts/build-index.ts`):

1. Varre o corpus: CV, cases, artigos MDX, metadados dos repositórios
2. Fatia em ~200 trechos com sobreposição, preservando origem (URL, título, idioma)
3. Gera embeddings via Workers AI com um modelo multilíngue. Primeira tarefa da Fase 3: consultar o catálogo de modelos e escolher o melhor modelo de embedding multilíngue disponível no plano Free (candidato: `bge-m3`), registrando a escolha no colofão
4. Quantiza os vetores para `int8` com escala por vetor
5. Emite `app/data/knowledge-index.json`, embarcado no bundle do Worker (~150 KB, bem abaixo do limite)

**Runtime** (`POST /api/chat`):

1. Valida o payload com Zod (tamanho máximo, formato)
2. Verifica Turnstile na primeira mensagem da sessão
3. Verifica rate limit por IP (binding de Rate Limiting)
4. Verifica o orçamento diário de Neurons em KV
5. Embeda a pergunta (1 chamada Workers AI)
6. Similaridade de cosseno em JS puro sobre ~200 vetores — sub-milissegundo, sem I/O
7. Monta o prompt com os trechos top-k e suas fontes
8. Faz streaming da geração (SSE) para o cliente

**Degradação graciosa — requisito, não extra:** quando o orçamento diário de Neurons se aproxima do limite, o agente para de gerar e passa a responder de forma **extrativa**: devolve os trechos recuperados com link para a página de origem. O visitante sempre recebe resposta útil. Nunca um erro, nunca uma cobrança inesperada.

**Guardrails:**

- System prompt fixo, restrito ao corpus
- Toda resposta cita a página de origem, com link
- Fora de escopo → recusa explícita e sugere o que ele *sabe* responder
- Sem execução de ferramentas; a saída do modelo nunca vira ação
- Entrada limitada em tamanho e sanitizada

**Plano B documentado:** AI Search (AutoRAG) — disponível no Free com 20.000 consultas/mês. Só se a abordagem embarcada se mostrar inviável. Perde-se controle e valor demonstrativo.

### Módulos e fronteiras

| Módulo | Responsabilidade | Depende de |
|---|---|---|
| `app/routes/*` | Rotas e composição de página | design system, conteúdo |
| `app/design/*` | Tokens, primitivos, temas | — |
| `app/content/*` | Carga e tipagem de MDX, cases, CV | Zod |
| `app/i18n/*` | Dicionários, negociação, formatação | — |
| `app/seo/*` | Metadata, JSON-LD, hreflang | conteúdo, i18n |
| `app/hero/*` | Cena 3D, telemetria, motion | design system |
| `app/agent/*` | UI do chat | — |
| `worker/*` | Endpoints, headers, rate limit, RAG | índice de conhecimento |
| `scripts/*` | Build do índice, OG images, PDF do CV | conteúdo |

Regra de fronteira: `worker/` nunca importa de `app/routes/`; `app/` nunca importa segredos ou bindings.

---

## 4. Rotas e conteúdo

Prefixo de idioma obrigatório em toda rota: `/pt-br/`, `/pt-pt/`, `/en/`. Os prefixos são explícitos e mapeiam 1:1 para os valores de `hreflang` (`pt-BR`, `pt-PT`, `en-US`) — sem `/pt/` ambíguo.

| Rota | Propósito |
|---|---|
| `/` | Home — hero com telemetria, prova, caminhos por persona |
| `/trabalho` | Índice de cases |
| `/trabalho/<slug>` | Case: problema, decisões técnicas, arquitetura, resultado |
| `/sobre` | Trajetória narrativa |
| `/cv` | Currículo estruturado + PDF gerado da mesma fonte |
| `/servicos` | Oferta, processo, CTA de orçamento |
| `/escritos` | Índice do blog |
| `/escritos/<slug>` | Artigo |
| `/escritos/tag/<tag>` | Arquivo por tag |
| `/ia` | O agente + como ele foi construído |
| `/contato` | Formulário com Turnstile + links diretos |
| `/colofao` | Como o site foi feito |
| `*` | 404 |

`/colofao` é decisão deliberada: conteúdo técnico indexável, prova de capacidade, e o tipo de página que outros desenvolvedores linkam.

### Modelo de conteúdo

Cases e artigos são MDX com frontmatter validado por Zod. Cada arquivo declara seu `locale`. Um documento existe em um ou mais idiomas; o vínculo entre traduções é feito por um `translationKey` compartilhado.

**Cobertura de idiomas:** páginas fixas (home, sobre, cv, serviços, contato, colofão, cases) existem nos três idiomas. Artigos declaram em quais idiomas existem. `hreflang` só é emitido para o que existe de fato — nunca aponta para página ausente.

---

## 5. SEO / AEO / GEO

### SEO técnico

- `title`, `description`, `canonical` e OG por rota, via `meta` do React Router
- `hreflang` recíproco entre traduções existentes + `x-default` → `/en/`
- `sitemap.xml` com `xhtml:link` alternates
- `robots.txt`
- RSS + JSON Feed do blog
- **OG images geradas em build** (satori + resvg) por rota, no visual ônix+âmbar
- IndexNow para indexação instantânea
- Google Search Console + Bing Webmaster Tools

### JSON-LD

`Person` (com `sameAs` → LinkedIn e GitHub, `knowsAbout`, `worksFor`, `alumniOf`) · `ProfilePage` em `/sobre` · `WebSite` · `BreadcrumbList` · `TechArticle` por artigo · `SoftwareSourceCode` por case · `Service` em `/servicos` · `FAQPage` onde houver FAQ genuíno.

### AEO — ser a resposta

- Cada página abre com um **bloco de resposta direta**: 2–3 frases autocontidas que respondem à pergunta implícita da página, compreensíveis fora de contexto
- Headings redigidos como perguntas quando natural
- FAQ real (não inventado para enganar schema) nas páginas onde há dúvidas legítimas

### GEO — ser citado por IAs

- **`/llms.txt`** — índice curado no formato llmstxt.org
- **`/llms-full.txt`** — site inteiro em markdown, arquivo único
- **Toda página disponível como `.md`** (ex.: `/en/sobre.md`), gerada em build
- `robots.txt` **permite explicitamente** GPTBot, ClaudeBot, PerplexityBot, Google-Extended e CCBot

A permissão a crawlers de IA é decisão consciente e alinhada ao objetivo: o site existe para ser citado.

---

## 6. Hero 3D

Globo em Three.js via React Three Fiber exibindo dois pontos — o visitante e o colo que serviu a página — ligados por um arco animado.

- Carregado com `React.lazy` + `Suspense`. **Nunca bloqueia o LCP** — o LCP é o headline em texto.
- Orçamento: < 120 KB gzip, < 16 ms por frame
- Fallback SVG estático (o mesmo desenho, sem canvas) para: `prefers-reduced-motion`, dispositivos de baixo desempenho e falha de WebGL
- Pausa o loop de render quando fora do viewport ou com a aba em background

---

## 7. Acessibilidade

WCAG 2.1 AA, verificado nos dois temas.

- Contraste medido, não estimado — em especial âmbar como fundo de botão
- `outline` de foco visível e desenhado, nunca removido
- Navegação completa por teclado, incluindo ⌘K e o chat
- Skip link
- Hierarquia de headings sem pular níveis; `lang` correto por locale
- Chat com `aria-live` para as respostas em streaming
- Todo ícone e botão sem texto com `aria-label`
- Formulário: `label` associado, erro vinculado por `aria-describedby`, `autocomplete`
- axe-core no CI; navegação completa só por teclado antes de considerar pronto

---

## 8. Performance

| Métrica | Meta |
|---|---|
| LCP | < 1,8 s |
| INP | < 200 ms |
| CLS | < 0,05 |
| JS até interatividade (gzip) | < 132 KB, verificado no build |
| Cena e movimento (gzip) | < 310 KB, carregados após o LCP e só para quem os recebe |

**Mudança consciente de 2026-08-01.** O orçamento deixou de ser um número único porque três públicos pagam contas diferentes. A cena em Three.js mediu 227 KB comprimidos — não os 120 previstos aqui — e o Diorgenes optou por mantê-la com o número na mesa. Quem pede movimento reduzido, está em aparelho modesto ou sem WebGL não baixa nada disso e fica em ~122 KB, recebendo o mesmo desenho em SVG. O detalhe está em `docs/superpowers/specs/2026-08-01-fase-2-hero-design.md`.

Fontes auto-hospedadas com `preload` do subset crítico. Imagens em AVIF/WebP com dimensões explícitas. Code splitting por rota. Cloudflare Web Analytics (sem cookie, sem banner).

---

## 9. Segurança

- **CSP estrita** — viável porque não há recurso externo algum
- HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` — injetados pelo Worker
- Turnstile no formulário e na primeira mensagem do chat
- Rate limiting por IP em `/api/chat` e `/api/contato`
- Zod validando todo payload na borda
- Segredos via Wrangler secrets; `.dev.vars` local, fora do git
- **Prompt injection:** corpus exclusivamente próprio, system prompt fixo, saída sem execução de ferramentas, entrada limitada e sanitizada
- Nada de PII em log

---

## 10. Testes

**Vitest** — retrieval (cosseno, quantização, top-k), negociação de idioma, geração de JSON-LD, geração de hreflang, formatação de data e número por locale, parsing de frontmatter.

**Playwright** — golden paths: navegar pelas páginas principais; trocar idioma preservando a página; trocar tema e persistir; enviar pergunta ao chat e receber resposta **com citação de fonte**; enviar o formulário de contato; renderizar o fallback do hero com `prefers-reduced-motion`.

**Teste do índice RAG:** para um conjunto de perguntas conhecidas, o trecho esperado deve estar no top-1. Roda no CI, falha o build se o índice degradar.

**axe-core** no CI, em todas as rotas pré-renderizadas.

**CI:** `lint + typecheck + unit + a11y + build` obrigatórios. E2E no PR.

---

## 11. Entrega em fases

| Fase | Escopo |
|---|---|
| 0 | Repositório, config, CI, `.gitignore`, design tokens, layout base, i18n, troca de tema |
| 1 | Páginas de conteúdo, modelo MDX, SEO/AEO/GEO completos, sitemap, llms.txt, feeds |
| 2 | Hero 3D, telemetria ao vivo, movimento GSAP/Motion |
| 3 | Agente: build do índice, `/api/chat`, UI, degradação graciosa, `/ia` |
| 4 | Contato + Email Service, OG images, PDF do CV, a11y, performance, deploy no domínio |

Cada fase termina com CI verde e é utilizável de ponta a ponta.

---

## 12. Decisões descartadas

| Descartado | Motivo |
|---|---|
| SSR completo | Conteúdo é estático; SSR só somaria latência e complexidade |
| Astro | Melhor performance bruta, mas sai do React+Vite pedido e fragmenta animações contínuas |
| Vectorize | Exclusivo do plano Workers Paid |
| AutoRAG como plano principal | Menos controle e menos valor demonstrativo; mantido como plano B |
| Space Grotesk + Space Mono | Dupla mais usada em portfólio dev; custa originalidade |
| Globo puramente decorativo | Viola a regra 2 |
| Google Fonts CDN | Impede CSP estrita e adiciona requisição externa |

---

## 13. Insumos pendentes (bloqueiam conteúdo, não arquitetura)

1. **Texto do perfil do LinkedIn** — headline, sobre, experiências com período, formação, certificações, idiomas. Bloqueia `/sobre`, `/cv` e o corpus do RAG.
2. **Números verificáveis para o hero** — sistemas em produção, pessoas atendidas, ano de início. **Sem origem verificável, o rodapé de métricas não é implementado.** A regra 1 vale também para quem constrói o site.
3. **Foto profissional.**
4. **E-mail de destino do formulário** e confirmação de `diorgenesgeorge.dev` na conta Cloudflare.
5. **Três artigos de largada**, escritos pelo Diorgenes.
6. **Instalação das skills** (`/plugin marketplace add`) — comando do usuário, não do agente.

---

## 14. Recomendações adicionais aceitas

- CV em PDF gerado da mesma fonte de dados do site — impossível divergirem
- Cloudflare Web Analytics — sem cookie, sem banner, sem exposição de LGPD
- Política de privacidade — obrigatória a partir da existência do formulário
- `contato@diorgenesgeorge.dev` em vez de e-mail pessoal
- Renomear ou arquivar o repositório `dev-portifolio` (erro de grafia visível a recrutadores)
- Redirects das URLs do site atual para as novas
- `.gitignore` incluindo `CLAUDE.md`, `.superpowers/`, `.dev.vars`
