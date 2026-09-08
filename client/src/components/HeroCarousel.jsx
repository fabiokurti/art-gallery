import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";
import BrandLogo from "./BrandLogo.jsx";

const INTERVAL = 7000;
const LOGO_SLIDE = { id: "__logo__", kind: "logo" };

function buildSlides(works) {
  const paintings = works.slice(0, 7);
  if (!paintings.length) return [LOGO_SLIDE];
  if (paintings.length === 1) return [paintings[0], LOGO_SLIDE];
  return [paintings[0], LOGO_SLIDE, ...paintings.slice(1)].slice(0, 8);
}

export default function HeroCarousel({ works, eyebrow, statement, lede }) {
  const { t, localize } = useI18n();
  const slides = buildSlides(works);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState(null);
  const current = slides[index];
  const logoSlide = current?.kind === "logo";

  useEffect(() => {
    setIndex(0);
  }, [works.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, INTERVAL);

    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  function go(next) {
    if (!slides.length) return;
    setIndex((value) => (value + next + slides.length) % slides.length);
  }

  function onTouchStart(event) {
    setTouchX(event.changedTouches[0].clientX);
  }

  function onTouchEnd(event) {
    if (touchX == null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    setTouchX(null);
    if (delta > 48) go(-1);
    if (delta < -48) go(1);
  }

  return (
    <section
      className={`hero ${logoSlide ? "is-logo" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-slides" aria-hidden="true">
        {slides.map((work, slideIndex) => (
          <div
            key={work.id}
            className={`hero-slide ${work.kind === "logo" ? "is-brand" : ""} ${
              slideIndex === index ? "is-on" : ""
            }`}
          >
            {work.kind === "logo" ? (
              <div className="hero-brand">
                <BrandLogo variant="hero" />
              </div>
            ) : (
              <img src={work.image} alt="" />
            )}
          </div>
        ))}
      </div>

      {!logoSlide && (
        <div className="hero-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="hero-title">{statement}</h1>
          {lede && <p className="hero-lede">{lede}</p>}
          <div className="hero-actions">
            <Link className="btn" to="/works">
              {t("home.viewWorks")}
            </Link>
            <Link className="btn ghost" to="/about">
              {t("home.aboutArtist")}
            </Link>
          </div>
        </div>
      )}

      {current && (
        <div className="hero-bar">
          {logoSlide ? (
            <div className="hero-caption">
              <em>{t("home.studio")}</em>
              <strong>Marsila Bitri Art</strong>
              <span>
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <Link to={`/works/${current.id}`} className="hero-caption">
              <em>{t("home.nowShowing")}</em>
              <strong>{localize(current.title)}</strong>
              <span>
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </Link>
          )}

          {slides.length > 1 && (
            <div className="hero-controls">
              <button type="button" onClick={() => go(-1)} aria-label={t("a11y.prevPainting")}>
                ←
              </button>
              <div className="hero-dots">
                {slides.map((work, slideIndex) => (
                  <button
                    key={work.id}
                    type="button"
                    className={slideIndex === index ? "is-on" : ""}
                    aria-label={work.kind === "logo" ? "Marsila Bitri Art" : localize(work.title)}
                    aria-current={slideIndex === index ? "true" : undefined}
                    onClick={() => setIndex(slideIndex)}
                  />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label={t("a11y.nextPainting")}>
                →
              </button>
            </div>
          )}
        </div>
      )}

      {slides.length > 1 && (
        <div className="hero-thumbs" aria-hidden="true">
          {slides.map((work, slideIndex) => (
            <button
              key={work.id}
              type="button"
              className={`hero-thumb ${work.kind === "logo" ? "is-brand" : ""} ${
                slideIndex === index ? "is-on" : ""
              }`}
              onClick={() => setIndex(slideIndex)}
              tabIndex={-1}
            >
              {work.kind === "logo" ? <span className="hero-thumb-m">M</span> : <img src={work.image} alt="" />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
