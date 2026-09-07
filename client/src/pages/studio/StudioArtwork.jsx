import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createArtwork,
  deleteArtwork,
  getAllArtworks,
  updateArtwork,
  uploadPhotos,
} from "../../api.js";
import { LANGUAGES } from "../../i18n/translations.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";

const MEDIUMS = ["", "acrylic", "oil", "watercolour", "mixed"];
const FORMS = ["", "triptych", "diptych"];

function emptyText() {
  return { en: "", sq: "", it: "" };
}

function asText(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { en: value.en || "", sq: value.sq || "", it: value.it || "" };
  }
  return emptyText();
}

function blankForm() {
  return {
    title: emptyText(),
    description: emptyText(),
    year: "",
    medium: "acrylic",
    form: "",
    dimensions: "",
    available: true,
    published: true,
    featured: false,
    images: [],
  };
}

export default function StudioArtwork() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState(blankForm);
  const [ready, setReady] = useState(isNew);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) {
      setForm(blankForm());
      setReady(true);
      setMissing(false);
      return;
    }

    setReady(false);
    getAllArtworks()
      .then((artworks) => {
        const artwork = artworks.find((work) => work.id === id);
        if (!artwork) {
          setMissing(true);
          return;
        }

        setForm({
          title: asText(artwork.title),
          description: asText(artwork.description),
          year: artwork.year || "",
          medium: artwork.medium || "",
          form: artwork.form || "",
          dimensions: artwork.dimensions || "",
          available: artwork.available !== false,
          published: artwork.published !== false,
          featured: Boolean(artwork.featured),
          images: Array.isArray(artwork.images) ? artwork.images : [],
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setReady(true));
  }, [id, isNew]);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function setLocalized(name, lang, value) {
    setForm((current) => ({
      ...current,
      [name]: { ...current[name], [lang]: value },
    }));
  }

  async function onFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const { images } = await uploadPhotos(files);
      setForm((current) => ({ ...current, images: [...current.images, ...images] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function movePhoto(index, step) {
    const next = index + step;
    if (next < 0 || next >= form.images.length) return;

    const images = [...form.images];
    [images[index], images[next]] = [images[next], images[index]];
    setField("images", images);
  }

  function removePhoto(index) {
    setField(
      "images",
      form.images.filter((_, current) => current !== index)
    );
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");

    try {
      if (isNew) {
        const created = await createArtwork(form);
        setStatus(t("studio.saved"));
        navigate(`/studio/${created.id}`, { replace: true });
      } else {
        await updateArtwork(id, form);
        setStatus(t("studio.saved"));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(t("studio.confirmDelete"))) return;

    setSaving(true);
    setError("");

    try {
      await deleteArtwork(id);
      navigate("/studio", { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (!ready) {
    return <p className="muted">{t("studio.loading")}</p>;
  }

  if (missing) {
    return (
      <section className="studio-section">
        <p className="status error">{t("studio.missing")}</p>
        <Link className="studio-link" to="/studio">
          {t("studio.back")}
        </Link>
      </section>
    );
  }

  return (
    <form className="studio-form" onSubmit={submit}>
      <div className="studio-head">
        <div>
          <Link className="studio-link" to="/studio">
            {t("studio.back")}
          </Link>
          <h1>{isNew ? t("studio.newTitle") : t("studio.editTitle")}</h1>
        </div>
        <button className="btn" type="submit" disabled={saving || uploading}>
          {saving ? t("studio.saving") : t("studio.save")}
        </button>
      </div>

      <fieldset className="studio-block">
        <legend>{t("studio.photos")}</legend>
        <p className="page-sub">{t("studio.photoHint")}</p>
        <label className="studio-file">
          <span>{uploading ? t("studio.uploading") : t("studio.addPhotos")}</span>
          <input type="file" accept="image/*" multiple onChange={onFiles} disabled={uploading} />
        </label>
        {form.images.length > 0 && (
          <ul className="studio-photos">
            {form.images.map((src, index) => (
              <li key={src}>
                <img src={src} alt="" />
                {index === 0 && <em>{t("studio.cover")}</em>}
                <div>
                  <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0}>
                    {t("studio.up")}
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(index, 1)}
                    disabled={index === form.images.length - 1}
                  >
                    {t("studio.down")}
                  </button>
                  <button type="button" onClick={() => removePhoto(index)}>
                    {t("studio.removePhoto")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="studio-block">
        <legend>{t("studio.title")}</legend>
        {LANGUAGES.map((entry) => (
          <label key={entry.code}>
            {entry.name}
            <input
              value={form.title[entry.code]}
              onChange={(event) => setLocalized("title", entry.code, event.target.value)}
            />
          </label>
        ))}
      </fieldset>

      <fieldset className="studio-block">
        <legend>{t("studio.description")}</legend>
        {LANGUAGES.map((entry) => (
          <label key={entry.code}>
            {entry.name}
            <textarea
              value={form.description[entry.code]}
              onChange={(event) => setLocalized("description", entry.code, event.target.value)}
            />
          </label>
        ))}
      </fieldset>

      <fieldset className="studio-block studio-meta">
        <legend>{t("studio.details")}</legend>
        <label>
          {t("studio.year")}
          <input value={form.year} onChange={(event) => setField("year", event.target.value)} />
        </label>
        <label>
          {t("studio.medium")}
          <select value={form.medium} onChange={(event) => setField("medium", event.target.value)}>
            {MEDIUMS.map((value) => (
              <option key={value || "none"} value={value}>
                {value ? t(`medium.${value}`) : t("studio.none")}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("studio.form")}
          <select value={form.form} onChange={(event) => setField("form", event.target.value)}>
            {FORMS.map((value) => (
              <option key={value || "none"} value={value}>
                {value ? t(`form.${value}`) : t("studio.none")}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("studio.dimensions")}
          <input
            value={form.dimensions}
            onChange={(event) => setField("dimensions", event.target.value)}
            placeholder="70 × 100 cm"
          />
        </label>
        <label className="studio-check">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => setField("published", event.target.checked)}
          />
          {t("studio.published")}
        </label>
        <label className="studio-check">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(event) => setField("available", event.target.checked)}
          />
          {t("studio.available")}
        </label>
        <label className="studio-check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => setField("featured", event.target.checked)}
          />
          {t("studio.featured")}
        </label>
      </fieldset>

      {status && <p className="status">{status}</p>}
      {error && <p className="status error">{error}</p>}

      <div className="studio-form-actions">
        <button className="btn" type="submit" disabled={saving || uploading}>
          {saving ? t("studio.saving") : t("studio.save")}
        </button>
        {!isNew && (
          <button className="btn ghost" type="button" onClick={remove} disabled={saving}>
            {t("studio.delete")}
          </button>
        )}
      </div>
    </form>
  );
}
