import { expect, test } from "@playwright/test";

const EMAIL = process.env.SEED_AUTH_EMAIL ?? "operator@cvdigitals.test";
const PASSWORD = process.env.SEED_AUTH_PASSWORD ?? "Password123!";

test.describe("login", () => {
  test("redirects unauthenticated visitors to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("password visibility toggle changes type and label", async ({ page }) => {
    await page.goto("/login");
    const password = page.locator("#password");

    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(
      page.getByRole("button", { name: "Hide password" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(password).toHaveAttribute("type", "password");
  });

  test("wrong password shows a human-readable error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(EMAIL);
    await page.locator("#password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page.getByTestId("login-error")).toHaveText(/incorrect/i);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("valid credentials sign in, show API-verified identity, then sign out", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill(EMAIL);
    await page.locator("#password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("verified-email")).toHaveText(EMAIL);
    await expect(page.getByTestId("verified-uid")).not.toBeEmpty();
    await expect(page.getByTestId("verified-provider")).toHaveText("password");

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Sign out" })
      .click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("google sign-in control is present and enabled", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeEnabled();
  });
});
