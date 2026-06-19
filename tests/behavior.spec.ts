import { expect, test } from "@playwright/test"

import type { Jump, JumpOptions, JumpTarget } from "../src/types"

declare global {
  interface Window {
    fixtures: {
      captureElementFocusArgs: (element: HTMLElement) => void
      getLatestElementFocusArgs: () => Array<FocusOptions> | undefined

      captureElementScrollToArgs: (element: HTMLElement) => void
      getLatestElementScrollToArgs: () => Array<ScrollToOptions> | undefined

      captureWindowScrollToArgs: () => void
      getLatestWindowScrollToArgs: () => Array<ScrollToOptions> | undefined

      getElement: (selector: string) => HTMLElement
      getElementX: (element: HTMLElement) => number
      getElementY: (element: HTMLElement) => number

      getElementScrollXMax: (element: HTMLElement) => number
      getElementScrollYMax: (element: HTMLElement) => number

      getWindowX: () => number
      getWindowY: () => number
      setWindowX: (left: number) => void
      setWindowY: (top: number) => void

      getWindowScrollXMax: () => number
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

test("root: window, axis: x, target: number (positive)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowX(50)
      await window.fixtures.scroll(100, { axis: "x" })
      return window.fixtures.getWindowX()
    }),
  ).toEqual(150)
})

test("root: window, axis: x, target: number (negative)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowX(150)
      await window.fixtures.scroll(-100, { axis: "x" })
      return window.fixtures.getWindowX()
    }),
  ).toEqual(50)
})

test("root: window, axis: x, target: number ignores offset", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowX(50)
      await window.fixtures.scroll(100, { axis: "x", offset: -50 })
      return window.fixtures.getWindowX()
    }),
  ).toEqual(150)
})

test("root: window, axis: x, target: number is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowX(25)
      window.fixtures.captureWindowScrollToArgs()
      await window.fixtures.scroll(-50, { axis: "x" })
      return window.fixtures.getLatestWindowScrollToArgs()
    }),
  ).toEqual([{ left: 0 }])
})

test("root: window, axis: x, target: number is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const maxX = window.fixtures.getWindowScrollXMax()

    window.fixtures.setWindowX(maxX - 25)
    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(50, { axis: "x" })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: maxX,
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: window, axis: x, target: element", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const target = window.fixtures.getElement("[data-window-x-target-element]")

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(target, { axis: "x" })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementX(target),
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: window, axis: x, target: element with offset", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const offset = 50
    const target = window.fixtures.getElement("[data-window-x-target-element]")

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(target, { axis: "x", offset })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementX(target) + offset,
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: window, axis: x, target: element is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const target = window.fixtures.getElement("[data-window-x-target-start]")
      window.fixtures.captureWindowScrollToArgs()
      await window.fixtures.scroll(target, { axis: "x", offset: -25 })
      return window.fixtures.getLatestWindowScrollToArgs()
    }),
  ).toEqual([{ left: 0 }])
})

test("root: window, axis: x, target: element is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const maxX = window.fixtures.getWindowScrollXMax()
    const target = window.fixtures.getElement("[data-window-x-target-end]")

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(target, { axis: "x" })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: maxX,
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: window, axis: x, target: string", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll("[data-window-x-target-string]", { axis: "x" })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementX(window.fixtures.getElement("[data-window-x-target-string]")),
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: window, axis: x, target: string with offset", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const offset = -50

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll("[data-window-x-target-string]", { axis: "x", offset })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementX(window.fixtures.getElement("[data-window-x-target-string]")) + offset,
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: window, axis: x, target: string is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.captureWindowScrollToArgs()
      await window.fixtures.scroll("[data-window-x-target-start]", { axis: "x", offset: -25 })
      return window.fixtures.getLatestWindowScrollToArgs()
    }),
  ).toEqual([{ left: 0 }])
})

test("root: window, axis: x, target: string is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll("[data-window-x-target-end]", { axis: "x" })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getWindowScrollXMax(),
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: window, axis: x, doesn't mutate other axis", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const y = 24

    window.scrollTo({ top: y })
    await window.fixtures.scroll("[data-window-x-target-string]", { axis: "x" })

    return {
      actual: window.fixtures.getWindowY(),
      expected: y,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: window, axis: y, target: number (positive)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowY(50)
      await window.fixtures.scroll(100)
      return window.fixtures.getWindowY()
    }),
  ).toEqual(150)
})

test("root: window, axis: y, target: number (negative)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowY(150)
      await window.fixtures.scroll(-100)
      return window.fixtures.getWindowY()
    }),
  ).toEqual(50)
})

test("root: window, axis: y, target: number ignores offset", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowY(50)
      await window.fixtures.scroll(100, { offset: -50 })
      return window.fixtures.getWindowY()
    }),
  ).toEqual(150)
})

test("root: window, axis: y, target: number is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.setWindowY(25)
      window.fixtures.captureWindowScrollToArgs()
      await window.fixtures.scroll(-50)
      return window.fixtures.getLatestWindowScrollToArgs()
    }),
  ).toEqual([{ top: 0 }])
})

test("root: window, axis: y, target: number is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const maxY = window.fixtures.getWindowScrollYMax()

    window.fixtures.setWindowY(maxY - 25)
    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(50)

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: maxY,
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: window, axis: y, target: element", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const target = window.fixtures.getElement("[data-window-y-target-element]")

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(target)

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementY(target),
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: window, axis: y, target: element with offset", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const offset = 50
    const target = window.fixtures.getElement("[data-window-y-target-element]")

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(target, { offset })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementY(target) + offset,
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: window, axis: y, target: element is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const target = window.fixtures.getElement("[data-window-y-target-start]")
      window.fixtures.captureWindowScrollToArgs()
      await window.fixtures.scroll(target, { offset: -25 })
      return window.fixtures.getLatestWindowScrollToArgs()
    }),
  ).toEqual([{ top: 0 }])
})

test("root: window, axis: y, target: element is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const maxY = window.fixtures.getWindowScrollYMax()
    const target = window.fixtures.getElement("[data-window-y-target-end]")

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll(target)

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: maxY,
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: window, axis: y, target: string", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll("[data-window-y-target-string]")

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementY(window.fixtures.getElement("[data-window-y-target-string]")),
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: window, axis: y, target: string with offset", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const offset = -50

    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll("[data-window-y-target-string]", { offset })

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getElementY(window.fixtures.getElement("[data-window-y-target-string]")) + offset,
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: window, axis: y, target: string is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      window.fixtures.captureWindowScrollToArgs()
      await window.fixtures.scroll("[data-window-y-target-start]", { offset: -25 })
      return window.fixtures.getLatestWindowScrollToArgs()
    }),
  ).toEqual([{ top: 0 }])
})

test("root: window, axis: y, target: string is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    window.fixtures.captureWindowScrollToArgs()
    await window.fixtures.scroll("[data-window-y-target-end]")

    return {
      actual: window.fixtures.getLatestWindowScrollToArgs(),
      expected: window.fixtures.getWindowScrollYMax(),
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: window, axis: y, doesn't mutate other axis", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const x = 24

    window.scrollTo({ left: x })
    await window.fixtures.scroll("[data-window-y-target-string]")

    return {
      actual: window.fixtures.getWindowX(),
      expected: x,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: x, target: number (positive)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      root.scrollLeft = 50
      await window.fixtures.scroll(100, { axis: "x", root })
      return root.scrollLeft
    }),
  ).toEqual(150)
})

test("root: element, axis: x, target: number (negative)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      root.scrollLeft = 150
      await window.fixtures.scroll(-100, { axis: "x", root })
      return root.scrollLeft
    }),
  ).toEqual(50)
})

test("root: element, axis: x, target: number ignores offset", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      root.scrollLeft = 50
      await window.fixtures.scroll(100, { axis: "x", offset: -50, root })
      return root.scrollLeft
    }),
  ).toEqual(150)
})

test("root: element, axis: x, target: element", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    const target = window.fixtures.getElement("[data-root-x-element]")

    await window.fixtures.scroll(target, { axis: "x", root })

    return {
      actual: root.scrollLeft,
      expected: target.offsetLeft,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: x, target: string", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")

    await window.fixtures.scroll("[data-root-x-string]", { axis: "x", root })

    return {
      actual: root.scrollLeft,
      expected: window.fixtures.getElement("[data-root-x-string]").offsetLeft,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: x, with offset", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const offset = 24
    const root = window.fixtures.getElement("[data-root]")
    const target = window.fixtures.getElement("[data-root-x-offset]")

    await window.fixtures.scroll(target, { axis: "x", offset, root })

    return {
      actual: root.scrollLeft,
      expected: target.offsetLeft + offset,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: x, is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      await window.fixtures.scroll("[data-root-x-clamp-start]", { axis: "x", root })
      return root.scrollLeft
    }),
  ).toEqual(0)
})

test("root: element, axis: x, is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")

    window.fixtures.captureElementScrollToArgs(root)
    await window.fixtures.scroll("[data-root-x-clamp-end]", { axis: "x", root })

    return {
      actual: window.fixtures.getLatestElementScrollToArgs(),
      expected: window.fixtures.getElementScrollXMax(root),
    }
  })

  expect(actual).toEqual([{ left: expected }])
})

test("root: element, axis: x, doesn't mutate other axis", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    const y = 24

    root.scrollTo({ top: y })
    await window.fixtures.scroll("[data-root-x-string]", { axis: "x", root })

    return {
      actual: root.scrollTop,
      expected: y,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: y, target: number (positive)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      root.scrollTop = 50
      await window.fixtures.scroll(100, { root })
      return root.scrollTop
    }),
  ).toEqual(150)
})

test("root: element, axis: y, target: number (negative)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      root.scrollTop = 150
      await window.fixtures.scroll(-100, { root })
      return root.scrollTop
    }),
  ).toEqual(50)
})

test("root: element, axis: y, target: number ignores offset", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      root.scrollTop = 50
      await window.fixtures.scroll(100, { offset: -50, root })
      return root.scrollTop
    }),
  ).toEqual(150)
})

test("root: element, axis: y, target: element", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    const target = window.fixtures.getElement("[data-root-y-element]")

    await window.fixtures.scroll(target, { root })

    return {
      actual: root.scrollTop,
      expected: target.offsetTop,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: y, target: string", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")

    await window.fixtures.scroll("[data-root-y-string]", { root })

    return {
      actual: root.scrollTop,
      expected: window.fixtures.getElement("[data-root-y-string]").offsetTop,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: y, with offset", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const offset = 24
    const root = window.fixtures.getElement("[data-root]")
    const target = window.fixtures.getElement("[data-root-y-offset]")

    await window.fixtures.scroll(target, { offset, root })

    return {
      actual: root.scrollTop,
      expected: target.offsetTop + offset,
    }
  })

  expect(actual).toEqual(expected)
})

test("root: element, axis: y, is clamped (start)", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-root]")
      await window.fixtures.scroll("[data-root-y-clamp-start]", { root })
      return root.scrollTop
    }),
  ).toEqual(0)
})

test("root: element, axis: y, is clamped (end)", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")

    window.fixtures.captureElementScrollToArgs(root)
    await window.fixtures.scroll("[data-root-y-clamp-end]", { root })

    return {
      actual: window.fixtures.getLatestElementScrollToArgs(),
      expected: window.fixtures.getElementScrollYMax(root),
    }
  })

  expect(actual).toEqual([{ top: expected }])
})

test("root: element, axis: y, doesn't mutate other axis", async ({ page }) => {
  const { actual, expected } = await page.evaluate(async () => {
    const root = window.fixtures.getElement("[data-root]")
    const x = 24

    root.scrollTo({ left: x })
    await window.fixtures.scroll("[data-root-y-string]", { root })

    return {
      actual: root.scrollLeft,
      expected: x,
    }
  })

  expect(actual).toEqual(expected)
})

test("a11y: falsy", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const sentinel = window.fixtures.getElement("[data-focus-button]")

      sentinel.focus({ preventScroll: true })
      await window.fixtures.scroll("[data-focus]", { a11y: false })
      const whenExplicit = sentinel === document.activeElement

      sentinel.focus({ preventScroll: true })
      await window.fixtures.scroll("[data-focus]")
      const whenOmitted = sentinel === document.activeElement

      return {
        whenExplicit,
        whenOmitted,
      }
    }),
  ).toEqual({
    whenExplicit: true,
    whenOmitted: true,
  })
})

test("a11y: true, target: element", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-focus]")
      const target = window.fixtures.getElement("[data-focus-element]")
      await window.fixtures.scroll(target, { a11y: true, root })
      return target === document.activeElement
    }),
  ).toEqual(true)
})

test("a11y: true, target: string", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-focus]")
      const target = window.fixtures.getElement("[data-focus-string]")
      await window.fixtures.scroll("[data-focus-string]", { a11y: true, root })
      return target === document.activeElement
    }),
  ).toEqual(true)
})

test("a11y: true, target: number doesn't change focus", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const sentinel = window.fixtures.getElement("[data-focus-button]")
      sentinel.focus({ preventScroll: true })

      const root = window.fixtures.getElement("[data-focus]")
      await window.fixtures.scroll(100, { a11y: true, root })

      return sentinel === document.activeElement
    }),
  ).toEqual(true)
})

test("a11y: true, does call focus({ preventScroll: true })", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const root = window.fixtures.getElement("[data-focus]")
      const target = window.fixtures.getElement("[data-focus-element]")
      window.fixtures.captureElementFocusArgs(target)
      await window.fixtures.scroll(target, { a11y: true, root })
      return window.fixtures.getLatestElementFocusArgs()
    }),
  ).toEqual([{ preventScroll: true }])
})

test("a11y: true, focus doesn't change scroll position", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      // Scroll past the target so that it ends up offscreen. Makes it easier to see regressions.
      const offset = 500

      const target = window.fixtures.getElement("[data-focus]")
      const expected = window.fixtures.getElementY(target) + offset

      await window.fixtures.scroll(target, { a11y: true, offset })

      return {
        didFocus: target === document.activeElement,

        // Small tolerance in case the browser ignores fractional scroll values. Can't check captured
        // `scrollTo` calls here, because browsers might not use it when `focus` is called.
        didScroll: Math.abs(window.fixtures.getWindowY() - expected) >= 1,
      }
    }),
  ).toEqual({
    didFocus: true,
    didScroll: false,
  })
})

test("a11y: true, preserves pre-existing tabindex", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const expected = 10
      const root = window.fixtures.getElement("[data-focus]")
      const sentinel = window.fixtures.getElement("[data-focus-button]")

      sentinel.setAttribute("tabindex", `${expected}`)
      await window.fixtures.scroll(sentinel, { a11y: true, root })
      sentinel.blur()

      return sentinel.hasAttribute("tabindex") && Number(sentinel.getAttribute("tabindex")) === expected
    }),
  ).toEqual(true)
})

test("a11y: true, temporary tabindex is added and removed", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const sentinel = window.fixtures.getElement("[data-focus]")

      await window.fixtures.scroll(sentinel, { a11y: true })
      const wasAdded = sentinel.getAttribute("tabindex") === "-1"

      sentinel.blur()
      const wasRemoved = sentinel.getAttribute("tabindex") === null

      return {
        wasAdded,
        wasRemoved,
      }
    }),
  ).toEqual({
    wasAdded: true,
    wasRemoved: true,
  })
})

test("error: target is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(null)
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: target number is invalid", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        window.fixtures.jump(Infinity)
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: target selector is invalid", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        window.fixtures.jump("1337")
      } catch (error) {
        return error instanceof Error
      }

      return false
    }),
  ).toEqual(true)
})

test("error: target selector didn't match", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        window.fixtures.jump(".no-match")
      } catch (error) {
        return error instanceof Error
      }

      return false
    }),
  ).toEqual(true)
})

test("error: options is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", null)
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: a11y is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", { a11y: "true" })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: axis is invalid", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", { axis: "z" })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: callback is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", { callback: true })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: duration is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", { duration: "1000" })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: duration is invalid", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        window.fixtures.jump(".target", { duration: -1000 })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: easing is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", { easing: true })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: offset is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", { offset: "100" })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: offset number is invalid", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        window.fixtures.jump(".target", { offset: NaN })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})

test("error: root is wrong type", async ({ page }) => {
  expect(
    await page.evaluate(() => {
      try {
        // @ts-expect-error Runtime validation check.
        window.fixtures.jump(".target", { root: true })
      } catch (error) {
        return error instanceof TypeError
      }

      return false
    }),
  ).toEqual(true)
})
