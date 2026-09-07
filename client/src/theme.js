const STORAGE_KEY = "mb-theme";

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function resolveTheme() {
  const stored = read(STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing can block storage; the theme still applies for this visit.
  }
}
