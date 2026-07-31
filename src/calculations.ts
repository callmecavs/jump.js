import type { JumpAxis, JumpResolvedTarget, JumpRoot } from "./types"
import { isWindow } from "./guards"
import { resolveDirection } from "./resolvers"
import { clamp } from "./utilities"

export const calculateDistance = (end: number, start: number) => {
  const distance = end - start

  // Catch sub-pixel distances. These should be `instant`.
  if (Math.abs(distance) < 1) return 0

  return distance
}

export const calculateEnd = (
  axis: JumpAxis,
  offset: number,
  root: JumpRoot,
  start: number,
  target: JumpResolvedTarget,
): number => {
  // Calculate the max amount `root` can be scrolled.
  let max: number

  const scrollRoot = isWindow(root) ? root.document.documentElement : root

  switch (axis) {
    case "x":
      max = scrollRoot.scrollWidth - scrollRoot.clientWidth
      break
    case "y":
      max = scrollRoot.scrollHeight - scrollRoot.clientHeight
      break
  }

  // Calculate the ideal `end` position.
  let ideal = start

  if (typeof target === "number") {
    // Ignore `offset` when `target` is a number.
    ideal += target
  } else {
    const targetBounds = target.getBoundingClientRect()

    if (isWindow(root)) {
      if (axis === "x") ideal += targetBounds.left
      if (axis === "y") ideal += targetBounds.top
    } else {
      const rootBounds = root.getBoundingClientRect()

      if (axis === "x") ideal += targetBounds.left - rootBounds.left - root.clientLeft
      if (axis === "y") ideal += targetBounds.top - rootBounds.top - root.clientTop
    }

    ideal += offset
  }

  // Clamp the ideal `end` to the real scroll range.
  if (axis === "x" && resolveDirection(root) === "rtl") {
    return clamp(ideal, -max, 0)
  }

  return clamp(ideal, 0, max)
}

export const calculateStart = (axis: JumpAxis, root: JumpRoot): number => {
  switch (axis) {
    case "x":
      return isWindow(root) ? root.scrollX : root.scrollLeft
    case "y":
      return isWindow(root) ? root.scrollY : root.scrollTop
  }
}
