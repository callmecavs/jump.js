import { expect, test } from "@playwright/test"

import type { Jump, JumpOptions, JumpTarget } from "../src/types"

declare global {
  interface Window {
    fixtures: {
      captureWindowScrollToArgs: () => void
      getLatestWindowScrollToArgs: () => number

      getWindowY: () => number
      getWindowYMax: () => number
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
  await page.evaluate(() => window.fixtures.setWindowY(50))
  await page.evaluate(() => window.fixtures.scroll(100))
  expect(await page.evaluate(() => window.fixtures.getWindowY())).toEqual(150)
})

test("target: number ignores offset", async ({ page }) => {
  await page.evaluate(() => window.fixtures.setWindowY(50))
  await page.evaluate(() => window.fixtures.scroll(100, { offset: -50 }))
  expect(await page.evaluate(() => window.fixtures.getWindowY())).toEqual(150)
})

test("target: number is clamped (start)", async ({ page }) => {
  await page.evaluate(() => window.fixtures.setWindowY(25))
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(-50))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: 0 }])
})

test("target: number is clamped (end)", async ({ page }) => {
  const maxY = await page.evaluate(() => window.fixtures.getWindowYMax())
  await page.evaluate(maxY => window.fixtures.setWindowY(maxY - 25), maxY)
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(50))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: maxY }])
})
