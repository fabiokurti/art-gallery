// The line under a painting's title, e.g. "Acrylic on canvas · Triptych ·
// 3 × 50 × 110 cm". Medium and form are stored as keys and translated here, so
// adding a painting in the admin never means typing the same words three
// times. Empty fields simply drop out.
export function artworkSpecs(artwork, t) {
  return [
    artwork.year,
    artwork.medium ? t(`medium.${artwork.medium}`) : "",
    artwork.form ? t(`form.${artwork.form}`) : "",
    artwork.dimensions,
  ].filter(Boolean);
}
