import { defineNitroConfig } from "nitropack/config"

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "latest",
  srcDir: "server",
  imports: false,
  runtimeConfig: {
    // Private runtime config (server-side only)
    // Environment variables: NITRO_DOLI_URL, NITRO_DOLI_KEY
    doliUrl: "http://default-url/api/index.php", // Default value - will be overridden by NITRO_DOLI_URL
    doliKey: "DEFAULT_TOKEN_SHOULD_BE_OVERRIDDEN", // Default value - will be overridden by NITRO_DOLI_KEY
    // Public runtime config (client-side and server-side)
    public: {
      // Add public config here if needed
    }
  }
});
