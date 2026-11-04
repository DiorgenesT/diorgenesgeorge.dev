# Plano do site (atualizado em 04/11/2026)

O conceito do spec `docs/superpowers/specs/2026-11-02-eu-desenvolvo-design.md` ("Eu desenvolvo ___", mundos com cortes
secos) foi **substituído** pelo conceito **ISEKAI**, inspirado na mecânica do daviaxs.com.br (o seletor de tema
controla o vídeo do hero), sem copiar o estilo dele. Idioma padrão da raiz: **en**. Deploy: só `*.workers.dev` até
aprovação; `diorgenesgeorge.dev` depois.

Cada fase termina com build, lint, prints em desktop (1440) e celular (390) e um checkpoint com o Diorgenes.

## Conceito ISEKAI

- **Escuro (código):** ele programa à noite, olhando o monitor de código; o jogo roda no outro monitor (vídeo em loop).
- **Troca para o claro ("Build & Run"):** aperta Enter, um flash de impacto, a luz e o código saem do monitor do jogo
  (canvas sincronizado ao vídeo), a câmera mergulha, o branco vira blocos de pixel que montam o mundo.
- **Claro (jogo):** ele dentro do mundo de fantasia (ilhas flutuantes, castelo, cristal), de perfil, olhando o castelo.
  HUD com nível e XP e conquista "Isekai".
- **Navegação:** hero fixo, sem scroll. Trabalhos, Jogos, Sobre e Contato abrem como **telas** por hash (`#work`...)
  através de um portal: a página é projetada em perspectiva dentro do monitor de código (ou do cristal, no claro),
  o monitor "liga" como um CRT e o painel voa até a janela. Voltar, Esc, logo e o voltar do navegador fecham.

## Feito

### Fase 1: base + hero ISEKAI
- [x] Next 16 (export estático), Tailwind 4, GSAP, Lenis, i18n pt/en/es, Worker que redireciona a raiz para /en/.
- [x] Tema claro/escuro sem flash (`data-tema` = escolha, `data-visual` = o que está na tela; variante `jogo:`).
- [x] Vídeos do Kling (`media/raw/kling-*.mp4`) processados por `scripts/midia-isekai.sh`: sem áudio, sem marca
      d'água, loop sem emenda, Enter alinhado ao loop (`scripts/alinhar-enter.py`), mundo só de 0,25 s a 1,3 s
      (ele não vira a cabeça nem sorri).
- [x] Transição Enter: `src/lib/luz.ts` (tela acende no formato do monitor, código voando em perspectiva, raios,
      flash de impacto em 1 s, onde a troca de vídeo fica escondida, e branco que nasce do monitor) + `src/lib/pixels.ts`.
- [x] HUD + conquista (`Hud.tsx`), botão de tema (`BotaoTema.tsx`).

### Fase 2: telas + portal
- [x] Hero fixo, sem scroll; `Telas.tsx` com rotas por hash, link direto, Esc, logo e voltar do navegador.
- [x] Portal `src/lib/portal.ts`: homografia (matrix3d) do monitor de código ou do cristal até a janela, CRT,
      câmera, borda brilhando e reflexo. Sem filtros pesados (blur no vídeo derrubava o FPS).
- [x] Tela Trabalhos (abas Sites/Sistemas/Motion, janelas de navegador com o site real).
- [x] Jogos, Sobre e Contato: placeholder "Fase bloqueada".

## Próximo (retomar aqui)

1. **Considerações do Diorgenes sobre o estado atual** (ele tem várias; ouvir antes de seguir).
2. Conferir no navegador real a fluidez do portal e da transição Enter (o headless roda a ~7 fps, não serve para medir).
3. Celular: no tema claro o cristal fica quase fora do enquadramento; o portal nasce na borda esquerda.
4. Tela Trabalhos no tema claro: hoje continua escura (só hero e HUD mudam com o tema).

## Fase 3: telas que faltam
- [ ] **Jogos:** jogos no navegador (bancada R3F ou vitrine), com import dinâmico e fallback em imagem.
- [ ] **Sobre:** curto, com foto e materiais.
- [ ] **Contato:** frase editável que vira mensagem no WhatsApp.
- [ ] XP do HUD por telas visitadas (hoje vem do scroll da tela aberta).
- [ ] Easter egg: Konami code.

## Fase 4: acabamento
- [ ] SEO/GEO (JSON-LD, sitemap, llms.txt, og) e metadados por tela.
- [ ] Acessibilidade (foco ao abrir/fechar tela, `prefers-reduced-motion`, leitores de tela no portal).
- [ ] Performance (peso dos vídeos, preload só do que é usado, Lighthouse).
- [ ] Revisão de UX e deploy no workers.dev; `diorgenesgeorge.dev` só depois de aprovado.

## Referências de verificação
- `scripts/prints-isekai.mjs`: prints da troca de tema.
- `scripts/prints-portal.mjs`: prints de abrir e fechar telas.
- Para ver a animação quadro a quadro, usar `page.clock.pauseAt()` + `clock.runFor()` do Playwright.
- Preview local: `npm run build` e `npx wrangler dev --port 8788` (reiniciar o wrangler depois de cada build).
