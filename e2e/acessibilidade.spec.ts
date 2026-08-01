import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { prerenderPaths } from "../scripts/prerender-paths";

// A lista vem do build: rota nova entra na cobertura sem ninguém lembrar de atualizar aqui.
const PATHS = prerenderPaths().filter((path) => path.endsWith("/"));

for (const path of PATHS) {
  for (const theme of ["dark", "light"] as const) {
    test(`should have no accessibility violations on ${path} in ${theme} theme`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.evaluate((value) => {
        document.documentElement.setAttribute("data-theme", value);
      }, theme);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
}

for (const path of PATHS) {
  test(`should have exactly one h1 on ${path}`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator("h1")).toHaveCount(1);
  });
}
