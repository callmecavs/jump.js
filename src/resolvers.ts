import type { JumpAxis, JumpDuration, JumpResolvedTarget, JumpRoot, JumpTarget } from "./types"
import { isElement, isWindow } from "./guards"

export const resolveAccessibility = (rawA11y: boolean, target: JumpResolvedTarget) => {
  // Disable `a11y` handling for numeric `target`s.
  return typeof target === "number" ? false : rawA11y
}

export const resolveDuration = (distance: number, rawDuration: JumpDuration) => {
  const duration = typeof rawDuration === "function" ? rawDuration(distance) : rawDuration

  // Catch invalid `duration`s. This can't be included in the validator because
  // `duration` functions require the scroll `distance` to be calculated first.
  if (!Number.isFinite(duration) || duration < 0) {
    throw new Error(`"duration": expected a finite, non-negative number.`)
  }

  return duration
}

export const resolveRoot = (rawRoot: JumpRoot, view: Window): JumpRoot => {
  // If `root` is the `documentElement`, use its `Window` instead. This simplifies the
  // calculations because `target` bounds are viewport-relative.
  if (isElement(rawRoot) && rawRoot === rawRoot.ownerDocument.documentElement) {
    return view
  }

  return rawRoot
}

export const resolveRootElement = (root: JumpRoot): Element => {
  return isWindow(root) ? root.document.documentElement : root
}

export const resolveRtl = (axis: JumpAxis, rootElement: Element, view: Window): boolean => {
  // For vertical scrolls, the text direction is irrelevant.
  return axis === "x" && view.getComputedStyle(rootElement).direction === "rtl"
}

export const resolveTarget = (rawTarget: JumpTarget, root: JumpRoot): JumpResolvedTarget => {
  if (typeof rawTarget === "number") return rawTarget

  let target: Element | null

  if (isElement(rawTarget)) {
    target = rawTarget
  } else {
    try {
      const scope = isWindow(root) ? root.document : root
      target = scope.querySelector(rawTarget)
    } catch {
      throw new Error(`"target": CSS selector is invalid.`)
    }

    if (target === null) throw new Error(`"target": CSS selector did not match an element.`)
  }

  const isContained = isWindow(root) ? root.document === target.ownerDocument : root.contains(target)

  if (!isContained) throw new Error(`"target": element is not contained by "root".`)
  if (!target.isConnected) throw new Error(`"target": element is not connected to a document.`)

  return target
}

export const resolveView = (rawRoot: JumpRoot): Window => {
  const view = isWindow(rawRoot) ? rawRoot : rawRoot.ownerDocument.defaultView

  if (!view) throw new Error(`"root": element's document is not connected to a browsing context.`)

  return view
}
