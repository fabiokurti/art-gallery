import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function Footer({ artist }) {
  const { t, localize } = useI18n();
  const location = localize(artist?.location);

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <p className="footer-logo">marsila bitri art</p>
          <p className="footer-note">
            {t("home.eyebrow")}
            {location ? ` · ${location}` : ""}
          </p>
        </div>
        <nav className="footer-links">
          <Link to="/works">{t("footer.works")}</Link>
          <Link to="/about">{t("footer.about")}</Link>
          <a href="#contact">{t("nav.contacts")}</a>
        </nav>
        <div className="footer-links">
          {artist?.email && <a href={`mailto:${artist.email}`}>{artist.email}</a>}
          {artist?.instagram && (
            <a href={artist.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
        </div>
      </div>
      <p className="footer-base">{t("footer.rights", { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
