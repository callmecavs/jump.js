import { defineConfig } from "tsdown"

export default defineConfig({
  dts: { tsgo: true },
  exports: {
    customExports(exports) {
      const rootExport = exports["."]

      if (typeof rootExport === "string") {
        exports["."] = {
          types: "./dist/index.d.ts",
          import: rootExport,
        }
      }

      return exports
    },
  },
  format: {
    esm: {},
    umd: {
      minify: true,
      outputOptions: {
        entryFileNames: "[name].umd.min.js",
      },
    },
  },
  globalName: "Jump",
  platform: "browser",
})
