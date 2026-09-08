import { useCallback, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { getSession, login, logout } from "../../api.js";
import LangSwitcher from "../../components/LangSwitcher.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import { useI18n } from "../../i18n/I18nProvider.jsx";

export default function StudioLayout() {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [passwordIsSet, setPasswordIsSet] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const session = await getSession();
      setAuthed(session.authenticated);
      setPasswordIsSet(session.passwordIsSet);
    } catch {
      setAuthed(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setError("");

    try {
      await login(password);
      setPassword("");
      setAuthed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function signOut() {
    await logout().catch(() => {});
    setAuthed(false);
  }

  return (
    <div className="studio">
      <header className="studio-bar">
        <Link to="/studio" className="studio-brand">
          {t("studio.brand")}
        </Link>
        <div className="studio-bar-actions">
          {authed && (
            <>
              <Link to="/studio" className="studio-link">
                {t("studio.works")}
              </Link>
              <Link to="/studio/messages" className="studio-link">
                {t("studio.messages")}
              </Link>
            </>
          )}
          <Link to="/" className="studio-link">
            {t("studio.viewSite")}
          </Link>
          {authed && (
            <button type="button" className="studio-link" onClick={signOut}>
              {t("studio.signOut")}
            </button>
          )}
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="studio-main">
        {!ready ? (
          <p className="muted">{t("studio.loading")}</p>
        ) : authed ? (
          <Outlet />
        ) : (
          <form className="form studio-login" onSubmit={submit}>
            <p className="eyebrow">{t("studio.brand")}</p>
            <h1>{t("studio.signIn")}</h1>
            <p className="page-sub">{t("studio.loginLede")}</p>
            {!passwordIsSet && <p className="status error">{t("studio.noPassword")}</p>}
            <label>
              {t("studio.password")}
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <button className="btn" type="submit" disabled={sending || !passwordIsSet}>
              {sending ? t("studio.entering") : t("studio.enter")}
            </button>
            {error && <p className="status error">{error}</p>}
          </form>
        )}
      </main>
    </div>
  );
}
