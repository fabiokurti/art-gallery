import { clearArtworks, peekArtworks, rememberArtworks } from "./worksSession.js";

const API = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function send(path, method, body) {
  return request(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function getArtist() {
  return request("/artist");
}

export function getArtworks() {
  const cached = peekArtworks();
  if (cached) return Promise.resolve(cached);

  return request("/artworks").then((data) => {
    rememberArtworks(data);
    return data;
  });
}

export function getArtwork(id) {
  const cached = peekArtworks()?.find((work) => work.id === id);
  if (cached) return Promise.resolve(cached);

  return request(`/artworks/${id}`);
}

export function sendInquiry(payload) {
  return send("/inquiries", "POST", payload);
}

// Admin. The session is an httpOnly cookie, so these carry no token — the
// browser attaches it and JavaScript can never read it.
export function getSession() {
  return request("/admin/session");
}

export function login(password) {
  return send("/admin/login", "POST", { password });
}

export function logout() {
  return request("/admin/logout", { method: "POST" });
}

export function getAllArtworks() {
  return request("/admin/artworks");
}

export function createArtwork(artwork) {
  clearArtworks();
  return send("/admin/artworks", "POST", artwork);
}

export function updateArtwork(id, artwork) {
  clearArtworks();
  return send(`/admin/artworks/${id}`, "PUT", artwork);
}

export function deleteArtwork(id) {
  clearArtworks();
  return request(`/admin/artworks/${id}`, { method: "DELETE" });
}

export function reorderArtworks(ids) {
  clearArtworks();
  return send("/admin/artworks/order", "POST", { ids });
}

export function updateArtist(artist) {
  return send("/admin/artist", "PUT", artist);
}

// Multipart, so the browser sets the content type and boundary itself.
export function uploadPhotos(files) {
  const form = new FormData();
  for (const file of files) {
    form.append("photos", file);
  }

  return request("/admin/uploads", { method: "POST", body: form });
}

export function getInquiries() {
  return request("/admin/inquiries");
}

export function deleteInquiry(id) {
  return request(`/admin/inquiries/${id}`, { method: "DELETE" });
}
