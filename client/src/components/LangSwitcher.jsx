import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { LANGUAGES } from "../i18n/translations.js";

export default function LangSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const current = LANGUAGES.find((entry) => entry.code === lang) || LANGUAGES[0];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    // The header slides away on scroll, so an open popup would ride off with it.
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

  function choose(code) {
    setLang(code);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="lang" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`lang-btn ${open ? "is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={t("a11y.language")}
        title={t("a11y.language")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{current.label}</span>
      </button>

      <div className={`lang-menu ${open ? "is-open" : ""}`} role="menu" aria-label={t("a11y.language")}>
        {LANGUAGES.map((entry) => (
          <button
            key={entry.code}
            type="button"
            role="menuitemradio"
            aria-checked={entry.code === lang}
            className={entry.code === lang ? "is-on" : ""}
            onClick={() => choose(entry.code)}
            tabIndex={open ? 0 : -1}
          >
            <em>{entry.label}</em>
            {entry.name}
          </button>
        ))}
      </div>
    </div>
  );
}
