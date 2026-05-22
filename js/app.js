const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");
const mobileMenuButton = document.querySelector("#mobileMenuButton");
const sidebarOverlay = document.querySelector("#sidebarOverlay");
const navLinks = document.querySelectorAll(".nav-link");
const filterButtons = document.querySelectorAll("[data-filter]");
const customerRows = document.querySelectorAll("#customerTable tbody tr");
const themeToggles = document.querySelectorAll("#themeToggle, #mobileThemeToggle");
const authPanel = document.querySelector("#authPanel");
const authTitle = document.querySelector("#authTitle");
const authOpenButtons = document.querySelectorAll("[data-auth-view]");
const authTabs = document.querySelectorAll("[data-auth-tab]");
const authForms = document.querySelectorAll("[data-auth-form]");
const authCloseButtons = document.querySelectorAll("[data-auth-close]");
const authMessage = document.querySelector("#authMessage");

function setSidebar(open) {
  sidebar.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  mobileMenuButton.setAttribute("aria-expanded", String(open));
  sidebarOverlay.hidden = !open;
}

function setTheme(mode) {
  const isDark = mode === "dark";

  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("dashboard-theme", mode);

  themeToggles.forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    button.querySelector(".theme-icon").textContent = isDark ? "☀" : "☾";
    button.querySelector(".theme-text").textContent = isDark ? "Light" : "Dark";
  });
}

function setAuthView(view) {
  const title = view === "signup" ? "Sign Up" : "Login";

  authTitle.textContent = title;
  authMessage.textContent = "";

  authTabs.forEach((tab) => {
    const active = tab.dataset.authTab === view;

    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  authForms.forEach((form) => {
    form.classList.toggle("active", form.dataset.authForm === view);
  });
}

function openAuthPanel(view) {
  setAuthView(view);
  authPanel.hidden = false;
}

function closeAuthPanel() {
  authPanel.hidden = true;
}

const savedTheme = localStorage.getItem("dashboard-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
setTheme(savedTheme || preferredTheme);

menuButton.addEventListener("click", () => {
  setSidebar(!sidebar.classList.contains("open"));
});

mobileMenuButton.addEventListener("click", () => {
  setSidebar(!sidebar.classList.contains("open"));
});

sidebarOverlay.addEventListener("click", () => {
  setSidebar(false);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    setSidebar(false);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    customerRows.forEach((row) => {
      row.hidden = filter !== "all" && row.dataset.plan !== filter;
    });
  });
});

themeToggles.forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
  });
});

authOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openAuthPanel(button.dataset.authView);
  });
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setAuthView(tab.dataset.authTab);
  });
});

authCloseButtons.forEach((button) => {
  button.addEventListener("click", closeAuthPanel);
});

authForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    authMessage.textContent = form.dataset.authForm === "signup"
      ? "Account details captured on this page."
      : "Login details captured on this page.";
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSidebar(false);
    closeAuthPanel();
  }
});
