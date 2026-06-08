import { expect, test } from "vitest"

import jump from "../src"

test.skip("jump", () => {
  expect(jump(".target")).toBe(undefined)
})
