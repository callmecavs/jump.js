import { isElement } from "./dom"
import type { JumpDuration, JumpResolvedTarget, JumpTarget } from "./types"

export const resolveAccessibility = (a11y: boolean, target: JumpResolvedTarget) => {
  // The `a11y` option doesn't do anything w/o a `target` node.
  if (typeof target === "number") return false
  return a11y
}

export const resolveDuration = (distance: number, duration: JumpDuration) => {
  if (typeof duration === "function") return duration(distance)
  return duration
}

export const resolveTarget = (target: JumpTarget): JumpResolvedTarget => {
  if (isElement(target) || typeof target === "number") return target

  let node: Element | null

  try {
    node = document.querySelector(target)
  } catch (error) {
    throw new Error(`Failed to resolve "target" string: CSS selector is invalid.`, { cause: error })
  }

  if (node === null) {
    throw new Error(`Failed to resolve "target" string: CSS selector didn't match.`)
  }

  return node
}
