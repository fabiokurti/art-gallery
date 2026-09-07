import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { applyTheme, resolveTheme } from "../theme.js";

export default function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState(() =>
    typeof document === "undefined"
      ? "light"
      : document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    const current = resolveTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? t("a11y.toLight") : t("a11y.toDark")}
      title={dark ? t("a11y.lightMode") : t("a11y.darkMode")}
    >
      <span className={`theme-icon ${dark ? "is-dark" : ""}`}>
        <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.6" />
          <g strokeWidth="1.6" strokeLinecap="round">
            <line x1="12" y1="1.8" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22.2" />
            <line x1="1.8" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22.2" y2="12" />
            <line x1="4.7" y1="4.7" x2="6.3" y2="6.3" />
            <line x1="17.7" y1="17.7" x2="19.3" y2="19.3" />
            <line x1="4.7" y1="19.3" x2="6.3" y2="17.7" />
            <line x1="17.7" y1="6.3" x2="19.3" y2="4.7" />
          </g>
        </svg>
        <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.6A8.6 8.6 0 0 1 9.4 4a8.8 8.8 0 1 0 10.6 10.6z" />
        </svg>
      </span>
    </button>
  );
}
