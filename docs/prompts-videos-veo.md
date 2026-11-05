# Prompts das imagens e dos vídeos do hero

**Versão 3 (05/11/2026): direção de arte adulta.** A versão anterior (ilhas flutuantes, cristal ciano, céu
saturado, bonequinhos na estante, RGB roxo) ficou infantil. Agora:

- **Mundo do jogo:** fantasia sombria e adulta. Ruínas antigas, escala colossal, névoa, paleta contida,
  luz natural de dia nublado. Continua sendo o tema **claro**: é dia, mas um dia frio e dramático, sem céu azul de desenho.
- **Personagem:** sempre de costas, **de capuz levantado também no mundo**. Mesmo moletom preto.
- **Efeitos:** nada de brilhos, faíscas, partículas mágicas, fitas de luz, arco-íris ou pose de herói.
  O movimento vem de coisas físicas: vento, névoa, nuvens, luz.
- **Estilo comum (vale para tudo):** anime 2D adulto de longa-metragem, fundos pintados à mão,
  proporções realistas, grão de filme. É o que mantém o quarto e o mundo com a mesma cara.

Prompts em inglês. O Veo e o Kling respondem mal a "não faça X" no texto, por isso o que não queremos vai no
campo de prompt negativo. Não falar do rosto (o Veo bloqueia "keep his face consistent").

## O que o código espera

| Arquivo em `media/raw/` | Uso no site | Observação |
|---|---|---|
| `veo-1-quarto.mp4` | loop do tema escuro | usado inteiro (10 s), crossfade de 1 s no fim |
| `v3-C-vazio.png` | o quarto vazio, fundo da sucção | a sucção em si é código (`src/lib/succao.ts`); não há vídeo de sucção |
| `veo-3-mundo.mp4` | loop do tema claro | a deriva de câmera é tirada em `scripts/estabilizar.py` |

Depois de trocar os vídeos: `bash scripts/midia-isekai.sh` e **remedir**, se o enquadramento mudar:
- tela do monitor do jogo: `TELA` e `MONITOR` em `src/lib/luz.ts`;
- tela do monitor de código: `MONITOR_CODIGO` em `src/lib/portal.ts`;
- polígonos da cadeira e região do personagem: `CADEIRA` e `PERSONAGEM` em `scripts/succao-camadas.py`;
- ponto focal no celular: `--px` da `.capa` em `src/components/Hero.tsx`.

Enquadramento da v3 (gerada em 05/11/2026): monitores à esquerda e no centro, personagem de costas à
**direita** deles. No celular o ponto focal (`--px: .72`) mostra o monitor do jogo e o capuz. No mundo, ele no
terço central.

**Arquivos da v3 em uso:** `v3-A-quarto.png`, `v3-B-mundo.png`, `v3-C-vazio.png`, `veo-1-quarto.mp4`
(gerado a partir da A) e `veo-3-mundo.mp4` (gerado a partir da B). O vento em código (pétalas e pólen,
`src/lib/vento.ts`) foi desligado: o vídeo já tem vento de verdade.

## Ordem de trabalho

1. **B (mundo)** primeiro: é ela que define a direção de arte.
2. **A (quarto)** depois, anexando a B como referência: o monitor da direita do quarto tem de mostrar
   **esse** mundo. Na versão anterior o monitor mostrava as ilhas flutuantes; se ficar assim, a história quebra.
3. **C** e **D** são edições da A e da B.
4. Vídeos: só os dois loops são obrigatórios. A sucção e a chegada já são feitas em código.

---

## Imagens

### B: mundo do jogo (principal)
```
Mature 2D anime film still, hand-painted background, cinematic and grounded, restrained desaturated palette of slate grey, moss green, weathered stone and pale gold, fine film grain, 16:9.

A lone man seen completely from behind, wearing a plain black hoodie with the hood up and black pants, stands still on a cracked stone ledge in the lower center of the frame, arms relaxed at his sides, looking out over a vast ancient valley. Realistic adult proportions.

Below and beyond him: the ruins of a colossal forgotten kingdom. A giant weathered stone statue of a hooded knight, half-collapsed and overgrown with moss, rises from the mist on the right. Broken gothic arches and a long ruined stone bridge cross the valley. A tall dark spire stands on a distant mountain. Low clouds and thick mist fill the valley floor.

Cold overcast daylight; a few pale sunbeams break through heavy clouds and fall across the ruins. Tall dry grass and wild heather at his feet. Quiet, solemn, epic scale, the feeling of standing at the beginning of a long journey.
```

**Variante B2 (mais nórdica, se a B ficar pesada demais):**
```
Mature 2D anime film still, hand-painted background, cinematic and grounded, cold muted palette of steel blue, bone white and dark pine green, fine film grain, 16:9.

A lone man seen completely from behind, wearing a plain black hoodie with the hood up and black pants, stands still on a rocky outcrop in the lower center of the frame, looking out over a vast northern landscape. Realistic adult proportions.

A deep fjord between snow-capped mountains. On the far shore, an ancient stone fortress built into the cliff, its towers partly ruined. Huge weathered standing stones carved with faint runes line the path in front of him. Dark pine forests climb the slopes, low clouds cling to the peaks, mist drifts over the water.

Pale winter daylight through thin clouds. Silent, vast, austere, the feeling of the first step of a long journey.
```

### A: quarto à noite
Anexar a B como referência de imagem (para o monitor da direita).
```
Mature 2D anime film still, hand-painted, cinematic, grounded, fine film grain, 16:9. A dark bedroom office at night.

A man in a plain black hoodie with the hood up sits at his desk, seen from behind and slightly from the left, typing on a dark mechanical keyboard. Headphones rest around his neck. Realistic adult proportions.

Two monitors near the center of the frame. The left monitor shows a code editor with lines of code. The right monitor shows the attached fantasy landscape as a video game.

The room is lit only by the cold blue light of the screens and a small warm desk lamp turned low. Dark wood desk, a black game controller, a ceramic coffee mug, a small plant. Behind him, a shelf with books and a few old game cases. A window with blinds shows distant city lights in the rain.

Quiet, focused, late-night mood. Muted colors, deep shadows, no neon.
```

### C: quarto vazio (editar a A)
```
Remove the man. The chair is empty and pushed slightly back from the desk. The right monitor glows brighter, a cold white-blue light that spills over the desk. Everything else identical: same framing, same objects, same lighting.
```

### D: mundo vazio (editar a B, só se for gerar a chegada em vídeo)
```
Remove the man. The empty stone ledge, everything else identical: same framing, same lighting.
```

---

## Vídeos

### 1. Loop do quarto (obrigatório)
**Anexar:** A no quadro inicial e A no quadro final.
```
Mature 2D anime film, hand-painted, muted night palette, subtle film grain. Locked-off static camera, no camera movement.

A man in a black hoodie with the hood up sits at his desk, seen from behind. He types with a slow, steady, natural rhythm; only his hands and forearms move, his head and shoulders stay still. On the left monitor, lines of code scroll gently upward. On the right monitor, the game world is softly alive: mist drifting through the ruins, clouds moving slowly. The screen light shifts subtly across his hood and the desk. Thin steam rises from the coffee mug. Rain runs down the window.

Calm, quiet, introspective. Continuous, understated motion with no sudden events.
```

### 2. Sucção: dispensável
O site usa a imagem C como quarto vazio (`scripts/midia-isekai.sh` já lê a `v3-C-vazio.png`). Não gere vídeo.

### 3. Chegada no mundo: dispensável
A chegada já é feita em código (o mundo se monta em pixels). Se um dia quiser em vídeo, sem filamentos de luz:
**anexar** D no quadro inicial e B no final.
```
Mature 2D anime film, hand-painted, overcast daylight, restrained palette. Locked-off static camera.

Thick mist rolls slowly across the empty stone ledge. As the mist thins, a man in a black hoodie with the hood up is revealed standing still at the edge, seen from behind, looking at the ruined valley. The wind moves the mist, the tall grass and the fabric of his hoodie.

Solemn, quiet, natural motion.
```

### 4. Loop do mundo (obrigatório)
**Anexar:** B no quadro inicial e B no quadro final.
```
Mature 2D anime film, hand-painted backgrounds, overcast daylight, restrained desaturated palette, subtle film grain. Locked-off static camera, no camera movement.

A man in a black hoodie with the hood up stands completely still on a stone ledge, seen from behind, looking out over the ruins of an ancient kingdom. His body does not move. A steady cold wind blows from left to right: it ripples the fabric of his hoodie, moves the edge of the hood and the hanging drawstrings.

The same wind moves the world: the tall dry grass and heather sway in slow waves, mist drifts through the valley and around the giant statue, low clouds move slowly across the sky, and the pale sunbeams shift gently as the clouds pass.

Solemn, contemplative, seamless continuous motion.
```

## Prompt negativo (todos)
```
face, turning head, looking back, looking at camera, profile view, hood down, cartoonish, childish, chibi, cute, toy-like, saturated colors, neon, rainbow, sparkles, glitter, magic particles, glowing orbs, fireflies, light ribbons, colorful trails, confetti, pixel particles, lens flare, bloom overload, floating islands, superhero pose, exaggerated motion, bouncy motion, camera shake, zoom, color change, extra people, text, watermark
```

## O que aprendemos
- O Veo bloqueia frases sobre manter o rosto igual ("keep his face consistent"): não falar do rosto.
- A primeira sucção gerada pelo Veo saiu "tosca" (fitas coloridas, pose de super-herói, rosto aparecendo):
  por isso a sucção virou código e do vídeo só se usa o quarto vazio.
- Mesmo pedindo câmera fixa, o Veo deriva alguns pixels; `scripts/estabilizar.py` corrige.
- 05/11/2026: céu azul saturado, ilhas flutuantes, cristal brilhante e bonecos na estante deram cara de
  jogo infantil. Paleta contida, escala colossal e névoa dão o tom adulto.
