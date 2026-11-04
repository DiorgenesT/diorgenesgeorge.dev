"""Alinha o vídeo do Enter ao loop escuro (os dois saem do Kling com o quadro levemente deslocado).

Mede a transformação (escala + deslocamento) entre o 1º quadro do loop e o 1º quadro do corte do Enter
com pontos SIFT, e aplica a inversa em todos os quadros do Enter. Assim a ida e a volta não "pulam".

Uso (via uv, sem instalar nada no sistema):
  uv run --with opencv-python-headless --with numpy python scripts/alinhar-enter.py \
      <loop.png> <enter-cru.mp4> <inicio_s> <duracao_s> <delogo> <saida.mp4>
"""

import subprocess
import sys

import cv2
import numpy as np

ref_png, entrada, ini, dur, delogo, saida = sys.argv[1:7]
W, H = 1280, 720


def quadros():
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-ss", ini, "-t", dur, "-i", entrada, "-vf", delogo,
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE,
    )
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)


def medir(a, b):
    """Transformação que leva pontos de `a` (referência) para `b`."""
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    m = np.full(ga.shape, 255, np.uint8)
    m[640:, 1080:] = 0  # ignora o canto da marca d'água
    s = cv2.SIFT_create(4000)
    ka, da = s.detectAndCompute(ga, m)
    kb, db = s.detectAndCompute(gb, m)
    bons = [x for x, y in cv2.BFMatcher().knnMatch(da, db, k=2) if x.distance < 0.7 * y.distance]
    pa = np.float32([ka[x.queryIdx].pt for x in bons])
    pb = np.float32([kb[x.trainIdx].pt for x in bons])
    M, _ = cv2.estimateAffinePartial2D(pa, pb, ransacReprojThreshold=2)
    return M


ref = cv2.imread(ref_png)
fs = list(quadros())
M = medir(ref, fs[0])
print(f"correção: escala={np.hypot(M[0, 0], M[1, 0]):.4f} dx={M[0, 2]:.1f} dy={M[1, 2]:.1f}")

enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "24",
     "-i", "-", "-an", "-vf", "format=yuv420p", "-c:v", "libx264", "-crf", "24", "-preset", "slow",
     "-movflags", "+faststart", saida],
    stdin=subprocess.PIPE,
)
for f in fs:
    # saída(p) = enter(M·p): o Enter passa a ocupar a mesma posição do loop
    g = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    enc.stdin.write(g.tobytes())
enc.stdin.close()
enc.wait()
