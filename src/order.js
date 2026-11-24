export const WHATSAPP_NUMBER = "77711597110";
export const MAX_QUANTITY = 6;

export const PRODUCTS = Object.freeze([
  { id: "espresso", name: "Эспрессо", tag: "Классика", description: "Плотный, яркий, с ореховой сладостью", volume: "60 мл", price: 1000, art: "hot" },
  { id: "cappuccino", name: "Капучино", tag: "На молоке", description: "Бархатная пенка и сбалансированный вкус", volume: "250 мл", price: 1800, art: "hot" },
  { id: "latte", name: "Латте", tag: "Нежный", description: "Много молока, мягкий кофе и карамель", volume: "300 мл", price: 1900, art: "hot" },
  { id: "iced-coffee", name: "Холодный кофе", tag: "Со льдом", description: "Освежает, бодрит и не торопит", volume: "350 мл", price: 2400, art: "cold" },
  { id: "raf", name: "Раф классический", tag: "Сливочный", description: "Воздушные сливки и ванильная сладость", volume: "300 мл", price: 2700, art: "hot" },
  { id: "pistachio-raf", name: "Фисташковый раф", tag: "Выбор VERDE", description: "Фисташка, сливки и фирменный эспрессо", volume: "350 мл", price: 3400, art: "hot" },
].map((product) => Object.freeze(product)));

export function getProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId) ?? null;
}

export function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .trim()
    .replace(/\s+/gu, " ");
}

export function validateName(value) {
  const name = normalizeName(value);

  if (name.length < 2 || name.length > 40) {
    return { valid: false, name, message: "Введите имя длиной от 2 до 40 символов." };
  }

  // Разрешаем буквы любых алфавитов, пробелы, дефис и апостроф.
  // Разметка, ссылки и управляющие символы в сообщение не попадут.
  if (!/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name)) {
    return { valid: false, name, message: "Используйте только буквы, пробел, дефис или апостроф." };
  }

  return { valid: true, name, message: "" };
}

export function formatPrice(value) {
  return `${new Intl.NumberFormat("ru-KZ").format(value)} ₸`;
}

export function buildOrder({ productId, name, quantity = 1 }) {
  const product = getProduct(productId);
  const checkedName = validateName(name);
  const count = quantity;

  if (!product) throw new Error("Выберите напиток из меню.");
  if (!checkedName.valid) throw new Error(checkedName.message);
  if (!Number.isInteger(count) || count < 1 || count > MAX_QUANTITY) {
    throw new Error(`Количество должно быть от 1 до ${MAX_QUANTITY}.`);
  }

  const total = product.price * count;
  const text = [
    "Здравствуйте, VERDE! Хочу сделать заказ 🌿",
    "",
    `Имя: ${checkedName.name}`,
    `Напиток: ${product.name}`,
    `Объём: ${product.volume}`,
    `Количество: ${count} шт.`,
    `Сумма: ${formatPrice(total)}`,
    "",
    "Подскажите, пожалуйста, когда заказ будет готов?",
  ].join("\n");

  return {
    product,
    name: checkedName.name,
    quantity: count,
    total,
    text,
    url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
  };
}
