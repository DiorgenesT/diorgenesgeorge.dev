// Prints do hero em cada mundo (verificação visual). Uso: node scripts/prints-hero.mjs <url> <pasta> [largura] [altura]
import { chromium } from "playwright";
const [url, pasta, w = "1440", h = "900"] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-gl=swiftshader"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const erros = [];
p.on("pageerror", (e) => erros.push(String(e)));
p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(700);
await p.screenshot({ path: `${pasta}/0-digitando.png` });
for (let i = 1; i <= 5; i++) {
  await p.waitForTimeout(i === 1 ? 2600 : 3350);
  await p.screenshot({ path: `${pasta}/${i}-mundo.png` });
}
console.log(w, erros.length ? erros : "sem erros");
await b.close();
