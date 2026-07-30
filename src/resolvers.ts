import type { JumpDuration, JumpResolvedTarget, JumpRoot, JumpTarget } from "./types"
import { isElement, isWindow } from "./guards"

export const resolveAccessibility = (a11y: boolean, target: JumpResolvedTarget) => {
  // The `a11y` option requires that the `target` be a node.
  if (typeof target === "number") return false
  return a11y
}

export const resolveDuration = (distance: number, duration: JumpDuration) => {
  if (typeof duration === "function") return duration(distance)
  return duration
}

export const resolveRoot = (root: JumpRoot): JumpRoot => {
  // Catch the `scrollingElement` being passed as the `root`. Use the `window`
  // instead because, like other elements, it has a stationary bounding box.
  if (isElement(root) && root === root.ownerDocument.scrollingElement) {
    return root.ownerDocument.defaultView ?? root
  }

  return root
}

export const resolveTarget = (target: JumpTarget, root: JumpRoot): JumpResolvedTarget => {
  if (typeof target === "number") return target

  let node: Element | null

  if (isElement(target)) {
    node = target
  } else {
    try {
      const scope = isWindow(root) ? root.document : root
      node = scope.querySelector(target)
    } catch (error) {
      throw new Error(`Failed to resolve "target" string: CSS selector is invalid.`, { cause: error })
    }

    if (node === null) {
      throw new Error(`Failed to resolve "target" string: CSS selector didn't match.`)
    }
  }

  if (!node.isConnected) throw new Error(`Failed to resolve "target": resolved element is not connected to a document.`)

  const outsideElement = isElement(root) && !root.contains(node)
  const outsideWindow = isWindow(root) && root.document !== node.ownerDocument

  if (outsideElement || outsideWindow) {
    throw new Error(`Failed to resolve "target": resolved element is not contained by the root.`)
  }

  return node
}
