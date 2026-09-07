import { useEffect, useState } from "react";
import { getArtworks } from "../api.js";
import ArtworkCard from "../components/ArtworkCard.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function Works() {
  const { t } = useI18n();
  const [works, setWorks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArtworks()
      .then(setWorks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <p className="muted">{error}</p>;
  }

  return (
    <>
      <header className="page-head">
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
            delay={(index % 3) * 70}
          />
        ))}
      </section>
    </>
  );
}
