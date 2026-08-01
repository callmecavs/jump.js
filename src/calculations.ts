import type { JumpAxis, JumpResolvedTarget, JumpRoot } from "./types"
import { isWindow } from "./guards"
import { resolveDirection } from "./resolvers"
import { clamp } from "./utilities"

export const calculateEnd = (
  axis: JumpAxis,
  offset: number,
  root: JumpRoot,
  start: number,
  target: JumpResolvedTarget,
): number => {
  // Calculate the `root`s maximum scroll position.
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

  // Calculate the `root`s ideal scroll position.
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

  // Clamp the `ideal` scroll position to the `root`s real scroll range. `max` is inherently less precise than `start`
  // because `.client` / `.scroll` properties are integers, whereas `getBoundingClientRect` properties are floats. As
  // such, make sure `max` never exceeds `start` (in either direction). Determine text direction only if `axis === "x"`
  // because no languages read "bottom to top".
  if (axis === "x" && resolveDirection(root) === "rtl") {
    return clamp(ideal, Math.min(start, -max), 0)
  }

  return clamp(ideal, 0, Math.max(start, max))
}

export const calculateStart = (axis: JumpAxis, root: JumpRoot): number => {
  switch (axis) {
    case "x":
      return isWindow(root) ? root.scrollX : root.scrollLeft
    case "y":
      return isWindow(root) ? root.scrollY : root.scrollTop
  }
}
