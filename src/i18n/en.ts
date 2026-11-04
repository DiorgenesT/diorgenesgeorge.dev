const en = {
  meta: {
    titulo: "Diorgenes George — I build systems, games, 3D worlds, videos and AI agents",
    descricao: "Full stack developer. Real-time dashboards, browser games, 3D, videos made with code and AI agents that work alongside me.",
  },
  nav: { secoes: [["#work", "Work"], ["#games", "Games"], ["#about", "About"], ["#contact", "Contact"]] as [string, string][], contato: "Let's build", idioma: "Language", pular: "Skip to content" },
  hero: {
    status: "Available for projects",
    papel: "Full stack developer",
    titulo: ["Code in the dark.", "Products in the light."],
    sub: "I build web systems, browser games, 3D, videos made with code and AI agents — from the first line to the deploy.",
    cta: "See my work",
    conversar: "Let's talk",
  },
  tema: { entrar: "Enter the game (light theme)", sair: "Back to the code (dark theme)", claro: "Play", escuro: "Code" },
  hud: { nivel: "LV.", classe: "Full-stack dev", xp: "XP" },
  conquista: { rotulo: "Achievement unlocked", nome: "Isekai", desc: "You entered the game I'm building." },
  telas: { voltar: "Back", fechar: "Close and return to the start", emBreve: "Level locked", emBreveDesc: "This area is still being built. Come back soon." },
  trabalhos: {
    rotulo: "Selected work",
    titulo: "Products already live.",
    sub: "Real projects, in production. Hover a project to scroll through it.",
    abas: { sites: "Sites", sistemas: "Systems", motion: "Motion" },
    feito: "What I did",
    ver: "Visit live",
  },
};
export default en;
export type Dicionario = typeof en;
