// Prints da transição do hero ISEKAI (verificação visual).
// Uso: node scripts/prints-isekai.mjs <url> <pasta> [largura] [altura]
import { chromium } from "playwright";
const [url, pasta, w = "1440", h = "900"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const erros = [];
p.on("pageerror", (e) => erros.push(String(e)));
p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${pasta}/0-escuro.png` });

const botao = p.getByRole("switch");
await botao.click();
const t0 = Date.now();
for (const ms of [700, 1700, 2600, 2950, 3400, 5000, 8000, 12000]) {
  await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
  await p.screenshot({ path: `${pasta}/ida-${ms}.png` });
}
await botao.click();
const t1 = Date.now();
for (const ms of [400, 1100, 2200, 2700, 3100, 3500, 4500]) {
  await p.waitForTimeout(Math.max(0, ms - (Date.now() - t1)));
  await p.screenshot({ path: `${pasta}/volta-${ms}.png` });
}
console.log(w, erros.length ? erros : "sem erros");
await b.close();
