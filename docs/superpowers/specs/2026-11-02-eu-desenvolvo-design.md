# Spec: "Eu desenvolvo ___", site pessoal do Diorgenes George

Data: 02/11/2026. Status: rascunho para aprovação.

## 1. Ideia central

O site inteiro é uma frase que nunca termina: **"Eu desenvolvo ___"**. A lacuna troca entre os mundos em que ele constrói, e **o visual do site muda junto com a palavra**. Cada mundo é uma seção feita na linguagem do próprio meio. O site prova o alcance dele em vez de listá-lo.

- **Nada de** prefeitura, órgão, cidade ou burocracia (pedido explícito).
- **Nada dos clichês** das tentativas anteriores: terminal no hero, barras de skill, cursor custom, cards com tilt, timeline de carreira, loader de painéis.
- **Tom:** confiante, direto, com humor seco. Frases curtas. A voz dele: "Prefiro decisão explicada a decisão elegante."

## 2. Estrutura (ordem do scroll)

### 0. Abertura (≤ 1,2 s, pula com qualquer interação)
- Tela escura e um cursor de texto piscando.
- Ele digita "Eu desenvolvo" e a lacuna fica aberta.
- Não é um loader: o site já está pronto por trás.

### 1. Hero: a frase
- "Diorgenes George · dev" pequeno no topo.
- Gigante: **Eu desenvolvo** + a palavra que troca: *sistemas → jogos → mundos 3D → vídeos → agentes de IA → …*
- Cada palavra troca o **fundo inteiro** com um corte seco (clip-path):
  - sistemas: grid claro de interface;
  - jogos: céu low-poly com a larva do VERMIS passando;
  - vídeos: faixas de timeline correndo;
  - agentes: pontos conectados conversando.
- O mouse desloca a cena em parallax.
- Rolar "trava" a palavra atual e leva para o mundo dela.
- Fallback de movimento reduzido: palavras listadas, sem troca de fundo.

### 2. Mundo SISTEMAS (tema claro, grid suíço, tipografia de interface)
- O site **vira claro** ao entrar: o único trecho claro, um contraste de propósito.
- Um painel construído ao vivo no scroll: números contando, gráfico se desenhando, filtros mudando o resultado.
- Os cases entram como produto, sem órgão:
  - "9 planilhas incompatíveis → 1 modelo auditável" (as planilhas se fundem numa tabela no scroll);
  - "44 apps → 1 hub, sem migrar banco" (44 quadradinhos se juntam em 1);
  - "Fila em tempo quase real, sem carga na origem".
- Princípio em destaque: "Número sem dono não entra em painel."

### 3. Mundo JOGOS / 3D: a **bancada** (escuro, low-poly, React Three Fiber)
- Uma bancada 3D com os projetos como objetos físicos:
  - larva (VERMIS), peça de xadrez (Xeque Bárbaro), cubo 3×3×3 (Cubo da Velha), orbe multiplayer (ApexWorm).
- Hover dá vida ao objeto: a larva rasteja, a peça golpeia, o cubo gira.
- Clique abre um painel lateral com nome, uma linha, stack e mídia.
- Câmera com leve dolly no scroll e parallax no mouse.
- Carregamento preguiçoso. Fallback: imagem estática renderizada da própria cena.

### 4. Mundo VÍDEOS (escuro, timeline de edição)
- O scroll vira uma **agulha numa timeline**: faixas de clipes e um monitor.
- O monitor mostra trechos dos vídeos feitos em código (Remotion + ElevenLabs).
- Mensagem: "vídeo também é código", com um trecho de composição que vira frame.

### 5. Mundo AGENTES DE IA (escuro, quente)
- O escritório 3D (QORVSION), gravado em vídeo, num monitor.
- Ao lado, uma conversa real entre agentes surgindo (chefe delega, revisora aponta, front corrige), em balões, sem terminal.
- Mensagem: "Eu desenvolvo quem desenvolve comigo."

### 6. "E também…": sites
- Parede de janelas de navegador com os sites de clientes rolando sozinhos: Miracar, Mali Rastreadores, Monumental, Jornal do Povo, Ceriso, Deyller.
- Hover pausa. Clique abre o site.

### 7. Sobre (curto) + materiais
- 3–4 frases sobre ele: formação em Ciência da Computação e "quem já esteve na ponta escreve software diferente". Sem empregador.
- Stack como **materiais de bancada**: etiquetas agrupadas (Front, Back, Borda, Dados, IA). Sem barras nem porcentagem.

### 8. Contato: a frase se completa com o visitante
- "Eu desenvolvo ___" com a **lacuna editável**: o visitante digita o que quer construir.
- O botão abre o WhatsApp com "Quero que você desenvolva: {texto}".
- Atalhos para e-mail, LinkedIn, GitHub e Instagram.
- É o pico-fim: o visitante termina a frase.

## 3. Sistema visual

- **Base escura neutra** (#0b0b0c) com **uma cor-assinatura por mundo**:
  - sistemas: azul-tinta sobre papel claro;
  - jogos: verde-ácido;
  - vídeos: vermelho REC;
  - agentes: âmbar.
- O acento global muda com o mundo ativo, via variável CSS animada.
- **Tipografia:**
  - display grotesca condensada de grande impacto para "Eu desenvolvo";
  - a palavra da lacuna em serifada itálica (contraste);
  - mono só para metadados.
  - Fontes a escolher na fase de design, com 2 opções para ele aprovar. Evitar Inter e Space Mono, que foram usadas antes.
- **Movimento:**
  - cortes secos entre mundos e curvas expo;
  - scroll com Lenis + GSAP ScrollTrigger (pin por mundo);
  - SplitText nos títulos.

## 4. Técnica

- Next.js 16 (App Router, `output: "export"`), React 19, TypeScript, Tailwind 4, GSAP (ScrollTrigger, SplitText), Lenis, three + @react-three/fiber + drei (só no mundo Jogos, com import dinâmico).
- i18n pt / en / es em rotas `/[lang]`. O Worker redireciona a raiz pelo Accept-Language (padrão: en, a confirmar).
- Hospedagem: Cloudflare Workers com assets estáticos, primeiro em `*.workers.dev`. O domínio diorgenesgeorge.dev só depois da aprovação.
- **SEO/GEO:** JSON-LD (Person, WebSite, CreativeWork por projeto), sitemap com hreflang, robots, llms.txt, og por idioma.
- **Performance:**
  - LCP é o texto do hero, sem esperar 3D;
  - 3D e vídeos carregam sob demanda;
  - meta: Lighthouse ≥ 90 em mobile.
- **Acessibilidade:**
  - `prefers-reduced-motion` desliga trocas e pins;
  - foco visível;
  - conteúdo de todos os mundos disponível sem WebGL.

## 5. Material necessário

| Item | Origem | Status |
|---|---|---|
| Prints/vídeos dos jogos (VERMIS, Xeque Bárbaro, ApexWorm, Cubo da Velha) | repositórios PlayFunGames (privados) ou builds no ar | **pedir ao Diorgenes ou eu capturo das builds** |
| Gravação do escritório 3D | rodar `laboratorio-virtual` localmente e gravar | eu faço |
| Vídeos Remotion | `~/projetos/motion/*/out` | disponível |
| Sites de clientes | capturas automáticas das URLs no ar | eu faço |
| Foto dele | — | opcional (o conceito não depende de foto) |

## 6. Fora do escopo (v1)
- Blog e artigos (podem voltar na v2 como "notas").
- Engenharia reversa (GamesReversed e GovReversed): não mostrar.
- Formulário com backend: o contato é WhatsApp, e-mail e redes.

## 7. Critérios de pronto
- As 8 partes funcionando em pt, en e es, em desktop e celular, sem erros de console.
- Movimento reduzido e sem WebGL: tudo legível e navegável.
- Revisões dos agentes leis-ux e front-end aplicadas.
- Publicado no workers.dev e aprovado pelo Diorgenes antes de trocar o domínio.
