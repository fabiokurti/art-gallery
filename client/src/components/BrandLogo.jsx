export default function BrandLogo({ className = "", variant = "auto" }) {
  // variant: auto | light | dark | hero
  const bust = "?v=3";
  const lightSrc = `${variant === "hero" ? "/logo-hero.svg" : "/logo.svg"}${bust}`;
  const darkSrc = `${variant === "hero" ? "/logo-hero.svg" : "/logo-dark.svg"}${bust}`;
  const mode = variant === "light" ? "is-light" : variant === "dark" || variant === "hero" ? "is-dark" : "is-auto";

  return (
    <span className={`brand-logo ${mode} ${className}`.trim()}>
      <img className="brand-logo-light" src={lightSrc} alt="" decoding="async" />
      <img className="brand-logo-dark" src={darkSrc} alt="" decoding="async" />
    </span>
  );
}
