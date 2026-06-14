import { expect, test } from "@playwright/test"

import type { Jump, JumpOptions, JumpTarget } from "../src/types"

declare global {
  interface Window {
    fixtures: {
      captureWindowScrollToArgs: () => void
      getLatestWindowScrollToArgs: () => Array<ScrollToOptions> | undefined

      getElement: (selector: string) => Element
      getElementY: (element: Element) => number

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

test("target: element", async ({ page }) => {
  const expected = await page.evaluate(() => window.fixtures.getElementY(window.fixtures.getElement(".target.element")))
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(window.fixtures.getElement(".target.element")))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: expected }])
})

test("target: element with offset", async ({ page }) => {
  const offset = 50

  const expected = await page.evaluate(
    offset => window.fixtures.getElementY(window.fixtures.getElement(".target.element")) + offset,
    offset,
  )

  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())

  await page.evaluate(
    offset => window.fixtures.scroll(window.fixtures.getElement(".target.element"), { offset }),
    offset,
  )

  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: expected }])
})

test("target: element is clamped (start)", async ({ page }) => {
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(window.fixtures.getElement(".target.start"), { offset: -25 }))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: 0 }])
})

test("target: element is clamped (end)", async ({ page }) => {
  const maxY = await page.evaluate(() => window.fixtures.getWindowYMax())
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(window.fixtures.getElement(".target.end"), { offset: 25 }))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: maxY }])
})

test("target: string", async ({ page }) => {
  const expected = await page.evaluate(() => window.fixtures.getElementY(window.fixtures.getElement(".target.string")))
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(".target.string"))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: expected }])
})

test("target: string with offset", async ({ page }) => {
  const offset = -50

  const expected = await page.evaluate(
    offset => window.fixtures.getElementY(window.fixtures.getElement(".target.string")) + offset,
    offset,
  )

  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())

  await page.evaluate(
    offset => window.fixtures.scroll(window.fixtures.getElement(".target.string"), { offset }),
    offset,
  )

  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: expected }])
})
