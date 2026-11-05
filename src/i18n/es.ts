import type { Dicionario } from "./en";

const es: Dicionario = {
  meta: {
    titulo: "Diorgenes George | Desarrollador full stack de sistemas, juegos, 3D, videos y agentes de IA",
    descricao: "Desarrollador full stack. Paneles en tiempo real, juegos en el navegador, 3D, videos hechos con código y agentes de IA que trabajan conmigo.",
  },
  nav: { secoes: [["#work", "Trabajos"], ["#games", "Juegos"], ["#about", "Sobre mí"], ["#contact", "Contacto"]] as [string, string][], contato: "Construyamos", idioma: "Idioma", pular: "Saltar al contenido" },
  hero: {
    status: "Disponible para proyectos",
    papel: "Desarrollador full stack",
    titulo: ["Yo programo el mundo.", "Tú entras en él."],
    sub: "Creo sistemas web, juegos que corren en el navegador, experiencias en 3D, videos hechos con código y agentes de IA. Llevo cada proyecto desde el primer commit hasta que está en línea.",
    cta: "Ver mis trabajos",
    conversar: "Hablemos",
  },
  tema: { entrar: "Entrar al juego (tema claro)", sair: "Volver al código (tema oscuro)", claro: "Jugar", escuro: "Código" },
  hud: { nivel: "NV.", classe: "Dev full stack", xp: "XP" },
  conquista: { rotulo: "Logro desbloqueado", nome: "Isekai", desc: "Entraste al juego que estoy construyendo." },
  telas: { voltar: "Volver", fechar: "Cerrar y volver al inicio", emBreve: "Nivel bloqueado", emBreveDesc: "Esta área todavía está en construcción. Vuelve pronto." },
  trabalhos: {
    rotulo: "Trabajos",
    titulo: "Productos que ya están en línea.",
    sub: "Proyectos reales, en producción. Pasa el mouse sobre un proyecto para recorrerlo.",
    abas: { sites: "Sitios", sistemas: "Sistemas", motion: "Motion" },
    feito: "Destacados",
    ver: "Ver en línea",
    ficha: {
      tipo: "Tipo",
      ano: "Año",
      papel: "Rol",
      status: "Estado",
      noAr: "En línea",
      video: "Video",
      tipos: { sites: "Sitio", sistemas: "Sistema", motion: "Motion" },
      papeis: { sites: "Diseño y desarrollo", sistemas: "Desarrollo full stack", motion: "Animación con código" },
    },
  },
};
export default es;
