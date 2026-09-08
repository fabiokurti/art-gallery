import { Link } from "react-router-dom";
import { artistEmails } from "../artistEmails.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function Footer({ artist }) {
  const { t, localize } = useI18n();
  const location = localize(artist?.location);
  const emails = artistEmails(artist);

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <p className="footer-logo">Marsila Bitri Art</p>
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
          {emails.map((address) => (
            <a key={address} href={`mailto:${address}`}>
              {address}
            </a>
          ))}
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
