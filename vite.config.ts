import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import cloudflare from "@tanstack/react-start-adapter-cloudflare-workers";

export default defineConfig({
  server: {
    adapter: cloudflare()
  }
});
