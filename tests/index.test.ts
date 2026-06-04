import { expect, test } from "vitest"
import { jump } from "../src"

test("jump", () => {
  expect(jump()).toBe("Yarrr, world!")
})
