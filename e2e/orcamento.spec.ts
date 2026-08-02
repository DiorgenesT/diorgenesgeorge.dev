import { expect, test } from "@playwright/test";

/**
 * O orcamento da spec exige zero fonte customizada nesta fase. A Fase 1 troca esta
 * expectativa por exatamente uma, quando a display do zine entrar subsetada.
 */
test("should ship no custom font file", async ({ page }) => {
  const fonts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fonts.push(request.url());
  });

  await page.goto("/pt-br/");
  await page.waitForLoadState("networkidle");

  expect(fonts).toEqual([]);
});
