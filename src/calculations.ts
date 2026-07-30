import type { JumpAxis, JumpResolvedTarget, JumpRoot } from "./types"
import { isElement, isWindow } from "./guards"
import { clamp } from "./utilities"

export const calculateDistance = (end: number, start: number) => {
  const delta = end - start

  // Catch sub-pixel distances. These should be `instant`.
  if (Math.abs(delta) < 1) return 0

  return delta
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

  const scrollingElement = isWindow(root) ? root.document.documentElement : root

  switch (axis) {
    case "x":
      max = scrollingElement.scrollWidth - scrollingElement.clientWidth
      break
    case "y":
      max = scrollingElement.scrollHeight - scrollingElement.clientHeight
      break
  }

  // Calculate the ideal `end` position.
  let ideal: number

  if (typeof target === "number") {
    // Ignore the `offset` when `target` is a number.
    ideal = start + target
  } else {
    ideal = start + offset

    const targetBounds = target.getBoundingClientRect()

    if (isElement(root)) {
      const rootBounds = root.getBoundingClientRect()

      if (axis === "x") ideal += targetBounds.left - rootBounds.left - root.clientLeft
      if (axis === "y") ideal += targetBounds.top - rootBounds.top - root.clientTop
    } else {
      if (axis === "x") ideal += targetBounds.left
      if (axis === "y") ideal += targetBounds.top
    }
  }

  // Clamp the ideal `end` to the real scroll range.
  return clamp(ideal, 0, max)
}

export const calculateStart = (axis: JumpAxis, root: JumpRoot): number => {
  switch (axis) {
    case "x":
      return isElement(root) ? root.scrollLeft : root.scrollX
    case "y":
      return isElement(root) ? root.scrollTop : root.scrollY
  }
}
