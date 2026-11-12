(() => {
  const key = "industrylab.theme";
  const root = document.documentElement;
  const system = matchMedia("(prefers-color-scheme: dark)");
  let choice;

  try {
    const saved = localStorage.getItem(key);
    if (saved === "light" || saved === "dark") choice = saved;
  } catch {
    // The switch also works when the browser blocks storage.
  }

  function applyTheme() {
    const theme = choice ?? (system.matches ? "dark" : "light");
    root.dataset.theme = theme;
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.setAttribute("aria-pressed", String(theme === "dark"));
  }

  applyTheme();
  system.addEventListener("change", applyTheme);
  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    applyTheme();
    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      choice = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(key, choice);
      } catch {
        // Retain the selection in this tab.
      }
      applyTheme();
    });
  });
})();
