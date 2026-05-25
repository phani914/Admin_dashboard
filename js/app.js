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
const chartCanvases = {
  revenue: document.querySelector("#revenueChart"),
  traffic: document.querySelector("#trafficChart"),
  sales: document.querySelector("#salesChart"),
};
const dashboardCharts = [];

function getThemeColor(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((char) => char + char).join("")
    : value;
  const number = parseInt(normalized, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function chartPalette() {
  const primary = getThemeColor("--primary");
  const accent = getThemeColor("--accent");
  const warning = getThemeColor("--warning");
  const line = getThemeColor("--line");
  const text = getThemeColor("--text");
  const muted = getThemeColor("--muted");
  const surface = getThemeColor("--surface");

  return {
    primary,
    accent,
    warning,
    line,
    text,
    muted,
    surface,
    primarySoft: hexToRgba(primary, 0.18),
    accentSoft: hexToRgba(accent, 0.16),
  };
}

function sharedChartOptions() {
  const colors = chartPalette();

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.text,
        bodyColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 1,
        displayColors: false,
        titleColor: colors.surface,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: colors.muted,
          font: {
            weight: 700,
          },
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: colors.line,
        },
        ticks: {
          color: colors.muted,
          callback: (value) => `$${value}k`,
        },
      },
    },
  };
}

function createGradient(ctx, topColor, bottomColor) {
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 300);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);

  return gradient;
}

const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart, args, pluginOptions) {
    if (!pluginOptions.text) {
      return;
    }

    const { ctx, chartArea } = chart;
    const colors = chartPalette();
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.fillStyle = colors.text;
    ctx.font = "800 26px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pluginOptions.text, centerX, centerY);
    ctx.restore();
  },
};

function updateDashboardCharts() {
  if (!dashboardCharts.length) {
    return;
  }

  const colors = chartPalette();

  dashboardCharts.forEach((chart) => {
    if (chart.canvas.id === "trafficChart") {
      chart.data.datasets[0].backgroundColor = [colors.primary, colors.accent, "#e6c878", colors.line];
      chart.data.datasets[0].borderColor = colors.surface;
      chart.options.plugins.tooltip.backgroundColor = colors.text;
      chart.options.plugins.tooltip.bodyColor = colors.surface;
      chart.options.plugins.tooltip.titleColor = colors.surface;
    } else {
      chart.options.scales.x.ticks.color = colors.muted;
      chart.options.scales.y.grid.color = colors.line;
      chart.options.scales.y.ticks.color = colors.muted;
      chart.options.plugins.tooltip.backgroundColor = colors.text;
      chart.options.plugins.tooltip.bodyColor = colors.surface;
      chart.options.plugins.tooltip.titleColor = colors.surface;

      if (chart.canvas.id === "salesChart") {
        chart.data.datasets[0].borderColor = colors.primary;
        chart.data.datasets[0].backgroundColor = colors.primarySoft;
        chart.data.datasets[0].pointBackgroundColor = colors.surface;
        chart.data.datasets[0].pointBorderColor = colors.accent;
      }

      if (chart.canvas.id === "revenueChart") {
        chart.data.datasets[0].backgroundColor = createGradient(chart.ctx, colors.primary, colors.accent);
      }
    }

    chart.update();
  });
}

function initCharts() {
  if (!window.Chart || !chartCanvases.revenue || !chartCanvases.traffic || !chartCanvases.sales) {
    return;
  }

  const colors = chartPalette();
  const revenueContext = chartCanvases.revenue.getContext("2d");

  dashboardCharts.push(
    new Chart(revenueContext, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          data: [48, 62, 54, 76, 68, 88, 72],
          backgroundColor: createGradient(revenueContext, colors.primary, colors.accent),
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: sharedChartOptions(),
    })
  );

  dashboardCharts.push(
    new Chart(chartCanvases.traffic, {
      type: "doughnut",
      data: {
        labels: ["Direct", "Search", "Social", "Referral"],
        datasets: [{
          data: [42, 26, 18, 14],
          backgroundColor: [colors.primary, colors.accent, "#e6c878", colors.line],
          borderColor: colors.surface,
          borderWidth: 4,
          hoverOffset: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          centerText: {
            text: "68%",
          },
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: colors.text,
            bodyColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 1,
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}%`,
            },
            titleColor: colors.surface,
          },
        },
      },
      plugins: [centerTextPlugin],
    })
  );

  dashboardCharts.push(
    new Chart(chartCanvases.sales, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        datasets: [{
          data: [42, 52, 47, 66, 63, 82, 77, 91],
          borderColor: colors.primary,
          backgroundColor: colors.primarySoft,
          borderWidth: 4,
          fill: true,
          pointBackgroundColor: colors.surface,
          pointBorderColor: colors.accent,
          pointBorderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.36,
        }],
      },
      options: sharedChartOptions(),
    })
  );
}

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

  updateDashboardCharts();
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
initCharts();

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
