import type { Jump } from "./types"
import { calculateEnd, calculateStart } from "./calculations"
import { hasFocusMethod } from "./guards"
import { resolveAccessibility, resolveDuration, resolveRoot, resolveTarget } from "./resolvers"
import { easeInOutQuad, noop, scroll } from "./utilities"
import { validateOptions, validateTarget } from "./validators"

// Export the types. `JumpDirection` and `JumpResolvedTarget` are intentionally omitted (internal only).
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
    root: rawRoot = window,
  } = options

  const root = resolveRoot(rawRoot)
  const target = resolveTarget(root, rawTarget)

  const start = calculateStart(axis, root)
  const end = calculateEnd(axis, offset, root, start, target)

  const a11y = resolveAccessibility(rawA11y, target)
  const distance = end - start
  const duration = resolveDuration(distance, rawDuration)
  const isInstant = Math.abs(end - start) < 1 || duration === 0

  let frameId: number
  let startTime: number | undefined

  const complete = () => {
    // If the jump is `instant`, this completes it immediately.
    // If not, this ensures the final position is perfect.
    scroll(axis, end, root)

    if (a11y && hasFocusMethod(target)) {
      // Add a temporary `tabindex` unless:
      // 1. The element already has a `tabindex`.
      // 2. The element is natively interactive.
      const needTabIndex = !target.hasAttribute("tabindex") && target.tabIndex < 0

      if (needTabIndex) target.setAttribute("tabindex", "-1")

      target.focus({ preventScroll: true })

      if (needTabIndex) {
        // Avoid using `document.activeElement` to preserve Shadow DOM and <iframe> compatibility.
        const didFocus = target.matches(":focus")

        // If `focus` succeeded, keep the `tabindex` until `blur`.
        // Removing it will also remove the `focus` in some browsers.
        if (didFocus) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true })

        // If `focus` failed, remove the `tabindex` immediately.
        if (!didFocus) target.removeAttribute("tabindex")
      }
    }

    // If the `callback` exists, run it after the final `scrollTo` call. Prevent it from
    // being `cancel`led by dropping the `frameId`.
    if (callback) window.requestAnimationFrame(() => callback())
  }

  const loop = (currentTime: DOMHighResTimeStamp) => {
    if (startTime === undefined) startTime = currentTime

    // Limit `elapsedTime` to `duration` to prevent going "past the end".
    const elapsedTime = Math.min(currentTime - startTime, duration)

    const progress = elapsedTime / duration
    const next = start + distance * easing(progress)

    if (elapsedTime < duration) {
      scroll(axis, next, root)
      frameId = window.requestAnimationFrame(loop)
      return
    }

    complete()
  }

  // Instant jumps complete immediately. No `rAF` loop to `cancel` here.
  if (isInstant) {
    complete()
    return noop
  }

  // Kick off the `rAF` loop, and return the `cancel` function.
  frameId = window.requestAnimationFrame(loop)
  return () => window.cancelAnimationFrame(frameId)
}

export default jump
