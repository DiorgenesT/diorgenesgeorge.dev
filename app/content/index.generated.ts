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
  }
];
