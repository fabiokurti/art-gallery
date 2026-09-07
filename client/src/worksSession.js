// Keeps the works list and how far the visitor had scrolled, so going back
// from a painting does not refetch, replay the enter animation, or jump to the top.
let artworks = null;
let worksScroll = 0;

export function peekArtworks() {
  return artworks;
}

export function rememberArtworks(list) {
  artworks = list;
}

export function clearArtworks() {
  artworks = null;
}

export function rememberWorksScroll(y) {
  worksScroll = y;
}

export function peekedWorksScroll() {
  return worksScroll;
}
