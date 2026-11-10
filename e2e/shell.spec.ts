import { mkdirSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

const EMAIL = process.env.SEED_AUTH_EMAIL ?? "operator@cvdigitals.test";
const PASSWORD = process.env.SEED_AUTH_PASSWORD ?? "Password123!";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.locator("#email").fill(EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("verified-email")).toHaveText(EMAIL);
}

const routes: Array<{ label: string; path: string }> = [
  { label: "Overview", path: "/" },
  { label: "Prospects", path: "/prospects" },
  { label: "Campaigns", path: "/campaigns" },
  { label: "Drafts", path: "/drafts" },
  { label: "Approval Queue", path: "/approval" },
  { label: "Sent Emails", path: "/sent" },
  { label: "Replies / Inbox", path: "/inbox" },
  { label: "Follow-ups", path: "/follow-ups" },
  { label: "Email Accounts", path: "/accounts" },
  { label: "Analytics", path: "/analytics" },
  { label: "Suppression List", path: "/suppression" },
  { label: "Activity Log", path: "/activity" },
  { label: "Settings", path: "/settings" },
  { label: "Backups & Data", path: "/data" },
];

test.describe("workspace shell", () => {
  test("redirects unauthenticated visitors from any workspace route", async ({
    page,
  }) => {
    await page.goto("/prospects");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("navigates every sidebar destination and marks the active route", async ({
    page,
  }) => {
    await signIn(page);

    for (const route of routes.filter((item) => item.path !== "/")) {
      await page.getByRole("link", { name: route.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${route.path}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: route.label }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: route.label, exact: true }),
      ).toHaveAttribute("aria-current", "page");
    }
  });

  test("placeholder pages state that nothing is simulated", async ({ page }) => {
    await signIn(page);
    await page.goto("/prospects");

    await expect(page.getByText("Not built yet", { exact: true })).toBeVisible();
    await expect(page.getByText(/nothing here is simulated/i)).toBeVisible();
  });

  test("mobile drawer opens, navigates, and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);

    await expect(
      page.getByRole("link", { name: "Prospects", exact: true }),
    ).toBeHidden();

    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "Drafts", exact: true }).click();
    await expect(page).toHaveURL(/\/drafts$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Drafts" }),
    ).toBeVisible();
    await expect(drawer).toBeHidden();
  });

  test("sign-out asks for confirmation and can be cancelled", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Sign out?" })).toBeVisible();

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test("confirmed sign-out returns to the login page", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Sign out" })
      .click();

    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("visual captures", () => {
  test("login page", async ({ page }) => {
    mkdirSync("screenshots", { recursive: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await page.screenshot({ path: "screenshots/login-desktop.png", fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: "screenshots/login-mobile.png", fullPage: true });
  });

  test("overview and placeholder", async ({ page }) => {
    mkdirSync("screenshots", { recursive: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page);
    await page.screenshot({
      path: "screenshots/overview-desktop.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.getByTestId("verified-email")).toBeVisible();
    await page.screenshot({
      path: "screenshots/overview-mobile.png",
      fullPage: true,
    });

    await page.goto("/prospects");
    await page.screenshot({
      path: "screenshots/placeholder-mobile.png",
      fullPage: true,
    });
  });
});
