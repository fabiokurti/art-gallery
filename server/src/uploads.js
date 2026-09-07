// Photos arrive straight from a phone or camera, so nothing is stored as it was
// uploaded: every file is decoded, rotated upright, resized to fit 1800px and
// re-encoded as JPEG. That keeps the gallery fast, and because sharp drops
// metadata by default it also strips the GPS coordinates a phone attaches to
// its pictures.
import path from "node:path";
import fs from "node:fs/promises";
import multer from "multer";
import sharp from "sharp";
import { UPLOAD_DIR } from "./store.js";

const MAX_EDGE = 1800;
const QUALITY = 78;

export const receive = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024, files: 8 },
});

function safeStem(originalName) {
  const stem = path.basename(originalName, path.extname(originalName));
  const slug = stem
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "painting";
}

async function uniquePath(stem) {
  for (let attempt = 0; ; attempt += 1) {
    const name = attempt === 0 ? `${stem}.jpg` : `${stem}-${attempt}.jpg`;
    const file = path.join(UPLOAD_DIR, name);
    try {
      // Fails when the name is free, which is the case we want.
      await fs.access(file);
    } catch {
      return { name, file };
    }
  }
}

// Rejects anything sharp cannot decode as an image, rather than trusting the
// content type the browser claimed.
export async function storeImage(buffer, originalName) {
  let image = sharp(buffer, { failOn: "error" });

  const metadata = await image.metadata().catch(() => null);
  if (!metadata?.width || !metadata?.height) {
    throw Object.assign(new Error("That file is not an image."), { status: 400 });
  }

  const { name, file } = await uniquePath(safeStem(originalName));

  await image
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(file);

  return `/media/${name}`;
}

// Deletes the photos a removed painting was using, but only the ones no other
// painting still points at. Files that were uploaded and never attached are
// left alone — an abandoned form should not cost someone their photo.
export async function discardImages(candidates, stillReferenced) {
  const keep = new Set(stillReferenced.map((entry) => path.basename(entry || "")));

  await Promise.all(
    candidates
      .map((entry) => path.basename(entry || ""))
      .filter((name) => name && !keep.has(name))
      .map((name) => fs.rm(path.join(UPLOAD_DIR, name), { force: true }))
  );
}
