import nodemailer from "nodemailer";
import { getArtist, getArtworks } from "./store.js";

function recipients() {
  const artist = getArtist();
  const listed = [
    ...(Array.isArray(artist?.emails) ? artist.emails : []),
    artist?.email,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return [...new Set(listed)];
}

function workLabel(artworkId) {
  if (!artworkId) return "";
  const work = getArtworks().find((entry) => entry.id === artworkId);
  return work?.title?.en || artworkId;
}

function transport() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE !== "false"
    : port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendInquiryMail(inquiry) {
  const mailer = transport();
  if (!mailer) {
    console.warn("Contact form saved, but SMTP is not set — no email was sent.");
    return false;
  }

  const to = recipients();
  if (!to.length) {
    console.warn("Contact form saved, but no studio email addresses are set.");
    return false;
  }

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER.trim();
  const about = workLabel(inquiry.artworkId);
  const subject = about
    ? `New inquiry about ${about}`
    : `New message from ${inquiry.name}`;

  const lines = [
    `${inquiry.name} wrote from the website.`,
    `Email: ${inquiry.email}`,
    about ? `About: ${about}` : null,
    "",
    inquiry.message,
  ].filter((line) => line !== null);

  await mailer.sendMail({
    from: `"Marsila Bitri Art" <${from}>`,
    to,
    replyTo: `"${inquiry.name.replace(/"/g, "")}" <${inquiry.email}>`,
    subject,
    text: lines.join("\n"),
  });

  return true;
}
