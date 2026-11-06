import type { Idioma } from "@/i18n/config";

type Texto = { resumo: string; genero: string; modos: string; desafio: string; feitos: string[]; resultado: string; numeros: [string, string][] };

export type Jogo = {
  id: string;
  nome: string;
  url: string;
  /** Abre dentro do site (iframe). O Cubo da Velha manda X-Frame-Options: SAMEORIGIN, então abre em nova aba. */
  embutir: boolean;
  capa: string;
  stack: string[];
  ano: string;
  texto: Record<Idioma, Texto>;
};

// Fatos tirados dos READMEs dos repositórios (~/play-fun-games/xeque-barbaro e cubo-da-velha).
export const jogos: Jogo[] = [
  {
    id: "xeque-barbaro",
    nome: "Xeque Bárbaro",
    url: "https://xeque-barbaro.opendigitalgames.com/",
    embutir: true,
    capa: "/jogos/xeque-barbaro.webp",
    stack: ["Three.js", "TypeScript", "chess.js", "Web Worker", "Cloudflare"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Xadrez de batalha: as peças são miniaturas animadas que lutam a cada captura e se despedaçam.",
        genero: "Xadrez de batalha",
        modos: "Local, bot e online",
        desafio: "Fazer do xadrez, um jogo de regras rígidas, um espetáculo de batalha, sem atrapalhar quem só quer jogar uma partida séria.",
        feitos: [
          "Regras oficiais completas: roque, en passant, promoção, xeque, mate e empates.",
          "Bot com três níveis, num motor próprio que roda em Web Worker.",
          "Cada peça ataca do seu jeito; o golpe da rainha faz o tabuleiro inteiro ondular.",
          "Seis cenários com luz própria, de floresta a arena viking com torcida.",
        ],
        resultado: "No ar no navegador, sem instalar nada: contra quem está ao lado, contra o bot ou online com um amigo.",
        numeros: [["3", "modos: local, bot e online"], ["3", "níveis de bot"], ["6", "cenários com luz própria"]],
      },
      en: {
        resumo: "Battle chess: the pieces are animated miniatures that fight on every capture and shatter.",
        genero: "Battle chess",
        modos: "Local, bot and online",
        desafio: "Turn chess, a game of strict rules, into a battle spectacle without getting in the way of someone who just wants a serious match.",
        feitos: [
          "Full official rules: castling, en passant, promotion, check, mate and draws.",
          "Three-level bot running on a custom engine in a Web Worker.",
          "Every piece attacks its own way; the queen's blow ripples the whole board.",
          "Six settings with their own lighting, from forest to a Viking arena with a crowd.",
        ],
        resultado: "Live in the browser, nothing to install: against someone beside you, against the bot or online with a friend.",
        numeros: [["3", "modes: local, bot and online"], ["3", "bot levels"], ["6", "settings with their own light"]],
      },
      es: {
        resumo: "Ajedrez de batalla: las piezas son miniaturas animadas que luchan en cada captura y se hacen pedazos.",
        genero: "Ajedrez de batalla",
        modos: "Local, bot y online",
        desafio: "Convertir el ajedrez, un juego de reglas estrictas, en un espectáculo de batalla sin estorbar a quien solo quiere una partida seria.",
        feitos: [
          "Reglas oficiales completas: enroque, en passant, promoción, jaque, mate y tablas.",
          "Bot con tres niveles, en un motor propio que corre en Web Worker.",
          "Cada pieza ataca a su manera; el golpe de la reina hace ondular todo el tablero.",
          "Seis escenarios con luz propia, del bosque a una arena vikinga con público.",
        ],
        resultado: "En línea en el navegador, sin instalar nada: contra quien está al lado, contra el bot u online con un amigo.",
        numeros: [["3", "modos: local, bot y online"], ["3", "niveles de bot"], ["6", "escenarios con luz propia"]],
      },
    },
  },
  {
    id: "cubo-da-velha",
    nome: "Cubo da Velha",
    url: "https://cubo-da-velha.opendigitalgames.com/",
    embutir: false,
    capa: "/jogos/cubo-da-velha.webp",
    stack: ["Three.js", "JavaScript", "Cloudflare Workers", "Durable Objects", "WebSockets"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Jogo da velha num cubo mágico que gira sozinho a cada rodada. O giro decide a partida.",
        genero: "Estratégia",
        modos: "Local, bot e online",
        desafio: "Dar profundidade ao jogo da velha, o jogo mais simples que existe, sem deixá-lo difícil de entender.",
        feitos: [
          "Partidas online por fila ou sala com código, num Worker com Durable Objects e WebSockets.",
          "Bot com três níveis, que prevê a resposta do adversário depois do giro.",
          "Tutorial jogável: um tour de 7 passos e uma partida guiada contra o bot.",
          "Pensado para o celular, com o cubo 3D e a vista das faces em cruz.",
        ],
        resultado: "No ar, com partidas online por fila ou código, bot em três níveis e um tutorial jogável para aprender jogando.",
        numeros: [["3", "níveis de bot"], ["7", "passos no tutorial jogável"], ["30 s", "por jogada no online"]],
      },
      en: {
        resumo: "Tic-tac-toe on a magic cube that turns by itself every round. The turn decides the match.",
        genero: "Strategy",
        modos: "Local, bot and online",
        desafio: "Give depth to tic-tac-toe, the simplest game there is, without making it hard to understand.",
        feitos: [
          "Online matches by queue or room code, on a Worker with Durable Objects and WebSockets.",
          "Three-level bot that predicts the opponent's answer after the turn.",
          "Playable tutorial: a 7-step tour and a guided match against the bot.",
          "Built for phones, with the 3D cube and an unfolded cross view of the faces.",
        ],
        resultado: "Live, with online matches by queue or code, a three-level bot and a playable tutorial to learn by playing.",
        numeros: [["3", "bot levels"], ["7", "steps in the playable tutorial"], ["30 s", "per move online"]],
      },
      es: {
        resumo: "Tres en raya en un cubo mágico que gira solo en cada ronda. El giro decide la partida.",
        genero: "Estrategia",
        modos: "Local, bot y online",
        desafio: "Dar profundidad al tres en raya, el juego más simple que existe, sin volverlo difícil de entender.",
        feitos: [
          "Partidas online por cola o sala con código, en un Worker con Durable Objects y WebSockets.",
          "Bot con tres niveles, que prevé la respuesta del rival después del giro.",
          "Tutorial jugable: un tour de 7 pasos y una partida guiada contra el bot.",
          "Pensado para el celular, con el cubo 3D y la vista de las caras en cruz.",
        ],
        resultado: "En línea, con partidas online por cola o código, bot en tres niveles y un tutorial jugable para aprender jugando.",
        numeros: [["3", "niveles de bot"], ["7", "pasos en el tutorial jugable"], ["30 s", "por jugada online"]],
      },
    },
  },
];
