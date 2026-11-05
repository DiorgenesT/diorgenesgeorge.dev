import type { Idioma } from "@/i18n/config";

type Texto = { resumo: string; genero: string; modos: string; feitos: string[] };

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
        feitos: [
          "Regras oficiais completas: roque, en passant, promoção, xeque, mate e empates.",
          "Bot com três níveis, num motor próprio que roda em Web Worker.",
          "Cada peça ataca do seu jeito; o golpe da rainha faz o tabuleiro inteiro ondular.",
          "Seis cenários com luz própria, de floresta a arena viking com torcida.",
        ],
      },
      en: {
        resumo: "Battle chess: the pieces are animated miniatures that fight on every capture and shatter.",
        genero: "Battle chess",
        modos: "Local, bot and online",
        feitos: [
          "Full official rules: castling, en passant, promotion, check, mate and draws.",
          "Three-level bot running on a custom engine in a Web Worker.",
          "Every piece attacks its own way; the queen's blow ripples the whole board.",
          "Six settings with their own lighting, from forest to a Viking arena with a crowd.",
        ],
      },
      es: {
        resumo: "Ajedrez de batalla: las piezas son miniaturas animadas que luchan en cada captura y se hacen pedazos.",
        genero: "Ajedrez de batalla",
        modos: "Local, bot y online",
        feitos: [
          "Reglas oficiales completas: enroque, en passant, promoción, jaque, mate y tablas.",
          "Bot con tres niveles, en un motor propio que corre en Web Worker.",
          "Cada pieza ataca a su manera; el golpe de la reina hace ondular todo el tablero.",
          "Seis escenarios con luz propia, del bosque a una arena vikinga con público.",
        ],
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
        feitos: [
          "Partidas online por fila ou sala com código, num Worker com Durable Objects e WebSockets.",
          "Bot com três níveis, que prevê a resposta do adversário depois do giro.",
          "Tutorial jogável: um tour de 7 passos e uma partida guiada contra o bot.",
          "Pensado para o celular, com o cubo 3D e a vista das faces em cruz.",
        ],
      },
      en: {
        resumo: "Tic-tac-toe on a magic cube that turns by itself every round. The turn decides the match.",
        genero: "Strategy",
        modos: "Local, bot and online",
        feitos: [
          "Online matches by queue or room code, on a Worker with Durable Objects and WebSockets.",
          "Three-level bot that predicts the opponent's answer after the turn.",
          "Playable tutorial: a 7-step tour and a guided match against the bot.",
          "Built for phones, with the 3D cube and an unfolded cross view of the faces.",
        ],
      },
      es: {
        resumo: "Tres en raya en un cubo mágico que gira solo en cada ronda. El giro decide la partida.",
        genero: "Estrategia",
        modos: "Local, bot y online",
        feitos: [
          "Partidas online por cola o sala con código, en un Worker con Durable Objects y WebSockets.",
          "Bot con tres niveles, que prevé la respuesta del rival después del giro.",
          "Tutorial jugable: un tour de 7 pasos y una partida guiada contra el bot.",
          "Pensado para el celular, con el cubo 3D y la vista de las caras en cruz.",
        ],
      },
    },
  },
];
