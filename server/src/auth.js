// One person edits this site, so there are no accounts: a single password,
// stored only as a scrypt hash in ADMIN_PASSWORD_HASH, is exchanged for a
// signed cookie. Node's crypto covers all of this, so there is nothing extra
// to keep patched.
import crypto from "node:crypto";

const COOKIE = "mb_admin";
const SESSION_HOURS = 12;
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map();

// Without a fixed secret the signing key is new on every boot, which only
// means the admin has to log in again after a restart.
const secret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

export const passwordIsSet = Boolean(process.env.ADMIN_PASSWORD_HASH);

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

function passwordMatches(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  const [scheme, saltHex, keyHex] = stored.split(":");

  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

function sign(value) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function parseCookies(header = "") {
  const jar = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index > 0) jar[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return jar;
}

// Repeated wrong guesses from one address stop being answered for a while.
// Successful logins clear the counter.
function throttled(ip) {
  const record = attempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.firstAt > ATTEMPT_WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const record = attempts.get(ip);
  if (record && Date.now() - record.firstAt <= ATTEMPT_WINDOW_MS) {
    record.count += 1;
  } else {
    attempts.set(ip, { count: 1, firstAt: Date.now() });
  }
}

export function login(req, res) {
  const ip = req.ip || "unknown";

  if (!passwordIsSet) {
    res.status(503).json({
      error: "No admin password is set on the server. Run: npm run set-password",
    });
    return;
  }

  if (throttled(ip)) {
    res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
    return;
  }

  const password = req.body?.password;
  if (typeof password !== "string" || !password || !passwordMatches(password)) {
    recordFailure(ip);
    res.status(401).json({ error: "Wrong password." });
    return;
  }

  attempts.delete(ip);

  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const token = `${expiresAt}.${sign(String(expiresAt))}`;

  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  });

  res.json({ ok: true });
}

export function logout(_req, res) {
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
}

export function isAuthenticated(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const expected = Buffer.from(sign(expiresAt));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Please log in." });
    return;
  }
  next();
}
