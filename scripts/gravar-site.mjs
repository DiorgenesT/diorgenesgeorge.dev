// Grava um vídeo rolando um site, para a vitrine de Trabalhos, quadro a quadro.
//
// Gravar em tempo real num Chrome headless sai travado (o navegador renderiza a poucos quadros por
// segundo). Aqui o relógio da página fica congelado: a cada quadro o script avança 1/30 s (rAF, timers,
// GSAP, Lenis), avança também os <video> da página, rola um pouco e tira uma foto. O ffmpeg junta as
// fotos a 30 fps: fluido, por mais lenta que seja a máquina.
//
// Uso: node scripts/gravar-site.mjs <url> <saida.mp4> [rolagem_px=6300] [segundos_rolando=12]
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const [url, saida, rolagem = "6300", segRolando = "12"] = process.argv.slice(2);
const FPS = 30;
const PARADO_INICIO = 3; // s: a abertura do site, antes de rolar
const PARADO_FIM = 1.5;
const pasta = mkdtempSync(join(tmpdir(), "gravar-site-"));

// sem forçar WebGL por software: com SwiftShader cada foto levava de 10 a 25 s; assim leva ~60 ms
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.clock.install();
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
await p.waitForTimeout(3000); // fontes, imagens e vídeos carregam em tempo real
await p.clock.pauseAt((await p.evaluate(() => Date.now())) + 500);
await p.mouse.move(640, 400);
// foto direto pelo CDP: o page.screenshot do Playwright espera um quadro de animação, que com o relógio
// congelado demora ~30 s para vir
const cdp = await p.context().newCDPSession(p);
const foto = async (arquivo) => {
  const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 92 });
  writeFileSync(arquivo, Buffer.from(data, "base64"));
};

// avança os vídeos da página junto com o relógio (eles tocam em tempo real, fora do relógio falso)
const avancarVideos = () =>
  p.evaluate(async (dt) => {
    const vs = [...document.querySelectorAll("video")].filter((v) => v.readyState >= 2 && v.duration > 0);
    await Promise.all(
      vs.map(
        (v) =>
          new Promise((ok) => {
            v.pause();
            const t = setTimeout(ok, 400);
            v.addEventListener("seeked", () => (clearTimeout(t), ok()), { once: true });
            v.currentTime = (v.currentTime + dt) % v.duration;
          }),
      ),
    );
  }, 1 / FPS);

const total = Math.round((PARADO_INICIO + Number(segRolando) + PARADO_FIM) * FPS);
const iniRola = PARADO_INICIO * FPS;
const nRola = Number(segRolando) * FPS;
let rolado = 0;
for (let i = 0; i < total; i++) {
  const k = i - iniRola;
  if (k >= 0 && k < nRola) {
    // rolagem com aceleração e freada suaves (perfil seno)
    const alvo = Number(rolagem) * (0.5 - 0.5 * Math.cos((Math.PI * (k + 1)) / nRola));
    const passo = Math.round(alvo - rolado);
    if (passo) await p.mouse.wheel(0, passo);
    rolado += passo;
  }
  await p.clock.runFor(1000 / FPS);
  await avancarVideos();
  await foto(join(pasta, `q${String(i).padStart(5, "0")}.jpg`));
  if (i % 30 === 0) console.log(`${i}/${total}`);
}
await b.close();

execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", join(pasta, "q%05d.jpg"),
  "-vf", "scale=960:600:flags=lanczos", "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-movflags", "+faststart", "-an", saida], { stdio: "inherit" });
rmSync(pasta, { recursive: true, force: true });
console.log("ok:", saida);
