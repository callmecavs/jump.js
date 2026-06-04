export type JumpEasing = (elapsedTime: number, start: number, distance: number, duration: number) => number

// Robert Penner's easeInOutQuad
// https://github.com/danro/jquery-easing/blob/master/jquery.easing.js#L28-L31
const easeInOutQuad: JumpEasing = (t, b, c, d) => {
  if ((t /= d / 2) < 1) return (c / 2) * t * t + b
  return (-c / 2) * (--t * (t - 2) - 1) + b
}

export type JumpTarget = Element | number | string

export type JumpA11y = boolean
export type JumpAxis = "x" | "y"
export type JumpCallback = () => void
export type JumpDistance = number
export type JumpDuration = number | ((distance: JumpDistance) => number) // ms
export type JumpOffset = number
export type JumpRoot = Window | Element

export type JumpOptions = {
  a11y?: JumpA11y
  axis?: JumpAxis
  callback?: JumpCallback
  duration?: JumpDuration
  easing?: JumpEasing
  offset?: JumpOffset
  root?: JumpRoot
}

const calculateEnd = (
  axis: JumpAxis,
  offset: JumpOffset,
  root: JumpRoot,
  startingLocation: number,
  target: JumpTarget,
) => {
  if (typeof target === "number") return startingLocation + target + offset

  if (target instanceof Element || typeof target === "string") {
    const targetNode = resolveTargetNode(target)
    const targetNodeBounds = targetNode.getBoundingClientRect()

    if (root instanceof Element) {
      const rootBounds = root.getBoundingClientRect()

      if (axis === "x") return startingLocation + targetNodeBounds.left - rootBounds.left - root.clientLeft + offset
      if (axis === "y") return startingLocation + targetNodeBounds.top - rootBounds.top - root.clientTop + offset
    } else {
      if (axis === "x") return startingLocation + targetNodeBounds.left + offset
      if (axis === "y") return startingLocation + targetNodeBounds.top + offset
    }
  }

  throw new Error(`Failed to calculate ending location.`)
}

const calculateStart = (axis: JumpAxis, root: JumpRoot): number => {
  const isElement = root instanceof Element

  if (axis === "x") return isElement ? root.scrollLeft : root.scrollX
  if (axis === "y") return isElement ? root.scrollTop : root.scrollY

  throw new Error(`Failed to calculate starting location.`)
}

const resolveAccessibility = (a11y: JumpA11y, target: JumpTarget) => {
  if (typeof target === "number") return false
  return a11y
}

const resolveDuration = (distance: JumpDistance, duration: JumpDuration) => {
  if (typeof duration === "number") return duration
  if (typeof duration === "function") return duration(distance)
  throw new Error(`Failed to resolve "duration".`)
}

const resolveTargetNode = (target: Element | string) => {
  if (target instanceof Element) return target

  let node: Element | null

  try {
    node = document.querySelector(target)
  } catch (error) {
    throw new Error(`Failed to resolve "target" (not a valid CSS selector).`, { cause: error })
  }

  if (!node) throw new Error(`Failed to resolve "target" (didn't match anything).`)

  return node
}

const jumper = (
  target: JumpTarget,
  {
    a11y: rawA11y = false,
    axis = "y",
    callback = undefined,
    duration: rawDuration = 1000,
    easing = easeInOutQuad,
    offset = 0,
    root = window,
  }: JumpOptions = {},
) => {
  const a11y = resolveAccessibility(rawA11y, target)

  const start = calculateStart(axis, root)
  const end = calculateEnd(axis, offset, root, start, target)

  const distance = end - start
  const duration = resolveDuration(distance, rawDuration)

  let rafId: number
  let startTime: number

  const loop = (currentTime: number) => {
    if (startTime === undefined) {
      startTime = currentTime
    }

    // make sure `elapsedTime` never exceeds `duration`
    const elapsedTime = Math.min(currentTime - startTime, duration)

    const next = easing(elapsedTime, start, distance, duration)

    root.scrollTo(axis === "x" ? next : 0, axis === "y" ? next : 0)

    if (elapsedTime < duration) {
      rafId = window.requestAnimationFrame(loop)
      return
    }

    done()
  }

  const done = () => {
    // rounding inaccuracies
    root.scrollTo(axis === "x" ? end : 0, axis === "y" ? end : 0)

    // FIX: need to handle a11y here, but need to think about
    // how to get the resolved `target` node here first

    if (callback) {
      if (typeof callback !== "function") throw new Error(`Fail to execute "callback" (not a function).`)

      // ensure `callback` executes after the above .scrollTo call
      window.requestAnimationFrame(callback)
    }
  }

  rafId = window.requestAnimationFrame(loop)

  return () => window.cancelAnimationFrame(rafId)
}

export default jumper

// // if scrolling to an element, and accessibility is enabled
// if (element && a11y) {
//   // add tabindex indicating programmatic focus
//   element.setAttribute("tabindex", "-1")

//   // focus the element
//   element.focus()
// }
