import type { JumpAxis, JumpResolvedTarget, JumpRoot } from "./types"
import { isWindow } from "./guards"
import { clamp } from "./utilities"

export const calculateEnd = (
  axis: JumpAxis,
  offset: number,
  root: JumpRoot,
  rootElement: Element,
  rtl: boolean,
  start: number,
  target: JumpResolvedTarget,
): number => {
  // Calculate the `root`s maximum scroll position.
  let max: number

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
    // When `target` is a number, ignore `offset`.
    ideal += target
  } else {
    const targetBounds = target.getBoundingClientRect()

    if (axis === "x") ideal += targetBounds.left
    if (axis === "y") ideal += targetBounds.top

    if (!isWindow(root)) {
      const rootBounds = rootElement.getBoundingClientRect()

      if (axis === "x") ideal -= rootBounds.left + rootElement.clientLeft
      if (axis === "y") ideal -= rootBounds.top + rootElement.clientTop
    }

    // For `rtl`, invert the `offset`.
    ideal += rtl ? -offset : offset
  }

  // Clamp the `ideal` scroll position to the `root`s scroll range.
  // For `rtl`, invert the scroll range.
  return rtl ? clamp(ideal, -max, 0) : clamp(ideal, 0, max)
}

export const calculateStart = (axis: JumpAxis, root: JumpRoot): number => {
  switch (axis) {
    case "x":
      return isWindow(root) ? root.scrollX : root.scrollLeft
    case "y":
      return isWindow(root) ? root.scrollY : root.scrollTop
  }
}
