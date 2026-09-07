import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArtist, getArtworks } from "../api.js";
import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { artworkSpecs } from "../specs.js";

export default function Home() {
  const { t, localize } = useI18n();
  const [artist, setArtist] = useState(null);
  const [works, setWorks] = useState([]);

  useEffect(() => {
    getArtist().then(setArtist).catch(() => {});
    getArtworks().then(setWorks).catch(() => {});
  }, []);

  const cover = works.find((work) => work.featured) || works[0];
  const selected = works.filter((work) => work.id !== cover?.id).slice(0, 4);
  const location = localize(artist?.location);
  const statement = localize(artist?.statement) || t("home.statement");
  const statements = [artist?.statement?.en, artist?.statement?.sq, artist?.statement?.it].filter(Boolean);
  const marquee = [...statements, ...statements];

  return (
    <>
      <section className="hero">
        {cover && <img className="hero-wash" src={cover.image} alt="" />}

        <p className="hero-spine" aria-hidden="true">
          Marsila Bitri Art
        </p>

        <div className="hero-copy">
          <p className="eyebrow">
            {t("home.eyebrow")}
            {location ? ` · ${location}` : ""}
          </p>
          <h1 className="hero-title">{statement}</h1>
          <p className="hero-lede">{localize(artist?.intro)}</p>
          <div className="hero-actions">
            <Link className="btn" to="/works">
              {t("home.viewWorks")}
            </Link>
            <Link className="btn ghost" to="/about">
              {t("home.aboutArtist")}
            </Link>
          </div>
        </div>

        <div className="hero-art">
          {cover && (
            <Link to={`/works/${cover.id}`} className="hero-frame">
              <span className="hero-index">01</span>
              <img src={cover.image} alt={localize(cover.title)} />
              <span className="hero-caption">
                <em>{t("home.nowShowing")}</em>
                {localize(cover.title)}
              </span>
            </Link>
          )}
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>{t("home.scroll")}</span>
          <i />
        </div>
      </section>

      {marquee.length > 0 && (
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {marquee.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </div>
        </div>
      )}

      <section className="strip">
        <div>
          <strong>{works.length || "—"}</strong>
          <span>{t("home.paintingsOnView")}</span>
        </div>
        <div>
          <strong>{location || "—"}</strong>
          <span>{t("home.studio")}</span>
        </div>
        <div>
          <strong>{t("home.enquiries")}</strong>
          <span>{t("home.openForViewings")}</span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("home.selected")}</p>
            <h2>{t("home.aFewPaintings")}</h2>
            <p className="page-sub">{t("home.selectedLede")}</p>
          </div>
          <Link className="section-link" to="/works">
            {t("home.allWorks")}
          </Link>
        </div>

        <div className="mosaic">
          {selected.map((work, index) => (
            <Reveal key={work.id} delay={index * 80} className={index === 0 ? "mosaic-lead" : ""}>
              <Link to={`/works/${work.id}`} className="tile">
                <div className="tile-frame">
                  <img src={work.image} alt={localize(work.title)} loading="lazy" />
                  <span className="tile-no">{String(index + 2).padStart(2, "0")}</span>
                </div>
                <h3>{localize(work.title)}</h3>
                {artworkSpecs(work, t).length > 0 && (
                  <p className="tile-specs">{artworkSpecs(work, t).join(" · ")}</p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="quote-band">
          <span className="quote-mark" aria-hidden="true">
            M
          </span>
          <p>{statement}</p>
          <span>Marsila Bitri</span>
        </section>
      </Reveal>
    </>
  );
}
