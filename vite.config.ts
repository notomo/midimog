import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/midimog/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
