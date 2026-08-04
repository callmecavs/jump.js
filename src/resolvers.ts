import type { JumpAxis, JumpDirection, JumpDuration, JumpResolvedTarget, JumpRoot, JumpTarget } from "./types"
import { isElement, isWindow } from "./guards"

export const resolveAccessibility = (a11y: boolean, target: JumpResolvedTarget) => {
  // Catch number `target`s.
  if (typeof target === "number") return false
  return a11y
}

export const resolveDirection = (axis: JumpAxis, root: JumpRoot): JumpDirection => {
  // For vertical scrolls, the direction isn't relevant.
  if (axis === "y") return

  const rootElement = isWindow(root) ? root.document.documentElement : root
  const rootView = rootElement.ownerDocument.defaultView

  // If `direction` can't be computed, assume "ltr".
  if (!rootView) return "ltr"

  return rootView.getComputedStyle(rootElement).direction === "rtl" ? "rtl" : "ltr"
}

export const resolveDuration = (distance: number, duration: JumpDuration) => {
  const resolved = typeof duration === "function" ? duration(distance) : duration

  // Catch invalid `duration`s. This can't be included in the validator because
  // `duration` functions require the scroll `distance` to be calculated first.
  if (!Number.isFinite(resolved) || resolved < 0) {
    throw new Error(`"duration": expected a finite, non-negative number.`)
  }

  return resolved
}

export const resolveRoot = (root: JumpRoot): JumpRoot => {
  // If the `root` is the `documentElement`, use the `window` instead.
  // Like elements, it has a stationary bounding box.
  if (isElement(root) && root === root.ownerDocument.documentElement) {
    return root.ownerDocument.defaultView || root
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
    } catch {
      throw new Error(`"target": CSS selector is invalid.`)
    }

    if (element === null) throw new Error(`"target": CSS selector did not match an element.`)
  }

  const isContained = isWindow(root) ? root.document === element.ownerDocument : root.contains(element)

  if (!isContained) throw new Error(`"target": element is not contained by "root".`)
  if (!element.isConnected) throw new Error(`"target": element is not connected to a document.`)

  return element
}
