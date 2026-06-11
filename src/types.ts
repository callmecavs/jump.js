export type Jump = (target: JumpTarget, options?: JumpOptions) => JumpCancel
export type JumpAxis = "x" | "y"
export type JumpCallback = () => void
export type JumpCancel = () => void
export type JumpDuration = number | ((distance: number) => number)
export type JumpEasing = (progress: number) => number
export type JumpResolvedTarget = Element | number
export type JumpRoot = Window | Element
export type JumpTarget = Element | number | string

export type JumpOptions = {
  a11y?: boolean
  axis?: JumpAxis
  callback?: JumpCallback
  duration?: JumpDuration // ms
  easing?: JumpEasing
  offset?: number // px
  root?: JumpRoot
}
