import "./style.css";
import { PRODUCTS, MAX_QUANTITY, buildOrder, formatPrice, getProduct } from "./order.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// Карточки создаются только через textContent: пользовательская разметка не исполняется.
function renderMenu() {
  const fragment = document.createDocumentFragment();

  PRODUCTS.forEach((product) => {
    const card = createElement("article", "menu-card");
    const top = createElement("div", "menu-card-top");
    top.append(createElement("span", "drink-tag", product.tag), createElement("span", "drink-volume", product.volume));

    const art = createElement("div", `drink-art ${product.art}`);
    art.setAttribute("aria-hidden", "true");
    art.append(createElement("i"));

    const info = createElement("div", "menu-card-info");
    const copy = createElement("div");
    copy.append(createElement("h3", "", product.name), createElement("p", "", product.description));
    info.append(copy);

    const bottom = createElement("div", "menu-card-bottom");
    const orderButton = createElement("button", "menu-order");
    orderButton.type = "button";
    orderButton.dataset.product = product.id;
    orderButton.setAttribute("aria-label", `Заказать ${product.name} за ${formatPrice(product.price)}`);
    bottom.append(createElement("span", "menu-price", formatPrice(product.price)), orderButton);
    card.append(top, art, info, bottom);
    fragment.append(card);
  });

  $("#menu-grid").replaceChildren(fragment);
}

renderMenu();
$("#year").textContent = String(new Date().getFullYear());

const header = $(".site-header");
const menuToggle = $(".menu-toggle");
const mobileNav = $("#mobile-nav");

function closeMobileMenu() {
  header.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  mobileNav.hidden = true;
}

menuToggle.addEventListener("click", () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  header.classList.toggle("menu-open", opening);
  menuToggle.setAttribute("aria-expanded", String(opening));
  menuToggle.setAttribute("aria-label", opening ? "Закрыть меню" : "Открыть меню");
});

$$("a", mobileNav).forEach((link) => link.addEventListener("click", closeMobileMenu));

let headerUpdatePending = false;
window.addEventListener("scroll", () => {
  if (headerUpdatePending) return;
  headerUpdatePending = true;
  requestAnimationFrame(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
    headerUpdatePending = false;
  });
}, { passive: true });

// Секции мягко уходят в blur и возвращаются при прокрутке в обе стороны.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = $$(".section-reveal");
if (!reducedMotion && "IntersectionObserver" in window) {
  document.body.classList.add("motion-enabled");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
  }, { threshold: 0.055, rootMargin: "-20px 0px -20px" });
  sections.forEach((section) => revealObserver.observe(section));
} else {
  sections.forEach((section) => section.classList.add("is-visible"));
}

// Порядок данных в форме всегда берётся из закрытого каталога, а не из DOM.
const orderDialog = $("#order-dialog");
const orderForm = $("#order-form");
const productSelect = $("#order-product");
const nameInput = $("#order-name");
const quantityOutput = $("#order-quantity");
const errorOutput = $("#order-error");
let quantity = 1;
let triggerElement = null;

PRODUCTS.forEach((product) => {
  const option = document.createElement("option");
  option.value = product.id;
  option.textContent = `${product.name} — ${formatPrice(product.price)}`;
  productSelect.append(option);
});

function clearError() {
  errorOutput.textContent = "";
  nameInput.removeAttribute("aria-invalid");
  productSelect.removeAttribute("aria-invalid");
}

function updateSummary() {
  const product = getProduct(productSelect.value);
  quantityOutput.textContent = String(quantity);
  $("#summary-product").textContent = product ? `${product.name}, ${product.volume}` : "Выберите напиток";
  $("#summary-quantity").textContent = `${quantity} шт.`;
  $("#summary-total").textContent = formatPrice(product ? product.price * quantity : 0);
  $("#quantity-minus").disabled = quantity === 1;
  $("#quantity-plus").disabled = quantity === MAX_QUANTITY;
}

function openOrder(productId, trigger) {
  if (getProduct(productId)) productSelect.value = productId;
  triggerElement = trigger ?? document.activeElement;
  clearError();
  updateSummary();
  closeMobileMenu();
  if (!orderDialog.open) orderDialog.showModal();
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => (productSelect.value ? nameInput : productSelect).focus());
}

$$('.js-open-order').forEach((button) => {
  button.addEventListener("click", () => openOrder("", button));
});

$("#menu-grid").addEventListener("click", (event) => {
  const button = event.target.closest(".menu-order");
  if (button) openOrder(button.dataset.product, button);
});

$("#close-order").addEventListener("click", () => orderDialog.close());
orderDialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (triggerElement?.isConnected) triggerElement.focus({ preventScroll: true });
});
orderDialog.addEventListener("click", (event) => {
  if (event.target !== orderDialog) return;
  const bounds = orderDialog.getBoundingClientRect();
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  if (!inside) orderDialog.close();
});

productSelect.addEventListener("change", () => {
  clearError();
  updateSummary();
});
nameInput.addEventListener("input", clearError);
$("#quantity-minus").addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  updateSummary();
});
$("#quantity-plus").addEventListener("click", () => {
  quantity = Math.min(MAX_QUANTITY, quantity + 1);
  updateSummary();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  let order;
  try {
    order = buildOrder({ productId: productSelect.value, name: nameInput.value, quantity });
  } catch (error) {
    errorOutput.textContent = error.message;
    if (!getProduct(productSelect.value)) {
      productSelect.setAttribute("aria-invalid", "true");
      productSelect.focus();
    } else {
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
    }
    return;
  }

  const submitButton = $(".order-submit", orderForm);
  submitButton.disabled = true;
  // Ссылка с noopener не даёт новой вкладке доступа к window.opener.
  const whatsappLink = document.createElement("a");
  whatsappLink.href = order.url;
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  document.body.append(whatsappLink);
  whatsappLink.click();
  whatsappLink.remove();

  orderDialog.close();
  orderForm.reset();
  quantity = 1;
  updateSummary();
  submitButton.disabled = false;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) closeMobileMenu();
});

// Three.js подгружается в свободное время браузера, чтобы не мешать первому экрану.
const startCupScene = () => {
  const fontReady = document.fonts
    ? Promise.all([
        document.fonts.load('700 112px "Inter Variable"'),
        document.fonts.load('italic 400 21px "Playfair Display Variable"'),
      ]).catch(() => undefined)
    : undefined;

  // Если шрифт задерживается, 3D всё равно запускается — стакан не ждёт сеть.
  Promise.race([fontReady ?? Promise.resolve(), new Promise((resolve) => setTimeout(resolve, 350))])
    .then(() => import("./cup.js"))
    .then(({ createCupScene }) => {
      createCupScene($("#cup-stage"), { reducedMotion });
      $("#cup-stage canvas").addEventListener("pointerdown", () => {
        $("#drag-hint").style.opacity = "0";
      }, { once: true });
    })
    .catch((error) => {
      console.error("Не удалось запустить 3D-сцену:", error);
      $("#drag-hint").textContent = "Фирменный стакан VERDE";
    });
};

if ("requestIdleCallback" in window) {
  requestIdleCallback(startCupScene, { timeout: 500 });
} else {
  setTimeout(startCupScene, 150);
}
