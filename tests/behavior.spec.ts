import { expect, test } from "@playwright/test"

import type { Jump, JumpOptions, JumpTarget } from "../src/types"

declare global {
  interface Window {
    fixtures: {
      getY: () => number
      jump: Jump
      reset: () => void
      scroll: (target: JumpTarget, options?: JumpOptions) => Promise<void>
      setY: (top: number) => void
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/behavior.html")
  await page.waitForFunction(() => window.fixtures !== undefined)
})

test("target: number", async ({ page }) => {
  await page.evaluate(async () => window.fixtures.setY(50))
  await page.evaluate(async () => window.fixtures.scroll(100))
  expect(await page.evaluate(async () => window.fixtures.getY())).toEqual(150)
})

test("target: number ignores offset", async ({ page }) => {
  await page.evaluate(async () => window.fixtures.setY(50))
  await page.evaluate(async () => window.fixtures.scroll(100, { offset: -50 }))
  expect(await page.evaluate(async () => window.fixtures.getY())).toEqual(150)
})
