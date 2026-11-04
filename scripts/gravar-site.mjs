// Grava um vídeo curto rolando um site (para a vitrine de Trabalhos). Uso: node scripts/gravar-site.mjs <url> <pasta-saida>
import { chromium } from "playwright";
const [url, pasta] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-gl=swiftshader", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: pasta, size: { width: 1280, height: 800 } } });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
await p.waitForTimeout(4500);
for (let i = 0; i < 70; i++) { await p.mouse.wheel(0, 90); await p.waitForTimeout(110); }
await p.waitForTimeout(1500);
await ctx.close();
await b.close();
