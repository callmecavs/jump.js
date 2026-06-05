export type JumpEasing = (elapsedTime: number, start: number, distance: number, duration: number) => number

// Robert Penner's easeInOutQuad
// https://github.com/danro/jquery-easing/blob/master/jquery.easing.js#L28-L31
const easeInOutQuad: JumpEasing = (t, b, c, d) => {
  if ((t /= d / 2) < 1) return (c / 2) * t * t + b
  return (-c / 2) * (--t * (t - 2) - 1) + b
}

export type JumpTarget = Element | number | string
export type JumpTargetNode = Element | undefined

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
  start: number,
  target: JumpTarget,
  targetNode: JumpTargetNode,
) => {
  // ignore `offset` when `target` is a number
  if (typeof target === "number") return start + target

  if (targetNode) {
    const targetNodeBounds = targetNode.getBoundingClientRect()

    if (root instanceof Element) {
      const rootBounds = root.getBoundingClientRect()

      if (axis === "x") return start + targetNodeBounds.left - rootBounds.left - root.clientLeft + offset
      if (axis === "y") return start + targetNodeBounds.top - rootBounds.top - root.clientTop + offset
    } else {
      if (axis === "x") return start + targetNodeBounds.left + offset
      if (axis === "y") return start + targetNodeBounds.top + offset
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
  if (typeof duration === "function") return duration(distance)
  return duration
}

const resolveTargetNode = (target: JumpTarget): JumpTargetNode => {
  if (typeof target === "number") return undefined
  if (target instanceof Element) return target

  let node: Element | null

  try {
    node = document.querySelector(target)
  } catch (error) {
    throw new Error(`Failed to resolve "target": CSS selector is invalid.`, { cause: error })
  }

  if (node === null) {
    throw new Error(`Failed to resolve "target": CSS selector didn't match.`)
  }

  return node
}

const validateOptions: (options: unknown) => asserts options is JumpOptions = options => {
  if (options === undefined) return

  if (typeof options !== "object" || Array.isArray(options) || options === null) {
    throw new TypeError(`Expected "options" to be an object.`)
  }

  const { a11y, axis, callback, duration, easing, offset, root } = options as JumpOptions

  if (a11y !== undefined && typeof a11y !== "boolean") {
    throw new TypeError(`Expected "a11y" to be a boolean.`)
  }

  if (axis !== undefined && axis !== "x" && axis !== "y") {
    throw new TypeError(`Expected "axis" to be "x" or "y".`)
  }

  if (callback !== undefined && typeof callback !== "function") {
    throw new TypeError(`Expected "callback" to be a function.`)
  }

  if (duration !== undefined && typeof duration !== "number" && typeof duration !== "function") {
    throw new TypeError(`Expected "duration" to be a number, or function.`)
  }

  if (easing !== undefined && typeof easing !== "function") {
    throw new TypeError(`Expected "easing" to be a function.`)
  }

  if (offset !== undefined && typeof offset !== "number") {
    throw new TypeError(`Expected "offset" to be a number.`)
  }

  if (root !== undefined && root !== window && !(root instanceof Element)) {
    throw new TypeError(`Expected "root" to be the window, or an Element.`)
  }
}

const validateTarget: (target: unknown) => asserts target is JumpTarget = target => {
  if (target instanceof Element || typeof target === "number" || typeof target === "string") return
  throw new TypeError(`Expected "target" to be an Element, number, or string.`)
}

const jumper = (target: JumpTarget, options: JumpOptions = {}) => {
  validateTarget(target)
  validateOptions(options)

  const {
    a11y: rawA11y = false,
    axis = "y",
    callback = undefined,
    duration: rawDuration = 1000,
    easing = easeInOutQuad,
    offset = 0,
    root = window,
  } = options

  const a11y = resolveAccessibility(rawA11y, target)
  const targetNode = resolveTargetNode(target)

  const start = calculateStart(axis, root)
  const end = calculateEnd(axis, offset, root, start, target, targetNode)

  const distance = end - start
  const duration = resolveDuration(distance, rawDuration)

  let rafId: number
  let startTime: number

  const loop = (currentTime: number) => {
    if (startTime === undefined) {
      startTime = currentTime
    }

    // prevent going "past the end" of a jump (`elapsedTime` should never exceed `duration`)
    const elapsedTime = Math.min(currentTime - startTime, duration)

    const next = easing(elapsedTime, start, distance, duration)

    if (axis === "x") root.scrollTo({ left: next })
    if (axis === "y") root.scrollTo({ top: next })

    if (elapsedTime < duration) {
      rafId = window.requestAnimationFrame(loop)
      return
    }

    done()
  }

  const done = () => {
    // rounding inaccuracies
    if (axis === "x") root.scrollTo({ left: end })
    if (axis === "y") root.scrollTo({ top: end })

    const isFocusable = targetNode instanceof HTMLElement || targetNode instanceof SVGElement

    if (a11y && isFocusable) {
      // temporarily add the `tabIndex` attribute, to ensure calling `focus` works, unless:
      // 1. the node already has the `tabIndex` attribute
      // 2. the node is in the tab order by default (example: <a>, <button>, etc)
      const needTabIndex = !targetNode.hasAttribute("tabindex") && targetNode.tabIndex < 0

      if (needTabIndex) targetNode.setAttribute("tabindex", "-1")
      targetNode.focus({ preventScroll: true })
      if (needTabIndex) targetNode.removeAttribute("tabindex")
    }

    // ensure `callback` executes after the above .scrollTo call
    if (callback) window.requestAnimationFrame(() => callback())
  }

  rafId = window.requestAnimationFrame(loop)

  return () => window.cancelAnimationFrame(rafId)
}

export default jumper
