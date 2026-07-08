import type { JumpOptions, JumpTarget } from "./types"
import { isElement, isWindow } from "./dom"

export const validateOptions: (options: unknown) => asserts options is JumpOptions = options => {
  if (typeof options !== "object" || Array.isArray(options) || options === null) {
    throw new TypeError(`Expected "options" to be an object.`)
  }

  const { a11y, axis, callback, duration, easing, offset, root } = options as JumpOptions

  if (a11y !== undefined && typeof a11y !== "boolean") {
    throw new TypeError(`Expected "a11y" to be a boolean.`)
  }

  if (axis !== undefined && axis !== "x" && axis !== "y") {
    throw new TypeError(`Expected "axis" to be "x" or "y".`)
  }

  if (callback !== undefined && typeof callback !== "function") {
    throw new TypeError(`Expected "callback" to be a function.`)
  }

  if (duration !== undefined) {
    if (typeof duration !== "number" && typeof duration !== "function") {
      throw new TypeError(`Expected "duration" to be a number, or function.`)
    }

    if (typeof duration === "number" && (!isFinite(duration) || duration < 0)) {
      throw new TypeError(`Expected "duration" to be a finite, non-negative number.`)
    }
  }

  if (easing !== undefined && typeof easing !== "function") {
    throw new TypeError(`Expected "easing" to be a function.`)
  }

  if (offset !== undefined) {
    if (typeof offset !== "number") {
      throw new TypeError(`Expected "offset" to be a number.`)
    }

    if (!isFinite(offset)) {
      throw new TypeError(`Expected "offset" to be a finite number.`)
    }
  }

  if (root !== undefined && !isWindow(root) && !isElement(root)) {
    throw new TypeError(`Expected "root" to be the window, or an Element.`)
  }
}

export const validateTarget: (target: unknown) => asserts target is JumpTarget = target => {
  if (isElement(target) || typeof target === "string") return

  if (typeof target === "number") {
    if (!isFinite(target)) {
      throw new TypeError(`Expected "target" to be a finite number.`)
    }

    return
  }

  throw new TypeError(`Expected "target" to be an Element, number, or string.`)
}
