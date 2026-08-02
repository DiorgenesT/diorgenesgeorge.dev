import { expect, test } from "@playwright/test";

test("should redirect the bare root to the negotiated locale", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/$/);
});

test("should serve each locale root with the correct lang attribute", async ({
  page,
}) => {
  for (const [path, lang] of [
    ["/pt-br/", "pt-BR"],
    ["/pt-pt/", "pt-PT"],
    ["/en/", "en-US"],
  ] as const) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  }
});

test("should keep the user on the colophon when switching language", async ({
  page,
}) => {
  await page.goto("/pt-br/colofao/");
  await page.getByRole("combobox").selectOption("en-US");
  await expect(page).toHaveURL(/\/en\/colophon\/$/);
});

test("should reach the skip link as the first keyboard stop", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});

test("should serve every canonical url without an intermediate redirect", async ({
  page,
}) => {
  for (const path of [
    "/pt-br/",
    "/pt-pt/",
    "/en/",
    "/pt-br/colofao/",
    "/pt-pt/colofao/",
    "/en/colophon/",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), `status de ${path}`).toBe(200);
    expect(response?.request().redirectedFrom(), `redirect em ${path}`).toBe(
      null,
    );
  }
});

test("should answer an unknown path with the designed 404", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist/");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This page does not exist",
  );
});

test("should answer the 404 in the language of the path", async ({ page }) => {
  await page.goto("/pt-br/nao-existe/");

  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Esta página não existe",
  );
});

test("should keep the 404 out of the index", async ({ page }) => {
  await page.goto("/en/does-not-exist/");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test("should not report any content security policy violation", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) {
      violations.push(message.text());
    }
  });

  await page.goto("/en/");
  // Navegar de rota exercita o script de módulo, que é o que a CSP poderia barrar.
  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/en\/about\/$/);

  expect(violations).toEqual([]);
});
