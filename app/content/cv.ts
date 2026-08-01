import type { Locale } from "../i18n/config";

export type CvPosition = {
  org: string;
  role: string;
  /** AAAA-MM. O fim ausente significa vínculo atual. */
  start: string;
  end?: string;
  location: string;
  highlights: string[];
};

export type CvEducation = {
  org: string;
  degree: string;
  start: string;
  end: string;
};

export type Cv = {
  headline: string;
  summary: string;
  positions: CvPosition[];
  education: CvEducation[];
  skills: { group: string; items: string[] }[];
};

const ptBR: Cv = {
  headline: "Desenvolvedor full stack · Sistemas de gestão pública",
  summary:
    "Construo painéis de inteligência executiva, portais de serviço e APIs para a administração municipal de Betim, com React, Next.js, TypeScript, Python e infraestrutura na Cloudflare.",
  positions: [
    {
      org: "Fundação Beta",
      role: "Analista sênior · Desenvolvedor de software",
      start: "2025-11",
      location: "Betim, MG",
      highlights: [
        "Painéis de indicadores para o gabinete executivo, alimentados por integrações automáticas com bases públicas federais, estaduais e municipais.",
        "Portais de serviço para servidores públicos e para o cidadão, em Next.js com renderização estática.",
        "APIs em Python com FastAPI e SQLAlchemy, e pipelines de extração e tratamento de dados com Pandas.",
        "Infraestrutura e deploy no ecossistema Cloudflare — Workers, Pages, D1, KV e R2 — com CI/CD no GitHub.",
        "Modelagem e manutenção de bancos relacionais em PostgreSQL, e Supabase como camada de persistência e autenticação.",
        "Sistemas em conformidade com LGPD, Lei de Acesso à Informação e requisitos legais de acessibilidade.",
      ],
    },
    {
      org: "Monumental Assistência 24h",
      role: "Gerente de atendimento",
      start: "2021-11",
      end: "2025-11",
      location: "Betim, MG",
      highlights: [
        "Gestão da equipe de atendimento, com acompanhamento de métricas de desempenho e de resolução.",
      ],
    },
  ],
  education: [
    {
      org: "Universidade Cruzeiro do Sul",
      degree: "Bacharelado em Ciência da Computação",
      start: "2019-04",
      end: "2024-09",
    },
  ],
  skills: [
    {
      group: "Front-end",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"],
    },
    { group: "Back-end", items: ["Python", "FastAPI", "SQLAlchemy", "Pandas"] },
    {
      group: "Infraestrutura",
      items: ["Cloudflare Workers", "Pages", "D1", "KV", "R2", "Docker", "CI/CD no GitHub"],
    },
    {
      group: "Dados",
      items: ["PostgreSQL", "Supabase", "Web scraping com BeautifulSoup"],
    },
  ],
};

const ptPT: Cv = {
  headline: "Programador full stack · Sistemas de gestão pública",
  summary:
    "Construo painéis de inteligência executiva, portais de serviço e APIs para a administração municipal de Betim, no Brasil, com React, Next.js, TypeScript, Python e infraestrutura na Cloudflare.",
  positions: [
    {
      org: "Fundação Beta",
      role: "Analista sénior · Programador de software",
      start: "2025-11",
      location: "Betim, Brasil",
      highlights: [
        "Painéis de indicadores para o gabinete executivo, alimentados por integrações automáticas com bases públicas federais, estaduais e municipais.",
        "Portais de serviço para funcionários públicos e para o cidadão, em Next.js com renderização estática.",
        "APIs em Python com FastAPI e SQLAlchemy, e pipelines de extracção e tratamento de dados com Pandas.",
        "Infraestrutura e publicação no ecossistema Cloudflare — Workers, Pages, D1, KV e R2 — com CI/CD no GitHub.",
        "Modelação e manutenção de bases de dados relacionais em PostgreSQL, e Supabase como camada de persistência e autenticação.",
        "Sistemas em conformidade com a legislação de protecção de dados, acesso à informação e acessibilidade.",
      ],
    },
    {
      org: "Monumental Assistência 24h",
      role: "Gestor de atendimento",
      start: "2021-11",
      end: "2025-11",
      location: "Betim, Brasil",
      highlights: [
        "Gestão da equipa de atendimento, com acompanhamento de métricas de desempenho e de resolução.",
      ],
    },
  ],
  education: [
    {
      org: "Universidade Cruzeiro do Sul",
      degree: "Licenciatura em Ciência da Computação",
      start: "2019-04",
      end: "2024-09",
    },
  ],
  skills: [
    {
      group: "Front-end",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"],
    },
    { group: "Back-end", items: ["Python", "FastAPI", "SQLAlchemy", "Pandas"] },
    {
      group: "Infraestrutura",
      items: ["Cloudflare Workers", "Pages", "D1", "KV", "R2", "Docker", "CI/CD no GitHub"],
    },
    {
      group: "Dados",
      items: ["PostgreSQL", "Supabase", "Web scraping com BeautifulSoup"],
    },
  ],
};

const enUS: Cv = {
  headline: "Full stack developer · Public sector systems",
  summary:
    "I build executive dashboards, service portals and APIs for the city government of Betim, Brazil, with React, Next.js, TypeScript, Python and infrastructure on Cloudflare.",
  positions: [
    {
      org: "Fundação Beta",
      role: "Senior analyst · Software developer",
      start: "2025-11",
      location: "Betim, Brazil",
      highlights: [
        "Indicator dashboards for the executive office, fed by automated integrations with federal, state and municipal open data sources.",
        "Service portals for public employees and citizens, built in Next.js with static rendering.",
        "APIs in Python with FastAPI and SQLAlchemy, plus extraction and data processing pipelines with Pandas.",
        "Infrastructure and deployment on Cloudflare — Workers, Pages, D1, KV and R2 — with CI/CD on GitHub.",
        "Relational data modeling and maintenance in PostgreSQL, with Supabase as persistence and authentication layer.",
        "Systems built to comply with Brazilian data protection, freedom of information and accessibility law.",
      ],
    },
    {
      org: "Monumental Assistência 24h",
      role: "Customer support manager",
      start: "2021-11",
      end: "2025-11",
      location: "Betim, Brazil",
      highlights: [
        "Led the support team, tracking performance and resolution metrics.",
      ],
    },
  ],
  education: [
    {
      org: "Universidade Cruzeiro do Sul",
      degree: "BSc in Computer Science",
      start: "2019-04",
      end: "2024-09",
    },
  ],
  skills: [
    {
      group: "Front-end",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"],
    },
    { group: "Back-end", items: ["Python", "FastAPI", "SQLAlchemy", "Pandas"] },
    {
      group: "Infrastructure",
      items: ["Cloudflare Workers", "Pages", "D1", "KV", "R2", "Docker", "CI/CD on GitHub"],
    },
    {
      group: "Data",
      items: ["PostgreSQL", "Supabase", "Web scraping with BeautifulSoup"],
    },
  ],
};

export const CV: Record<Locale, Cv> = {
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "en-US": enUS,
};
