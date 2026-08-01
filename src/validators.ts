import type { JumpOptions } from "./types"
import { isElement, isWindow } from "./guards"

const validateObject: (value: unknown) => asserts value is Record<string, unknown> = value => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`Expected "options" to be an object.`)
  }
}

const validateAccessibility: (value: unknown) => asserts value is JumpOptions["a11y"] = value => {
  if (value !== undefined && typeof value !== "boolean") throw new TypeError(`Expected "a11y" to be a boolean.`)
}

const validateAxis: (value: unknown) => asserts value is JumpOptions["axis"] = value => {
  if (value !== undefined && value !== "x" && value !== "y") throw new TypeError(`Expected "axis" to be "x" or "y".`)
}

const validateCallback: (value: unknown) => asserts value is JumpOptions["callback"] = value => {
  if (value !== undefined && typeof value !== "function") throw new TypeError(`Expected "callback" to be a function.`)
}

const validateDuration: (value: unknown) => asserts value is JumpOptions["duration"] = value => {
  if (value !== undefined && typeof value !== "number" && typeof value !== "function") {
    throw new TypeError(`Expected "duration" to be a number, or function.`)
  }

  if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) {
    throw new TypeError(`Expected "duration" to be a finite, non-negative number.`)
  }
}

const validateEasing: (value: unknown) => asserts value is JumpOptions["easing"] = value => {
  if (value !== undefined && typeof value !== "function") throw new TypeError(`Expected "easing" to be a function.`)
}

const validateOffset: (value: unknown) => asserts value is JumpOptions["offset"] = value => {
  if (value !== undefined) {
    if (typeof value !== "number") throw new TypeError(`Expected "offset" to be a number.`)
    if (!Number.isFinite(value)) throw new TypeError(`Expected "offset" to be a finite number.`)
  }
}

const validateRoot: (value: unknown) => asserts value is JumpOptions["root"] = value => {
  if (value !== undefined && !isWindow(value) && !isElement(value)) {
    throw new TypeError(`Expected "root" to be a Window, or Element.`)
  }
}

export const validateOptions = (options: unknown) => {
  validateObject(options)

  const { a11y, axis, callback, duration, easing, offset, root } = options

  validateAccessibility(a11y)
  validateAxis(axis)
  validateCallback(callback)
  validateDuration(duration)
  validateEasing(easing)
  validateOffset(offset)
  validateRoot(root)
}

export const validateTarget = (target: unknown) => {
  if (isElement(target) || typeof target === "string") return

  if (typeof target === "number") {
    if (!Number.isFinite(target)) throw new TypeError(`Expected "target" to be a finite number.`)
    return
  }

  throw new TypeError(`Expected "target" to be an Element, number, or string.`)
}
