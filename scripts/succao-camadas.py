"""Camadas da sucção feita em código (src/lib/succao.ts).

A partir do 1º quadro do loop do quarto e do último quadro do vídeo de sucção do Veo (o quarto vazio,
monitor branco, enquadramento quase igual), gera:
  - quarto-vazio.webp: o quarto vazio alinhado ao loop (SIFT + homografia), o fundo que aparece quando ele some;
  - quarto-mascara.webp: a silhueta do personagem, sem a cadeira (ela fica e se funde ao quarto vazio).

A silhueta vem do rembg (modelo isnet-anime). O quarto é escuro demais para o modelo: o quadro é clareado
(CLAHE) e recortado na região do personagem antes. A cadeira sai por um polígono medido à mão.

Uso:
  uv run --with "rembg[cpu]" --with pillow --with opencv-python-headless --with numpy \
      python scripts/succao-camadas.py <loop.mp4> <succao.mp4> <pasta-saida>
"""

import subprocess
import sys

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

loop, succao, saida = sys.argv[1:4]
W, H = 1280, 720

# Cadeira (frações do quadro): encosto e cabeceira à esquerda do corpo e o braço da cadeira embaixo.
CADEIRA = [(0.17, 0.39), (0.300, 0.385), (0.300, 0.62), (0.325, 0.80), (0.345, 0.885), (0.56, 0.875),
           (0.57, 1.0), (0.17, 1.0)]


def quadro(video: str, args: list[str]) -> np.ndarray:
    b = subprocess.run(
        ["ffmpeg", "-v", "error", *args, "-i", video, "-frames:v", "1", "-s", f"{W}x{H}",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(b, np.uint8).reshape(H, W, 3).copy()


ref = quadro(loop, ["-ss", "1"])  # 1º quadro do dev-loop (o loop começa em 1 s)
vazio = quadro(succao, ["-sseof", "-0.1"])

# 1) alinha o quarto vazio ao loop, usando só o cenário à direita (o personagem e a cadeira mudam)
sift = cv2.SIFT_create(4000)
zona = np.zeros((H, W), np.uint8)
zona[:, int(W * 0.42):] = 255
g1, g2 = (cv2.cvtColor(x, cv2.COLOR_BGR2GRAY) for x in (ref, vazio))
k1, d1 = sift.detectAndCompute(g1, zona)
k2, d2 = sift.detectAndCompute(g2, zona)
pares = [m for m, n in cv2.BFMatcher().knnMatch(d2, d1, k=2) if m.distance < 0.7 * n.distance]
src = np.float32([k2[m.queryIdx].pt for m in pares])
dst = np.float32([k1[m.trainIdx].pt for m in pares])
Hm, ok = cv2.findHomography(src, dst, cv2.RANSAC, 2.0)
print(f"alinhamento: {len(pares)} pares, {int(ok.sum())} inliers")
alinhado = cv2.warpPerspective(vazio, Hm, (W, H), borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite(f"{saida}/quarto-vazio.webp", alinhado, [cv2.IMWRITE_WEBP_QUALITY, 88])

# 2) silhueta: quadro clareado e recortado -> isnet-anime
x0, x1, y0 = int(W * 0.06), int(W * 0.68), int(H * 0.15)
lab = cv2.cvtColor(ref[y0:, x0:x1], cv2.COLOR_BGR2LAB)
lab[..., 0] = np.clip(cv2.createCLAHE(3.0, (8, 8)).apply(lab[..., 0]).astype(np.float32) * 1.6, 0, 255).astype(np.uint8)
claro = cv2.cvtColor(cv2.cvtColor(lab, cv2.COLOR_LAB2BGR), cv2.COLOR_BGR2RGB)
m = np.zeros((H, W), np.uint8)
m[y0:, x0:x1] = np.array(remove(Image.fromarray(claro), session=new_session("isnet-anime"), only_mask=True))

# sem a cadeira; fica só o maior pedaço (o corpo), sem buracos
cadeira = np.zeros_like(m)
cv2.fillPoly(cadeira, [np.int32([(x * W, y * H) for x, y in CADEIRA])], 255)
m = np.where((m > 110) & (cadeira == 0), 255, 0).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
n, rot, st, _ = cv2.connectedComponentsWithStats(m)
maior = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
m = np.where(rot == maior, 255, 0).astype(np.uint8)
cont, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
m = cv2.drawContours(np.zeros_like(m), cont, -1, 255, cv2.FILLED)
# folga para o movimento das mãos e do capuz no loop, com borda suave
m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
m = cv2.GaussianBlur(m, (11, 11), 0)
cv2.imwrite(f"{saida}/quarto-mascara.webp", m, [cv2.IMWRITE_WEBP_QUALITY, 90])

# prova visual: o personagem sobre o quarto vazio escurecido
a = (m.astype(np.float32) / 255)[..., None]
cv2.imwrite(f"{saida}/prova-recorte.jpg", (ref * a + alinhado * (1 - a) * 0.3).astype(np.uint8))
