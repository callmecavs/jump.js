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

      getWindowScrollXMax: () => number
      getWindowScrollYMax: () => number

      jump: Jump
      scroll: (target: JumpTarget, options?: JumpOptions) => Promise<void>

      wait: (time: number) => Promise<void>
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/behavior.html")
  await page.waitForFunction(() => window.fixtures !== undefined)
})

test.describe("root: window", () => {
  test.describe("axis: x", () => {
    test("target: number (positive)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          window.scrollTo({ left: 50 })
          await window.fixtures.scroll(100, { axis: "x" })
          return window.scrollX
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          window.scrollTo({ left: 150 })
          await window.fixtures.scroll(-100, { axis: "x" })
          return window.scrollX
        }),
      ).toEqual(50)
    })

    test("target: element", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const target = window.fixtures.getElement("[data-window-x-target-element]")

        window.fixtures.captureWindowScrollToArgs()
        await window.fixtures.scroll(target, { axis: "x" })

        return {
          actual: window.fixtures.getLatestWindowScrollToArgs(),
          expected: window.fixtures.getElementX(target),
        }
      })

      expect(actual).toEqual([{ behavior: "instant", left: expected }])
    })

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          window.scrollTo({ left: 25 })
          window.fixtures.captureWindowScrollToArgs()
          await window.fixtures.scroll(-50, { axis: "x" })
          return window.fixtures.getLatestWindowScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", left: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const maxX = window.fixtures.getWindowScrollXMax()

        window.scrollTo({ left: maxX - 25 })
        window.fixtures.captureWindowScrollToArgs()
        await window.fixtures.scroll(50, { axis: "x" })

        return {
          actual: window.fixtures.getLatestWindowScrollToArgs(),
          expected: maxX,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", left: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const target = window.fixtures.getElement("[data-window-x-target-element]")
        const y = 24

        window.scrollTo({ top: y })
        await window.fixtures.scroll(target, { axis: "x" })

        return {
          actual: window.scrollY,
          expected: y,
        }
      })

      expect(actual).toEqual(expected)
    })
  })

  test.describe("axis: y", () => {
    test("target: number (positive)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          window.scrollTo({ top: 50 })
          await window.fixtures.scroll(100)
          return window.scrollY
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          window.scrollTo({ top: 150 })
          await window.fixtures.scroll(-100)
          return window.scrollY
        }),
      ).toEqual(50)
    })

    test("target: number ignores offset", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          window.scrollTo({ top: 50 })
          await window.fixtures.scroll(100, { offset: -50 })
          return window.scrollY
        }),
      ).toEqual(150)
    })

    test("target: element", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const target = window.fixtures.getElement("[data-window-y-target-element]")

        window.fixtures.captureWindowScrollToArgs()
        await window.fixtures.scroll(target)

        return {
          actual: window.fixtures.getLatestWindowScrollToArgs(),
          expected: window.fixtures.getElementY(target),
        }
      })

      expect(actual).toEqual([{ behavior: "instant", top: expected }])
    })

    test("target: element with offset", async ({ page }) => {
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

      expect(actual).toEqual([{ behavior: "instant", top: expected }])
    })

    test("target: string", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        window.fixtures.captureWindowScrollToArgs()
        await window.fixtures.scroll("[data-window-y-target-string]")

        return {
          actual: window.fixtures.getLatestWindowScrollToArgs(),
          expected: window.fixtures.getElementY(window.fixtures.getElement("[data-window-y-target-string]")),
        }
      })

      expect(actual).toEqual([{ behavior: "instant", top: expected }])
    })

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          window.scrollTo({ top: 25 })
          window.fixtures.captureWindowScrollToArgs()
          await window.fixtures.scroll(-50)
          return window.fixtures.getLatestWindowScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", top: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const maxY = window.fixtures.getWindowScrollYMax()

        window.scrollTo({ top: maxY - 25 })
        window.fixtures.captureWindowScrollToArgs()
        await window.fixtures.scroll(50)

        return {
          actual: window.fixtures.getLatestWindowScrollToArgs(),
          expected: maxY,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", top: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const target = window.fixtures.getElement("[data-window-y-target-element")
        const x = 24

        window.scrollTo({ left: x })
        await window.fixtures.scroll(target)

        return {
          actual: window.scrollX,
          expected: x,
        }
      })

      expect(actual).toEqual(expected)
    })
  })
})

test.describe("root: element", () => {
  test.describe("axis: x", () => {
    test("target: number (positive)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollLeft = 50
          await window.fixtures.scroll(100, { axis: "x", root })
          return root.scrollLeft
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollLeft = 150
          await window.fixtures.scroll(-100, { axis: "x", root })
          return root.scrollLeft
        }),
      ).toEqual(50)
    })

    test("target: element", async ({ page }) => {
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

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollLeft = 25
          window.fixtures.captureElementScrollToArgs(root)
          await window.fixtures.scroll(-50, { axis: "x", root })
          return window.fixtures.getLatestElementScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", left: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const root = window.fixtures.getElement("[data-root]")
        const maxX = window.fixtures.getElementScrollXMax(root)

        root.scrollLeft = maxX - 25
        window.fixtures.captureElementScrollToArgs(root)
        await window.fixtures.scroll(50, { axis: "x", root })

        return {
          actual: window.fixtures.getLatestElementScrollToArgs(),
          expected: maxX,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", left: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const root = window.fixtures.getElement("[data-root]")
        const target = window.fixtures.getElement("[data-root-x-element]")
        const y = 24

        root.scrollTo({ top: y })
        await window.fixtures.scroll(target, { axis: "x", root })

        return {
          actual: root.scrollTop,
          expected: y,
        }
      })

      expect(actual).toEqual(expected)
    })
  })

  test.describe("axis: y", () => {
    test("target: number (positive)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollTop = 50
          await window.fixtures.scroll(100, { root })
          return root.scrollTop
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollTop = 150
          await window.fixtures.scroll(-100, { root })
          return root.scrollTop
        }),
      ).toEqual(50)
    })

    test("target: element", async ({ page }) => {
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

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollTop = 25
          window.fixtures.captureElementScrollToArgs(root)
          await window.fixtures.scroll(-50, { root })
          return window.fixtures.getLatestElementScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", top: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const root = window.fixtures.getElement("[data-root]")
        const maxY = window.fixtures.getElementScrollYMax(root)

        root.scrollTop = maxY - 25
        window.fixtures.captureElementScrollToArgs(root)
        await window.fixtures.scroll(50, { root })

        return {
          actual: window.fixtures.getLatestElementScrollToArgs(),
          expected: maxY,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", top: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const { actual, expected } = await page.evaluate(async () => {
        const root = window.fixtures.getElement("[data-root]")
        const target = window.fixtures.getElement("[data-root-y-element]")
        const x = 24

        root.scrollTo({ left: x })
        await window.fixtures.scroll(target, { root })

        return {
          actual: root.scrollLeft,
          expected: x,
        }
      })

      expect(actual).toEqual(expected)
    })
  })
})

test.describe("cancel", () => {
  test("stops an in-progress scroll", async ({ page }) => {
    expect(
      await page.evaluate(async () => {
        const distance = 500
        const duration = 2000
        const step = duration / 4

        const yStart = window.scrollY

        const cancel = window.fixtures.jump(distance, { duration })

        await window.fixtures.wait(step)
        const yBeforeCancel = window.scrollY

        cancel()

        await window.fixtures.wait(step)
        const yAfterCancel = window.scrollY

        return {
          didStart: yBeforeCancel > yStart,
          didStop: yBeforeCancel === yAfterCancel,
          didntComplete: yAfterCancel < yStart + distance,
        }
      }),
    ).toEqual({
      didStart: true,
      didStop: true,
      didntComplete: true,
    })
  })

  test("doesn't run callback", async ({ page }) => {
    expect(
      await page.evaluate(async () => {
        const distance = 500
        const duration = 1000
        const step = duration / 2

        let didRun = false

        const callback = () => {
          didRun = true
        }

        const cancel = window.fixtures.jump(distance, { callback, duration })

        await window.fixtures.wait(step)
        cancel()
        await window.fixtures.wait(duration)

        return didRun
      }),
    ).toEqual(false)
  })
})

test.describe("a11y", () => {
  test.describe("disabled", () => {
    test("false", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const sentinel = window.fixtures.getElement("[data-focus-button]")
          const target = window.fixtures.getElement("[data-focus]")
          sentinel.focus({ preventScroll: true })
          await window.fixtures.scroll(target, { a11y: false })
          return sentinel === document.activeElement
        }),
      ).toEqual(true)
    })

    test("undefined", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const sentinel = window.fixtures.getElement("[data-focus-button]")
          const target = window.fixtures.getElement("[data-focus]")
          sentinel.focus({ preventScroll: true })
          await window.fixtures.scroll(target, { a11y: undefined })
          return sentinel === document.activeElement
        }),
      ).toEqual(true)
    })
  })

  test.describe("enabled", () => {
    test("target: element", async ({ page }) => {
      expect(
        await page.evaluate(async () => {
          const root = window.fixtures.getElement("[data-focus]")
          const target = window.fixtures.getElement("[data-focus-element]")
          await window.fixtures.scroll(target, { a11y: true, root })
          return target === document.activeElement
        }),
      ).toEqual(true)
    })

    test("target: number doesn't change focus", async ({ page }) => {
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

    test("does call focus({ preventScroll: true })", async ({ page }) => {
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

    test("focus doesn't change scroll position", async ({ page }) => {
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
            didScroll: Math.abs(window.scrollY - expected) >= 1,
          }
        }),
      ).toEqual({
        didFocus: true,
        didScroll: false,
      })
    })

    test("preserves pre-existing tabindex", async ({ page }) => {
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

    test("temporary tabindex is added and removed", async ({ page }) => {
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
  })
})

test.describe("error", () => {
  test("target is wrong type", async ({ page }) => {
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

  test("target number is invalid", async ({ page }) => {
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

  test("target selector is invalid", async ({ page }) => {
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

  test("target selector didn't match", async ({ page }) => {
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

  test("options is wrong type", async ({ page }) => {
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

  test("a11y is wrong type", async ({ page }) => {
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

  test("axis is invalid", async ({ page }) => {
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

  test("callback is wrong type", async ({ page }) => {
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

  test("duration is wrong type", async ({ page }) => {
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

  test("duration number is invalid", async ({ page }) => {
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

  test("easing is wrong type", async ({ page }) => {
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

  test("offset is wrong type", async ({ page }) => {
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

  test("offset number is invalid", async ({ page }) => {
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

  test("root is wrong type", async ({ page }) => {
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
})
