// Renders a list of items into the parent element using a template function.
export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
    if (clear) {
        parentElement.innerHTML = '';
    }
    const html = list.map(templateFn);
    parentElement.insertAdjacentHTML(position, html.join(''));
}

// Inserts a template string into the page and optionally runs a callback.
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if(callback) {
    callback(data);
  }
}

// Loads the shared header and footer into the current page.
export async function loadHeaderFooter(){
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");
  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement, null);

    if (!headerElement.dataset.menuBound) {
      headerElement.addEventListener("click", (event) => {
        const menuButton = event.target.closest(".menu-toggle");
        const menuNav = headerElement.querySelector(".main-nav");

        if (menuButton) {
          const expanded = menuButton.getAttribute("aria-expanded") === "true";
          menuButton.setAttribute("aria-expanded", String(!expanded));
          menuNav?.classList.toggle("is-open", !expanded);
        } else if (event.target.closest(".main-nav a")) {
          const button = headerElement.querySelector(".menu-toggle");
          button?.setAttribute("aria-expanded", "false");
          menuNav?.classList.remove("is-open");
        }
      });

      headerElement.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        const menuButton = headerElement.querySelector(".menu-toggle");
        const menuNav = headerElement.querySelector(".main-nav");
        menuButton?.setAttribute("aria-expanded", "false");
        menuNav?.classList.remove("is-open");
        menuButton?.focus();
      });

      headerElement.dataset.menuBound = "true";
    }
  }
  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}

// Loads an HTML partial from the server for reuse in templates.
export async function loadTemplate(path){
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

// Reads a query-string value from the current page URL.
export function getParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// Retrieves a stored cart or other JSON value from localStorage.
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// Saves JSON data to localStorage under the given key.
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Displays a custom alert banner at the top of the main content and optionally scrolls the page back to the top.
export function alertMessage(message, scroll = true) {
  const main = document.querySelector("main");
  if (!main) return;

  const existingAlerts = document.querySelectorAll(".alert-message");
  existingAlerts.forEach((alert) => alert.remove());

  const alertText = Array.isArray(message)
    ? message.join(" ")
    : typeof message === "string"
      ? message
      : JSON.stringify(message);

  const alert = document.createElement("div");
  alert.className = "alert-message";
  alert.setAttribute("role", "alert");
  alert.textContent = alertText;

  main.prepend(alert);

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}