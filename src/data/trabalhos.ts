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
          "Scroll-scrubbed hero with 113 frames drawn on canvas — smoother than <video>, even on iOS.",
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
    id: "miracar",
    nome: "Miracar Brasil",
    aba: "sites",
    url: "https://www.miracarbrasil.com.br",
    midia: { tipo: "pagina", src: "/trabalhos/miracar.webp" },
    stack: ["React Router 8", "React 19", "Tailwind 4", "Motion", "Zod", "Cloudflare Workers"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Site institucional de proteção veicular, estático e servido na borda.",
        feitos: [
          "SPA React pré-renderizada em HTML por rota: buscadores e IAs leem a página inteira sem executar JavaScript.",
          "Pipeline próprio de imagens com Sharp (AVIF, WebP e PNG responsivos).",
          "Regras de negócio validadas com Zod no build: erro de configuração não chega ao ar.",
          "Animações de scroll só em transform e opacity, sem travar a rolagem.",
        ],
      },
      en: {
        resumo: "Corporate site for a vehicle protection company — static and served from the edge.",
        feitos: [
          "React SPA prerendered to HTML per route: search engines and AI crawlers read the whole page without running JavaScript.",
          "Custom image pipeline with Sharp (responsive AVIF, WebP and PNG).",
          "Business rules validated with Zod at build time: a config mistake never ships.",
          "Scroll animations on transform and opacity only, no scroll jank.",
        ],
      },
      es: {
        resumo: "Sitio institucional de protección vehicular, estático y servido en el borde.",
        feitos: [
          "SPA React prerenderizada en HTML por ruta: buscadores e IAs leen la página completa sin ejecutar JavaScript.",
          "Pipeline propio de imágenes con Sharp (AVIF, WebP y PNG responsivos).",
          "Reglas de negocio validadas con Zod en el build: un error de configuración no llega a producción.",
          "Animaciones de scroll solo en transform y opacity, sin trabar el desplazamiento.",
        ],
      },
    },
  },
  {
    id: "mali",
    nome: "Mali Rastreadores",
    aba: "sites",
    url: "https://www.malirastreadores.com.br",
    midia: { tipo: "pagina", src: "/trabalhos/mali.webp" },
    stack: ["TypeScript", "Tailwind", "SEO técnico", "WCAG 2.1 AA", "Cloudflare Workers"],
    ano: "2026",
    texto: {
      pt: {
        resumo: "Landing de lançamento de um rastreador com bloqueio pelo celular, já no ar e convertendo.",
        feitos: [
          "Página completa de lançamento, pronta para o site maior crescer por cima sem retrabalho.",
          "SEO técnico com JSON-LD, sitemap e llms.txt para buscadores e IAs.",
          "Cabeçalhos de segurança (CSP, HSTS) e DNSSEC ativos.",
          "Acessibilidade WCAG 2.1 AA, respeitando quem pede menos movimento.",
        ],
      },
      en: {
        resumo: "Launch landing page for a phone-controlled vehicle tracker — live and converting.",
        feitos: [
          "Complete launch page, ready for the larger site to grow on top of it with no rework.",
          "Technical SEO with JSON-LD, sitemap and llms.txt for search engines and AI.",
          "Security headers (CSP, HSTS) and DNSSEC enabled.",
          "WCAG 2.1 AA accessibility, honoring reduced-motion preferences.",
        ],
      },
      es: {
        resumo: "Landing de lanzamiento de un rastreador con bloqueo desde el celular, en línea y convirtiendo.",
        feitos: [
          "Página completa de lanzamiento, lista para que el sitio mayor crezca encima sin retrabajo.",
          "SEO técnico con JSON-LD, sitemap y llms.txt para buscadores e IAs.",
          "Cabeceras de seguridad (CSP, HSTS) y DNSSEC activos.",
          "Accesibilidad WCAG 2.1 AA, respetando a quien pide menos movimiento.",
        ],
      },
    },
  },
  {
    id: "monumental",
    nome: "Monumental Assistência",
    aba: "sites",
    url: "https://monumentalassistencia.com.br/",
    midia: { tipo: "pagina", src: "/trabalhos/monumental.webp" },
    stack: ["Vite", "Tailwind", "GSAP", "EJS", "PHP 8", "Vitest"],
    ano: "2025",
    texto: {
      pt: {
        resumo: "Site multipágina de assistência veicular 24h, 100% estático, com formulários que chegam por e-mail.",
        feitos: [
          "Build multipágina com Vite e partials EJS compartilhados entre as páginas.",
          "Design system próprio em Tailwind (cores, tipografia e componentes).",
          "Animações GSAP de entrada com suporte a movimento reduzido.",
          "Formulários enviados por SMTP autenticado em PHP 8, com a lógica de UI coberta por testes no Vitest.",
        ],
      },
      en: {
        resumo: "Multi-page site for a 24/7 roadside assistance company — fully static, with forms delivered by email.",
        feitos: [
          "Multi-page build with Vite and EJS partials shared across pages.",
          "Custom Tailwind design system (colors, type and components).",
          "GSAP reveal animations with reduced-motion support.",
          "Forms sent via authenticated SMTP in PHP 8, with UI logic covered by Vitest tests.",
        ],
      },
      es: {
        resumo: "Sitio multipágina de asistencia vehicular 24h, 100% estático, con formularios que llegan por correo.",
        feitos: [
          "Build multipágina con Vite y partials EJS compartidos entre páginas.",
          "Design system propio en Tailwind (colores, tipografía y componentes).",
          "Animaciones GSAP de entrada con soporte a movimiento reducido.",
          "Formularios enviados por SMTP autenticado en PHP 8, con la lógica de UI cubierta por tests en Vitest.",
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
        resumo: "Custom time-tracking system that took a workshop off spreadsheets — automatic math and a timesheet ready to sign.",
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
];
