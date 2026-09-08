import cors from "cors";
import express from "express";
import admin from "./admin.js";
import { sendInquiryMail } from "./mail.js";
import { getArtist, getArtworks, init, updateInquiries, UPLOAD_DIR } from "./store.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Behind nginx on the server, so the client address comes from the proxy
// header — the login throttle counts real visitors rather than the proxy.
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Uploaded photos. Immutable because a new upload always gets a new filename.
app.use(
  "/media",
  express.static(UPLOAD_DIR, {
    maxAge: "365d",
    immutable: true,
    fallthrough: false,
  })
);

app.use("/api/admin", admin);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", studio: getArtist().studio });
});

app.get("/api/artist", (_req, res) => {
  res.json(getArtist());
});

// Drafts stay out of every public response.
function published() {
  return getArtworks().filter((artwork) => artwork.published !== false);
}

app.get("/api/artworks", (_req, res) => {
  res.json(published());
});

app.get("/api/artworks/:id", (req, res) => {
  const artwork = published().find((work) => work.id === req.params.id);

  if (!artwork) {
    res.status(404).json({ error: "Artwork not found" });
    return;
  }

  res.json(artwork);
});

app.post("/api/inquiries", async (req, res, next) => {
  try {
    const { name, email, message, artworkId } = req.body ?? {};

    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }

    const inquiry = await updateInquiries((draft) => {
      const entry = {
        id: `${Date.now()}-${draft.length + 1}`,
        name: String(name).trim().slice(0, 120),
        email: String(email).trim().slice(0, 160),
        message: String(message).trim().slice(0, 4000),
        artworkId: artworkId || null,
        createdAt: new Date().toISOString(),
      };

      draft.push(entry);
      return entry;
    });

    try {
      await sendInquiryMail(inquiry);
    } catch (error) {
      console.error("Could not email the inquiry:", error);
    }

    res.status(201).json({ ok: true, inquiry });
  } catch (error) {
    next(error);
  }
});

// eslint-disable-next-line no-unused-vars -- Express needs the 4th argument.
app.use((error, _req, res, _next) => {
  const status = error.status || (error.code === "LIMIT_FILE_SIZE" ? 413 : 500);

  if (status === 500) console.error(error);

  res.status(status).json({
    error: status === 500 ? "Something went wrong on the server." : error.message,
  });
});

await init();

app.listen(PORT, () => {
  console.log(`Marsila Bitri Art API on http://localhost:${PORT}`);
});
