import { expect, test } from "@playwright/test";

test("главная, меню и 3D загружаются без ошибок и внешних ресурсов", async ({ page }) => {
  const errors = [];
  const externalRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") console.error("Browser:", message.text());
  });
  page.on("request", (request) => {
    const url = request.url();
    if (/^https?:/.test(url) && !url.startsWith("http://127.0.0.1:5173")) externalRequests.push(url);
  });

  await page.goto("/");
  await expect(page).toHaveTitle("VERDE — кофе в твоём ритме");
  await expect(page.locator("#menu-grid .menu-card")).toHaveCount(6);
  await expect(page.locator("#cup-stage canvas")).toBeVisible({ timeout: 10000 });
  await expect(page.locator("#cup-stage")).toHaveClass(/webgl-ready/);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: "artifacts/desktop.png", fullPage: false });
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test("прокрутка переключает мягкие blur-переходы секций", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator("#home")).toHaveClass(/is-visible/);
  await page.locator("#menu").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await expect(page.locator("#menu")).toHaveClass(/is-visible/);
  await expect(page.locator("#home")).not.toHaveClass(/is-visible/);
  await page.waitForTimeout(700);
  await page.screenshot({ path: "artifacts/menu.png", fullPage: false });

  const response = await request.get("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("script-src 'self'");
});

test("форма заранее выбирает напиток, валидирует имя и считает сумму", async ({ page }) => {
  await page.goto("/#menu");
  await page.getByRole("button", { name: "Заказать Холодный кофе" }).click();
  await expect(page.locator("#order-dialog")).toBeVisible();
  await expect(page.locator("#order-product")).toHaveValue("iced-coffee");
  await page.locator("#quantity-plus").click();
  await expect(page.locator("#summary-total")).toHaveText("4 800 ₸");
  await page.screenshot({ path: "artifacts/order.png", fullPage: false });

  await page.locator(".order-submit").click();
  await expect(page.locator("#order-name")).toHaveAttribute("aria-invalid", "true");
  await page.locator("#order-name").fill("<script>alert(1)</script>");
  await page.locator(".order-submit").click();
  await expect(page.locator("#order-error")).toContainText("только буквы");
  await expect(page.locator("#order-dialog")).toBeVisible();
});

test("после заказа открывается WhatsApp с готовым текстом", async ({ page, context }) => {
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: "WhatsApp test" }));
  await page.goto("/");
  await page.locator(".hero .js-open-order").click();
  await page.locator("#order-product").selectOption("cappuccino");
  await page.locator("#order-name").fill("Алия");
  await page.locator("#quantity-plus").click();

  const popupPromise = page.waitForEvent("popup");
  await page.locator(".order-submit").click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  const url = new URL(popup.url());
  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe("/77711597110");
  const text = url.searchParams.get("text");
  expect(text).toContain("Имя: Алия");
  expect(text).toContain("Напиток: Капучино");
  expect(text).toContain("Количество: 2 шт.");
  expect(text).toMatch(/Сумма: 3\s600 ₸/);
  await expect(page.locator("#order-dialog")).not.toBeVisible();
  await popup.close();
});

test("мобильная версия не имеет горизонтального скролла", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#cup-stage canvas")).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "artifacts/mobile.png", fullPage: false });
  await page.locator(".menu-toggle").click();
  await expect(page.locator("#mobile-nav")).toBeVisible();
  await page.locator("#mobile-nav a[href='#menu']").click();
  await expect(page.locator("#mobile-nav")).not.toBeVisible();
  await page.waitForTimeout(1000);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
});
