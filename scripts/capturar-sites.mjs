// Captura prints dos sites de clientes para a seção Trabalhos. Uso: node scripts/capturar-sites.mjs <pasta>
import { chromium } from "playwright";
const pasta = process.argv[2] ?? "media/trabalhos";
const sites = {
  miracar: "https://www.miracarbrasil.com.br",
  mali: "https://www.malirastreadores.com.br",
  monumental: "https://monumentalassistencia.com.br",
  deyller: "https://deyller.dgtssk8.workers.dev/en/",
  "controle-de-ponto": "https://controle-ponto.pages.dev",
};
const b = await chromium.launch({ args: ["--use-gl=swiftshader", "--autoplay-policy=no-user-gesture-required"] });
for (const [nome, url] of Object.entries(sites)) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch {}
  await p.waitForTimeout(5000);
  const info = await p.evaluate(() => ({ t: document.title, g: document.querySelector('meta[name="generator"]')?.content ?? "", autor: document.querySelector('meta[name="author"]')?.content ?? "" }));
  // página inteira (rolando antes para disparar lazy-load e animações de entrada), limitada a 4200 px
  const altura = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(altura, 4200); y += 700) {
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(350);
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${pasta}/${nome}.png`, fullPage: true, clip: { x: 0, y: 0, width: 1440, height: Math.min(altura, 4200) } });
  console.log(nome, "|", info.t, "|", info.autor, info.g);
  await p.close();
}
await b.close();
