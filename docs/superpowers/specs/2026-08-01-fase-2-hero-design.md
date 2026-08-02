# Fase 2 — Hero, telemetria ao vivo e movimento · Design

**Data:** 2026-08-01
**Status:** aprovado, pronto para plano de implementação
**Spec do site:** `docs/superpowers/specs/2026-07-31-site-dev-design.md` (seções 2, 3 e 6)

---

## 1. Objetivo

Entregar a propriedade que nenhum template consegue reproduzir: **cada visitante vê uma imagem diferente da home**, porque ela mostra a posição real de quem está lendo ligada ao datacenter real que serviu aquele HTML.

O hero deixa de ser um bloco de texto e passa a ser um painel de operação com dado ao vivo — sem que nenhum número seja inventado e sem que o LCP saia do texto.

---

## 2. Decisões tomadas neste brainstorming

Três escolhas foram feitas com o custo explicitado. Ficam registradas com o motivo, para que ninguém as reabra achando que foram descuido.

| Decisão | Escolha | Custo aceito |
|---|---|---|
| Tecnologia da cena | **Three.js via React Three Fiber**, como o spec original previa | ~130 KB gzip, contra ~3 KB de uma projeção desenhada à mão em SVG. O Diorgenes escolheu impacto visual acima do número |
| Escopo do movimento | **GSAP + ScrollTrigger + Motion**, a Fase 2 completa | ~45 KB gzip somados |
| Primeiro segundo | Globo entra girando e **desacelera até a região do visitante** quando o dado chega | O movimento inicial não representa dado ainda; é declaradamente "procurando", e para quando acha |

**Consequência assumida:** a home chega a ~300 KB de JS quando tudo carrega, para quem recebe tudo. A seção 7 divide esse número por quem realmente o paga, e a seção 8 registra a mudança formal do orçamento do spec principal.

**Dívida da Fase 1 que entra nesta fase:** o registro de conteúdo importa todo o MDX de forma eager, então cada visitante baixa o texto de todas as páginas — 34 KB gzip desperdiçados na home. Corrigir isso é pré-requisito, não melhoria opcional: não se gasta 130 KB numa cena enquanto se desperdiça 34 KB em texto que ninguém vai ler naquela visita.

---

## 3. De onde vem o dado

### `/api/edge`

Endpoint no Worker que lê `request.cf` e devolve, em JSON:

| Campo | Origem |
|---|---|
| `city`, `country`, `region` | `request.cf` |
| `visitor.lat`, `visitor.lon` | `request.cf.latitude` e `longitude`, convertidos de string para número |
| `colo` | `request.cf.colo` — código IATA de três letras |
| `coloLocation.lat`, `.lon` | Tabela estática IATA → coordenada, embarcada no Worker |
| `httpProtocol`, `tlsVersion` | `request.cf` |

**O que o `request.cf` não dá e precisa ser resolvido:**

- **Coordenada do datacenter.** Não existe no `cf`. Vem de uma tabela estática no Worker, com os colos da Cloudflare. A tabela é dado público de aeroportos e não identifica ninguém.
- **RTT.** Medido no browser, cronometrando a própria requisição a `/api/edge` com `performance.now()`.
- **Distância.** Calculada no cliente por haversine, a partir dos dois pares de coordenadas.

### Privacidade

- **Nada é gravado e nada é logado.** O dado é apresentado ao próprio visitante e descartado quando a aba fecha.
- Resposta com `Cache-Control: no-store`: ela é diferente para cada pessoa e não pode ser servida a outra.
- A resposta não inclui IP, ASN nem organização — o painel não precisa e publicá-los mudaria a natureza do que é mostrado.
- O painel exibe **a cidade do visitante para o próprio visitante**. Uma linha no painel diz que o dado veio da requisição e não foi armazenado, para que o efeito seja "o site sabe onde estou porque a rede sabe" e não "este site me rastreia".

### Impacto na arquitetura estática

Nenhum. `run_worker_first` já cobre `/api/*`, e as páginas continuam sendo HTML estático servido sem compute.

---

## 4. Módulos e fronteiras

| Módulo | Responsabilidade | Depende de |
|---|---|---|
| `app/hero/projection.ts` | Matemática pura: lat/lon → vetor na esfera, → ponto em projeção ortográfica, arco de grande círculo, haversine | — |
| `app/hero/telemetry.ts` | Hook de carga de `/api/edge`, com estados e medição de RTT | — |
| `app/hero/capability.ts` | Decide cena ou fallback antes de qualquer download | — |
| `app/hero/globe-scene.tsx` | Cena R3F, carregada com `lazy` | projection, three, gsap |
| `app/hero/globe-static.tsx` | Mesmo desenho em SVG, sem canvas | projection |
| `app/hero/telemetry-panel.tsx` | Leitura dos dados, do esqueleto ao preenchido | telemetry |
| `workers/api/edge.ts` | O endpoint | tabela de colos |
| `workers/data/colos.ts` | IATA → coordenada | — |

**A peça central é `projection.ts`.** O fallback estático exigido pelo spec precisa desenhar exatamente os mesmos dois pontos e o mesmo arco, sem canvas — então a matemática existe fora do Three.js por necessidade, não por elegância. As duas versões consomem a mesma função e não têm como divergir, e ela é testável contra coordenadas conhecidas sem abrir browser.

---

## 5. Capacidade e degradação

A decisão acontece **antes de qualquer download**:

| Condição | Resultado |
|---|---|
| `prefers-reduced-motion: reduce` | SVG estático e **nenhuma biblioteca de movimento é baixada** — nem Three.js, nem GSAP, nem Motion |
| WebGL indisponível | SVG estático; a camada de movimento das demais seções continua |
| `navigator.deviceMemory < 4` **ou** `hardwareConcurrency < 4` | SVG estático; camada de movimento continua |
| Restante | Cena R3F, com `lazy` depois do LCP |

Os dois sinais são independentes e precisam ser lidos separadamente:

- **Movimento reduzido** desliga a camada inteira, no site todo. É preferência declarada do visitante e vale para tudo.
- **Aparelho incapaz** desliga só a cena 3D. Um celular modesto sem WebGL ainda recebe as transições, que são baratas.

Isso não é degradação: é a versão correta para aquele visitante, e ela é mais rápida.

### Quando algo falha

- **Sem JavaScript:** o HTML estático mostra o headline e o painel com traços no lugar dos números, mais uma linha dizendo que a medição depende de JavaScript. Nada em branco.
- **`/api/edge` falha ou demora demais:** o painel informa que não foi possível medir e o globo continua girando devagar, sem marcadores. **Nunca chuta uma posição** — é a regra 1 do spec aplicada ao caso de erro.
- **Fora do viewport ou aba em segundo plano:** o loop de render para.

---

## 6. Movimento

| Biblioteca | Papel |
|---|---|
| GSAP | Câmera do globo: rotação que desacelera com inércia até a região do visitante; desenho do arco; entrada do painel |
| ScrollTrigger | Seções da home entrando em cena conforme o scroll |
| Motion | Transição de rota e estado de componente |

Sem sobreposição de responsabilidade entre as três.

**Regra sem exceção:** com `prefers-reduced-motion: reduce`, toda animação vai direto ao estado final. Nada de movimento residual, nada de "versão suave".

E a regra tem consequência de carga, não só de comportamento: **as três bibliotecas são carregadas atrás do mesmo sinal**. Quem pede movimento reduzido não baixa nenhuma delas, e as seções da home renderizam no estado final direto do HTML estático. Animação desligada que ainda custa download é meia-medida.

### Sequência do primeiro segundo

```
0ms     headline em texto — este é o LCP
~300ms  cena carrega, globo em rotação lenta, sem marcadores
~600ms  /api/edge responde
~900ms  câmera desacelera com inércia até a região do visitante
~1.2s   dois pontos aparecem, arco é desenhado, painel preenche
```

---

## 7. Orçamento de performance

O número único de "JS inicial" deixa de servir e passa a ser três, porque três públicos diferentes pagam contas diferentes:

| Camada | Custo | Quem paga |
|---|---|---|
| Crítico até o LCP | ~15 KB | Todo mundo |
| Interatividade | ~113 KB | Todo mundo, após corrigir o registry |
| Cena e movimento | **227 KB medidos** + movimento | Só quem tem aparelho capaz e não pediu menos movimento |

Quem pede movimento reduzido fica em ~113 KB e recebe o SVG.

**Metas de campo, inalteradas:** LCP < 1,8 s · INP < 200 ms · CLS < 0,05.

**Verificação automatizada:** um script de pós-build falha se a camada crítica passar do teto. A ausência desse portão foi o que deixou os 34 KB do registry passarem despercebidos na Fase 1 — a lição virou teste.

---

## 8. Mudança formal no spec principal

A seção 8 do spec do site fixa "JS inicial (gzip) < 100 KB" e "Cena 3D (gzip) < 120 KB". As duas linhas passam a ser:

- **JS até interatividade:** < 120 KB gzip
- **Cena e movimento, carregados após o LCP e apenas para quem os recebe:** < 230 KB gzip

**Medição de 2026-08-01, corrigindo a estimativa deste documento.** A cena custa **227,1 KB gzip**, não os ~130 KB estimados. O motivo é o React Three Fiber: ele registra o catálogo inteiro do Three.js para traduzir JSX em objetos, e isso impede que a árvore seja podada — importação nomeada não muda nada, medido. A mesma cena escrita em Three.js imperativo mede **129,6 KB**. O Diorgenes optou por manter o R3F com o número na mesa, e o teto subiu para 230 KB.

A mudança é consciente e decidida pelo Diorgenes com o custo na mesa. O colofão passa a contar essa escolha: quanto a cena custa, quem não a baixa, e por que valeu.

---

## 9. Testes

**Vitest:** projeção contra coordenadas conhecidas; haversine contra distâncias reais; geração do arco de grande círculo; parsing e validação do payload do `request.cf`; decisão de capacidade para cada combinação de condições; tabela de colos completa e sem coordenada inválida.

**Playwright:** painel preenchendo com resposta interceptada; fallback sob `prefers-reduced-motion`, verificando que a cena não é baixada; caminho sem WebGL; falha e timeout de `/api/edge`; pausa do loop fora do viewport; axe no hero nos dois temas; e a garantia de que o LCP continua sendo o texto.

**Build:** o portão de orçamento da seção 7.

---

## 10. Fora do escopo desta fase

Agente de IA e `/ia` (Fase 3). Formulário de contato, OG images, PDF do CV, IndexNow, Search Console e deploy no domínio (Fase 4).

---

## 11. Riscos conhecidos

| Risco | Sinal | O que fazer |
|---|---|---|
| A cena passa de 200 KB | Portão de orçamento falha | Reduzir geometria e texturas antes de mexer no teto. Se não couber, a projeção em SVG já está construída e pode assumir |
| `request.cf` incompleto em algum caminho de rede | Campos vazios no painel | O schema valida e o painel mostra apenas o que veio; campo ausente não vira zero |
| Coordenada de colo desatualizada | Ponto no lugar errado | A tabela é versionada e testada; colo desconhecido cai no estado "não foi possível medir" em vez de chutar |
| GSAP e Motion animando a mesma coisa | Movimento brigando, jank | Fronteira explícita na seção 6; revisão de código verifica |
| 60 fps em aparelho intermediário | Frame acima de 16 ms | O gate de capacidade já exclui os fracos; medir em aparelho real antes de fechar a fase |
