import type { Jump, JumpAxis, JumpEasing, JumpRoot } from "./types"
import { isFocusable } from "./dom"
import { resolveAccessibility, resolveDuration, resolveTarget } from "./options"
import { calculateDistance, calculateEnd, calculateStart } from "./scroll"
import { validateOptions, validateTarget } from "./validate"

// Export the types, excluding `JumpResolvedTarget` (internal only).
export type {
  Jump,
  JumpAxis,
  JumpCallback,
  JumpCancel,
  JumpDuration,
  JumpEasing,
  JumpOptions,
  JumpRoot,
  JumpTarget,
} from "./types"

const easeInOutQuad: JumpEasing = p => {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
}

const scrollTo = (axis: JumpAxis, position: number, root: JumpRoot) => {
  if (axis === "x") root.scrollTo({ behavior: "instant", left: position })
  if (axis === "y") root.scrollTo({ behavior: "instant", top: position })
}

const jump: Jump = (rawTarget, options = {}) => {
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

  const target = resolveTarget(rawTarget, root)

  const start = calculateStart(axis, root)
  const end = calculateEnd(axis, offset, root, start, target)

  const a11y = resolveAccessibility(rawA11y, target)
  const distance = calculateDistance(end, start)
  const duration = resolveDuration(distance, rawDuration)

  let rafId: number
  let startTime: number | undefined

  const complete = () => {
    // If the jump is `instant`, this completes it immediately.
    // If the jump isn't `instant`, this makes sure the final position is perfect.
    scrollTo(axis, end, root)

    if (a11y && isFocusable(target)) {
      // Add the `tabindex` attribute temporarily, to ensure calling `focus` works, unless:
      // 1. The node already has the `tabindex` attribute.
      // 2. The node is in the tab order by default (example: <a>, <button>, etc).
      const needTabIndex = !target.hasAttribute("tabindex") && target.tabIndex < 0

      if (needTabIndex) target.setAttribute("tabindex", "-1")

      target.focus({ preventScroll: true })

      if (needTabIndex) {
        const didFocus = document.activeElement === target

        // If `focus` failed, remove `tabindex` immediately.
        if (!didFocus) target.removeAttribute("tabindex")

        // If `focus` worked, keep the `tabindex` until the `target` is `blur`red, because
        // removing it will also remove the `focus`.
        if (didFocus) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true })
      }
    }

    // If we made it here, and the `callback` exists:
    // 1. Run it no matter what. Disregard the frame ID, it's not intended to be `cancel`-able.
    // 2. Make sure it runs after the final `scrollTo` call.
    if (callback) window.requestAnimationFrame(() => callback())
  }

  const loop = (currentTime: DOMHighResTimeStamp) => {
    if (startTime === undefined) startTime = currentTime

    // Limit `elapsedTime` to `duration` to prevent going "past the end" of the jump.
    const elapsedTime = Math.min(currentTime - startTime, duration)

    const progress = elapsedTime / duration
    const next = start + distance * easing(progress)

    if (elapsedTime < duration) {
      scrollTo(axis, next, root)
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
