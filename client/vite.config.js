import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      // Uploaded paintings are served by the API, not from the client folder.
      "/media": "http://localhost:4000",
    },
  },
});
