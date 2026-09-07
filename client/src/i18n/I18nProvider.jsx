import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, LANGUAGES, translations } from "./translations.js";

const STORAGE_KEY = "mb-lang";
const CODES = LANGUAGES.map((entry) => entry.code);

const I18nContext = createContext(null);

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function detectLanguage() {
  const stored = readStored();

  if (CODES.includes(stored)) {
    return stored;
  }

  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const tag of preferred) {
    const code = String(tag || "").slice(0, 2).toLowerCase();
    if (CODES.includes(code)) {
      return code;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be blocked; the choice still holds for this visit.
    }
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations[DEFAULT_LANGUAGE];
      let text = dict[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(value));
        }
      }

      return text;
    },
    [lang]
  );

  // Content from the API arrives as { en, sq, it }; plain strings pass through
  // so untranslated fields keep working. A painting can be added in one
  // language and translated later, so an empty field falls back to any
  // language that does have text rather than showing nothing.
  const localize = useCallback(
    (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "object") {
        for (const code of [lang, DEFAULT_LANGUAGE, ...CODES]) {
          const text = value[code];
          if (Array.isArray(text) ? text.length : text) {
            return text;
          }
        }
        return "";
      }

      return value;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, localize }), [lang, t, localize]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
