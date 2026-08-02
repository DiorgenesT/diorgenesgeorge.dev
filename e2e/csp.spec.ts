import { expect, test } from "@playwright/test";

test("should keep the policy inside its budget", async ({ request }) => {
  const response = await request.get("/en/");
  const csp = response.headers()["content-security-policy"] ?? "";

  expect(csp.length).toBeLessThan(4096);
});

test("should never fall back to unsafe-inline for scripts", async ({ request }) => {
  const response = await request.get("/en/");
  const csp = response.headers()["content-security-policy"] ?? "";
  const scriptSrc = /script-src ([^;]+)/.exec(csp)?.[1] ?? "";

  expect(scriptSrc).not.toContain("unsafe-inline");
});

test("should render a page without any policy violation", async ({ page }) => {
  await page.addInitScript(() => {
    const store = window as unknown as { __violations: string[] };
    store.__violations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      store.__violations.push(event.violatedDirective);
    });
  });

  await page.goto("/en/");
  const violations = await page.evaluate(
    () => (window as unknown as { __violations?: string[] }).__violations ?? [],
  );

  expect(violations).toEqual([]);
});

test("should hydrate without throwing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/en/");
  await page.waitForLoadState("networkidle");
  // Navegar depois da hidratação: uma árvore regenerada por erro não navegaria.
  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/en\/about\/$/);

  expect(errors).toEqual([]);
});
