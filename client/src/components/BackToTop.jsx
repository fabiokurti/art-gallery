import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    let active = false;

    function read() {
      frame = 0;
      const limit = window.innerHeight * 0.9;
      const next = active ? window.scrollY > limit * 0.8 : window.scrollY > limit;

      if (next !== active) {
        active = next;
        setVisible(next);
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(read);
    }

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      className={`to-top ${visible ? "is-in" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("a11y.backToTop")}
    >
      ↑
    </button>
  );
}
