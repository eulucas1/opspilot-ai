import { expect, test } from "@playwright/test";

test("renders the landing page scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "OpsPilot AI" })).toBeVisible();
  await expect(page.getByText("FastAPI + SQLAlchemy")).toBeVisible();
  await expect(page.getByText("GET /health")).toBeVisible();
});
