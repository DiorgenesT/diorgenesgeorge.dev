# Briefing: site pessoal do Diorgenes

Levantado em 02/11/2026. Fontes: o perfil do GitHub (DiorgenesT e o README do perfil), o repositório `DiorgenesT/diorgenesgeorge.dev` (cv.ts, about, services, cases, artigos e config/site.ts) e o histórico de tentativas anteriores.

## Quem é

- **Nome:** Diorgenes George. Nome completo: Diorgenes George Tavares Silva. Também aparece como "Diorgenes Tavares" e "DG".
- **Cargo:** Analista Sênior e Desenvolvedor de Software na **Fundação Beta**, a fundação pública de pesquisa e tecnologia ligada à Prefeitura de Betim. Está lá desde nov/2025.
- **Antes:** foi Gerente de Atendimento na Monumental Assistência 24h de nov/2021 a nov/2025. Sobre isso, ele escreve: "Quem já esteve na ponta escreve software diferente."
- **Formação:** Bacharelado em Ciência da Computação pela Universidade Cruzeiro do Sul (UNICSUL), de 2019 a 2024.
- **Local:** Betim, Minas Gerais, Brasil.
- **Domínio:** diorgenesgeorge.dev, que está no ar.
- **Contatos:**
  - GitHub: github.com/DiorgenesT
  - LinkedIn: linkedin.com/in/diorgenesgeorge
  - Instagram: @diorgenestavares
  - WhatsApp: +55 31 99151-9864

## O que faz

O resumo que ele usa: "Construo painéis de inteligência executiva, portais de serviço e APIs para a administração municipal de Betim."

Atende três públicos:
- o gabinete, que precisa de indicador confiável para decidir;
- o servidor, que precisa resolver a vida sem ir até o setor;
- o cidadão, que precisa de informação que antes só existia dentro da repartição.

### Stack

| Área | Ferramentas |
|---|---|
| Front | React, Next.js, TypeScript, Tailwind CSS |
| Back | Python, FastAPI, SQLAlchemy, Pandas, Node.js |
| Infra | Cloudflare (Workers, Pages, D1, KV, R2), Docker, CI/CD no GitHub |
| Dados | PostgreSQL, Supabase, scraping com BeautifulSoup |
| Explorando | IA em produção (RAG, agentes, automação) |

## Cases (com resultado)

1. **468 acordos em nove planilhas incompatíveis.** Viraram um modelo de dados normalizado e auditável. Resultado: o que antes exigia consolidar nove arquivos à mão virou um filtro na tela.
2. **44 painéis consolidados sem migrar um único banco.** Viraram um hub com login institucional, e a migração foi scriptada e reversível. Resultado: um login no lugar de dezenas de senhas e um deploy no lugar de dezenas.
3. **ODS Betim.** Painel público dos Objetivos de Desenvolvimento Sustentável, com série histórica e comparação com MG e Brasil.
4. **UPA Agora.** Mostra a fila e a classificação de risco das 4 UPAs de Betim em tempo quase real, sem gerar carga no sistema de origem.
5. **Planejamento de contratação pública.** Os 3 documentos da lei de licitações passaram a nascer num sistema com trilha de auditoria. É também o caso do "Word em vez de PDF".

## Artigos e princípios (a voz dele)

- **"Número sem dono não entra em painel de gestão."** Dado errado é pior que ausência de dado, porque a decisão vira ficção com aparência de dado.
- **"Consolidei 44 aplicações sem migrar um banco."**
- **"Quando o formato tecnicamente pior é a decisão certa"** (Word em vez de PDF).
- **Outras frases dele:**
  - "Prefiro decisão explicada a decisão elegante."
  - "Arquitetura se escolhe pelo raio de dano de um erro, não pela elegância do diagrama."
  - "Testes e acessibilidade entram como requisito, não como fase final."

### Serviços

- Painéis a partir de fontes dispersas.
- Portais estáticos.
- Integrações e ETL.

Processo em 4 passos: diagnóstico sem custo, escopo fechado, entregas incrementais e transferência com documentação.

O que ele não faz:
- legado sem acesso ao código;
- painel com número sem origem.

## Outros projetos (fora do trabalho)

- **PlayFun Games:**
  - VERMIS, com uma larva de cemitério e protótipos em Three.js;
  - Xeque Bárbaro, xadrez low-poly em que as peças lutam;
  - ApexWorm, multiplayer em Cloudflare;
  - Cubo da Velha, um jogo da velha 3D;
  - Reinos Vivos, um GDD.
- **Laboratório Virtual:** um escritório 3D em Godot onde agentes de IA trabalham.
- **Motion:** vídeos narrados com Remotion e ElevenLabs.
- **GamesReversed / GovReversed:** engenharia reversa de sistemas legados, como DATASUS e e-SUS.
- **Sites para clientes:** Miracar, Mali Rastreadores, Monumental, Jornal do Povo, Ceriso e Deyller.

## Tentativas anteriores (não repetir)

- `meu-site`, em React + Vite: loader com painéis divididos, cursor custom, terminal no hero, barras de skill, timeline, cards 3D tilt. É o portfólio dev genérico.
- `site-dev-project` e `site-dev`.
- `dev-portifolio`: React Router v7, SSR, blog.
- `diorgenesgeorge.dev`: uma "fanzine" em 3 idiomas (pt-BR, pt-PT, en-US), com Archivo Black e Space Mono, monograma e telemetria no hero. É o que está no ar.

## Direção (definida pelo Diorgenes, 02/11/2026)

O site é dele como dev: quem é, o que desenvolve e do que é capaz. **Sem nenhuma referência a prefeitura, Fundação Beta, cidade, ofícios ou burocracia.** Os cases acima servem só de bastidor; se entrarem, entram como produto ("painel de dados em tempo real", "hub com 44 apps"), sem órgão nem local.

## Atualizações (02/11/2026)
- **Open Digital Games:** ele agora faz parte dessa startup de jogos. Ela entra no mundo Jogos. O papel exato dele ainda precisa ser confirmado.
- Em breve será nomeado diretor (assunto para outro momento; não entra no site agora).
