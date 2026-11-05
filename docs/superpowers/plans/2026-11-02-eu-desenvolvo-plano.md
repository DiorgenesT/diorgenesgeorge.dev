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

### Fase 2b: vídeos "de costas" + sucção em código (04/11/2026, noite)
- [x] Personagem sem rosto em destaque: quarto de costas com capuz, mundo de costas admirando a paisagem
      (Veo: `media/raw/veo-{1-quarto,2-succao,3-mundo}.mp4`, imagens-chave `media/raw/v2-*.png`).
- [x] `scripts/midia-isekai.sh` refeito: loop do quarto com os 10 s (crossfade 1 s), mundo estabilizado
      (`scripts/estabilizar.py`, tira a deriva de câmera do Veo) com crossfade 1,5 s.
- [x] Sucção em WebGL (`src/lib/succao.ts`): o monitor do jogo puxa o personagem; cada ponto do corpo vai com
      atraso pela distância até a tela (mãos primeiro), se estica em fios de luz, vira pixel perto da tela.
      Camadas de `scripts/succao-camadas.py`: quarto vazio (último quadro do vídeo de sucção do Veo, alinhado
      por SIFT) e máscara da silhueta (rembg isnet-anime sobre o quadro clareado; cadeira tirada por polígono).
- [x] Vídeos de Enter/volta removidos; a luz do `luz.ts` só faz o mergulho final. Volta = mesma cena ao contrário.
- [x] Vento em código no mundo (`src/lib/vento.ts`): pétalas, folhas, pólen e riscos de vento.
- [x] Coordenadas novas: tela do jogo (`luz.ts`), monitor de código e cristal (`portal.ts`).
- [ ] Novos vídeos do Veo com os prompts trabalhados (`docs/prompts-videos-veo.md`): ao trocar, rodar o script
      e remedir as coordenadas e o polígono da cadeira.

### Fase 2c: portal, ficha dos projetos e textos (05/11/2026)
- [x] Portal no quarto: zoom no monitor de código com a grade de subpixels do LCD (camada em multiply);
      a troca código -> página acontece no pico da grade, que depois se dissolve (`src/lib/portal.ts`).
- [x] Portal no mundo do jogo, em dois tempos: o mundo escurece e perde cor; depois o jogo "buga" (glitch em
      WebGL, `src/lib/nevoa.ts`, modo "glitch"; o modo "nuvens" fica disponível) e revela a tela.
- [x] A volta mantém o trecho que estava na tela (antes saltava para o topo antes da transição).
- [x] Ficha técnica nos projetos: tipo, ano, papel e status em grade; nome, resumo, destaques, stack e link.
- [x] Hero: "Eu programo o mundo. / Você entra nele."; subtítulo novo; nada de travessão nos textos.
- [x] Legibilidade: degradê escuro à esquerda nos dois temas, mundo menos claro, texto claro nos dois temas,
      redes sociais numa cápsula de vidro escuro.
- [x] Vídeo do Deyller regravado quadro a quadro (`scripts/gravar-site.mjs`: relógio congelado, foto por CDP,
      sem WebGL por software, que deixava cada foto em 10 a 25 s).

## Próximo (retomar aqui)

1. Gerar os vídeos novos no Veo (`docs/prompts-videos-veo.md`), rodar `scripts/midia-isekai.sh` e remedir.
2. Conferir no navegador real: sucção (ida e volta), portal com subpixels, glitch do mundo e a volta suave.
3. Celular: Trabalhos, ficha técnica e as transições (o portal do quarto nunca foi conferido em 390 px).
4. Papel por projeto na ficha (hoje vem por categoria: sites, sistemas, motion).
5. Tela Trabalhos no tema claro: continua escura (decidir se fica assim).

## Fase 3: telas que faltam
- [x] **Jogos (05/11/2026):** vitrine na linguagem de Trabalhos (Xeque Bárbaro e Cubo da Velha, Open Digital Games), com "Jogar aqui" em iframe de tela cheia. O Cubo da Velha manda `X-Frame-Options: SAMEORIGIN`; enquanto o `_headers` dele não liberar o domínio do site, abre em nova aba (`embutir: false` em `src/data/jogos.ts`). Falta: vídeo de gameplay no lugar das capas.
- [x] **Sobre (05/11/2026):** parallax em 5 camadas do mundo de ruínas (`public/sobre`, recortadas do verde por `scripts/camadas-parallax.py`), com mouse e rolagem; texto, frase, fatos e materiais por área.
- [x] **Contato (05/11/2026):** o quarto em 5 camadas (`public/contato`, `scripts/camadas-parallax.py contato`) com parallax no mouse; o monitor de código digita exemplos sozinho; ao rolar, a câmera entra no monitor e a tela vira o editor `contato.ts`, onde o visitante completa "Eu desenvolvo ___" e roda no WhatsApp. Os outros contatos são os imports.
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
