export type JumpAxis = "x" | "y"
export type JumpCallback = () => void
export type JumpCancel = () => void
export type JumpDuration = number | ((distance: number) => number) // ms
export type JumpEasing = (progress: number) => number
export type JumpResolvedTarget = Element | number
export type JumpRoot = Window | Element
export type JumpTarget = Element | number | string

export type JumpOptions = {
  a11y?: boolean
  axis?: JumpAxis
  callback?: JumpCallback
  duration?: JumpDuration
  easing?: JumpEasing
  offset?: number
  root?: JumpRoot
}
