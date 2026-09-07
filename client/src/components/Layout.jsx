import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getArtist } from "../api.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import BackToTop from "./BackToTop.jsx";
import ContactBlock from "./ContactBlock.jsx";
import Footer from "./Footer.jsx";
import LangSwitcher from "./LangSwitcher.jsx";
import ScrollProgress from "./ScrollProgress.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

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
  const onAbout = pathname.startsWith("/about");
  const heroMode = onAbout && !pastHero;

  useEffect(() => {
    getArtist().then(setArtist).catch(() => {});
  }, []);

  useEffect(() => {
    setCollapsed(false);
    setPastHero(false);
  }, [pathname]);

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
    <div className={`site ${onAbout ? "site-about" : ""}`}>
      <ScrollToTop />
      <ScrollProgress />

      <header
        className={`nav ${heroMode ? "is-hero" : ""} ${lifted ? "is-lifted" : ""} ${
          collapsed ? "is-hidden" : ""
        }`}
      >
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

        <NavLink to="/" className="logo">
          <span>marsila bitri art</span>
        </NavLink>

        <div className="nav-actions">
          <LangSwitcher />
          <a
            className="social"
            href={artist?.instagram || "https://instagram.com/"}
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5.2A3.8 3.8 0 1 0 15.8 12 3.8 3.8 0 0 0 12 8.2zm5.15-2.35a.9.9 0 1 0 .9.9.9.9 0 0 0-.9-.9zM12 9.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <button
        type="button"
        className={`mark ${collapsed ? "is-in" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("a11y.backToTop")}
        tabIndex={collapsed ? 0 : -1}
      >
        <span>M</span>
      </button>

      <main className="main">
        <Outlet />
      </main>

      <ContactBlock artist={artist} />
      <Footer artist={artist} />
      <BackToTop />
    </div>
  );
}
