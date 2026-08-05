import type { JumpAxis, JumpEasing, JumpRoot } from "./types"

export const clamp = (number: number, min: number, max: number): number => {
  if (number < min) return min
  if (number > max) return max
  return number
}

// https://github.com/d3/d3-ease/blob/main/src/quad.js
export const easeInOutQuad: JumpEasing = p => {
  return ((p *= 2) <= 1 ? p * p : --p * (2 - p) + 1) / 2
}

export const noop = () => {}

export const scroll = (axis: JumpAxis, position: number, root: JumpRoot) => {
  if (axis === "x") root.scrollTo({ behavior: "instant", left: position })
  if (axis === "y") root.scrollTo({ behavior: "instant", top: position })
}
