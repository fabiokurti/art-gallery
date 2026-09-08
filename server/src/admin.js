// Everything behind the password. The public routes in index.js only read, so
// this is the one place the content can change.
import express from "express";
import { isAuthenticated, login, logout, passwordIsSet, requireAuth } from "./auth.js";
import {
  getArtist,
  getArtworks,
  getInquiries,
  updateContent,
  updateInquiries,
} from "./store.js";
import { discardImages, receive, storeImage } from "./uploads.js";

// `medium` and `form` are stored as keys and translated in the browser, so the
// admin picks from a list instead of typing the same words in three languages.
const MEDIUMS = ["", "acrylic", "oil", "watercolour", "mixed"];
const FORMS = ["", "triptych", "diptych"];
const LANGS = ["en", "sq", "it"];

const router = express.Router();

function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function cleanText(input) {
  const text = {};
  for (const lang of LANGS) {
    text[lang] = typeof input?.[lang] === "string" ? input[lang].trim() : "";
  }
  return text;
}

function hasText(text) {
  return LANGS.some((lang) => text[lang]);
}

// Images must be paths this server produced. Anything else — a remote URL, a
// path with directory segments — is refused rather than stored.
function cleanImages(input) {
  if (!Array.isArray(input)) return [];

  const images = [];
  for (const entry of input) {
    if (typeof entry !== "string") continue;
    const match = /^\/media\/([A-Za-z0-9._-]+)$/.exec(entry.trim());
    if (match && !match[1].includes("..") && !images.includes(entry.trim())) {
      images.push(entry.trim());
    }
  }
  return images;
}

function buildArtwork(body, existing) {
  const title = cleanText(body?.title);
  if (!hasText(title)) throw fail("A painting needs a title in at least one language.");

  const images = cleanImages(body?.images);
  if (!images.length) throw fail("A painting needs at least one photo.");

  const medium = MEDIUMS.includes(body?.medium) ? body.medium : "";
  const form = FORMS.includes(body?.form) ? body.form : "";
  const description = cleanText(body?.description);

  return {
    id: existing?.id || "",
    title,
    year: typeof body?.year === "string" ? body.year.trim().slice(0, 20) : "",
    medium,
    form,
    dimensions:
      typeof body?.dimensions === "string" ? body.dimensions.trim().slice(0, 60) : "",
    available: body?.available !== false,
    published: body?.published !== false,
    featured: Boolean(body?.featured),
    image: images[0],
    images,
    // Storing "" rather than three empty strings keeps the shape the public
    // pages already handle for a painting with no text yet.
    description: hasText(description) ? description : "",
  };
}

function uniqueId(base, artworks, ignoreId) {
  const stem = base || "painting";
  let candidate = stem;

  for (let n = 2; artworks.some((w) => w.id === candidate && w.id !== ignoreId); n += 1) {
    candidate = `${stem}-${n}`;
  }

  return candidate;
}

// Only one painting can be the home page cover.
function applyFeatured(artworks, featuredId) {
  for (const work of artworks) {
    work.featured = work.id === featuredId;
  }
}

router.post("/login", login);
router.post("/logout", logout);

router.get("/session", (req, res) => {
  res.json({ authenticated: isAuthenticated(req), passwordIsSet });
});

router.use(requireAuth);

// Unlike the public list, this includes drafts.
router.get("/artworks", (_req, res) => {
  res.json(getArtworks());
});

router.post("/artworks", async (req, res, next) => {
  try {
    const created = await updateContent((draft) => {
      const artwork = buildArtwork(req.body, null);
      artwork.id = uniqueId(slugify(artwork.title.en || artwork.title.sq), draft.artworks);

      draft.artworks.push(artwork);
      if (artwork.featured) applyFeatured(draft.artworks, artwork.id);

      return artwork;
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/artworks/:id", async (req, res, next) => {
  try {
    const updated = await updateContent(async (draft) => {
      const index = draft.artworks.findIndex((work) => work.id === req.params.id);
      if (index === -1) throw fail("That painting no longer exists.", 404);

      const previous = draft.artworks[index];
      const artwork = buildArtwork(req.body, previous);
      artwork.id = previous.id;

      draft.artworks[index] = artwork;
      if (artwork.featured) applyFeatured(draft.artworks, artwork.id);

      // Photos dropped from this painting are removed from disk unless another
      // painting uses them.
      const removed = previous.images.filter((entry) => !artwork.images.includes(entry));
      if (removed.length) {
        const kept = draft.artworks.flatMap((work) => work.images);
        await discardImages(removed, kept);
      }

      return artwork;
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/artworks/:id", async (req, res, next) => {
  try {
    await updateContent(async (draft) => {
      const index = draft.artworks.findIndex((work) => work.id === req.params.id);
      if (index === -1) throw fail("That painting no longer exists.", 404);

      const [removed] = draft.artworks.splice(index, 1);
      const kept = draft.artworks.flatMap((work) => work.images);
      await discardImages(removed.images, kept);
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// The gallery order is the array order, so reordering is a list of ids.
router.post("/artworks/order", async (req, res, next) => {
  try {
    const order = Array.isArray(req.body?.ids) ? req.body.ids : null;
    if (!order) throw fail("Send the painting ids in their new order.");

    const ordered = await updateContent((draft) => {
      const byId = new Map(draft.artworks.map((work) => [work.id, work]));
      const next = [];

      for (const id of order) {
        const work = byId.get(id);
        if (work) {
          next.push(work);
          byId.delete(id);
        }
      }

      // Anything the client did not mention keeps its place at the end.
      draft.artworks = [...next, ...byId.values()];
      return draft.artworks;
    });

    res.json(ordered);
  } catch (error) {
    next(error);
  }
});

router.get("/artist", (_req, res) => {
  res.json(getArtist());
});

router.put("/artist", async (req, res, next) => {
  try {
    const saved = await updateContent((draft) => {
      const body = req.body ?? {};
      const artist = draft.artist;

      if (typeof body.name === "string") artist.name = body.name.trim();
      if (typeof body.email === "string") artist.email = body.email.trim();
      if (Array.isArray(body.emails)) {
        artist.emails = body.emails.map((value) => String(value).trim()).filter(Boolean);
      }
      if (typeof body.instagram === "string") artist.instagram = body.instagram.trim();

      for (const field of ["statement", "intro"]) {
        if (body[field]) artist[field] = cleanText(body[field]);
      }

      for (const field of ["birthplace", "location"]) {
        if (body[field]) artist[field] = cleanText(body[field]);
      }

      // The About page reads the biography as a list of paragraphs, so a
      // textarea per language is split on blank lines.
      if (body.bio) {
        const bio = {};
        for (const lang of LANGS) {
          const value = body.bio[lang];
          const paragraphs = Array.isArray(value)
            ? value
            : String(value || "").split(/\n\s*\n/);
          bio[lang] = paragraphs.map((entry) => entry.trim()).filter(Boolean);
        }
        artist.bio = bio;
      }

      return artist;
    });

    res.json(saved);
  } catch (error) {
    next(error);
  }
});

router.post("/uploads", receive.array("photos", 8), async (req, res, next) => {
  try {
    if (!req.files?.length) throw fail("No photos were attached.");

    const stored = [];
    for (const file of req.files) {
      stored.push(await storeImage(file.buffer, file.originalname));
    }

    res.status(201).json({ images: stored });
  } catch (error) {
    next(error);
  }
});

router.get("/inquiries", (_req, res) => {
  res.json(getInquiries());
});

router.delete("/inquiries/:id", async (req, res, next) => {
  try {
    await updateInquiries((draft) => {
      const index = draft.findIndex((entry) => entry.id === req.params.id);
      if (index === -1) throw fail("That message no longer exists.", 404);
      draft.splice(index, 1);
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
