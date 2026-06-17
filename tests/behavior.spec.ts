import { expect, test } from "@playwright/test"

import type { Jump, JumpOptions, JumpTarget } from "../src/types"

declare global {
  interface Window {
    fixtures: {
      captureElementScrollToArgs: (element: HTMLElement) => void
      getLatestElementScrollToArgs: () => Array<ScrollToOptions> | undefined

      captureWindowScrollToArgs: () => void
      getLatestWindowScrollToArgs: () => Array<ScrollToOptions> | undefined

      getElement: (selector: string) => HTMLElement
      getElementY: (element: HTMLElement) => number

      getElementScrollXMax: (element: HTMLElement) => number
      getElementScrollYMax: (element: HTMLElement) => number

      getWindowY: () => number
      setWindowY: (top: number) => void

      getWindowScrollYMax: () => number

      jump: Jump
      scroll: (target: JumpTarget, options?: JumpOptions) => Promise<void>
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/behavior.html")
  await page.waitForFunction(() => window.fixtures !== undefined)
})

test("target: number (positive)", async ({ page }) => {
  await page.evaluate(() => window.fixtures.setWindowY(50))
  await page.evaluate(() => window.fixtures.scroll(100))
  expect(await page.evaluate(() => window.fixtures.getWindowY())).toEqual(150)
})

test("target: number (negative)", async ({ page }) => {
  await page.evaluate(() => window.fixtures.setWindowY(150))
  await page.evaluate(() => window.fixtures.scroll(-100))
  expect(await page.evaluate(() => window.fixtures.getWindowY())).toEqual(50)
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
  const maxY = await page.evaluate(() => window.fixtures.getWindowScrollYMax())
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
  const maxY = await page.evaluate(() => window.fixtures.getWindowScrollYMax())
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(window.fixtures.getElement(".target.end")))
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
  await page.evaluate(offset => window.fixtures.scroll(".target.string", { offset }), offset)
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: expected }])
})

test("target: string is clamped (start)", async ({ page }) => {
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(".target.start", { offset: -25 }))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: 0 }])
})

test("target: string is clamped (end)", async ({ page }) => {
  const maxY = await page.evaluate(() => window.fixtures.getWindowScrollYMax())
  await page.evaluate(() => window.fixtures.captureWindowScrollToArgs())
  await page.evaluate(() => window.fixtures.scroll(".target.end"))
  expect(await page.evaluate(() => window.fixtures.getLatestWindowScrollToArgs())).toEqual([{ top: maxY }])
})

test("root: element, axis: x, target: element", async ({ page }) => {
  const expected = await page.evaluate(() => window.fixtures.getElement("[data-root-x-element]").offsetLeft)

  await page.evaluate(async () => {
    const target = window.fixtures.getElement("[data-root-x-element]")
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll(target, { axis: "x", root })
  })

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollLeft)).toEqual(expected)
})

test("root: element, axis: x, target: string", async ({ page }) => {
  const expected = await page.evaluate(() => window.fixtures.getElement("[data-root-x-string]").offsetLeft)

  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-x-string]", { axis: "x", root })
  })

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollLeft)).toEqual(expected)
})

test("root: element, axis: x, with offset", async ({ page }) => {
  const offset = 24

  const expected = await page.evaluate(
    offset => window.fixtures.getElement("[data-root-x-offset]").offsetLeft + offset,
    offset,
  )

  await page.evaluate(async offset => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-x-offset]", { axis: "x", offset, root })
  }, offset)

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollLeft)).toEqual(expected)
})

test("root: element, axis: x, is clamped (start)", async ({ page }) => {
  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-x-clamp-start]", { axis: "x", root })
  })

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollLeft)).toEqual(0)
})

test("root: element, axis: x, is clamped (end)", async ({ page }) => {
  const expected = await page.evaluate(async () =>
    window.fixtures.getElementScrollXMax(window.fixtures.getElement("[data-root]")),
  )

  await page.evaluate(async () => window.fixtures.captureElementScrollToArgs(window.fixtures.getElement("[data-root]")))

  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-x-clamp-end]", { axis: "x", root })
  })

  expect(await page.evaluate(() => window.fixtures.getLatestElementScrollToArgs())).toEqual([{ left: expected }])
})

test("root: element, axis: x, doesn't mutate other axis", async ({ page }) => {
  const y = 24

  await page.evaluate(async y => {
    const root = window.fixtures.getElement("[data-root]")
    root.scrollTo({ top: y })
    await window.fixtures.scroll("[data-root-x-string]", { axis: "x", root })
  }, y)

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollTop)).toEqual(y)
})

test("root: element, axis: y, target: element", async ({ page }) => {
  const expected = await page.evaluate(() => window.fixtures.getElement("[data-root-y-element]").offsetTop)

  await page.evaluate(async () => {
    const target = window.fixtures.getElement("[data-root-y-element]")
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll(target, { root })
  })

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollTop)).toEqual(expected)
})

test("root: element, axis: y, target: string", async ({ page }) => {
  const expected = await page.evaluate(() => window.fixtures.getElement("[data-root-y-string]").offsetTop)

  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-y-string]", { root })
  })

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollTop)).toEqual(expected)
})

test("root: element, axis: y, with offset", async ({ page }) => {
  const offset = 24

  const expected = await page.evaluate(
    offset => window.fixtures.getElement("[data-root-y-offset]").offsetTop + offset,
    offset,
  )

  await page.evaluate(async offset => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-y-offset]", { offset, root })
  }, offset)

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollTop)).toEqual(expected)
})

test("root: element, axis: y, is clamped (start)", async ({ page }) => {
  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-y-clamp-start]", { root })
  })

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollTop)).toEqual(0)
})

test("root: element, axis: y, is clamped (end)", async ({ page }) => {
  const expected = await page.evaluate(async () =>
    window.fixtures.getElementScrollYMax(window.fixtures.getElement("[data-root]")),
  )

  await page.evaluate(async () => window.fixtures.captureElementScrollToArgs(window.fixtures.getElement("[data-root]")))

  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    await window.fixtures.scroll("[data-root-y-clamp-end]", { root })
  })

  expect(await page.evaluate(() => window.fixtures.getLatestElementScrollToArgs())).toEqual([{ top: expected }])
})

test("root: element, axis: y, doesn't mutate other axis", async ({ page }) => {
  const x = 24

  await page.evaluate(async x => {
    const root = window.fixtures.getElement("[data-root]")
    root.scrollTo({ left: x })
    await window.fixtures.scroll("[data-root-y-string]", { root })
  }, x)

  expect(await page.evaluate(() => window.fixtures.getElement("[data-root]").scrollLeft)).toEqual(x)
})

test("a11y, target: element", async ({ page }) => {
  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-focus]")
    const target = window.fixtures.getElement("[data-focus-element]")
    await window.fixtures.scroll(target, { a11y: true, root })
  })

  expect(
    await page.evaluate(() => {
      // elements can't be serialized, so compare them here
      const target = window.fixtures.getElement("[data-focus-element]")
      return target === document.activeElement
    }),
  ).toEqual(true)
})

test("a11y, target: string", async ({ page }) => {
  await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-focus]")
    await window.fixtures.scroll("[data-focus-string]", { a11y: true, root })
  })

  expect(
    await page.evaluate(() => {
      // elements can't be serialized, so compare them here
      const target = window.fixtures.getElement("[data-focus-string]")
      return target === document.activeElement
    }),
  ).toEqual(true)
})
