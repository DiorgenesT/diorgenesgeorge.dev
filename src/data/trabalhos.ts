import type { Idioma } from "@/i18n/config";

/** Categorias (abas) da seção Trabalhos. */
export type Aba = "sites" | "sistemas" | "motion";

/** Cada projeto contado como um caso: a frase de abertura, o desafio, o que foi construído e o resultado. */
type Texto = { resumo: string; desafio: string; feitos: string[]; resultado: string; numeros: [string, string][] };

export type Trabalho = {
  id: string;
  nome: string;
  aba: Aba;
  url?: string;
  /** "imagem": print da tela; "pagina": print da página inteira (rola junto com a leitura); "video": vídeo em loop */
  midia: { tipo: "imagem" | "pagina" | "video"; src: string; poster?: string };
  stack: string[];
  ano: string;
  texto: Record<Idioma, Texto>;
};

// Os fatos vêm do código e dos READMEs de cada projeto: nada de números que não estejam lá.
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
        resumo: "O portfólio de um editor de vídeo que se assiste como um filme: o scroll é a agulha da timeline.",
        desafio: "Mostrar o trabalho de um editor com ritmo e acabamento antes de qualquer palavra, sem o site pesar no celular nem travar no iPhone.",
        feitos: [
          "Hero com scroll-scrub de 113 quadros desenhados em canvas, mais fluido que um <video> até no iOS.",
          "Chroma key em WebGL que rastreia a tela de um celular filmado e coloca uma interface clicável dentro dela.",
          "Três idiomas, com SEO e GEO: JSON-LD, sitemap de vídeo e llms.txt.",
          "Vídeos servidos da borda pelo Cloudflare Workers, com Range (206) para o Safari.",
        ],
        resultado: "No ar em três idiomas, com o hero rodando liso no iOS e os vídeos entregues da borda.",
        numeros: [["113", "quadros desenhados no hero"], ["3", "idiomas"], ["iOS", "rodando liso até no iPhone"]],
      },
      en: {
        resumo: "A video editor's portfolio you watch like a film: the scroll is the timeline's playhead.",
        desafio: "Show an editor's work with rhythm and polish before a single word, without the site getting heavy on phones or stuttering on iPhone.",
        feitos: [
          "Scroll-scrubbed hero with 113 frames drawn on canvas, smoother than a <video> even on iOS.",
          "WebGL chroma key that tracks a filmed phone screen and places a clickable interface inside it.",
          "Three languages, with SEO and GEO: JSON-LD, video sitemap and llms.txt.",
          "Videos served from the edge by Cloudflare Workers, with Range (206) for Safari.",
        ],
        resultado: "Live in three languages, with the hero running smoothly on iOS and videos delivered from the edge.",
        numeros: [["113", "frames drawn in the hero"], ["3", "languages"], ["iOS", "smooth even on iPhone"]],
      },
      es: {
        resumo: "El portafolio de un editor de video que se mira como una película: el scroll es la aguja de la línea de tiempo.",
        desafio: "Mostrar el trabajo de un editor con ritmo y acabado antes de cualquier palabra, sin que el sitio pese en el celular ni se trabe en el iPhone.",
        feitos: [
          "Hero con scroll-scrub de 113 cuadros dibujados en canvas, más fluido que un <video> incluso en iOS.",
          "Chroma key en WebGL que sigue la pantalla de un celular filmado y coloca una interfaz clicable dentro.",
          "Tres idiomas, con SEO y GEO: JSON-LD, sitemap de video y llms.txt.",
          "Videos servidos desde el borde con Cloudflare Workers, con Range (206) para Safari.",
        ],
        resultado: "En línea en tres idiomas, con el hero fluido en iOS y los videos entregados desde el borde.",
        numeros: [["113", "cuadros dibujados en el hero"], ["3", "idiomas"], ["iOS", "fluido incluso en iPhone"]],
      },
    },
  },
  {
    id: "ponto",
    nome: "Controle de Ponto",
    aba: "sistemas",
    url: "https://controle-ponto.pages.dev",
    midia: { tipo: "imagem", src: "/trabalhos/controle-de-ponto.webp" },
    stack: ["React", "TypeScript", "Cloudflare Workers", "D1", "JWT", "GitHub Actions"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "O ponto de uma oficina saiu da planilha: o sistema calcula tudo e entrega a folha pronta para assinar.",
        desafio: "O ponto dependia de planilha e de conta no fim do mês: horas extras, faltas, feriados e banco de horas somados à mão, com espaço para erro.",
        feitos: [
          "Cálculo automático de horas, extras e faltas, com tolerância configurável por funcionário.",
          "Banco de horas mensal e acumulado, considerando feriados, férias, atestados e dias de empresa fechada.",
          "Folha de ponto em PDF, pronta para assinatura.",
          "Login com JWT e bcrypt, limite de tentativas por IP e deploy contínuo pelo GitHub Actions.",
        ],
        resultado: "A folha do mês sai pronta para assinar, com horas, extras e banco de horas já calculados.",
        numeros: [["Auto", "horas, extras e faltas calculadas"], ["2", "bancos de horas: mensal e acumulado"], ["PDF", "folha pronta para assinar"]],
      },
      en: {
        resumo: "A workshop's time clock left the spreadsheet: the system does the math and hands over a timesheet ready to sign.",
        desafio: "Timekeeping depended on a spreadsheet and month-end math: overtime, absences, holidays and hour banks added up by hand, with room for error.",
        feitos: [
          "Automatic calculation of hours, overtime and absences, with tolerance set per employee.",
          "Monthly and running hour bank, accounting for holidays, vacations, sick notes and closed-shop days.",
          "PDF timesheet, ready to be signed.",
          "Login with JWT and bcrypt, per-IP attempt limits and continuous deployment through GitHub Actions.",
        ],
        resultado: "The monthly timesheet comes out ready to sign, with hours, overtime and hour bank already calculated.",
        numeros: [["Auto", "hours, overtime and absences calculated"], ["2", "hour banks: monthly and running"], ["PDF", "timesheet ready to sign"]],
      },
      es: {
        resumo: "El control de horario de un taller salió de la planilla: el sistema hace las cuentas y entrega la hoja lista para firmar.",
        desafio: "El horario dependía de una planilla y de cuentas a fin de mes: horas extra, faltas, feriados y banco de horas sumados a mano, con margen de error.",
        feitos: [
          "Cálculo automático de horas, extras y faltas, con tolerancia configurable por empleado.",
          "Banco de horas mensual y acumulado, con feriados, vacaciones, licencias médicas y días de taller cerrado.",
          "Hoja de horario en PDF, lista para firmar.",
          "Login con JWT y bcrypt, límite de intentos por IP y despliegue continuo con GitHub Actions.",
        ],
        resultado: "La hoja del mes sale lista para firmar, con horas, extras y banco de horas ya calculados.",
        numeros: [["Auto", "horas, extras y faltas calculadas"], ["2", "bancos de horas: mensual y acumulado"], ["PDF", "hoja lista para firmar"]],
      },
    },
  },
  {
    id: "motion",
    nome: "CERISO",
    aba: "motion",
    midia: { tipo: "video", src: "/trabalhos/ceriso-motion.mp4", poster: "/trabalhos/ceriso-motion.webp" },
    stack: ["Remotion", "React", "TypeScript", "WebGL", "ElevenLabs"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Uma apresentação institucional feita em código, em que o mapa se forma conforme a água corre.",
        desafio: "Apresentar um consórcio de 29 municípios em poucos segundos para o site novo dele, sem uma foto sequer.",
        feitos: [
          "O mapa real da bacia (divisas do IBGE, rios do OpenStreetMap): a água corre no sentido da correnteza e as cidades surgem conforme ela chega.",
          "Abertura com uma gota caindo num espelho d'água, feita em shader WebGL.",
          "Logotipo reconstruído em vetor para ficar nítido em tela cheia.",
          "Narração gerada com a ElevenLabs; cada quadro é um componente React.",
        ],
        resultado: "Um vídeo 1920×1080 para o site, ajustado em código a cada revisão do cliente, sem reeditar nada.",
        numeros: [["29", "municípios no mapa"], ["0", "fotos: só mapa, água e código"], ["1080p", "para o site"]],
      },
      en: {
        resumo: "An institutional presentation made with code, where the map takes shape as the water flows.",
        desafio: "Present a consortium of 29 municipalities in a few seconds for its new website, without a single photo.",
        feitos: [
          "The real basin map (IBGE borders, OpenStreetMap rivers): water flows downstream and towns appear as it reaches them.",
          "Opening with a drop falling on still water, made as a WebGL shader.",
          "Logo rebuilt as vector to stay sharp full screen.",
          "Narration generated with ElevenLabs; every frame is a React component.",
        ],
        resultado: "A 1920×1080 video for the website, adjusted in code at every client review, without re-editing anything.",
        numeros: [["29", "municipalities on the map"], ["0", "photos: just map, water and code"], ["1080p", "for the website"]],
      },
      es: {
        resumo: "Una presentación institucional hecha con código, donde el mapa se forma a medida que corre el agua.",
        desafio: "Presentar un consorcio de 29 municipios en pocos segundos para su sitio nuevo, sin una sola foto.",
        feitos: [
          "El mapa real de la cuenca (límites del IBGE, ríos de OpenStreetMap): el agua corre con la corriente y las ciudades aparecen cuando llega.",
          "Apertura con una gota cayendo en un espejo de agua, hecha en shader WebGL.",
          "Logotipo reconstruido en vector para verse nítido a pantalla completa.",
          "Narración generada con ElevenLabs; cada cuadro es un componente React.",
        ],
        resultado: "Un video 1920×1080 para el sitio, ajustado con código en cada revisión del cliente, sin reeditar nada.",
        numeros: [["29", "municipios en el mapa"], ["0", "fotos: solo mapa, agua y código"], ["1080p", "para el sitio"]],
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
        resumo: "Um Reel narrado que explica, em 67 segundos, como pedir a autorização de um evento pela internet.",
        desafio: "Explicar um serviço público com formulário, documentos e acompanhamento num formato de stories, sem perder ninguém no caminho.",
        feitos: [
          "Telas do portal redesenhadas a partir do sistema real: formulário em cinco passos, classificação de impacto e acompanhamento.",
          "Narração gerada com a ElevenLabs, com as legendas sincronizadas à fala.",
          "Vertical 1080×1920, com as margens seguras do Instagram garantidas por regra.",
          "Logo do SEI reconstruído em vetor para ficar nítido em tela cheia.",
        ],
        resultado: "67 segundos prontos para os stories, refeitos em código a cada ajuste até a sexta versão.",
        numeros: [["67 s", "de Reel narrado"], ["5", "passos do formulário explicados"], ["6", "versões, todas em código"]],
      },
      en: {
        resumo: "A narrated Reel that explains, in 67 seconds, how to request an event permit online.",
        desafio: "Explain a public service with a form, documents and tracking in a stories format, without losing anyone along the way.",
        feitos: [
          "Portal screens redrawn from the real system: a five-step form, impact classification and tracking.",
          "Narration generated with ElevenLabs, with captions synced to the voice.",
          "Vertical 1080×1920, with Instagram safe areas enforced by rule.",
          "SEI logo rebuilt as vector to stay sharp full screen.",
        ],
        resultado: "67 seconds ready for stories, remade in code at every adjustment up to the sixth version.",
        numeros: [["67 s", "of narrated Reel"], ["5", "form steps explained"], ["6", "versions, all in code"]],
      },
      es: {
        resumo: "Un Reel narrado que explica, en 67 segundos, cómo pedir el permiso de un evento por internet.",
        desafio: "Explicar un servicio público con formulario, documentos y seguimiento en formato de stories, sin que nadie se pierda en el camino.",
        feitos: [
          "Pantallas del portal rediseñadas a partir del sistema real: formulario en cinco pasos, clasificación de impacto y seguimiento.",
          "Narración generada con ElevenLabs, con subtítulos sincronizados con la voz.",
          "Vertical 1080×1920, con los márgenes seguros de Instagram garantizados por regla.",
          "Logo del SEI reconstruido en vector para verse nítido a pantalla completa.",
        ],
        resultado: "67 segundos listos para stories, rehechos con código en cada ajuste hasta la sexta versión.",
        numeros: [["67 s", "de Reel narrado"], ["5", "pasos del formulario explicados"], ["6", "versiones, todas con código"]],
      },
    },
  },
];
