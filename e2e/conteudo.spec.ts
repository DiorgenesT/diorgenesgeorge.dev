import { expect, test } from "@playwright/test";

test("should walk from the home to the cv", async ({ page }) => {
  await page.goto("/en/");
  await page.getByRole("link", { name: "I am a recruiter" }).click();

  await expect(page).toHaveURL(/\/en\/cv\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("should keep the reader on the same page when switching language", async ({
  page,
}) => {
  await page.goto("/pt-br/sobre/");
  await page.getByRole("combobox").selectOption("en-US");

  await expect(page).toHaveURL(/\/en\/about\/$/);
});

test("should follow the european portuguese spelling of contact", async ({
  page,
}) => {
  await page.goto("/en/contact/");
  await page.getByRole("combobox").selectOption("pt-PT");

  await expect(page).toHaveURL(/\/pt-pt\/contacto\/$/);
});

test("should open a content page with its answer block", async ({ page }) => {
  await page.goto("/en/about/");
  const answer = page.locator("main p").first();

  await expect(answer).not.toBeEmpty();
  expect((await answer.textContent())?.length ?? 0).toBeGreaterThan(100);
});

test("should offer a whatsapp conversation with a prefilled message", async ({
  page,
}) => {
  await page.goto("/en/contact/");

  await expect(
    page.getByRole("link", { name: "Message me on WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me\/\d+\?text=/);
});

test("should explain an empty index instead of showing an empty list", async ({
  page,
}) => {
  await page.goto("/en/work/");

  await expect(page.locator("main")).toContainText("being prepared");
});

test("should keep an empty index out of the navigation", async ({ page }) => {
  await page.goto("/en/");

  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Work", exact: true }),
  ).toHaveCount(0);
});
