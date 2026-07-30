import type { JumpAxis, JumpEasing, JumpRoot } from "./types"

export const clamp = (number: number, min: number, max: number): number => {
  if (number < min) return min
  if (number > max) return max
  return number
}

export const easeInOutQuad: JumpEasing = p => {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
}

export const noop = () => {}

export const scroll = (axis: JumpAxis, position: number, root: JumpRoot) => {
  if (axis === "x") root.scrollTo({ behavior: "instant", left: position })
  if (axis === "y") root.scrollTo({ behavior: "instant", top: position })
}
