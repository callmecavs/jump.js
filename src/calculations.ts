import type { JumpAxis, JumpDirection, JumpResolvedTarget, JumpRoot } from "./types"
import { isWindow } from "./guards"
import { clamp } from "./utilities"

export const calculateEnd = (
  axis: JumpAxis,
  direction: JumpDirection,
  offset: number,
  root: JumpRoot,
  start: number,
  target: JumpResolvedTarget,
): number => {
  const isRtl = direction === "rtl"

  // Calculate the `root`s maximum scroll position.
  let max: number

  const rootElement = isWindow(root) ? root.document.documentElement : root

  switch (axis) {
    case "x":
      max = rootElement.scrollWidth - rootElement.clientWidth
      break
    case "y":
      max = rootElement.scrollHeight - rootElement.clientHeight
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

    // For `rtl`, invert the `offset`.
    ideal += isRtl ? -offset : offset
  }

  // Clamp the `ideal` scroll position to the `root`s real scroll range.
  return isRtl ? clamp(ideal, -max, 0) : clamp(ideal, 0, max)
}

export const calculateStart = (axis: JumpAxis, root: JumpRoot): number => {
  switch (axis) {
    case "x":
      return isWindow(root) ? root.scrollX : root.scrollLeft
    case "y":
      return isWindow(root) ? root.scrollY : root.scrollTop
  }
}
