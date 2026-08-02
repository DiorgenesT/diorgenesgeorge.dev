import { expect, test } from "@playwright/test";

/** Teto da spec para as duas fontes somadas, em bytes. */
const TETO_DE_FONTES = 75_000;

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
