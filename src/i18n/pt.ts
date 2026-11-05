import type { Dicionario } from "./en";

const pt: Dicionario = {
  meta: {
    titulo: "Diorgenes George | Desenvolvedor full stack de sistemas, jogos, 3D, vídeos e agentes de IA",
    descricao: "Desenvolvedor full stack. Painéis em tempo real, jogos no navegador, 3D, vídeos feitos em código e agentes de IA que trabalham comigo.",
  },
  nav: { secoes: [["#work", "Trabalhos"], ["#games", "Jogos"], ["#about", "Sobre"], ["#contact", "Contato"]] as [string, string][], contato: "Vamos construir", idioma: "Idioma", pular: "Pular para o conteúdo" },
  hero: {
    status: "Disponível para projetos",
    papel: "Desenvolvedor full stack",
    titulo: ["Eu programo o mundo.", "Você entra nele."],
    sub: "Crio sistemas web, jogos que rodam no navegador, experiências em 3D, vídeos feitos com código e agentes de IA. Cuido de cada projeto do primeiro commit até ele estar no ar.",
    cta: "Ver meus trabalhos",
    conversar: "Vamos conversar",
  },
  tema: { entrar: "Entrar no jogo (tema claro)", sair: "Voltar ao código (tema escuro)", claro: "Jogar", escuro: "Código" },
  hud: { nivel: "NV.", classe: "Dev full stack", xp: "XP" },
  conquista: { rotulo: "Conquista desbloqueada", nome: "Isekai", desc: "Você entrou no jogo que eu estou construindo." },
  telas: { voltar: "Voltar", fechar: "Fechar e voltar ao início", emBreve: "Fase bloqueada", emBreveDesc: "Esta área ainda está sendo construída. Volte em breve." },
  trabalhos: {
    rotulo: "Trabalhos",
    titulo: "Produtos que já estão no ar.",
    sub: "Projetos reais, em produção. Passe o mouse sobre um projeto para navegar por ele.",
    abas: { sites: "Sites", sistemas: "Sistemas", motion: "Motion" },
    feito: "Destaques",
    ver: "Ver no ar",
    ficha: {
      tipo: "Tipo",
      ano: "Ano",
      papel: "Papel",
      status: "Status",
      noAr: "No ar",
      video: "Vídeo",
      tipos: { sites: "Site", sistemas: "Sistema", motion: "Motion" },
      papeis: { sites: "Design e desenvolvimento", sistemas: "Desenvolvimento full stack", motion: "Animação em código" },
    },
  },
};
export default pt;
