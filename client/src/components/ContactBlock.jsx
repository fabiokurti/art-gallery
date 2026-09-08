import { useState } from "react";
import { sendInquiry } from "../api.js";
import { artistEmails } from "../artistEmails.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function ContactBlock({ artist }) {
  const { t } = useI18n();
  const emails = artistEmails(artist);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setSending(true);

    try {
      await sendInquiry(form);
      setStatus(t("contact.thanks"));
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-intro">
        <p className="eyebrow">{t("nav.contacts")}</p>
        <h2>{t("contact.title")}</h2>
        <p className="page-sub">
          {t("contact.lede")}
          {emails.length > 0 ? ` ${t("contact.emailHint")}` : ""}
        </p>
        {emails.length > 0 && (
          <div className="contact-mails">
            {emails.map((address) => (
              <a key={address} className="contact-mail" href={`mailto:${address}`}>
                {address}
              </a>
            ))}
          </div>
        )}
      </div>
      <form className="form" onSubmit={submit}>
        <label>
          {t("contact.name")}
          <input name="name" value={form.name} onChange={update} required />
        </label>
        <label>
          {t("contact.email")}
          <input name="email" type="email" value={form.email} onChange={update} required />
        </label>
        <label>
          {t("contact.message")}
          <textarea name="message" value={form.message} onChange={update} required />
        </label>
        <button className="btn" type="submit" disabled={sending}>
          {sending ? t("contact.sending") : t("contact.send")}
        </button>
        {status && <p className="status">{status}</p>}
        {error && <p className="status error">{error}</p>}
      </form>
    </section>
  );
}
