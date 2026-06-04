import js from "@eslint/js"
import tslint from "typescript-eslint"
import prettier from "eslint-config-prettier"

export default tslint.config(js.configs.recommended, tseslint.configs.recommended, prettier)
