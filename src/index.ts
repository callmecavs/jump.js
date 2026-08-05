import type { Jump } from "./types"
import { calculateEnd, calculateStart } from "./calculations"
import { hasFocusMethod } from "./guards"
import {
  resolveAccessibility,
  resolveDuration,
  resolveRoot,
  resolveRootElement,
  resolveRtl,
  resolveTarget,
  resolveView,
} from "./resolvers"
import { easeInOutQuad, noop, scroll } from "./utilities"
import { validateOptions, validateTarget } from "./validators"

// Export the types. `JumpResolvedTarget` is intentionally omitted.
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

  const view = resolveView(rawRoot)
  const root = resolveRoot(rawRoot, view)
  const rootElement = resolveRootElement(root)
  const target = resolveTarget(root, rawTarget)

  const start = calculateStart(axis, root)
  const rtl = resolveRtl(axis, rootElement, view)
  const end = calculateEnd(axis, offset, root, rootElement, rtl, start, target)

  const distance = end - start
  const duration = resolveDuration(distance, rawDuration)

  const a11y = resolveAccessibility(rawA11y, target)

  // Flag `instant` jumps. A small tolerance is included when checking `distance` because browsers behave
  // inconsistently when handling fractional `scrollTo` coordinates.
  const instant = Math.abs(distance) < 1 || duration === 0

  let frameId: number
  let startTime: number | undefined

  const complete = () => {
    // Again, because of potentially fractional `scrollTo` coordinates, avoid calling `scrollTo` if it's not necessary.
    // It's not always safe to "(re)write" the `start` position, especially if the jump is `instant`.
    if (start !== end) scroll(axis, end, root)

    if (a11y && hasFocusMethod(target)) {
      // Add a temporary `tabindex` unless the element already has a `tabindex` or is natively interactive.
      const needsIndex = !target.hasAttribute("tabindex") && target.tabIndex < 0

      if (needsIndex) target.setAttribute("tabindex", "-1")

      target.focus({ preventScroll: true })

      if (needsIndex) {
        // Prefer `matches` because it's realm-agnostic.
        const receivedFocus = target.matches(":focus")

        // If `focus` worked, keep the `tabindex` until `blur`. Removing it will also remove `focus` in some browsers.
        // If `focus` failed, remove the `tabindex` immediately.
        if (receivedFocus) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true })
        else target.removeAttribute("tabindex")
      }
    }

    // Run the `callback` in the frame after scroll completion.
    // Don't store this frame ID, because the `callback` isn't intended to be canceled.
    if (callback) view.requestAnimationFrame(() => callback())
  }

  const loop = (currentTime: DOMHighResTimeStamp) => {
    // Catch the 1st frame in a `loop`. Can't make `progress` without a `startTime`.
    if (startTime === undefined) {
      startTime = currentTime
    } else {
      // Limit `elapsedTime` to `duration` to prevent going "past the end" of the jump.
      const elapsedTime = Math.min(currentTime - startTime, duration)

      const progress = elapsedTime / duration
      const next = start + distance * easing(progress)

      if (elapsedTime >= duration) {
        complete()
        return
      }

      scroll(axis, next, root)
    }

    frameId = view.requestAnimationFrame(loop)
  }

  // If the jump is `instant`, `complete` it immediately. There's no `loop` to `cancel` here.
  if (instant) {
    complete()
    return noop
  }

  // Kick off the `rAF` loop and return the `cancel` function.
  frameId = view.requestAnimationFrame(loop)
  return () => view.cancelAnimationFrame(frameId)
}

export default jump
