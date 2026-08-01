import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PATHS = ["/pt-br/", "/pt-pt/", "/en/", "/en/colophon/"];

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
