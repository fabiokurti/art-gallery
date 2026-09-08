import { useEffect, useState } from "react";
import { deleteInquiry, getInquiries } from "../../api.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";

export default function StudioMessages() {
  const { t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getInquiries()
      .then((entries) => setMessages([...entries].reverse()))
      .catch((err) => setError(err.message));
  }, []);

  async function remove(id) {
    if (!window.confirm(t("studio.confirmDeleteMessage"))) return;

    try {
      await deleteInquiry(id);
      setMessages((current) => current.filter((entry) => entry.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="studio-section">
      <div className="studio-head">
        <div>
          <p className="eyebrow">{t("studio.brand")}</p>
          <h1>{t("studio.messages")}</h1>
          <p className="page-sub">{t("studio.messagesLede")}</p>
        </div>
      </div>

      {error && <p className="status error">{error}</p>}

      {!messages.length && !error ? (
        <p className="muted">{t("studio.messagesEmpty")}</p>
      ) : (
        <ul className="studio-messages">
          {messages.map((entry) => (
            <li key={entry.id} className="studio-message">
              <div className="studio-message-head">
                <div>
                  <strong>{entry.name}</strong>
                  <a href={`mailto:${entry.email}`}>{entry.email}</a>
                  {entry.artworkId ? (
                    <span>
                      {t("studio.aboutWork")} {entry.artworkId}
                    </span>
                  ) : null}
                </div>
                <time dateTime={entry.createdAt}>
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </div>
              <p>{entry.message}</p>
              <button type="button" className="studio-link" onClick={() => remove(entry.id)}>
                {t("studio.deleteMessage")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
