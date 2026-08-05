import type { JumpOptions } from "./types"
import { isElement, isWindow } from "./guards"

const validateObject: (value: unknown) => asserts value is Record<string, unknown> = value => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`"options": expected an object.`)
  }
}

const validateAccessibility: (value: unknown) => asserts value is JumpOptions["a11y"] = value => {
  if (value !== undefined && typeof value !== "boolean") throw new TypeError(`"a11y": expected a boolean.`)
}

const validateAxis: (value: unknown) => asserts value is JumpOptions["axis"] = value => {
  if (value !== undefined && value !== "x" && value !== "y") throw new TypeError(`"axis": expected "x" or "y".`)
}

const validateCallback: (value: unknown) => asserts value is JumpOptions["callback"] = value => {
  if (value !== undefined && typeof value !== "function") throw new TypeError(`"callback": expected a function.`)
}

const validateDuration: (value: unknown) => asserts value is JumpOptions["duration"] = value => {
  if (value !== undefined && typeof value !== "number" && typeof value !== "function") {
    throw new TypeError(`"duration": expected a number or a function.`)
  }
}

const validateEasing: (value: unknown) => asserts value is JumpOptions["easing"] = value => {
  if (value !== undefined && typeof value !== "function") throw new TypeError(`"easing": expected a function.`)
}

const validateOffset: (value: unknown) => asserts value is JumpOptions["offset"] = value => {
  if (value !== undefined) {
    if (typeof value !== "number") throw new TypeError(`"offset": expected a number.`)
    if (!Number.isFinite(value)) throw new TypeError(`"offset": expected a finite number.`)
  }
}

const validateRoot: (value: unknown) => asserts value is JumpOptions["root"] = value => {
  if (value !== undefined && !isWindow(value) && !isElement(value)) {
    throw new TypeError(`"root": expected a Window or an Element.`)
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

export const validateTarget = (rawTarget: unknown) => {
  if (isElement(rawTarget) || typeof rawTarget === "string") return

  if (typeof rawTarget === "number") {
    if (!Number.isFinite(rawTarget)) throw new TypeError(`"target": expected a finite number.`)
    return
  }

  throw new TypeError(`"target": expected an Element, a number, or a string.`)
}
