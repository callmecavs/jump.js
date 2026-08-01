import type { JumpDirection, JumpDuration, JumpResolvedTarget, JumpRoot, JumpTarget } from "./types"
import { isElement, isWindow } from "./guards"

export const resolveAccessibility = (a11y: boolean, target: JumpResolvedTarget) => {
  // Catch number `target`s.
  if (typeof target === "number") return false
  return a11y
}

export const resolveDirection = (root: JumpRoot): JumpDirection => {
  const scrollRoot = isWindow(root) ? root.document.documentElement : root
  const scrollView = scrollRoot.ownerDocument.defaultView
  return scrollView?.getComputedStyle(scrollRoot).direction === "rtl" ? "rtl" : "ltr"
}

export const resolveDuration = (distance: number, duration: JumpDuration) => {
  const resolved = typeof duration === "function" ? duration(distance) : duration

  // Catch invalid `duration` number.
  if (!Number.isFinite(resolved) || resolved < 0) {
    throw new Error(`"duration": expected a finite, non-negative number.`)
  }

  return resolved
}

export const resolveRoot = (root: JumpRoot): JumpRoot => {
  // Catch the `root` being the `documentElement`. Use the `window` instead
  // because, like `Element`s, it has a stationary bounding box.
  if (isElement(root) && root === root.ownerDocument.documentElement) {
    return root.ownerDocument.defaultView ?? root
  }

  return root
}

export const resolveTarget = (root: JumpRoot, target: JumpTarget): JumpResolvedTarget => {
  if (typeof target === "number") return target

  let element: Element | null

  if (isElement(target)) {
    element = target
  } else {
    try {
      const scope = isWindow(root) ? root.document : root
      element = scope.querySelector(target)
    } catch (error) {
      throw new Error(`"target": CSS selector is invalid.`, { cause: error })
    }

    if (element === null) throw new Error(`"target": CSS selector did not match an Element.`)
  }

  const isContained = isWindow(root) ? root.document === element.ownerDocument : root.contains(element)

  if (!isContained) throw new Error(`"target": Element is not contained by "root".`)
  if (!element.isConnected) throw new Error(`"target": Element is not connected to a document.`)

  return element
}
