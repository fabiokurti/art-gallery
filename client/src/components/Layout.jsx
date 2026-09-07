import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getArtist } from "../api.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import BackToTop from "./BackToTop.jsx";
import ContactBlock from "./ContactBlock.jsx";
import Footer from "./Footer.jsx";
import ScrollProgress from "./ScrollProgress.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import SettingsMenu from "./SettingsMenu.jsx";

function scrollToContact(event) {
  event.preventDefault();
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

export default function Layout() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [artist, setArtist] = useState(null);
  const [lifted, setLifted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const onAbout = pathname.startsWith("/about");
  const onHome = pathname === "/";
  const heroMode = (onAbout || onHome) && !pastHero && !menuOpen;

  useEffect(() => {
    getArtist().then(setArtist).catch(() => {});
  }, []);

  useEffect(() => {
    setCollapsed(false);
    setPastHero(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    function onKey(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    let frame = 0;
    let lastY = Math.max(0, window.scrollY);
    let travel = 0;
    let isLifted = lastY > 88;
    let isCollapsed = false;
    let isPastHero = false;

    function syncPosition() {
      lastY = Math.max(0, window.scrollY);
      travel = 0;
      isCollapsed = false;
      setCollapsed(false);
    }

    function read() {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      const nextLifted = isLifted ? y > 24 : y > 88;
      if (nextLifted !== isLifted) {
        isLifted = nextLifted;
        setLifted(nextLifted);
      }

      const nextPastHero = isPastHero
        ? y > window.innerHeight * 0.7
        : y > window.innerHeight * 0.85;
      if (nextPastHero !== isPastHero) {
        isPastHero = nextPastHero;
        setPastHero(nextPastHero);
      }

      if (y < 80) {
        travel = 0;
        if (isCollapsed) {
          isCollapsed = false;
          setCollapsed(false);
        }
        return;
      }

      // Phone scroll fires tiny +/− ticks. Ignore those so they cannot cancel
      // a real swipe up that should bring the header back.
      if (Math.abs(delta) < 4) return;

      travel = Math.max(-160, Math.min(160, travel + delta));

      if (travel > 48 && !isCollapsed) {
        travel = 0;
        isCollapsed = true;
        setCollapsed(true);
      } else if (travel < -32 && isCollapsed) {
        travel = 0;
        isCollapsed = false;
        setCollapsed(false);
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(read);
    }

    syncPosition();
    const settle = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        syncPosition();
        window.addEventListener("scroll", onScroll, { passive: true });
      });
    });

    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <div className={`site ${onAbout || onHome ? "site-flush" : ""}`}>
      <ScrollToTop />
      <ScrollProgress />

      <header
        className={`nav ${heroMode ? "is-hero" : ""} ${lifted ? "is-lifted" : ""} ${
          collapsed && !menuOpen ? "is-hidden" : ""
        }`}
      >
        <div className="nav-lead">
          <button
            type="button"
            className={`menu-btn ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? t("a11y.closeMenu") : t("a11y.menu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <i />
            <i />
            <i />
          </button>
          <nav className="nav-menu">
            <ul className="nav-links">
              <li>
                <NavLink to="/works">{t("nav.works")}</NavLink>
              </li>
              <li>
                <NavLink to="/about">{t("nav.about")}</NavLink>
              </li>
              <li>
                <a href="#contact" onClick={scrollToContact}>
                  {t("nav.contacts")}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <NavLink to="/" className="logo">
          <span>Marsila Bitri Art</span>
        </NavLink>

        <div className="nav-actions">
          <SettingsMenu instagram={artist?.instagram} />
        </div>
      </header>

      <button
        type="button"
        className={`mark ${collapsed && !menuOpen ? "is-in" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("a11y.backToTop")}
        tabIndex={collapsed && !menuOpen ? 0 : -1}
      >
        <span>M</span>
      </button>

      <div
        className={`drawer-back ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        hidden={!menuOpen}
      />
      <aside className={`drawer ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <nav className="drawer-nav">
          <NavLink to="/works" onClick={() => setMenuOpen(false)}>
            {t("nav.works")}
          </NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>
            {t("nav.about")}
          </NavLink>
          <a
            href="#contact"
            onClick={(event) => {
              setMenuOpen(false);
              scrollToContact(event);
            }}
          >
            {t("nav.contacts")}
          </a>
        </nav>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      <ContactBlock artist={artist} />
      <Footer artist={artist} />
      <BackToTop />
    </div>
  );
}
