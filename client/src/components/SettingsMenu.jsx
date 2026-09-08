import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { LANGUAGES } from "../i18n/translations.js";
import { applyTheme, resolveTheme } from "../theme.js";

export default function SettingsMenu({ instagram }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    typeof document === "undefined"
      ? "light"
      : document.documentElement.getAttribute("data-theme") || "light"
  );
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setTheme(resolveTheme());
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onScroll() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const dark = theme === "dark";

  return (
    <div className="settings" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`settings-btn ${open ? "is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={t("a11y.settings")}
        title={t("a11y.settings")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.49.49 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
          />
        </svg>
      </button>

      <div className={`settings-menu ${open ? "is-open" : ""}`} role="dialog" aria-label={t("a11y.settings")}>
        <p className="settings-label">{t("a11y.language")}</p>
        <div className="settings-langs">
          {LANGUAGES.map((entry) => (
            <button
              key={entry.code}
              type="button"
              className={entry.code === lang ? "is-on" : ""}
              onClick={() => setLang(entry.code)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <a
          className="settings-row"
          href={instagram || "https://www.instagram.com/marsilabitri.art/"}
          target="_blank"
          rel="noreferrer"
        >
          {t("a11y.instagram")}
        </a>

        <button type="button" className="settings-row" onClick={toggleTheme}>
          {dark ? t("a11y.lightMode") : t("a11y.darkMode")}
        </button>
      </div>
    </div>
  );
}
