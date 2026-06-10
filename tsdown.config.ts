import { defineConfig } from "tsdown"

export default defineConfig({
  dts: { tsgo: true },
  exports: {
    customExports(exports) {
      const rootExport = exports["."]

      if (typeof rootExport === "object" && rootExport !== null && !Array.isArray(rootExport)) {
        exports["."] = { types: "./dist/index.d.ts", ...rootExport }
      }

      return exports
    },
  },
  format: {
    cjs: {},
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
