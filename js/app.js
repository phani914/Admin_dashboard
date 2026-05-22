const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");
const mobileMenuButton = document.querySelector("#mobileMenuButton");
const sidebarOverlay = document.querySelector("#sidebarOverlay");
const navLinks = document.querySelectorAll(".nav-link");
const filterButtons = document.querySelectorAll("[data-filter]");
const customerRows = document.querySelectorAll("#customerTable tbody tr");
const themeToggles = document.querySelectorAll("#themeToggle, #mobileThemeToggle");

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

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSidebar(false);
  }
});
