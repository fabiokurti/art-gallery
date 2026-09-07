import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArtist, getArtworks } from "../api.js";
import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function Home() {
  const { t, localize } = useI18n();
  const [artist, setArtist] = useState(null);
  const [works, setWorks] = useState([]);

  useEffect(() => {
    getArtist().then(setArtist).catch(() => {});
    getArtworks().then(setWorks).catch(() => {});
  }, []);

  const cover = works.find((work) => work.featured) || works[0];
  const selected = works.filter((work) => work.id !== cover?.id).slice(0, 3);
  const location = localize(artist?.location);
  const statement = localize(artist?.statement) || t("home.statement");

  return (
    <>
      <section className="hero">
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
              <img src={cover.image} alt={localize(cover.title)} />
              <span className="hero-caption">{localize(cover.title)}</span>
            </Link>
          )}
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>{t("home.scroll")}</span>
          <i />
        </div>
      </section>

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
          </div>
          <Link className="section-link" to="/works">
            {t("home.allWorks")}
          </Link>
        </div>
        <div className="tiles">
          {selected.map((work, index) => (
            <Reveal key={work.id} delay={index * 90}>
              <Link to={`/works/${work.id}`} className="tile">
                <div className="tile-frame">
                  <img src={work.image} alt={localize(work.title)} loading="lazy" />
                </div>
                <h3>{localize(work.title)}</h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="quote-band">
          <p>{statement}</p>
          <span>Marsila Bitri</span>
        </section>
      </Reveal>
    </>
  );
}
