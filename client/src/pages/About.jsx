import { useEffect, useState } from "react";
import { getArtist } from "../api.js";
import Reveal from "../components/Reveal.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function About() {
  const { t, localize } = useI18n();
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    getArtist().then(setArtist).catch(() => {});
  }, []);

  const bio = localize(artist?.bio);
  const paragraphs = Array.isArray(bio) ? bio : [bio].filter(Boolean);

  return (
    <>
      <section className="about-hero">
        <img src="/works/horizon.jpg" alt="" />
        <p className="about-quote">{localize(artist?.statement) || t("home.statement")}</p>
      </section>
      <section className="about-copy">
        <h1>Marsila Bitri</h1>
        {paragraphs.map((paragraph, index) => (
          <Reveal key={paragraph.slice(0, 40)} delay={index * 60}>
            <p>{paragraph}</p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
