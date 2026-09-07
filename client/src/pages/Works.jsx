import { useEffect, useRef, useState } from "react";
import { getArtworks } from "../api.js";
import ArtworkCard from "../components/ArtworkCard.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { peekArtworks, rememberWorksScroll } from "../worksSession.js";

export default function Works() {
  const { t } = useI18n();
  const cached = peekArtworks();
  const returning = useRef(Boolean(cached));
  const [works, setWorks] = useState(cached || []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    getArtworks()
      .then(setWorks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => rememberWorksScroll(window.scrollY);
  }, []);

  if (error) {
    return <p className="muted">{error}</p>;
  }

  return (
    <>
      <header className={`page-head ${returning.current ? "is-static" : ""}`}>
        <p className="eyebrow">{t("nav.works")}</p>
        <h1>{t("works.title")}</h1>
        <p className="page-sub">{t("works.lede")}</p>
        {!loading && <p className="page-count">{t("works.count", { count: works.length })}</p>}
      </header>

      <section className="feed">
        {loading &&
          [0, 1].map((n) => (
            <div className="work" key={n}>
              <div className="skeleton" />
            </div>
          ))}
        {works.map((artwork, index) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            index={index + 1}
            total={works.length}
            delay={returning.current ? 0 : (index % 3) * 70}
            instant={returning.current}
          />
        ))}
      </section>
    </>
  );
}
