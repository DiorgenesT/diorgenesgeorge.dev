"""Tira a deriva de câmera de um vídeo gerado (o Veo "anda" alguns pixels mesmo pedindo câmera fixa).

Alinha cada quadro ao primeiro (ECC, modelo afim, em escala reduzida) e grava o vídeo corrigido, com uma
pequena margem de zoom para esconder as bordas. Sem deriva, o fim do vídeo volta a casar com o começo e o
loop fecha com um crossfade curto.

Uso:
  uv run --with opencv-python-headless --with numpy python scripts/estabilizar.py <entrada.mp4> <saida.mp4>
"""

import subprocess
import sys

import cv2
import numpy as np

entrada, saida = sys.argv[1:3]
W, H, FPS = 1280, 720, 24
ZOOM = 1.03  # margem para a borda corrigida não aparecer

ler = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-i", entrada, "-s", f"{W}x{H}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
    stdout=subprocess.PIPE,
)
gravar = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
     "-i", "-", "-an", "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", saida],
    stdin=subprocess.PIPE,
)

ESC = 0.25
ref = None
M = np.eye(2, 3, dtype=np.float32)
# zoom pelo centro, como mapa de saída -> quadro estabilizado: y = c + (x - c) / ZOOM
S = np.array([[1 / ZOOM, 0, (1 - 1 / ZOOM) * W / 2], [0, 1 / ZOOM, (1 - 1 / ZOOM) * H / 2], [0, 0, 1]], np.float32)
n = 0
while True:
    b = ler.stdout.read(W * H * 3)
    if len(b) < W * H * 3:
        break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    g = cv2.GaussianBlur(cv2.cvtColor(cv2.resize(f, None, fx=ESC, fy=ESC), cv2.COLOR_BGR2GRAY), (5, 5), 0)
    if ref is None:
        ref = g
    else:
        # parte do alinhamento anterior (a deriva é contínua) e refina
        _, M = cv2.findTransformECC(ref, g, M, cv2.MOTION_AFFINE,
                                    (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 80, 1e-5), None, 5)
    # o ECC devolve M com f(M·x) ≈ ref(x): mapa saída -> quadro de entrada = M · S
    A = np.vstack([M, [0, 0, 1]])
    A[:2, 2] /= ESC
    T = (A @ S)[:2]
    out = cv2.warpAffine(f, T, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP,
                         borderMode=cv2.BORDER_REFLECT)
    gravar.stdin.write(out.tobytes())
    n += 1
gravar.stdin.close()
gravar.wait()
print(f"{n} quadros; deriva final: dx={M[0, 2] / ESC:.1f}px dy={M[1, 2] / ESC:.1f}px escala={M[0, 0]:.4f}")
