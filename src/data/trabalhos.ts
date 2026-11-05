import type { Idioma } from "@/i18n/config";

/** Categorias (abas) da seção Trabalhos. */
export type Aba = "sites" | "sistemas" | "motion";

type Texto = { resumo: string; feitos: string[] };

export type Trabalho = {
  id: string;
  nome: string;
  aba: Aba;
  url?: string;
  /** "pagina": print da página inteira que rola no hover; "video": vídeo curto em loop */
  midia: { tipo: "pagina" | "video"; src: string; poster?: string };
  stack: string[];
  ano: string;
  texto: Record<Idioma, Texto>;
};

export const trabalhos: Trabalho[] = [
  {
    id: "deyller",
    nome: "Deyller Melo",
    aba: "sites",
    url: "https://deyller.dgtssk8.workers.dev/en/",
    midia: { tipo: "video", src: "/trabalhos/deyller.mp4", poster: "/trabalhos/deyller.webp" },
    stack: ["Next.js 16", "TypeScript", "GSAP", "WebGL", "Lenis", "Cloudflare Workers"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Portfólio de um editor de vídeo pensado como um filme: o scroll é a agulha da timeline.",
        feitos: [
          "Hero com scroll-scrub de 113 quadros desenhados em canvas, mais fluido que <video> até no iOS.",
          "Chroma key em WebGL que rastreia a tela de um celular filmado e coloca uma interface clicável dentro dela.",
          "Três idiomas, SEO/GEO com JSON-LD, sitemap de vídeo e llms.txt.",
          "Deploy na borda com Cloudflare Workers, servindo vídeos com Range (206) para o Safari.",
        ],
      },
      en: {
        resumo: "A video editor's portfolio built like a film: the scroll is the timeline's playhead.",
        feitos: [
          "Scroll-scrubbed hero with 113 frames drawn on canvas, smoother than <video> even on iOS.",
          "WebGL chroma key that tracks a filmed phone screen and places a clickable interface inside it.",
          "Three languages, SEO/GEO with JSON-LD, a video sitemap and llms.txt.",
          "Edge deploy on Cloudflare Workers, serving videos with Range (206) for Safari.",
        ],
      },
      es: {
        resumo: "Portafolio de un editor de video pensado como una película: el scroll es la aguja de la línea de tiempo.",
        feitos: [
          "Hero con scroll-scrub de 113 cuadros dibujados en canvas, más fluido que <video> incluso en iOS.",
          "Chroma key en WebGL que rastrea la pantalla de un celular filmado y coloca una interfaz clicable dentro.",
          "Tres idiomas, SEO/GEO con JSON-LD, sitemap de video y llms.txt.",
          "Deploy en el borde con Cloudflare Workers, sirviendo videos con Range (206) para Safari.",
        ],
      },
    },
  },
  {
    id: "ponto",
    nome: "Controle de Ponto",
    aba: "sistemas",
    url: "https://controle-ponto.pages.dev",
    midia: { tipo: "pagina", src: "/trabalhos/controle-de-ponto.webp" },
    stack: ["React", "TypeScript", "Cloudflare Workers", "D1", "JWT", "GitHub Actions"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Sistema sob medida que tirou o ponto de uma oficina da planilha: cálculo automático e folha pronta para assinar.",
        feitos: [
          "Cálculo automático de horas, extras e faltas com tolerância configurável por funcionário.",
          "Banco de horas mensal e acumulado, com feriados, férias, atestados e empresa fechada.",
          "Folha de ponto em PDF pronta para assinatura.",
          "Login com JWT, bcrypt e limite de tentativas por IP, com deploy contínuo no GitHub Actions.",
        ],
      },
      en: {
        resumo: "Custom time-tracking system that took a workshop off spreadsheets, with automatic math and a timesheet ready to sign.",
        feitos: [
          "Automatic hours, overtime and absence math with per-employee configurable tolerance.",
          "Monthly and running hour bank, handling holidays, vacations, sick notes and closed days.",
          "Timesheet PDF ready for signature.",
          "JWT login with bcrypt and per-IP rate limiting, with continuous deploy on GitHub Actions.",
        ],
      },
      es: {
        resumo: "Sistema a medida que sacó el control de asistencia de un taller de la planilla: cálculo automático y hoja lista para firmar.",
        feitos: [
          "Cálculo automático de horas, extras y faltas con tolerancia configurable por empleado.",
          "Banco de horas mensual y acumulado, con feriados, vacaciones, certificados y días cerrados.",
          "Hoja de asistencia en PDF lista para firmar.",
          "Login con JWT, bcrypt y límite de intentos por IP, con deploy continuo en GitHub Actions.",
        ],
      },
    },
  },
  {
    id: "motion",
    nome: "Vídeos em código",
    aba: "motion",
    midia: { tipo: "video", src: "/trabalhos/ceriso-motion.mp4", poster: "/trabalhos/ceriso-motion.webp" },
    stack: ["Remotion", "React", "TypeScript", "ElevenLabs"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Apresentações e Reels narrados, feitos em código: cada quadro é um componente React.",
        feitos: [
          "Composições em Remotion com animação, tipografia e mapas programados.",
          "Narração, trilha e efeitos sonoros gerados com a ElevenLabs.",
          "Versões com trilhas diferentes geradas a partir do mesmo código, sem reeditar nada.",
          "Margens seguras de Instagram garantidas por regra, não por olho.",
        ],
      },
      en: {
        resumo: "Narrated presentations and Reels made with code: every frame is a React component.",
        feitos: [
          "Remotion compositions with programmed animation, typography and maps.",
          "Narration, soundtrack and sound effects generated with ElevenLabs.",
          "Versions with different soundtracks rendered from the same code, no re-editing.",
          "Instagram safe areas enforced by rule, not by eye.",
        ],
      },
      es: {
        resumo: "Presentaciones y Reels narrados, hechos con código: cada cuadro es un componente React.",
        feitos: [
          "Composiciones en Remotion con animación, tipografía y mapas programados.",
          "Narración, banda sonora y efectos generados con ElevenLabs.",
          "Versiones con distintas bandas sonoras generadas desde el mismo código, sin reeditar.",
          "Márgenes seguros de Instagram garantizados por regla, no a ojo.",
        ],
      },
    },
  },
  {
    id: "eventos-betim",
    nome: "Portal de Eventos de Betim",
    aba: "motion",
    midia: { tipo: "video", src: "/trabalhos/eventos-betim-motion.mp4", poster: "/trabalhos/eventos-betim-motion.webp" },
    stack: ["Remotion", "React", "TypeScript", "ElevenLabs"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Reel narrado de 67 s que apresenta o Portal de Eventos de Betim, feito em código para os stories.",
        feitos: [
          "Formato vertical 1080×1920, com as margens seguras do Instagram garantidas por regra.",
          "Telas do portal redesenhadas a partir do sistema real: formulário, classificação de impacto e acompanhamento.",
          "Narração gerada com a ElevenLabs, com legendas sincronizadas à fala.",
          "Logo do SEI reconstruído em vetor para ficar nítido em tela cheia.",
        ],
      },
      en: {
        resumo: "A 67-second narrated Reel presenting Betim's Events Portal, made with code for stories.",
        feitos: [
          "Vertical 1080×1920 format, with Instagram safe areas enforced by rule.",
          "Portal screens redrawn from the real system: form, impact classification and tracking.",
          "Narration generated with ElevenLabs, with captions synced to the voice.",
          "SEI logo rebuilt as vector to stay sharp full screen.",
        ],
      },
      es: {
        resumo: "Reel narrado de 67 s que presenta el Portal de Eventos de Betim, hecho con código para stories.",
        feitos: [
          "Formato vertical 1080×1920, con los márgenes seguros de Instagram garantizados por regla.",
          "Pantallas del portal rediseñadas a partir del sistema real: formulario, clasificación de impacto y seguimiento.",
          "Narración generada con ElevenLabs, con subtítulos sincronizados con la voz.",
          "Logo del SEI reconstruido en vector para verse nítido a pantalla completa.",
        ],
      },
    },
  },
];
