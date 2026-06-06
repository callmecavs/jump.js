import type { JumpAxis, JumpResolvedTarget, JumpRoot } from "./types"
import { isElement } from "./dom"

const clamp = (number: number, min: number, max: number): number => {
  if (number < min) return min
  if (number > max) return max
  return number
}

export const calculateEnd = (
  axis: JumpAxis,
  offset: number,
  root: JumpRoot,
  start: number,
  target: JumpResolvedTarget,
): number => {
  // Ignore the `offset` when `target` is a number.
  if (typeof target === "number") return start + target

  const targetBounds = target.getBoundingClientRect()

  let result = start + offset

  if (isElement(root)) {
    const rootBounds = root.getBoundingClientRect()

    // FIX: There's a bug here. We can't assume that the `root` actually has this much room
    // to scroll. If it doesn't, the animation currently breaks, and it'd be more "correct"
    // to scroll to the `root`s end instead.
    if (axis === "x") result += targetBounds.left - rootBounds.left - root.clientLeft
    if (axis === "y") result += targetBounds.top - rootBounds.top - root.clientTop
  } else {
    if (axis === "x") result += targetBounds.left
    if (axis === "y") result += targetBounds.top
  }

  return result
}

export const calculateStart = (axis: JumpAxis, root: JumpRoot): number => {
  switch (axis) {
    case "x":
      return isElement(root) ? root.scrollLeft : root.scrollX
    case "y":
      return isElement(root) ? root.scrollTop : root.scrollY
  }
}
