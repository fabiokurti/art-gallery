import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { artworkSpecs } from "../specs.js";
import Reveal from "./Reveal.jsx";

export default function ArtworkCard({ artwork, index, total, delay = 0, instant = false }) {
  const { t, localize } = useI18n();
  const [wide, setWide] = useState(false);
  const extra = (artwork.images?.length || 0) > 1;
  const title = localize(artwork.title);
  const specs = artworkSpecs(artwork, t).join(" · ");

  function measure(event) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setWide(naturalWidth > naturalHeight);
  }

  return (
    <Reveal className={`work ${wide ? "is-wide" : ""}`} delay={delay} instant={instant}>
      <Link to={`/works/${artwork.id}`} className="work-link">
        <div className="work-frame">
          <img src={artwork.image} alt={title} loading={instant ? "eager" : "lazy"} onLoad={measure} />
          {extra && <span className="more-photo">{t("works.morePhotos")}</span>}
          <span className="work-view">{t("works.view")}</span>
        </div>
        <div className="work-caption">
          {index && (
            <span className="work-index">
              {String(index).padStart(2, "0")}
              {total ? ` / ${total}` : ""}
            </span>
          )}
          <h2 className="work-title">{title}</h2>
          {specs && <span className="work-specs">{specs}</span>}
        </div>
      </Link>
    </Reveal>
  );
}
