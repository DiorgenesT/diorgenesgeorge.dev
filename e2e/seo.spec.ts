import { expect, test } from "@playwright/test";

test("should expose a canonical url on a content page", async ({ page }) => {
  await page.goto("/pt-br/sobre/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://diorgenesgeorge.dev/pt-br/sobre/",
  );
});

test("should declare reciprocal hreflang including itself", async ({ page }) => {
  await page.goto("/pt-br/sobre/");

  await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveCount(1);
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", "https://diorgenesgeorge.dev/en/about/");
});

test("should carry a description on every indexable page", async ({ page }) => {
  await page.goto("/en/services/");

  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");

  expect(description?.length ?? 0).toBeGreaterThan(80);
});

test("should describe the person with its name variants", async ({ page }) => {
  await page.goto("/en/");

  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const person = blocks.map((raw) => JSON.parse(raw)).find((d) => d["@type"] === "Person");

  expect(person.alternateName).toContain("Diorgenes Tavares");
});

test("should keep every json-ld block parseable", async ({ page }) => {
  await page.goto("/en/");

  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  expect(blocks.length).toBeGreaterThan(0);
  expect(() => blocks.forEach((raw) => JSON.parse(raw))).not.toThrow();
});

test("should serve the markdown twin of a page", async ({ request }) => {
  const response = await request.get("/en/about.md");

  expect(response.headers()["content-type"]).toContain("text/markdown");
  expect(await response.text()).toContain(
    "https://diorgenesgeorge.dev/en/about/",
  );
});

test("should allow ai crawlers explicitly", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();

  expect(robots).toContain("ClaudeBot");
  expect(robots).toContain("GPTBot");
  expect(robots).toContain("Sitemap: https://diorgenesgeorge.dev/sitemap.xml");
});

test("should list alternates inside the sitemap", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();

  expect(sitemap).toContain("xhtml:link");
  expect(sitemap).not.toContain("/404/");
  expect(sitemap).not.toContain("/tag/");
});

test("should index the site for language models", async ({ request }) => {
  const llms = await (await request.get("/llms.txt")).text();

  expect(llms).toContain("# Diorgenes George");
  expect(llms).toContain(".md)");
});

test("should serve the whole corpus as one file", async ({ request }) => {
  const response = await request.get("/llms-full.txt");

  expect(response.status()).toBe(200);
  expect((await response.text()).length).toBeGreaterThan(5000);
});

test("should publish a feed per language", async ({ request }) => {
  for (const path of [
    "/pt-br/escritos/feed.xml",
    "/pt-pt/escritos/feed.xml",
    "/en/writing/feed.xml",
  ]) {
    const response = await request.get(path);

    expect(response.status(), path).toBe(200);
    expect(await response.text()).toContain("<rss");
  }
});
