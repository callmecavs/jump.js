import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import tslint from "typescript-eslint"

const config = tslint.config(
  { ignores: ["dist/**", "pnpm-lock.yaml"] }, // matches .prettierignore
  js.configs.recommended,
  tslint.configs.recommended,
  prettier,
)

export default config
