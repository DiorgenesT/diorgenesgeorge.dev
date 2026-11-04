// Prints do portal hero -> telas (verificação visual).
// Uso: node scripts/prints-portal.mjs <url> <pasta> [largura] [altura]
import { chromium } from "playwright";
const [url, pasta, w = "1440", h = "900"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const erros = [];
p.on("pageerror", (e) => erros.push(String(e)));
p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
const foto = (n) => p.screenshot({ path: `${pasta}/${n}.png` });
const serie = async (prefixo, tempos) => {
  const t0 = Date.now();
  for (const ms of tempos) {
    await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    await foto(`${prefixo}-${ms}`);
  }
};

await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(2500);
console.log("altura do documento no hero:", await p.evaluate(() => document.documentElement.scrollHeight));

// escuro: abre Trabalhos pelo botão do hero
await p.locator(".hero-texto a[href='#work']").click();
await serie("abre", [100, 250, 450, 650, 850, 1100, 1400, 1900]);
console.log("hash:", await p.evaluate(() => location.hash));
await p.mouse.wheel(0, 1200);
await p.waitForTimeout(1200);
await foto("rolou");
// fecha pelo botão voltar
await p.getByRole("button", { name: /voltar|back|volver|fechar/i }).click();
await serie("fecha", [200, 500, 800, 1100, 1500]);
console.log("hash depois de fechar:", JSON.stringify(await p.evaluate(() => location.hash)));

// claro: entra no jogo e abre pelo menu
await p.getByRole("switch").click();
await p.waitForTimeout(6000);
await p.locator("nav a[href='#work']").first().click().catch(async () => p.evaluate(() => (location.hash = "work")));
await serie("claro-abre", [250, 600, 1000, 1900]);
await p.keyboard.press("Escape");
await p.waitForTimeout(1300);
await foto("claro-fechou");

// link direto
await p.goto(url + "#games", { waitUntil: "load" });
await p.waitForTimeout(1500);
await foto("direto-games");
console.log(w, erros.length ? erros : "sem erros");
await b.close();
