import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArtwork } from "../api.js";
import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { artworkSpecs } from "../specs.js";

export default function ArtworkDetail() {
  const { id } = useParams();
  const { t, localize } = useI18n();
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setArtwork(null);
    getArtwork(id)
      .then(setArtwork)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <p className="muted">{error}</p>;
  }

  if (!artwork) {
    return <p className="muted">{t("detail.loading")}</p>;
  }

  const title = localize(artwork.title);
  const extras = (artwork.images || []).slice(1);
  const specs = artworkSpecs(artwork, t)
    .concat(artwork.available ? [] : [t("detail.sold")])
    .join(" · ");

  return (
    <article className="detail">
      <Link className="back" to="/works">
        {t("detail.back")}
      </Link>
      <div className="detail-hero">
        <img src={artwork.image} alt={title} />
      </div>
      <div className="detail-meta">
        <h1>{title}</h1>
        {localize(artwork.description) && <p>{localize(artwork.description)}</p>}
        {specs && <p className="detail-specs">{specs}</p>}
      </div>
      {extras.length > 0 && (
        <div className="more-grid">
          {extras.map((src, index) => (
            <Reveal key={src} delay={index * 80}>
              <img src={src} alt={`${title} ${index + 2}`} />
            </Reveal>
          ))}
        </div>
      )}
    </article>
  );
}
