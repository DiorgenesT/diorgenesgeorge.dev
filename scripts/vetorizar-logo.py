"""Vetoriza a logo DG (media/raw/logo/dg-original.png, branco sobre preto) em SVG com curvas (potracer).

Saída: public/logo/dg.svg (um path só, fill-rule evenodd, viewBox recortado na logo) e o mesmo path em
src/lib/logo-path.ts, para o carregador e o menu desenharem a logo em código.

Uso: uv run --with potracer --with pillow --with numpy python scripts/vetorizar-logo.py
"""

import os

import numpy as np
import potrace
from PIL import Image

img = Image.open("media/raw/logo/dg-original.png").convert("L")
a = np.array(img) > 128
ys, xs = np.where(a)
m = 8
y0, y1, x0, x1 = ys.min() - m, ys.max() + m, xs.min() - m, xs.max() + m
a = a[y0:y1, x0:x1]
H, W = a.shape

# o potracer traça o "escuro": passamos a máscara invertida (a logo vira o desenho)
curvas = potrace.Bitmap(~a).trace(turdsize=12, alphamax=1.0, opticurve=True, opttolerance=0.2)
def caminho_de(c):
    d = []
    s = c.start_point
    d.append(f"M{s.x:.1f} {s.y:.1f}")
    for seg in c.segments:
        if seg.is_corner:
            d.append(f"L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}")
        else:
            d.append(f"C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}")
    d.append("Z")
    return "".join(d)


# o chevron ">" é o contorno que fica inteiro no quarto inferior direito: vai separado, para piscar
def e_chevron(c):
    pts = [c.start_point] + [seg.end_point for seg in c.segments]
    return min(p.x for p in pts) > W * 0.7 and min(p.y for p in pts) > H * 0.6


corpo = "".join(caminho_de(c) for c in curvas if not e_chevron(c))
chevron = "".join(caminho_de(c) for c in curvas if e_chevron(c))
caminho = corpo + chevron

os.makedirs("public/logo", exist_ok=True)
with open("public/logo/dg.svg", "w") as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><path fill="#fff" fill-rule="evenodd" d="{caminho}"/></svg>\n')
with open("src/lib/logo-path.ts", "w") as f:
    f.write("// Gerado por scripts/vetorizar-logo.py a partir de media/raw/logo/dg-original.png: não editar à mão.\n")
    f.write(f'export const LOGO_VIEWBOX = "0 0 {W} {H}";\n')
    f.write(f"export const LOGO_PATH =\n  \"{caminho}\";\n")
    f.write("/** O DG sem o chevron (para animar o chevron como cursor). */\n")
    f.write(f"export const LOGO_CORPO =\n  \"{corpo}\";\n")
    f.write(f"export const LOGO_CHEVRON =\n  \"{chevron}\";\n")
print(f"{W}x{H}, {len(curvas)} contornos, chevron {len(chevron)} caracteres")
