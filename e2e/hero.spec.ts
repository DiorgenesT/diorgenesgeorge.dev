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

test("should carry the full name as the heading, not the monogram", async ({
  page,
}) => {
  await page.goto("/pt-br/");

  // O monograma é gráfico. Quem diz de quem é esta página é o h1, e é dele que
  // dependem o buscador e a desambiguação de entidade do JSON-LD.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Diorgenes George",
  );
});

test("should keep the monogram out of the accessibility tree", async ({
  page,
}) => {
  await page.goto("/pt-br/");

  await expect(page.locator("[data-monograma]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );

  // A árvore de acessibilidade é a autoridade aqui, e não o DOM: `getByText` acha
  // o monograma mesmo escondido, porque ele varre a marcação. Letra a letra, um
  // leitor de tela soletraria "D G" antes do título da página.
  const arvore = await page.locator("main").ariaSnapshot();

  expect(arvore).toContain("Diorgenes George");
  expect(arvore).not.toContain("DG");
});

test("should never show the visitor telemetry on screen", async ({ page }) => {
  await page.route("**/api/edge", (route) => route.fulfill({ json: TELEMETRY }));

  await page.goto("/pt-br/");
  await page.waitForLoadState("networkidle");

  // A latência comanda a intensidade do desregistro e nada mais: cidade,
  // datacenter, distância e protocolo não aparecem em lugar nenhum da página.
  const corpo = (await page.locator("body").textContent()) ?? "";

  expect(corpo).not.toContain("GIG");
  expect(corpo).not.toContain("331");
  expect(corpo).not.toContain("HTTP/3");
});

test("should offer the whole index on the cover", async ({ page }) => {
  await page.goto("/pt-br/");

  // Seis portas: sobre, trabalho, escritos, currículo, serviços e contato.
  await expect(page.locator("main nav a")).toHaveCount(6);
});

test("should not repeat the index in the header while on the cover", async ({
  page,
}) => {
  await page.goto("/pt-br/");

  // Na capa o sumário do hero já é o índice: repetir no cabeçalho seria dizer a
  // mesma coisa duas vezes na mesma tela.
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Trabalho" }),
  ).toHaveCount(0);
});

test("should keep the header navigation on every other route", async ({
  page,
}) => {
  await page.goto("/pt-br/sobre/");

  // Fora da capa o cabeçalho é a única navegação que existe, e some-lo deixaria
  // as outras oito rotas sem saída.
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Trabalho" }),
  ).toBeVisible();
});

/**
 * A marca chega depois que o edge responde, e a recepção é uma animação de
 * `transform`: ela não pode empurrar nada, ou o CLS estoura o orçamento de 0.05.
 */
test("should not shift the layout while the mark is received", async ({
  page,
}) => {
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

test("should print the mark for a visitor without javascript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/pt-br/");

  // Sem JavaScript não há medição, então a marca aparece assentada. O que não
  // pode acontecer é a capa ficar sem marca nenhuma.
  await expect(page.locator("[data-monograma]")).toBeVisible();

  await context.close();
});

/**
 * A emulação `reducedMotion` do Playwright não chega ao `window.matchMedia` nesta
 * versão — medido: com ela ligada, `matches` continua falso. O sinal é forçado aqui
 * para o teste verificar o portão do site, e não a emulação do harness.
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

  test("should settle the mark instead of receiving it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pt-br/");

    // A marca remonta quando a telemetria chega, porque a `key` muda. Esperar a rede
    // sossegar evita medir durante a remontagem; resolver o elemento dentro do
    // `evaluate` evita medir um elemento ja desanexado, que devolveria string vazia
    // em vez do valor calculado.
    await page.waitForLoadState("networkidle");

    const animando = await page.evaluate(() => {
      const fatia = document.querySelector("[data-monograma] .monograma-fatia");
      return fatia === null
        ? "marca ausente"
        : getComputedStyle(fatia).animationName;
    });

    expect(animando).toBe("none");
  });
});

test("should keep a text element as the largest paint", async ({ page }) => {
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

  // O monograma é o maior elemento da capa, e ele é texto: pinta com a fonte do
  // sistema antes de a display chegar, então nunca segura o LCP.
  expect(["H1", "P", "SPAN", "none"]).toContain(tag);
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
