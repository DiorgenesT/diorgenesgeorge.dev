#!/usr/bin/env bash
# Prepara os vídeos do hero ISEKAI (gerados no Kling) para o site.
# Entrada: media/raw/kling-{1-loop,2-enter,3-chegada}.mp4  ->  saída: public/hero/isekai/
# Remove o áudio e a marca d'água "KlingAI 4.0" (canto inferior direito, 1280x720).
# Precisa de ffmpeg e uv (o alinhamento do Enter usa OpenCV via `uv run`).
set -euo pipefail
cd "$(dirname "$0")/.."
R=media/raw
O=public/hero/isekai
L="delogo=x=1118:y=666:w=142:h=34"
X=(-an -c:v libx264 -crf 24 -preset slow -movflags +faststart)
ff() { ffmpeg -v error -y "$@"; }

# 1) escuro: loop sem emenda (o primeiro segundo entra em fade sobre o fim)
ff -i $R/kling-1-loop.mp4 -filter_complex "[0:v]$L,split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[m];[b]trim=start=0:end=1,setpts=PTS-STARTPTS[t];[m][t]xfade=transition=fade:duration=1:offset=4,format=yuv420p[v]" -map "[v]" "${X[@]}" $O/dev-loop.mp4
# 2) Enter: de 2 s a 5 s (o monitor acende e termina no branco), alinhado ao loop, e a mesma cena ao contrário
ff -i $R/kling-1-loop.mp4 -frames:v 1 /tmp/isekai-ref.png
uv run -q --with opencv-python-headless --with numpy python scripts/alinhar-enter.py /tmp/isekai-ref.png $R/kling-2-enter.mp4 2 3 "$L" $O/enter.mp4
ff -i $O/enter.mp4 -vf reverse "${X[@]}" $O/enter-volta.mp4
# 3) mundo: só o começo (de perfil, olhando o castelo; em ~1,5 s ele começa a virar a cabeça).
#    0,25 s a 1,3 s, 1,6x mais lento (quadros interpolados) e em vai e volta
ff -ss 0.25 -t 1.05 -i $R/kling-3-chegada.mp4 -filter_complex "[0:v]$L,setpts=1.6*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1,format=yuv420p[v]" -map "[v]" "${X[@]}" $O/mundo-loop.mp4

for f in dev-loop enter enter-volta mundo-loop; do
  ff -i $O/$f.mp4 -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -an $O/$f.webm
done
ff -i $O/dev-loop.mp4 -frames:v 1 -c:v libwebp -quality 80 $O/dev-poster.webp
ff -i $O/mundo-loop.mp4 -frames:v 1 -c:v libwebp -quality 82 $O/mundo.webp
ls -la $O
