// Imagem de compartilhamento (og:image) por idioma: o hero escuro em 1200×630, sem o menu e sem os ícones,
// com a logo no canto. Fotografa o build local (rode antes `next build` e sirva ./out).
// Uso: node scripts/gerar-og.mjs [http://127.0.0.1:3002]   ->  public/og/og-{pt,en,es}.jpg
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:3002";
const logo = fs.readFileSync("public/logo/dg.svg", "utf8");
fs.mkdirSync("public/og", { recursive: true });

const b = await chromium.launch();
for (const lang of ["pt", "en", "es"]) {
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await p.addInitScript(() => localStorage.setItem("tema", "escuro"));
  await p.goto(`${base}/${lang}/`, { waitUntil: "load" });
  await p.waitForFunction(() => !document.documentElement.dataset.carregador, null, { timeout: 30000 });
  await p.waitForTimeout(2500);
  await p.evaluate((logo) => {
    document.querySelectorAll("header, #topo ul, [role=status]").forEach((e) => (e.style.display = "none"));
    // os botões ficam de fora; o status, o título e o subtítulo ficam
    document.querySelectorAll("#topo .hero-entra").forEach((e) => { if (e.querySelector("a")) e.style.visibility = "hidden"; });
    const marca = document.createElement("div");
    marca.innerHTML = logo;
    Object.assign(marca.style, { position: "fixed", top: "44px", left: "56px", width: "96px", zIndex: 999 });
    marca.querySelector("svg").style.width = "100%";
    document.body.appendChild(marca);
  }, logo);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `public/og/og-${lang}.jpg`, type: "jpeg", quality: 86 });
  await p.close();
  console.log(lang, "ok");
}
await b.close();
