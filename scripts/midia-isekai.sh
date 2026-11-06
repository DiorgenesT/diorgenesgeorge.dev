#!/usr/bin/env bash
# Prepara a mídia do hero ISEKAI para o site: só o mundo do jogo (tema claro), que segue em vídeo.
# O quarto (tema escuro) é feito em camadas (src/components/Quarto.tsx, public/contato) desde 05/11/2026.
# Entrada: media/raw/veo-4-mundo-vazio.mp4 (o mundo sem ele: ele e a grama da frente são camadas em
# parallax, src/components/Mundo.tsx)  ->  saída: public/hero/isekai/
#
#  - mundo-loop: o mundo vazio (nuvens, névoa, cachoeiras, grama). Sem a deriva de câmera (scripts/estabilizar.py) e com
#    crossfade de 1,5 s no fim, o loop fecha sem emenda.
# Precisa de ffmpeg e uv (OpenCV via `uv run`, sem instalar nada no sistema).
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

# mundo: estabiliza e fecha o loop
py python scripts/estabilizar.py $R/veo-4-mundo-vazio.mp4 $T/mundo.mp4
ff -i $T/mundo.mp4 -filter_complex "[0:v]split[a][b];[a]trim=start=1.5,setpts=PTS-STARTPTS[m];[b]trim=end=1.5,setpts=PTS-STARTPTS[t];[m][t]xfade=transition=fade:duration=1.5:offset=7.0[v]" -map "[v]" "${X[@]}" $O/mundo-loop.mp4

for f in mundo-loop; do
  ff -i $O/$f.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -an $O/$f.webm
done
ff -i $O/mundo-loop.mp4 -frames:v 1 -c:v libwebp -quality 82 $O/mundo.webp
ls -la $O
