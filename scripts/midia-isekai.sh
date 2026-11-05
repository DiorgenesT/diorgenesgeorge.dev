#!/usr/bin/env bash
# Prepara a mídia do hero ISEKAI (vídeos do Veo, versão "de costas") para o site.
# Entrada: media/raw/veo-{1-quarto,3-mundo}.mp4 e v3-C-vazio.png  ->  saída: public/hero/isekai/
#
#  - dev-loop: o quarto à noite, os 10 s inteiros; o loop fecha com um crossfade de 1 s (começa em 1 s do original).
#  - quarto-vazio / quarto-mascara: camadas da sucção feita em código (scripts/succao-camadas.py), a partir
#    da imagem do quarto vazio (v3-C-vazio.png). Não há vídeo de sucção.
#  - mundo-loop: ele de costas olhando o mundo. Sem a deriva de câmera (scripts/estabilizar.py) e com
#    crossfade de 1,5 s no fim, o loop fecha sem emenda.
# Precisa de ffmpeg e uv (OpenCV e rembg via `uv run`, sem instalar nada no sistema).
set -euo pipefail
cd "$(dirname "$0")/.."
R=media/raw
O=public/hero/isekai
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
X=(-an -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p -movflags +faststart)
ff() { ffmpeg -v error -y "$@"; }
py() { uv run -q --with opencv-python-headless --with numpy "$@"; }

mkdir -p $O
rm -f $O/enter.* $O/enter-volta.*

# 1) quarto: o último 1 s se funde ao começo
ff -i $R/veo-1-quarto.mp4 -filter_complex "[0:v]scale=1280:720,split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[m];[b]trim=end=1,setpts=PTS-STARTPTS[t];[m][t]xfade=transition=fade:duration=1:offset=8.0[v]" -map "[v]" "${X[@]}" $O/dev-loop.mp4

# 2) camadas da sucção
py --with "rembg[cpu]" --with pillow python scripts/succao-camadas.py $R/veo-1-quarto.mp4 $R/v3-C-vazio.png $T
if [ -n "${PROVA:-}" ]; then cp $T/prova-recorte.jpg "$PROVA"; fi  # prova visual do recorte, se pedida
cp $T/quarto-vazio.webp $T/quarto-mascara.webp $O/

# 3) mundo: estabiliza e fecha o loop
py python scripts/estabilizar.py $R/veo-3-mundo.mp4 $T/mundo.mp4
ff -i $T/mundo.mp4 -filter_complex "[0:v]split[a][b];[a]trim=start=1.5,setpts=PTS-STARTPTS[m];[b]trim=end=1.5,setpts=PTS-STARTPTS[t];[m][t]xfade=transition=fade:duration=1.5:offset=7.0[v]" -map "[v]" "${X[@]}" $O/mundo-loop.mp4

for f in dev-loop mundo-loop; do
  ff -i $O/$f.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -an $O/$f.webm
done
ff -i $O/dev-loop.mp4 -frames:v 1 -c:v libwebp -quality 80 $O/dev-poster.webp
ff -i $O/mundo-loop.mp4 -frames:v 1 -c:v libwebp -quality 82 $O/mundo.webp
ls -la $O
