import { expect, test } from "vitest"
import { singleton } from "../src"

test("singleton", () => {
  expect(singleton()).toBe("Yarrr, world!")
})
