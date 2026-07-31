import type { JumpDirection, JumpDuration, JumpResolvedTarget, JumpRoot, JumpTarget } from "./types"
import { isElement, isWindow } from "./guards"

export const resolveAccessibility = (a11y: boolean, target: JumpResolvedTarget) => {
  // The `a11y` option requires that the `target` be a node.
  if (typeof target === "number") return false
  return a11y
}

export const resolveDirection = (root: JumpRoot): JumpDirection => {
  const scrollRoot = isWindow(root) ? root.document.documentElement : root
  const scrollView = scrollRoot.ownerDocument.defaultView
  return scrollView?.getComputedStyle(scrollRoot).direction === "rtl" ? "rtl" : "ltr"
}

export const resolveDuration = (distance: number, duration: JumpDuration) => {
  if (typeof duration === "function") return duration(distance)
  return duration
}

export const resolveRoot = (root: JumpRoot): JumpRoot => {
  // Catch the `documentElement` being passed as the `root`. Use the `window`
  // instead because, like other elements, it has a stationary bounding box.
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
      throw new Error(`Error resolving "target" string: CSS selector is invalid.`, { cause: error })
    }

    if (element === null) throw new Error(`Error resolving "target" string: CSS selector didn't match.`)
  }

  const isContained = isWindow(root) ? root.document === element.ownerDocument : root.contains(element)

  if (!isContained) throw new Error(`Error resolving "target" element: Not contained by the "root".`)
  if (!element.isConnected) throw new Error(`Error resolving "target" element: Not connected to a document.`)

  return element
}
