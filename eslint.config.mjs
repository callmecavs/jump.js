import js from "@eslint/js"
import tslint from "typescript-eslint"
import prettier from "eslint-config-prettier"

const config = tslint.config(
  { ignores: ["dist/**", "pnpm-lock.yaml"] }, // matches .prettierignore
  js.configs.recommended,
  tslint.configs.recommended,
  prettier,
)

export default config
