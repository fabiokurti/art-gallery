// Turns a password into the two lines the server needs in its .env file.
// Usage: npm run set-password -- "the password"
import crypto from "node:crypto";
import { hashPassword } from "../src/auth.js";

const password = process.argv[2];

if (!password || password.length < 10) {
  console.error('Usage: npm run set-password -- "a password of at least 10 characters"');
  process.exit(1);
}

console.log("Put these in server/.env (and never commit that file):\n");
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString("hex")}`);
