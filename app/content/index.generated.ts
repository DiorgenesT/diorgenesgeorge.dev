// Gerado por scripts/build-content-index.ts — não editar à mão.
// Só frontmatter: o MDX compilado fica no chunk da rota que o renderiza, para a
// home não baixar o texto de todas as páginas do site.
import type { Locale } from "../i18n/config";
import type {
  ArticleFrontmatter,
  CaseFrontmatter,
  PageFrontmatter,
} from "./schema";

export type IndexEntry =
  | { kind: "page"; slug: string; locale: Locale; frontmatter: PageFrontmatter }
  | { kind: "case"; slug: string; locale: Locale; frontmatter: CaseFrontmatter }
  | {
      kind: "article";
      slug: string;
      locale: Locale;
      frontmatter: ArticleFrontmatter;
    };

export const CONTENT_INDEX: IndexEntry[] = [
  {
    "kind": "page",
    "slug": "about",
    "locale": "en-US",
    "frontmatter": {
      "title": "Diorgenes George, public sector software developer",
      "answer": "I am a full stack developer in Betim, Minas Gerais, Brazil. At Fundação Beta, the city government's technology foundation, I build the dashboards municipal leadership uses to decide and the portals public employees and citizens use every day.",
      "translationKey": "sobre",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "about",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Diorgenes George, desenvolvedor de software público",
      "answer": "Sou desenvolvedor full stack em Betim, Minas Gerais. Na Fundação Beta, o órgão de tecnologia da prefeitura, construo os painéis que a gestão municipal usa para decidir e os portais que servidores e cidadãos acessam todo dia.",
      "translationKey": "sobre",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "about",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "Diorgenes George, programador de software público",
      "answer": "Sou programador full stack em Betim, Minas Gerais, no Brasil. Na Fundação Beta, o organismo de tecnologia da câmara municipal, construo os painéis que a gestão usa para decidir e os portais que funcionários e cidadãos acedem todos os dias.",
      "translationKey": "sobre",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "colophon",
    "locale": "en-US",
    "frontmatter": {
      "title": "How this site was built",
      "answer": "This site is prerendered at build time and served as static HTML from Cloudflare's edge, in three languages, with no request to any external domain. The code is open and every technical decision here has a written reason.",
      "translationKey": "colofao",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "colophon",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Como este site foi construído",
      "answer": "Este site é pré-renderizado em build e servido como HTML estático na borda da Cloudflare, em três idiomas, sem nenhuma requisição a domínio externo. O código é aberto e cada decisão técnica aqui tem um motivo escrito.",
      "translationKey": "colofao",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "colophon",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "Como este sítio foi construído",
      "answer": "Este sítio é pré-renderizado em build e servido como HTML estático na periferia da Cloudflare, em três idiomas, sem qualquer pedido a domínio externo. O código é aberto e cada decisão técnica aqui tem um motivo escrito.",
      "translationKey": "colofao",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "services",
    "locale": "en-US",
    "frontmatter": {
      "title": "Data dashboards, portals and integrations",
      "answer": "I build data dashboards, service portals and integrations between systems that do not talk to each other, delivered on edge infrastructure with predictable cost. I work mostly with organizations that need to turn scattered data into decisions.",
      "translationKey": "servicos",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "services",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Painéis de dados, portais e integrações",
      "answer": "Construo painéis de dados, portais de serviço e integrações entre sistemas que não conversam, entregues em infraestrutura de borda com custo previsível. Trabalho principalmente com organizações que precisam transformar dado disperso em decisão.",
      "translationKey": "servicos",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "page",
    "slug": "services",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "Painéis de dados, portais e integrações",
      "answer": "Construo painéis de dados, portais de serviço e integrações entre sistemas que não comunicam, entregues em infraestrutura de periferia com custo previsível. Trabalho sobretudo com organizações que precisam de transformar dado disperso em decisão.",
      "translationKey": "servicos",
      "status": "publicado",
      "updated": "2026-08-01"
    }
  },
  {
    "kind": "case",
    "slug": "468-acordos-em-nove-planilhas",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "468 acordos em nove planilhas incompatíveis",
      "answer": "Cerca de 468 termos de ajuste assinados entre 2020 e 2026 viviam em nove planilhas com formatos incompatíveis, e ninguém conseguia responder quantos estavam atrasados sem abrir os nove arquivos. Viraram um modelo de dados normalizado e auditável, com a origem de cada registro preservada.",
      "translationKey": "instrumentos",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Desenvolvedor full stack",
      "period": "2026",
      "stack": [
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "SQL"
      ],
      "outcome": "Pergunta que exigia consolidar nove arquivos à mão passou a ser um filtro na tela.",
      "order": 3,
      "proof": {
        "value": "468",
        "label": "acordos migrados de nove planilhas"
      }
    }
  },
  {
    "kind": "case",
    "slug": "468-acordos-em-nove-planilhas",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "468 acordos em nove folhas de cálculo incompatíveis",
      "answer": "Cerca de 468 termos de ajuste assinados entre 2020 e 2026 viviam em nove folhas de cálculo com formatos incompatíveis, e ninguém conseguia responder quantos estavam atrasados sem abrir os nove ficheiros. Passaram a um modelo de dados normalizado e auditável, com a origem de cada registo preservada.",
      "translationKey": "instrumentos",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Programador full stack",
      "period": "2026",
      "stack": [
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "SQL"
      ],
      "outcome": "Pergunta que exigia consolidar nove ficheiros à mão passou a ser um filtro no ecrã.",
      "order": 3,
      "proof": {
        "value": "468",
        "label": "acordos migrados de nove folhas de cálculo"
      }
    }
  },
  {
    "kind": "case",
    "slug": "468-agreements-nine-spreadsheets",
    "locale": "en-US",
    "frontmatter": {
      "title": "468 agreements across nine incompatible spreadsheets",
      "answer": "Around 468 municipal agreements signed between 2020 and 2026 lived in nine spreadsheets with incompatible formats, and nobody could answer how many were overdue without opening all nine files. They became a normalized, auditable data model with the origin of every record preserved.",
      "translationKey": "instrumentos",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Full stack developer",
      "period": "2026",
      "stack": [
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "SQL"
      ],
      "outcome": "A question that required consolidating nine files by hand became a filter on screen.",
      "order": 3,
      "proof": {
        "value": "468",
        "label": "agreements migrated from nine spreadsheets"
      }
    }
  },
  {
    "kind": "case",
    "slug": "consolidacao-de-44-paineis",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Consolidar 44 painéis sem migrar um único banco",
      "answer": "Quarenta e quatro painéis independentes, cada um com endereço e senha próprios, viraram um hub único com login institucional — sem mover nenhum banco de dados. A migração foi scriptada e permaneceu reversível, porque os dados vivem na plataforma por identificador e mover o código não os toca.",
      "translationKey": "central",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Desenvolvedor full stack",
      "period": "2026",
      "stack": [
        "Next.js",
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "Supabase"
      ],
      "outcome": "Um login institucional em vez de senha compartilhada por painel, e um deploy em vez de dezenas.",
      "order": 1,
      "proof": {
        "value": "44",
        "label": "painéis consolidados em um hub"
      }
    }
  },
  {
    "kind": "case",
    "slug": "consolidacao-de-44-paineis",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "Consolidar 44 painéis sem migrar uma única base",
      "answer": "Quarenta e quatro painéis independentes, cada um com endereço e palavra-passe próprios, passaram a um único hub com autenticação institucional — sem mover qualquer base de dados. A migração foi automatizada e manteve-se reversível, porque os dados vivem na plataforma por identificador e mover o código não lhes toca.",
      "translationKey": "central",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Programador full stack",
      "period": "2026",
      "stack": [
        "Next.js",
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "Supabase"
      ],
      "outcome": "Uma autenticação institucional em vez de palavra-passe partilhada por painel, e uma publicação em vez de dezenas.",
      "order": 1,
      "proof": {
        "value": "44",
        "label": "painéis consolidados num hub"
      }
    }
  },
  {
    "kind": "case",
    "slug": "consolidating-44-dashboards",
    "locale": "en-US",
    "frontmatter": {
      "title": "Consolidating 44 dashboards without migrating a database",
      "answer": "Forty-four independent dashboards, each with its own address and password, became a single hub behind institutional login — without moving a single database. The migration was scripted and stayed reversible, because the data lives on the platform by identifier and moving the code never touches it.",
      "translationKey": "central",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Full stack developer",
      "period": "2026",
      "stack": [
        "Next.js",
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "Supabase"
      ],
      "outcome": "One institutional login instead of a shared password per dashboard, and one deploy instead of dozens.",
      "order": 1,
      "proof": {
        "value": "44",
        "label": "dashboards consolidated into one hub"
      }
    }
  },
  {
    "kind": "case",
    "slug": "painel-ods-de-betim",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "ODS Betim: indicadores comparáveis com estado e país",
      "answer": "O desempenho de Betim nos Objetivos de Desenvolvimento Sustentável existia em relatórios anuais e em bases estatísticas que exigem saber navegar tabela para extrair. O ODS Betim é o painel público que reúne isso com série histórica, onde cada indicador aparece ao lado de Minas Gerais e do Brasil.",
      "translationKey": "ods",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Desenvolvedor full stack",
      "period": "2026",
      "stack": [
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "Python"
      ],
      "outcome": "Indicador disperso em base estatística e relatório anual passou a ser consultável por qualquer pessoa.",
      "order": 5
    }
  },
  {
    "kind": "case",
    "slug": "painel-ods-de-betim",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "ODS Betim: indicadores comparáveis com estado e país",
      "answer": "O desempenho de Betim nos Objectivos de Desenvolvimento Sustentável existia em relatórios anuais e em bases estatísticas que exigem saber navegar tabelas para extrair. O ODS Betim é o painel público que reúne isto com série histórica, onde cada indicador aparece ao lado de Minas Gerais e do Brasil.",
      "translationKey": "ods",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Programador full stack",
      "period": "2026",
      "stack": [
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "Python"
      ],
      "outcome": "Indicador disperso em base estatística e relatório anual passou a poder ser consultado por qualquer pessoa.",
      "order": 5
    }
  },
  {
    "kind": "case",
    "slug": "painel-publico-de-filas-de-upa",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "UPA Agora: fila de pronto-atendimento em tempo quase real",
      "answer": "Para saber qual unidade de pronto-atendimento estava mais cheia, era preciso ir até lá e olhar a fila. O UPA Agora passou a mostrar espera e classificação de risco das quatro UPAs de Betim, sem que o acesso do cidadão gere carga no sistema assistencial de origem.",
      "translationKey": "upa-agora",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Desenvolvedor full stack",
      "period": "2026",
      "stack": [
        "React",
        "TypeScript",
        "Cloudflare Workers",
        "KV",
        "Cron Triggers"
      ],
      "outcome": "Informação que só existia dentro da unidade passou a ser consultável antes de sair de casa.",
      "order": 4,
      "proof": {
        "value": "4",
        "label": "unidades com fila pública em tempo quase real"
      }
    }
  },
  {
    "kind": "case",
    "slug": "painel-publico-de-filas-de-upa",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "UPA Agora: fila de urgência em tempo quase real",
      "answer": "Para saber qual unidade de urgência estava mais cheia, era preciso deslocar-se até lá e ver a fila. O UPA Agora passou a mostrar espera e triagem de risco das quatro unidades de Betim, sem que o acesso do cidadão gere carga no sistema assistencial de origem.",
      "translationKey": "upa-agora",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Programador full stack",
      "period": "2026",
      "stack": [
        "React",
        "TypeScript",
        "Cloudflare Workers",
        "KV",
        "Cron Triggers"
      ],
      "outcome": "Informação que só existia dentro da unidade passou a poder ser consultada antes de sair de casa.",
      "order": 4,
      "proof": {
        "value": "4",
        "label": "unidades com fila pública em tempo quase real"
      }
    }
  },
  {
    "kind": "case",
    "slug": "planejamento-de-contratacao-publica",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Quando exportar Word em vez de PDF é a decisão certa",
      "answer": "Os três documentos que a lei de licitações exige antes de qualquer compra pública eram produzidos em arquivos de texto isolados por cada secretaria, sem rastreabilidade nem padronização. Passaram a nascer dentro de um sistema, com trilha de auditoria e geração automática do documento final.",
      "translationKey": "contrataplan",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Desenvolvedor full stack",
      "period": "2026",
      "stack": [
        "Next.js",
        "TypeScript",
        "Cloudflare Workers",
        "D1"
      ],
      "outcome": "Documento obrigatório por lei saiu do arquivo solto em cada secretaria e ganhou trilha de auditoria.",
      "order": 2
    }
  },
  {
    "kind": "case",
    "slug": "planejamento-de-contratacao-publica",
    "locale": "pt-PT",
    "frontmatter": {
      "title": "Quando exportar Word em vez de PDF é a decisão certa",
      "answer": "Os três documentos que a lei de contratação pública exige antes de qualquer compra eram produzidos em ficheiros de texto isolados por cada área, sem rastreabilidade nem normalização. Passaram a nascer dentro de um sistema, com trilho de auditoria e geração automática do documento final.",
      "translationKey": "contrataplan",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Programador full stack",
      "period": "2026",
      "stack": [
        "Next.js",
        "TypeScript",
        "Cloudflare Workers",
        "D1"
      ],
      "outcome": "Documento obrigatório por lei saiu do ficheiro solto em cada área e ganhou trilho de auditoria.",
      "order": 2
    }
  },
  {
    "kind": "case",
    "slug": "public-emergency-room-queues",
    "locale": "en-US",
    "frontmatter": {
      "title": "UPA Agora: public emergency room queues in near real time",
      "answer": "To find out which emergency room was busiest, people had to go there and look at the queue. UPA Agora now shows waiting times and triage counts for Betim's four units, without citizen traffic putting any load on the clinical system it reads from.",
      "translationKey": "upa-agora",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Full stack developer",
      "period": "2026",
      "stack": [
        "React",
        "TypeScript",
        "Cloudflare Workers",
        "KV",
        "Cron Triggers"
      ],
      "outcome": "Information that existed only inside the unit became something you can check before leaving home.",
      "order": 4,
      "proof": {
        "value": "4",
        "label": "units with public queues in near real time"
      }
    }
  },
  {
    "kind": "case",
    "slug": "public-procurement-planning",
    "locale": "en-US",
    "frontmatter": {
      "title": "When exporting Word instead of PDF is the right call",
      "answer": "The three documents Brazilian procurement law requires before any public purchase were written in isolated text files by each department, with no traceability and no standard. They now start inside a system, with an audit trail and automatic generation of the final document.",
      "translationKey": "contrataplan",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Full stack developer",
      "period": "2026",
      "stack": [
        "Next.js",
        "TypeScript",
        "Cloudflare Workers",
        "D1"
      ],
      "outcome": "A document required by law moved out of loose files on department machines and gained an audit trail.",
      "order": 2
    }
  },
  {
    "kind": "case",
    "slug": "sdg-dashboard",
    "locale": "en-US",
    "frontmatter": {
      "title": "ODS Betim: sustainable development indicators, comparable",
      "answer": "Betim's performance against the Sustainable Development Goals existed in annual reports and in statistical databases that require knowing exactly which table to open. ODS Betim is the public dashboard that gathers it with historical series, where every indicator sits next to Minas Gerais and Brazil.",
      "translationKey": "ods",
      "status": "publicado",
      "updated": "2026-08-01",
      "org": "Fundação Beta",
      "role": "Full stack developer",
      "period": "2026",
      "stack": [
        "TypeScript",
        "Cloudflare Workers",
        "D1",
        "Python"
      ],
      "outcome": "Indicators scattered across statistical databases and annual reports became something anyone can look up.",
      "order": 5
    }
  },
  {
    "kind": "article",
    "slug": "consolidar-sem-migrar-banco",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Consolidei 44 aplicações sem migrar um banco",
      "answer": "Quando a plataforma endereça o banco por identificador e não por localização, consolidar aplicações é um problema de código, não de dados. Tratar como problema de dados é o que cria janela de indisponibilidade, plano de rollback e risco de perda — três coisas que não precisavam existir.",
      "translationKey": "consolidar-sem-migrar",
      "status": "publicado",
      "updated": "2026-08-01",
      "published": "2026-08-01",
      "tags": [
        "arquitetura",
        "cloudflare",
        "migracao"
      ]
    }
  },
  {
    "kind": "article",
    "slug": "consolidating-without-migrating-databases",
    "locale": "en-US",
    "frontmatter": {
      "title": "I consolidated 44 applications without migrating a database",
      "answer": "When the platform addresses a database by identifier rather than by location, consolidating applications is a code problem, not a data problem. Treating it as a data problem is what creates the maintenance window, the rollback plan and the risk of loss — three things that never had to exist.",
      "translationKey": "consolidar-sem-migrar",
      "status": "publicado",
      "updated": "2026-08-01",
      "published": "2026-08-01",
      "tags": [
        "arquitetura",
        "cloudflare",
        "migracao"
      ]
    }
  },
  {
    "kind": "article",
    "slug": "numbers-without-an-owner",
    "locale": "en-US",
    "frontmatter": {
      "title": "A number without an owner does not belong on a dashboard",
      "answer": "Wrong data for a public official is worse than no data, because the decision becomes fiction wearing the appearance of data. Every indicator on display needs a traceable origin and someone responsible for updating it — and when it has neither, the right answer is not to display it.",
      "translationKey": "numero-sem-dono",
      "status": "publicado",
      "updated": "2026-08-01",
      "published": "2026-08-01",
      "tags": [
        "dados",
        "governanca"
      ]
    }
  },
  {
    "kind": "article",
    "slug": "numero-sem-dono",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Número sem dono não entra em painel de gestão",
      "answer": "Dado errado para um gestor público é pior do que ausência de dado, porque a decisão vira ficção com aparência de dado. Todo indicador exibido precisa de origem rastreável e de alguém responsável por atualizá-lo — e quando não tem, a resposta certa é não exibir.",
      "translationKey": "numero-sem-dono",
      "status": "publicado",
      "updated": "2026-08-01",
      "published": "2026-08-01",
      "tags": [
        "dados",
        "governanca"
      ]
    }
  },
  {
    "kind": "article",
    "slug": "word-em-vez-de-pdf",
    "locale": "pt-BR",
    "frontmatter": {
      "title": "Quando o formato tecnicamente pior é a decisão certa",
      "answer": "Escolhi exportar documento em Word em vez de PDF num sistema público, sabendo que PDF é o padrão técnico. O motivo é que o documento continua percorrendo as secretarias em papel, e um formato imutável não travaria uma etapa: travaria o circuito inteiro de aprovação.",
      "translationKey": "formato-que-o-processo-suporta",
      "status": "publicado",
      "updated": "2026-08-01",
      "published": "2026-08-01",
      "tags": [
        "produto",
        "setor-publico"
      ]
    }
  },
  {
    "kind": "article",
    "slug": "word-instead-of-pdf",
    "locale": "en-US",
    "frontmatter": {
      "title": "When the technically worse format is the right decision",
      "answer": "I made a government system export Word instead of PDF, knowing PDF is the technical standard. The reason is that the document keeps travelling between departments on paper, and an immutable format would not stall one step: it would stall the entire approval circuit.",
      "translationKey": "formato-que-o-processo-suporta",
      "status": "publicado",
      "updated": "2026-08-01",
      "published": "2026-08-01",
      "tags": [
        "produto",
        "setor-publico"
      ]
    }
  }
];
