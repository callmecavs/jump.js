import { defineConfig } from "tsdown"

export default defineConfig({
  attw: {
    level: "error",
    profile: "esm-only",
  },
  dts: {
    tsgo: true,
  },
  exports: true,
  platform: "browser",
  publint: {
    level: "error",
  },
})
