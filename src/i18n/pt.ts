import type { Dicionario } from "./en";

const pt: Dicionario = {
  meta: {
    titulo: "Diorgenes George — Eu desenvolvo sistemas, jogos, mundos 3D, vídeos e agentes de IA",
    descricao: "Desenvolvedor full stack. Painéis em tempo real, jogos no navegador, 3D, vídeos feitos em código e agentes de IA que trabalham comigo.",
  },
  nav: { secoes: [["#work", "Trabalhos"], ["#games", "Jogos"], ["#about", "Sobre"], ["#contact", "Contato"]] as [string, string][], contato: "Vamos construir", idioma: "Idioma", pular: "Pular para o conteúdo" },
  hero: {
    status: "Disponível para projetos",
    papel: "Desenvolvedor full stack",
    titulo: ["Código no escuro.", "Produto na luz."],
    sub: "Desenvolvo sistemas web, jogos no navegador, 3D, vídeos feitos em código e agentes de IA — da primeira linha ao deploy.",
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
    feito: "O que eu fiz",
    ver: "Ver no ar",
  },
};
export default pt;
