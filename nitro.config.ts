import { defineNitroConfig } from "nitropack/config"

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "latest",
  srcDir: "server",
  imports: false,
  runtimeConfig: {
    // Private runtime config (server-side only)
    // Environment variables: NITRO_DOLI_URL, NITRO_DOLI_KEY
    doliUrl: "http://localhost/api/index.php", // Default value
    doliKey: "super_api_key", // Default value
    // Public runtime config (client-side and server-side)
    public: {
      // Add public config here if needed
    }
  }
});
