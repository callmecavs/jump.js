import { expect, test } from "@playwright/test"

import type { Jump } from "../src/types"

declare global {
  type EventName = "callback" | "element-focus" | "element-scroll" | "window-scroll"
  type ScrollToArgs = [options?: ScrollToOptions] | [x: number, y: number]

  interface Window {
    fixtures: {
      captureEvent: (name: EventName) => void
      getEvents: () => Array<EventName>

      captureRequestAnimationFrameArgs: () => void
      getLatestRequestAnimationFrameArgs: () => Parameters<Window["requestAnimationFrame"]> | undefined

      captureElementFocusArgs: (element: HTMLElement) => void
      getLatestElementFocusArgs: () => Parameters<HTMLElement["focus"]> | undefined

      captureElementScrollToArgs: (element: HTMLElement) => void
      getLatestElementScrollToArgs: () => ScrollToArgs | undefined

      captureWindowScrollToArgs: () => void
      getLatestWindowScrollToArgs: () => ScrollToArgs | undefined

      getElement: (selector: string) => HTMLElement
      getElementBounds: (element: HTMLElement) => DOMRect
      getElementScrollXMax: (element: HTMLElement) => number
      getElementScrollYMax: (element: HTMLElement) => number

      getWindowScrollXMax: () => number
      getWindowScrollYMax: () => number

      jump: Jump
      jumpAsync: (...args: Parameters<Jump>) => Promise<void>
      jumpInstant: Jump

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
        await page.evaluate(() => {
          window.scrollTo({ left: 50 })
          window.fixtures.jumpInstant(100, { axis: "x" })
          return window.scrollX
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.scrollTo({ left: 150 })
          window.fixtures.jumpInstant(-100, { axis: "x" })
          return window.scrollX
        }),
      ).toEqual(50)
    })

    test("target: element", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const target = window.fixtures.getElement("[data-window-x-target-element]")
          window.fixtures.jumpInstant(target, { axis: "x" })
          return window.fixtures.getElementBounds(target).left
        }),
      ).toEqual(0)
    })

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.scrollTo({ left: 25 })
          window.fixtures.captureWindowScrollToArgs()
          window.fixtures.jumpInstant(-50, { axis: "x" })
          return window.fixtures.getLatestWindowScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", left: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(() => {
        const maxX = window.fixtures.getWindowScrollXMax()

        window.scrollTo({ left: maxX - 25 })
        window.fixtures.captureWindowScrollToArgs()
        window.fixtures.jumpInstant(50, { axis: "x" })

        return {
          actual: window.fixtures.getLatestWindowScrollToArgs(),
          expected: maxX,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", left: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const y = 25

      expect(
        await page.evaluate(y => {
          const target = window.fixtures.getElement("[data-window-x-target-element]")
          window.scrollTo({ top: y })
          window.fixtures.jumpInstant(target, { axis: "x" })
          return window.scrollY
        }, y),
      ).toEqual(y)
    })
  })

  test.describe("axis: y", () => {
    test("target: number (positive)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.scrollTo({ top: 50 })
          window.fixtures.jumpInstant(100)
          return window.scrollY
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.scrollTo({ top: 150 })
          window.fixtures.jumpInstant(-100)
          return window.scrollY
        }),
      ).toEqual(50)
    })

    test("target: number ignores offset", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.scrollTo({ top: 50 })
          window.fixtures.jumpInstant(100, { offset: -50 })
          return window.scrollY
        }),
      ).toEqual(150)
    })

    test("target: element", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const target = window.fixtures.getElement("[data-window-y-target-element]")
          window.fixtures.jumpInstant(target)
          return window.fixtures.getElementBounds(target).top
        }),
      ).toEqual(0)
    })

    test("target: element with offset", async ({ page }) => {
      const offset = 50

      expect(
        await page.evaluate(offset => {
          const target = window.fixtures.getElement("[data-window-y-target-element]")
          window.fixtures.jumpInstant(target, { offset })
          return window.fixtures.getElementBounds(target).top
        }, offset),
      ).toEqual(-offset)
    })

    test("target: string", async ({ page }) => {
      const selector = "[data-window-y-target-string]"

      expect(
        await page.evaluate(selector => {
          window.fixtures.jumpInstant(selector)
          return window.fixtures.getElementBounds(window.fixtures.getElement(selector)).top
        }, selector),
      ).toEqual(0)
    })

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.scrollTo({ top: 25 })
          window.fixtures.captureWindowScrollToArgs()
          window.fixtures.jumpInstant(-50)
          return window.fixtures.getLatestWindowScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", top: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(() => {
        const maxY = window.fixtures.getWindowScrollYMax()

        window.scrollTo({ top: maxY - 25 })
        window.fixtures.captureWindowScrollToArgs()
        window.fixtures.jumpInstant(50)

        return {
          actual: window.fixtures.getLatestWindowScrollToArgs(),
          expected: maxY,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", top: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const x = 25

      expect(
        await page.evaluate(x => {
          const target = window.fixtures.getElement("[data-window-y-target-element]")
          window.scrollTo({ left: x })
          window.fixtures.jumpInstant(target)
          return window.scrollX
        }, x),
      ).toEqual(x)
    })

    // TODO: pull out `distance`
    test("instant: duration", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const distance = 100

          window.fixtures.captureRequestAnimationFrameArgs()
          window.fixtures.captureWindowScrollToArgs()
          window.fixtures.jump(distance, { duration: 0 })

          return {
            argsFrame: window.fixtures.getLatestRequestAnimationFrameArgs(),
            argsScroll: window.fixtures.getLatestWindowScrollToArgs(),
          }
        }),
      ).toEqual({
        argsFrame: undefined,
        argsScroll: [{ behavior: "instant", top: 100 }],
      })
    })

    test("instant: distance", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.fixtures.captureRequestAnimationFrameArgs()
          window.fixtures.captureWindowScrollToArgs()
          window.fixtures.jump(0)

          return {
            argsFrame: window.fixtures.getLatestRequestAnimationFrameArgs(),
            argsScroll: window.fixtures.getLatestWindowScrollToArgs(),
          }
        }),
      ).toEqual({
        argsFrame: undefined,
        argsScroll: undefined,
      })
    })

    test("instant: distance, sub-pixel", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          window.fixtures.captureRequestAnimationFrameArgs()
          window.fixtures.captureWindowScrollToArgs()
          window.fixtures.jump(0.5)

          return {
            argsFrame: window.fixtures.getLatestRequestAnimationFrameArgs(),
            argsScroll: window.fixtures.getLatestWindowScrollToArgs(),
          }
        }),
      ).toEqual({
        argsFrame: undefined,
        argsScroll: [{ behavior: "instant", top: 0.5 }],
      })
    })
  })
})

test.describe("root: element", () => {
  test.describe("axis: x", () => {
    test("target: number (positive)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollLeft = 50
          window.fixtures.jumpInstant(100, { axis: "x", root })
          return root.scrollLeft
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollLeft = 150
          window.fixtures.jumpInstant(-100, { axis: "x", root })
          return root.scrollLeft
        }),
      ).toEqual(50)
    })

    test("target: element", async ({ page }) => {
      const { actual, expected } = await page.evaluate(() => {
        const root = window.fixtures.getElement("[data-root]")
        const target = window.fixtures.getElement("[data-root-x-element]")

        window.fixtures.jumpInstant(target, { axis: "x", root })

        return {
          actual: root.scrollLeft,
          expected: target.offsetLeft,
        }
      })

      expect(actual).toEqual(expected)
    })

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollLeft = 25
          window.fixtures.captureElementScrollToArgs(root)
          window.fixtures.jumpInstant(-50, { axis: "x", root })
          return window.fixtures.getLatestElementScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", left: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(() => {
        const root = window.fixtures.getElement("[data-root]")
        const maxX = window.fixtures.getElementScrollXMax(root)

        root.scrollLeft = maxX - 25
        window.fixtures.captureElementScrollToArgs(root)
        window.fixtures.jumpInstant(50, { axis: "x", root })

        return {
          actual: window.fixtures.getLatestElementScrollToArgs(),
          expected: maxX,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", left: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const y = 25

      expect(
        await page.evaluate(y => {
          const root = window.fixtures.getElement("[data-root]")
          const target = window.fixtures.getElement("[data-root-x-element]")
          root.scrollTo({ top: y })
          window.fixtures.jumpInstant(target, { axis: "x", root })
          return root.scrollTop
        }, y),
      ).toEqual(y)
    })
  })

  test.describe("axis: y", () => {
    test("target: number (positive)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollTop = 50
          window.fixtures.jumpInstant(100, { root })
          return root.scrollTop
        }),
      ).toEqual(150)
    })

    test("target: number (negative)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollTop = 150
          window.fixtures.jumpInstant(-100, { root })
          return root.scrollTop
        }),
      ).toEqual(50)
    })

    test("target: element", async ({ page }) => {
      const { actual, expected } = await page.evaluate(() => {
        const root = window.fixtures.getElement("[data-root]")
        const target = window.fixtures.getElement("[data-root-y-element]")

        window.fixtures.jumpInstant(target, { root })

        return {
          actual: root.scrollTop,
          expected: target.offsetTop,
        }
      })

      expect(actual).toEqual(expected)
    })

    test("is clamped (start)", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-root]")
          root.scrollTop = 25
          window.fixtures.captureElementScrollToArgs(root)
          window.fixtures.jumpInstant(-50, { root })
          return window.fixtures.getLatestElementScrollToArgs()
        }),
      ).toEqual([{ behavior: "instant", top: 0 }])
    })

    test("is clamped (end)", async ({ page }) => {
      const { actual, expected } = await page.evaluate(() => {
        const root = window.fixtures.getElement("[data-root]")
        const maxY = window.fixtures.getElementScrollYMax(root)

        root.scrollTop = maxY - 25
        window.fixtures.captureElementScrollToArgs(root)
        window.fixtures.jumpInstant(50, { root })

        return {
          actual: window.fixtures.getLatestElementScrollToArgs(),
          expected: maxY,
        }
      })

      expect(actual).toEqual([{ behavior: "instant", top: expected }])
    })

    test("doesn't mutate other axis", async ({ page }) => {
      const x = 25

      expect(
        await page.evaluate(x => {
          const root = window.fixtures.getElement("[data-root]")
          const target = window.fixtures.getElement("[data-root-y-element]")
          root.scrollTo({ left: x })
          window.fixtures.jumpInstant(target, { root })
          return root.scrollLeft
        }, x),
      ).toEqual(x)
    })
  })
})

test.describe("a11y", () => {
  test.describe("disabled", () => {
    test("false", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const sentinel = window.fixtures.getElement("[data-focus-button]")
          const target = window.fixtures.getElement("[data-focus]")
          sentinel.focus({ preventScroll: true })
          window.fixtures.jumpInstant(target, { a11y: false })
          return sentinel === document.activeElement
        }),
      ).toEqual(true)
    })

    test("undefined", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const sentinel = window.fixtures.getElement("[data-focus-button]")
          const target = window.fixtures.getElement("[data-focus]")
          sentinel.focus({ preventScroll: true })
          window.fixtures.jumpInstant(target, { a11y: undefined })
          return sentinel === document.activeElement
        }),
      ).toEqual(true)
    })
  })

  test.describe("enabled", () => {
    test("target: element", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-focus]")
          const target = window.fixtures.getElement("[data-focus-element]")
          window.fixtures.jumpInstant(target, { a11y: true, root })
          return target === document.activeElement
        }),
      ).toEqual(true)
    })

    test("target: number doesn't change focus", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-focus]")
          const sentinel = window.fixtures.getElement("[data-focus-button]")
          sentinel.focus({ preventScroll: true })
          window.fixtures.jumpInstant(100, { a11y: true, root })
          return sentinel === document.activeElement
        }),
      ).toEqual(true)
    })

    test("calls focus with `preventScroll: true` option", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const root = window.fixtures.getElement("[data-focus]")
          const target = window.fixtures.getElement("[data-focus-element]")
          window.fixtures.captureElementFocusArgs(target)
          window.fixtures.jumpInstant(target, { a11y: true, root })
          return window.fixtures.getLatestElementFocusArgs()
        }),
      ).toEqual([{ preventScroll: true }])
    })

    test("focus doesn't change scroll position", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const offset = 500
          const target = window.fixtures.getElement("[data-focus]")

          window.fixtures.jumpInstant(target, { a11y: true, offset })

          return {
            wasFocused: target === document.activeElement,
            wasScrolled: window.fixtures.getElementBounds(target).top !== -offset,
          }
        }),
      ).toEqual({
        wasFocused: true,
        wasScrolled: false,
      })
    })

    test("preserves pre-existing tabindex", async ({ page }) => {
      const tabindex = "10"

      expect(
        await page.evaluate(tabindex => {
          const root = window.fixtures.getElement("[data-focus]")
          const sentinel = window.fixtures.getElement("[data-focus-button]")

          sentinel.setAttribute("tabindex", tabindex)
          window.fixtures.jumpInstant(sentinel, { a11y: true, root })
          sentinel.blur()

          return sentinel.getAttribute("tabindex")
        }, tabindex),
      ).toEqual(tabindex)
    })

    test("temporary tabindex is added and removed", async ({ page }) => {
      expect(
        await page.evaluate(() => {
          const sentinel = window.fixtures.getElement("[data-focus]")

          window.fixtures.jumpInstant(sentinel, { a11y: true })
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

test.describe("cancel", () => {
  test("stops an in-progress scroll", async ({ page }) => {
    expect(
      await page.evaluate(async () => {
        const distance = 500
        const duration = 2000
        const step = duration / 3

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

test.describe("error", () => {
  test("target: is wrong type", async ({ page }) => {
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

  test("target: number is invalid", async ({ page }) => {
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

  test("target: selector is invalid", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          window.fixtures.jump("1337")
        } catch (error) {
          return error instanceof Error && error.constructor === Error
        }

        return false
      }),
    ).toEqual(true)
  })

  test("target: selector didn't match", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          window.fixtures.jump(".no-match")
        } catch (error) {
          return error instanceof Error && error.constructor === Error
        }

        return false
      }),
    ).toEqual(true)
  })

  test("options: is wrong type", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, null)
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("a11y: is wrong type", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, { a11y: "true" })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("axis: is invalid", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, { axis: "z" })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("callback: is wrong type", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, { callback: true })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("duration: is wrong type", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, { duration: "1000" })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("duration: number is invalid", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          window.fixtures.jump(100, { duration: -1000 })
        } catch (error) {
          return error instanceof Error && error.constructor === Error
        }

        return false
      }),
    ).toEqual(true)
  })

  test("duration: function returns number that is invalid", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          window.fixtures.jump(100, { duration: distance => -1 * distance })
        } catch (error) {
          return error instanceof Error && error.constructor === Error
        }

        return false
      }),
    ).toEqual(true)
  })

  test("easing: is wrong type", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, { easing: true })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("offset: is wrong type", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, { offset: "100" })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("offset: number is invalid", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          window.fixtures.jump(100, { offset: NaN })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })

  test("root: is wrong type", async ({ page }) => {
    expect(
      await page.evaluate(() => {
        try {
          // @ts-expect-error Runtime validation check.
          window.fixtures.jump(100, { root: true })
        } catch (error) {
          return error instanceof TypeError
        }

        return false
      }),
    ).toEqual(true)
  })
})

test.describe("sequencing", () => {
  test("order: final scroll -> callback", async ({ page }) => {
    expect(
      await page.evaluate(async () => {
        const root = window.fixtures.getElement("[data-focus]")
        const target = window.fixtures.getElement("[data-focus-element]")

        const callback = () => window.fixtures.captureEvent("callback")

        window.fixtures.captureElementScrollToArgs(root)

        await window.fixtures.jumpAsync(target, { callback, root })

        return window.fixtures.getEvents().slice(-2)
      }),
    ).toEqual(["element-scroll", "callback"])
  })

  test("order: final scroll -> focus -> callback", async ({ page }) => {
    expect(
      await page.evaluate(async () => {
        const root = window.fixtures.getElement("[data-focus]")
        const target = window.fixtures.getElement("[data-focus-element]")

        const callback = () => window.fixtures.captureEvent("callback")

        window.fixtures.captureElementFocusArgs(target)
        window.fixtures.captureElementScrollToArgs(root)

        await window.fixtures.jumpAsync(target, { a11y: true, callback, root })

        return window.fixtures.getEvents().slice(-3)
      }),
    ).toEqual(["element-scroll", "element-focus", "callback"])
  })
})
