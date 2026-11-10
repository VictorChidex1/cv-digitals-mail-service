import { expect, test } from "@playwright/test";

test("status page renders live health data from the API", async ({ page }) => {
  await page.goto("/status");

  await expect(page.getByTestId("status-overall")).toHaveText("ok");
  await expect(page.getByTestId("status-service")).toHaveText(
    "cv-digitals-mail-api",
  );
  await expect(page.getByTestId("status-database")).toHaveText("ok");
  await expect(page.getByTestId("status-migrations")).toHaveText(/^\d+$/);
});
