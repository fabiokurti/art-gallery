import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllArtworks, reorderArtworks } from "../../api.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";

export default function StudioWorks() {
  const { t, localize } = useI18n();
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllArtworks()
      .then(setArtworks)
      .catch((err) => setError(err.message));
  }, []);

  async function move(index, step) {
    const next = index + step;
    if (next < 0 || next >= artworks.length) return;

    const ids = artworks.map((work) => work.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];

    try {
      setArtworks(await reorderArtworks(ids));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="studio-section">
      <div className="studio-head">
        <div>
          <p className="eyebrow">{t("studio.brand")}</p>
          <h1>{t("studio.works")}</h1>
        </div>
        <Link className="btn" to="/studio/new">
          {t("studio.new")}
        </Link>
      </div>

      {error && <p className="status error">{error}</p>}

      {!artworks.length && !error ? (
        <p className="muted">{t("studio.empty")}</p>
      ) : (
        <ul className="studio-list">
          {artworks.map((work, index) => (
            <li key={work.id} className="studio-row">
              <img src={work.image} alt="" />
              <div className="studio-row-copy">
                <Link to={`/studio/${work.id}`}>{localize(work.title) || work.id}</Link>
                <span>
                  {work.published === false ? t("studio.draft") : t("studio.live")}
                  {work.featured ? ` · ${t("studio.cover")}` : ""}
                </span>
              </div>
              <div className="studio-row-actions">
                <button type="button" className="studio-link" onClick={() => move(index, -1)} disabled={index === 0}>
                  {t("studio.up")}
                </button>
                <button
                  type="button"
                  className="studio-link"
                  onClick={() => move(index, 1)}
                  disabled={index === artworks.length - 1}
                >
                  {t("studio.down")}
                </button>
                <Link className="studio-link" to={`/studio/${work.id}`}>
                  {t("studio.edit")}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
