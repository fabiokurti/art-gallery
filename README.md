# marsila bitri art

Artist site for **Marsila Bitri** — React (Vite) frontend and Node.js (Express) API.

The works page is modeled on a quiet, single-column studio feed: large images, scroll reveals, a slow zoom on hover, and a yellow **more photo** mark.

## Run

```bash
npm install
npm run install:all
npm run dev
```

- Site: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000/api](http://localhost:4000/api)

## Pages

| Path | Content |
| ---- | ------- |
| `/` | Home — statement, selected paintings, studio details |
| `/works` | Works — one painting at a time |
| `/works/:id` | Extra photographs of a piece |
| `/about` | Artist statement |
| `#contact` | Inquiry form on every page |

## Languages

English, Albanian and Italian. The header button shows the current code (`EN`)
and opens a popup listing the languages by name; it closes on selection, on
Escape, on a click outside, or when the page scrolls. The choice is saved in
`localStorage`; on a first visit the browser's preferred language decides.
Interface text lives in `client/src/i18n/translations.js`.

Text that belongs to the artist (statement, biography, painting titles and
descriptions) is stored per language in `server/src/data.js` and served as
`{ en, sq, it }` objects, so the client can switch without refetching:

```js
title: { en: "Seated Figure", sq: "Figurë e ulur", it: "Figura seduta" }
```

Adding a language means adding its code to `LANGUAGES` in the same translations
file and filling in the matching keys and data fields.

## Theme

Light and dark, toggled with the sun/moon button in the header. It follows the
system preference until the visitor chooses, then remembers the choice. An
inline script in `client/index.html` applies the theme before first paint so the
page never flashes the wrong one. Colors are CSS variables in
`client/src/index.css`: `:root` for light, `[data-theme="dark"]` for dark.

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/artist` | Studio name and bio |
| GET | `/api/artworks` | All works |
| GET | `/api/artworks/:id` | One work and extra images |
| POST | `/api/inquiries` | Contact form |
# art-gallery
