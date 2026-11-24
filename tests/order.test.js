import nodeAssert from "node:assert/strict";
import test from "node:test";
import {
  MAX_QUANTITY,
  PRODUCTS,
  WHATSAPP_NUMBER,
  buildOrder,
  normalizeName,
  validateName,
} from "../src/order.js";

test("меню содержит холодный кофе и цены в заявленном диапазоне", () => {
  nodeAssert.ok(PRODUCTS.some((product) => product.id === "iced-coffee"));
  nodeAssert.ok(PRODUCTS.every((product) => product.price >= 1000 && product.price <= 4000));
  nodeAssert.equal(new Set(PRODUCTS.map((product) => product.id)).size, PRODUCTS.length);
});

test("имя нормализуется без небезопасного HTML", () => {
  nodeAssert.equal(normalizeName("  Али\u200bя   \n"), "Алия");
  nodeAssert.equal(validateName("Anne-Marie O’Neil").valid, true);
  nodeAssert.equal(validateName("<img src=x onerror=alert(1)>").valid, false);
  nodeAssert.equal(validateName("https://example.com").valid, false);
});

test("заказ создаёт корректный WhatsApp URL и сумму", () => {
  const order = buildOrder({ productId: "iced-coffee", name: "  Алия  ", quantity: 2 });
  nodeAssert.equal(order.name, "Алия");
  nodeAssert.equal(order.total, 4800);
  nodeAssert.ok(order.url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`));

  const text = new URL(order.url).searchParams.get("text");
  nodeAssert.match(text, /Имя: Алия/);
  nodeAssert.match(text, /Напиток: Холодный кофе/);
  nodeAssert.match(text, /Количество: 2 шт\./);
  nodeAssert.match(text, /Сумма: 4\s800 ₸/);
});

test("неизвестный продукт нельзя подменить через DOM", () => {
  nodeAssert.throws(() => buildOrder({ productId: "free-coffee", name: "Алия" }), /Выберите напиток/);
});

test("количество строго ограничено диапазоном", () => {
  for (const quantity of [0, -1, 1.5, MAX_QUANTITY + 1, "2", Infinity]) {
    nodeAssert.throws(() => buildOrder({ productId: "latte", name: "Алия", quantity }));
  }
  nodeAssert.equal(buildOrder({ productId: "latte", name: "Алия", quantity: MAX_QUANTITY }).total, 11400);
});
