# Prompts dos vídeos do hero (Veo)

Prompts trabalhados em 04/11/2026 para refazer os vídeos do hero ISEKAI com o personagem de costas.
Gerar no Veo (Flow ou Argon), em **Frames to Video**. Para loop perfeito: **a mesma imagem como quadro
inicial e final**. Escrever os prompts em inglês; o Veo responde mal a "não faça X" no texto, por isso o
que não queremos vai no campo de prompt negativo (quando existir).

## O que o código espera

| Arquivo em `media/raw/` | Uso no site | Observação |
|---|---|---|
| `veo-1-quarto.mp4` | loop do tema escuro | usado inteiro (10 s), crossfade de 1 s no fim |
| `veo-2-succao.mp4` | **só o último quadro**: o quarto vazio | a sucção em si é código (`src/lib/succao.ts`) |
| `veo-3-mundo.mp4` | loop do tema claro | a deriva de câmera é tirada em `scripts/estabilizar.py` |

Depois de trocar os vídeos: `bash scripts/midia-isekai.sh` e **remedir**, se o enquadramento mudar:
- tela do monitor do jogo: `TELA` e `MONITOR` em `src/lib/luz.ts`;
- tela do monitor de código: `MONITOR_CODIGO` em `src/lib/portal.ts`;
- polígono da cadeira: `CADEIRA` em `scripts/succao-camadas.py`.

Enquadramento: o monitor de código perto do centro do quadro (no celular só o terço central aparece) e o
personagem de costas, à esquerda dos monitores.

## Imagens-chave

| Imagem | O que é | Como gerar |
|---|---|---|
| **A** | quarto à noite, ele de costas com capuz, digitando, os dois monitores no centro | `media/raw/v2-A-quarto.png` |
| **B** | mundo do jogo, ele de costas e parado olhando o horizonte, cristal à direita dele | `media/raw/v2-B-mundo.png` |
| **C** | A sem ele: cadeira vazia, um pouco afastada, monitor do jogo bem aceso | editar a A: *"remove the man, the chair is empty and pushed slightly back from the desk, the right monitor glows intensely white-blue, everything else identical"* |
| **D** | B sem ele: a beira do penhasco vazia | editar a B: *"remove the man, empty grassy cliff edge, everything else identical"* |

Prompt de imagem do mundo (B), se precisar refazer:
```
2D anime illustration, bright fantasy landscape. A young man in a black hoodie, hood down, short dark hair, seen completely from behind, standing still on a grassy cliff edge in the lower center of the frame, looking at the horizon. A large glowing cyan crystal cluster stands just to his right, near the center of the frame. In the distance, floating islands with waterfalls, a white castle on the largest island, a stone aqueduct bridge, blue sky with big soft clouds, sunlight from the right. Cel shading, vivid colors, sense of wonder. 16:9.
```

## 1. Loop do quarto
**Anexar:** A no quadro inicial e A no quadro final.
```
Cinematic 2D anime, feature-film quality, muted night palette, subtle film grain. Locked-off static camera, no camera movement.

A man in a black hoodie sits at his desk, seen from behind, hood up. He types with slow, steady, natural rhythm; only his hands and forearms move, his head and shoulders stay still. On the left monitor, lines of code scroll gently upward. On the right monitor, a fantasy game world is gently alive: clouds drifting, a waterfall flowing. The cool blue light of the screens flickers softly across the edges of his hood and the desk. Steam rises slowly from the coffee mug. The city lights behind the window twinkle faintly.

Calm, quiet, introspective mood. Continuous motion with no sudden events.
```

## 2. Sucção (só o último quadro é usado)
**Anexar:** A no quadro inicial e C no quadro final. O que importa é terminar no quarto vazio com o mesmo
enquadramento do loop; a imagem C sozinha, se alinhada à A, também serve.
```
Cinematic 2D anime, feature-film quality, grounded and dramatic visual effects, inspired by high-end anime film VFX. Static camera with a very slow push-in toward the right monitor. The man is always seen from behind; he never turns around.

The man in the black hoodie is typing. He stops. The right monitor slowly brightens, and its light begins to pull the room toward it: the air ripples like heat haze, loose papers slide across the desk toward the screen, the plant leaves bend toward it, and the drawstrings and fabric of his hoodie stretch toward the light.

The pull grows stronger. He is lifted gently out of the chair, still seen from behind, his silhouette drawn toward the center of the screen. As he approaches the screen, his body thins into fine filaments of cyan and white light, like threads being unspooled, and they spiral smoothly into the center of the monitor. The empty chair rolls back slowly and comes to rest.

The light from the screen settles into a steady, intense glow over the empty room. Elegant, controlled, cinematic. Motion is smooth and physically believable.
```

## 3. Chegada no mundo (opcional; hoje o mundo se monta em pixels, em código)
**Anexar:** D no quadro inicial e B no quadro final.
```
Cinematic 2D anime, feature-film quality, bright natural daylight, rich painterly backgrounds. Locked-off static camera, no camera movement.

A fantasy landscape: floating islands with waterfalls, a white castle in the distance, soft clouds, and a large cyan crystal glowing on a grassy cliff. A steady breeze moves the grass, the wildflowers and the leaves of the plants.

A thin column of cyan and white light threads descends onto the cliff edge and weaves together, filament by filament, forming the silhouette of a man seen from behind. The light fades into his solid form: a man in a black hoodie, hood down, standing still, gazing at the horizon. The breeze immediately catches his hair and the fabric of his hoodie. The crystal pulses once as he arrives.

Graceful, serene, awe-inspiring. Smooth and elegant motion.
```

## 4. Loop do mundo
**Anexar:** B no quadro inicial e B no quadro final.
```
Cinematic 2D anime, feature-film quality, bright natural daylight, rich painterly backgrounds. Locked-off static camera, no camera movement.

A man in a black hoodie stands completely still on a grassy cliff edge, seen from behind, gazing at floating islands and a distant white castle. His body does not move. A constant gentle breeze flows from left to right: it ripples the fabric of his hoodie, lifts and sways strands of his dark hair, moves the hood resting on his shoulders and the hanging drawstrings.

The same breeze moves the whole world in waves: the tall grass and wildflowers sway, the leaves of the nearby plants and bushes flutter, the trees on the floating islands rustle. Clouds drift slowly across the sky, waterfalls pour continuously into the mist below, and the large cyan crystal beside him glows with a slow, soft pulse.

Peaceful, contemplative, seamless continuous motion.
```

## Prompt negativo (os quatro vídeos)
```
face, turning head, looking back, looking at camera, profile view, headphones on head, cartoonish, childish, chibi, exaggerated motion, superhero pose, flying pose, colorful ribbons, confetti, square pixel particles, lens flare overload, camera shake, zoom, color change, extra people, text, watermark
```
Mostrar um pouco do rosto não é problema (liberado em 04/11/2026); o negativo só evita que ele vire para a câmera.

## O que aprendemos
- O Veo bloqueia frases sobre manter o rosto igual ("keep his face consistent"): não falar do rosto.
- A primeira sucção gerada pelo Veo saiu "tosca" (fitas coloridas, pose de super-herói, rosto aparecendo):
  por isso a sucção virou código e do vídeo só se usa o quarto vazio.
- Mesmo pedindo câmera fixa, o Veo deriva alguns pixels; `scripts/estabilizar.py` corrige.
