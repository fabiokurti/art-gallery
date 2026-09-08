export const STUDIO_EMAILS = [
  "hello@marsilabitri.art",
  "contact@marsilabitri.art",
];

export function artistEmails(artist) {
  const extra = [
    ...(Array.isArray(artist?.emails) ? artist.emails : []),
    artist?.email,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return [...new Set([...STUDIO_EMAILS, ...extra])];
}
