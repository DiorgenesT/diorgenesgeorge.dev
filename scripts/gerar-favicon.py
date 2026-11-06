"""Favicons a partir da logo vetorizada (src/lib/logo-path.ts): a logo branca sobre um quadrado escuro
arredondado, legível de 16 a 512 px.

Saída em public/: icon.svg, favicon.ico (16/32/48), icon-192.png, icon-512.png, apple-icon.png (180, sem
cantos: o iOS arredonda sozinho).

Uso: uv run --with cairosvg --with pillow python scripts/gerar-favicon.py
"""

import io
import re

import cairosvg
from PIL import Image

fonte = open("src/lib/logo-path.ts").read()
d = re.search(r'LOGO_PATH =\s*"([^"]+)"', fonte).group(1)
vw, vh = map(float, re.search(r'LOGO_VIEWBOX = "0 0 (\S+) (\S+)"', fonte).groups())

FUNDO = "#05070c"


def svg(raio: float, margem: float = 0.14) -> str:
    """Quadrado de 512 com a logo centrada; raio em px (0 = quadrado)."""
    lado = 512
    escala = lado * (1 - 2 * margem) / vw
    tx = (lado - vw * escala) / 2
    ty = (lado - vh * escala) / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lado} {lado}">'
        f'<rect width="{lado}" height="{lado}" rx="{raio}" fill="{FUNDO}"/>'
        f'<path transform="translate({tx:.1f} {ty:.1f}) scale({escala:.5f})" fill="#fff" fill-rule="evenodd" d="{d}"/></svg>'
    )


def png(s: str, tam: int) -> Image.Image:
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=s.encode(), output_width=tam, output_height=tam))).convert("RGBA")


redondo = svg(112)
open("public/icon.svg", "w").write(redondo + "\n")
# nos tamanhos minúsculos a logo ocupa mais do quadrado (menos margem) para continuar lendo
pequeno = svg(96, margem=0.06)
png(pequeno, 48).save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
png(redondo, 192).save("public/icon-192.png")
png(redondo, 512).save("public/icon-512.png")
png(svg(0, margem=0.16), 180).save("public/apple-icon.png")
print("ok")
