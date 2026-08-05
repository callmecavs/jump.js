import type { JumpAxis, JumpDuration, JumpResolvedTarget, JumpRoot, JumpTarget } from "./types"
import { isElement, isWindow } from "./guards"

export const resolveAccessibility = (a11y: boolean, target: JumpResolvedTarget) => {
  // Catch number `target`s.
  return typeof target === "number" ? false : a11y
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

export const resolveRoot = (root: JumpRoot, view: Window): JumpRoot => {
  // Catch the `root` being the `documentElement`. Use its `Window` instead
  // because, like `Element`s, it has a stationary bounding box.
  if (isElement(root) && root === root.ownerDocument.documentElement) {
    return view
  }

  return root
}

export const resolveRootElement = (root: JumpRoot): Element => {
  return isWindow(root) ? root.document.documentElement : root
}

export const resolveRtl = (axis: JumpAxis, rootElement: Element, view: Window): boolean => {
  // For vertical scrolls, the text direction is irrelevant.
  return axis === "x" && view.getComputedStyle(rootElement).direction === "rtl"
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

export const resolveView = (root: JumpRoot): Window => {
  const view = isWindow(root) ? root : root.ownerDocument.defaultView

  if (!view) throw new Error(`"root": element's document is not connected to a browsing context.`)

  return view
}
