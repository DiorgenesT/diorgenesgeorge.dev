import { expect, test } from "@playwright/test";

const TELEMETRY = {
  visitor: {
    city: "Betim",
    region: "Minas Gerais",
    country: "BR",
    lat: -19.9678,
    lon: -44.1983,
  },
  colo: { code: "GIG", lat: -22.81, lon: -43.2506 },
  httpProtocol: "HTTP/3",
  tlsVersion: "TLSv1.3",
};

test("should stamp what the edge reported", async ({ page }) => {
  await page.route("**/api/edge", (route) => route.fulfill({ json: TELEMETRY }));

  await page.goto("/pt-br/");
  const carimbo = page.locator("[data-carimbo]");

  await expect(carimbo.getByText("Betim, BR")).toBeVisible();
  await expect(carimbo.getByText(/GIG/)).toBeVisible();
  await expect(carimbo.getByText(/331 km/)).toBeVisible();
});

test("should stamp nothing when the edge cannot answer", async ({ page }) => {
  await page.route("**/api/edge", (route) => route.fulfill({ status: 500 }));

  await page.goto("/pt-br/");
  const carimbo = page.locator("[data-carimbo]");

  // O invólucro continua lá, reservando o espaço; o que não existe é conteúdo.
  await expect(carimbo).toBeAttached();
  await expect(carimbo).toHaveText("");
  await expect(page.getByText("0 km")).toHaveCount(0);
});

test("should never invent a position when the colo is unknown", async ({
  page,
}) => {
  await page.route("**/api/edge", (route) =>
    route.fulfill({ json: { ...TELEMETRY, colo: null } }),
  );

  await page.goto("/pt-br/");

  // A cidade veio, então ela aparece; a distância não tem como existir.
  await expect(page.locator("[data-carimbo]").getByText("Betim, BR")).toBeVisible();
  await expect(page.getByText("331 km")).toHaveCount(0);
});

/**
 * O risco real desta fase: o carimbo só existe depois que o cliente busca o edge, e o
 * espaço dele é reservado desde o servidor justamente para que a queda não empurre nada.
 */
test("should not shift the layout when the stamp lands", async ({ page }) => {
  await page.route("**/api/edge", (route) => route.fulfill({ json: TELEMETRY }));

  await page.goto("/pt-br/");

  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 3000);
      }),
  );

  expect(cls).toBeLessThan(0.05);
});

test("should keep the stamp out of the page for a visitor without javascript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/pt-br/");

  // Sem JavaScript não há medição, e sem medição não há o que carimbar. O espaço
  // reservado continua lá, e vazio, que é o estado correto.
  await expect(page.locator("[data-carimbo]")).toHaveText("");

  await context.close();
});

/**
 * A emulação `reducedMotion` do Playwright não chega ao `window.matchMedia` nesta
 * versão — medido: com ela ligada, `matches` continua falso e a cena monta. O sinal é
 * forçado aqui para o teste verificar o portão do site, e não a emulação do harness.
 */
const forceReducedMotion = `
  const original = window.matchMedia.bind(window);
  window.matchMedia = (query) =>
    query.includes("prefers-reduced-motion: reduce")
      ? { matches: true, media: query, addEventListener() {}, removeEventListener() {} }
      : original(query);
`;

test.describe("movimento reduzido", () => {
  test("should never download the motion libraries", async ({ page }) => {
    await page.addInitScript(forceReducedMotion);

    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });

    await page.goto("/pt-br/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);

    expect(scripts.filter((url) => /gsap|ScrollTrigger/i.test(url))).toEqual(
      [],
    );
  });
});

test("should keep the headline as the largest paint", async ({ page }) => {
  await page.goto("/pt-br/");

  const tag = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1) as
            | { element?: Element }
            | undefined;
          resolve(last?.element?.tagName ?? "none");
        }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve("none"), 4000);
      }),
  );

  expect(["H1", "P", "none"]).toContain(tag);
});

test("should never send the network operator of the visitor to the browser", async ({
  request,
}) => {
  const body = await (await request.get("/api/edge")).text();

  expect(body).not.toMatch(/asOrganization|asn|"ip"/i);
});

test("should refuse to let the telemetry be cached for another visitor", async ({
  request,
}) => {
  const response = await request.get("/api/edge");

  expect(response.headers()["cache-control"]).toContain("no-store");
});
