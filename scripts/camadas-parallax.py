"""Camadas dos parallax (telas Sobre e Contato): tira o fundo verde (#00FF00) das imagens geradas e recorta
cada uma na caixa do conteúdo.

Entrada: media/raw/<tela>/*.png  ->  public/<tela>/*.webp  (tela = sobre ou contato)
A que começa com "1-" é o fundo: não tem verde, só é reduzida. Nas outras, o alfa vem de quanto o verde
domina o pixel, e o verde que vaza na borda (spill) é tirado puxando o G para o máximo entre R e B.
Imprime, por camada, o tamanho do recorte e a caixa dele na imagem original (para posicionar no CSS).

Uso: uv run --with opencv-python-headless --with numpy python scripts/camadas-parallax.py sobre
"""

import glob
import os
import sys

import json

import cv2
import numpy as np

TELA = sys.argv[1] if len(sys.argv) > 1 else "sobre"
ENTRADA = f"media/raw/{TELA}"
SAIDA = f"public/{TELA}"
LARGURA_FUNDO = 2400
os.makedirs(SAIDA, exist_ok=True)

nomes = sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(f"{ENTRADA}/*.png"))
info = {}
fundo_nome = next(n for n in nomes if n.startswith("1-"))
fundo = cv2.imread(f"{ENTRADA}/{fundo_nome}.png")
h, w = fundo.shape[:2]
fundo = cv2.resize(fundo, (LARGURA_FUNDO, round(h * LARGURA_FUNDO / w)), interpolation=cv2.INTER_LANCZOS4)
cv2.imwrite(f"{SAIDA}/{fundo_nome}.webp", fundo, [cv2.IMWRITE_WEBP_QUALITY, 82])
info[fundo_nome] = {"w": fundo.shape[1], "h": fundo.shape[0]}

for nome in [n for n in nomes if n != fundo_nome]:
    img = cv2.imread(f"{ENTRADA}/{nome}.png").astype(np.float32)
    b, g, r = img[..., 0], img[..., 1], img[..., 2]
    domina = g - np.maximum(r, b)  # quanto o verde passa dos outros canais
    alfa = 1.0 - np.clip((domina - 25.0) / 70.0, 0.0, 1.0)
    alfa = cv2.GaussianBlur(alfa, (3, 3), 0)
    g2 = np.minimum(g, np.maximum(r, b) * 1.02)  # despill
    rgb = np.dstack([b, g2, r])
    bgra = np.dstack([rgb, alfa * 255.0]).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(alfa > 0.04)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    recorte = bgra[y0:y1, x0:x1]
    cv2.imwrite(f"{SAIDA}/{nome}.webp", recorte, [cv2.IMWRITE_WEBP_QUALITY, 88])
    info[nome] = {"w": int(x1 - x0), "h": int(y1 - y0), "caixa": [int(x0), int(y0), int(x1), int(y1)], "origem": [img.shape[1], img.shape[0]]}

print(json.dumps(info, indent=1))
