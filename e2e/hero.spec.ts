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

test("should fill the panel with what the edge reported", async ({ page }) => {
  await page.route("**/api/edge", (route) => route.fulfill({ json: TELEMETRY }));

  await page.goto("/pt-br/");

  await expect(page.getByText("Betim, BR")).toBeVisible();
  await expect(page.getByText("GIG")).toBeVisible();
  await expect(page.getByText("331 km")).toBeVisible();
});

test("should say it could not measure instead of showing a zero", async ({
  page,
}) => {
  await page.route("**/api/edge", (route) => route.fulfill({ status: 500 }));

  await page.goto("/pt-br/");

  await expect(page.getByText("Não foi possível medir").first()).toBeVisible();
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
  await expect(page.getByText("Betim, BR")).toBeVisible();
  await expect(page.getByText("331 km")).toHaveCount(0);
});

test("should tell a visitor without javascript why the numbers are missing", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/pt-br/");

  await expect(page.getByText("A medição depende de JavaScript")).toBeVisible();
  await expect(page.getByText("Medindo")).toHaveCount(0);

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
  test("should never download the scene or the motion libraries", async ({
    page,
  }) => {
    await page.addInitScript(forceReducedMotion);

    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });

    await page.goto("/pt-br/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);

    expect(
      scripts.filter((url) =>
        /globe-scene|gsap|ScrollTrigger|animated-outlet/i.test(url),
      ),
    ).toEqual([]);
  });

  test("should still draw the globe as svg", async ({ page }) => {
    await page.addInitScript(forceReducedMotion);
    await page.route("**/api/edge", (route) =>
      route.fulfill({ json: TELEMETRY }),
    );

    await page.goto("/pt-br/");
    await page.waitForTimeout(1200);

    await expect(page.locator('svg[role="img"]')).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test("should fall back to svg when webgl is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return original.call(this, type, ...(rest as []));
    } as typeof original;
  });

  await page.goto("/pt-br/");

  await expect(page.locator('svg[role="img"]')).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("should keep the headline as the largest paint, not the scene", async ({
  page,
}) => {
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
  expect(tag).not.toBe("CANVAS");
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
