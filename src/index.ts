import type { JumpCancel, JumpEasing, JumpOptions, JumpTarget } from "./types"
import { isFocusable } from "./dom"
import { resolveAccessibility, resolveDuration, resolveTarget } from "./options"
import { calculateEnd, calculateStart } from "./scroll"
import { validateOptions, validateTarget } from "./validate"

export type * from "./types"

// Robert Penner's easeInOutQuad
// https://github.com/danro/jquery-easing/blob/master/jquery.easing.js#L28-L31
const easeInOutQuad: JumpEasing = (t, b, c, d) => {
  if ((t /= d / 2) < 1) return (c / 2) * t * t + b
  return (-c / 2) * (--t * (t - 2) - 1) + b
}

const jump = (rawTarget: JumpTarget, options: JumpOptions = {}): JumpCancel => {
  validateTarget(rawTarget)
  validateOptions(options)

  const {
    a11y: rawA11y = false,
    axis = "y",
    callback = undefined,
    duration: rawDuration = 1000,
    easing = easeInOutQuad,
    offset = 0,
    root = window,
  } = options

  const target = resolveTarget(rawTarget)

  const start = calculateStart(axis, root)
  const end = calculateEnd(axis, offset, root, start, target)

  const a11y = resolveAccessibility(rawA11y, target)
  const distance = end - start
  const duration = resolveDuration(distance, rawDuration)

  let rafId: number
  let startTime: number

  const complete = () => {
    // If the jump is not `instant`, make sure the final position is perfect (no rounding inaccuracies).
    // If the jump is `instant`, complete it immediately.
    if (axis === "x") root.scrollTo({ left: end })
    if (axis === "y") root.scrollTo({ top: end })

    if (a11y && isFocusable(target)) {
      // Add the `tabindex` attribute temporarily, to ensure calling `focus` works, unless:
      // 1. The node already has the `tabindex` attribute.
      // 2. The node is in the tab order by default (example: <a>, <button>, etc).
      const needTabIndex = !target.hasAttribute("tabindex") && target.tabIndex < 0

      if (needTabIndex) target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
      if (needTabIndex) target.removeAttribute("tabindex")
    }

    // If the `callback` exists:
    // 1. Run it no matter what. Disregard the frame ID, it's not intended to be `cancel`-able.
    // 2. Make sure it runs after the final `scrollTo` call.
    if (callback) window.requestAnimationFrame(() => callback())
  }

  const loop = (currentTime: DOMHighResTimeStamp) => {
    if (startTime === undefined) startTime = currentTime

    // Limit `elapsedTime` to `duration` to prevent going "past the end" of the jump.
    const elapsedTime = Math.min(currentTime - startTime, duration)

    const next = easing(elapsedTime, start, distance, duration)

    if (axis === "x") root.scrollTo({ left: next })
    if (axis === "y") root.scrollTo({ top: next })

    if (elapsedTime < duration) {
      rafId = window.requestAnimationFrame(loop)
      return
    }

    complete()
  }

  // Instant jumps complete immediately. No `rAF` loop to `cancel` here.
  const instant = distance === 0 || duration === 0

  if (instant) {
    complete()
    return () => {}
  }

  // Kick off the `rAF` loop, and return the `cancel` function.
  rafId = window.requestAnimationFrame(loop)
  return () => window.cancelAnimationFrame(rafId)
}

export default jump
