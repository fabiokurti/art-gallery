// The site's content lives in two JSON files under server/data, next to the
// uploaded images. The data is document shaped — every painting carries text in
// three languages and a list of photos — so a JSON document is a closer fit
// than SQL tables, and it stays readable if anything ever needs fixing by hand.
//
// Reads come from an in-memory copy. Writes go through a queue so two requests
// can never interleave, and each one lands as a temp file that is renamed over
// the old one, so an interrupted write leaves the previous file intact.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { artist as seedArtist, artworks as seedArtworks } from "./seed.js";

const STUDIO_EMAILS = ["hello@marsilabitri.art", "contact@marsilabitri.art"];

const here = path.dirname(fileURLToPath(import.meta.url));

// Set DATA_DIR on the server to keep content on a path that survives deploys.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(here, "..", "data");

export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const SEED_MEDIA_DIR = path.join(here, "..", "seed-media");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const CONTENT_BACKUP = path.join(DATA_DIR, "content.backup.json");
const INQUIRY_FILE = path.join(DATA_DIR, "inquiries.json");

let content = null;
let inquiries = null;
let queue = Promise.resolve();

async function writeJson(file, value, backup) {
  if (backup) {
    await fs.copyFile(file, backup).catch(() => {});
  }

  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(temp, file);
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function ensureCircusPanels(content) {
  const work = content.artworks?.find((entry) => entry.id === "a-man-and-his-circus");
  if (!work) return false;
  if (work.image === "/media/a-man-and-his-circus.jpg") return false;
  work.image = "/media/a-man-and-his-circus.jpg";
  work.images = [
    "/media/a-man-and-his-circus.jpg",
    "/media/a-man-and-his-circus-2.jpg",
  ];
  return true;
}

function ensureStudioEmails(artist) {
  const current = Array.isArray(artist.emails)
    ? artist.emails.map((value) => String(value).trim()).filter(Boolean)
    : [];
  const next = [...new Set([...STUDIO_EMAILS, ...current, artist.email].filter(Boolean))];
  const same =
    current.length === next.length && current.every((value, index) => value === next[index]);

  if (same && artist.email === STUDIO_EMAILS[0]) return false;

  artist.email = STUDIO_EMAILS[0];
  artist.emails = next;
  return true;
}

// A fresh install has no data directory, so the first boot lays down the seed
// content and the photos that ship with the repo. This is what makes deploying
// to a new server a matter of starting the process.
export async function init() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  content = await readJson(CONTENT_FILE);
  if (!content) {
    content = { artist: seedArtist, artworks: seedArtworks };
    await writeJson(CONTENT_FILE, content);
  } else {
    const emailChanged = ensureStudioEmails(content.artist);
    const circusChanged = ensureCircusPanels(content);
    if (emailChanged || circusChanged) await writeJson(CONTENT_FILE, content, true);
  }

  inquiries = (await readJson(INQUIRY_FILE)) || [];

  const seeded = await fs.readdir(SEED_MEDIA_DIR).catch(() => []);
  const present = new Set(await fs.readdir(UPLOAD_DIR).catch(() => []));
  for (const name of seeded) {
    if (!present.has(name)) {
      await fs.copyFile(path.join(SEED_MEDIA_DIR, name), path.join(UPLOAD_DIR, name));
    }
  }
}

export function getArtist() {
  return content.artist;
}

export function getArtworks() {
  return content.artworks;
}

export function getInquiries() {
  return inquiries;
}

// `mutator` receives a deep copy, so a validation error thrown halfway through
// leaves the live content untouched.
export function updateContent(mutator) {
  queue = queue.then(async () => {
    const draft = structuredClone(content);
    const result = await mutator(draft);
    await writeJson(CONTENT_FILE, draft, CONTENT_BACKUP);
    content = draft;
    return result;
  });

  return queue;
}

export function updateInquiries(mutator) {
  queue = queue.then(async () => {
    const draft = structuredClone(inquiries);
    const result = await mutator(draft);
    await writeJson(INQUIRY_FILE, draft);
    inquiries = draft;
    return result;
  });

  return queue;
}
