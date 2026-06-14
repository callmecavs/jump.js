import { expect, test } from "@playwright/test"

import type { Jump, JumpOptions, JumpTarget } from "../src/types"

declare global {
  interface Window {
    fixtures: {
      captureWindowScrollToArgs: () => void
      getLatestWindowScrollToArgs: () => number

      getWindowY: () => number
      setWindowY: (top: number) => void

      jump: Jump
      scroll: (target: JumpTarget, options?: JumpOptions) => Promise<void>
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/behavior.html")
  await page.waitForFunction(() => window.fixtures !== undefined)
})

test("target: number", async ({ page }) => {
  await page.evaluate(async () => window.fixtures.setWindowY(50))
  await page.evaluate(async () => window.fixtures.scroll(100))
  expect(await page.evaluate(async () => window.fixtures.getWindowY())).toEqual(150)
})

test("target: number ignores offset", async ({ page }) => {
  await page.evaluate(async () => window.fixtures.setWindowY(50))
  await page.evaluate(async () => window.fixtures.scroll(100, { offset: -50 }))
  expect(await page.evaluate(async () => window.fixtures.getWindowY())).toEqual(150)
})
