import { expect, test } from "@playwright/test";

/**
 * Teto da spec para as duas fontes somadas, em bytes. Caiu de 75.000 para 40.000 em
 * 2026-08-02, quando Anton e Special Elite deram lugar a Archivo Black e Space Mono:
 * a datilografada gasta custava 53 KB sozinha, e o desgaste desenhado que justificava
 * o preco deixou de fazer sentido quando o fanzine saiu.
 */
const TETO_DE_FONTES = 40_000;

test("should ship exactly the two fonts the spec allows", async ({ page }) => {
  const fontes: { url: string; bytes: number }[] = [];

  page.on("response", async (response) => {
    if (response.request().resourceType() !== "font") return;
    const corpo = await response.body().catch(() => null);
    if (corpo) fontes.push({ url: response.url(), bytes: corpo.length });
  });

  await page.goto("/pt-br/");
  await page.waitForLoadState("networkidle");

  expect(fontes).toHaveLength(2);
  expect(fontes.every((fonte) => fonte.url.endsWith(".woff2"))).toBe(true);

  const total = fontes.reduce((soma, fonte) => soma + fonte.bytes, 0);
  expect(total).toBeLessThanOrEqual(TETO_DE_FONTES);
});

test("should never fetch a font from another origin", async ({ page }) => {
  const externas: string[] = [];

  page.on("request", (request) => {
    if (request.resourceType() !== "font") return;
    if (!request.url().startsWith("http://localhost")) externas.push(request.url());
  });

  await page.goto("/pt-br/");
  await page.waitForLoadState("networkidle");

  expect(externas).toEqual([]);
});
