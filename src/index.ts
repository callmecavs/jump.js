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
  // easing: () => void
  offset?: JumpOffset
  root?: JumpRoot
}

const calculateEnd = (axis: JumpAxis, root: JumpRoot, startingLocation: number, target: JumpTarget) => {
  if (typeof target === "number") return startingLocation + target

  if (target instanceof Element || typeof target === "string") {
    const targetNode = resolveTargetNode(target)
    const targetNodeBounds = targetNode.getBoundingClientRect()

    if (root instanceof Element) {
      const rootBounds = root.getBoundingClientRect()

      if (axis === "x") return startingLocation + targetNodeBounds.left - rootBounds.left - root.clientLeft
      if (axis === "y") return startingLocation + targetNodeBounds.top - rootBounds.top - root.clientTop
    } else {
      if (axis === "x") return startingLocation + targetNodeBounds.left
      if (axis === "y") return startingLocation + targetNodeBounds.top
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
    offset = 0,
    root = window,
  }: JumpOptions = {},
) => {
  const a11y = resolveAccessibility(rawA11y, target)

  const start = calculateStart(axis, root)
  const end = calculateEnd(axis, root, start, target)

  const distance = end - start + offset
  const duration = resolveDuration(distance, rawDuration)

  console.dir({ a11y, start, end, distance, duration })

  return
}

export default jumper

// // Robert Penner's easeInOutQuad

// // find the rest of his easing functions here: http://robertpenner.com/easing/
// // find them exported for ES6 consumption here: https://github.com/jaxgeller/ez.js

// const easeInOutQuad = (t, b, c, d) => {
//   t /= d / 2
//   if (t < 1) return (c / 2) * t * t + b
//   t--
//   return (-c / 2) * (t * (t - 2) - 1) + b
// }

// const jumper = () => {
//   // private variable cache
//   // no variables are created during a jump, preventing memory leaks

//   let element // element to scroll to                   (node)

//   let start // where scroll starts                    (px)
//   let stop // where scroll stops                     (px)

//   let offset // adjustment from the stop position      (px)
//   let easing // easing function                        (function)
//   let a11y // accessibility support flag             (boolean)

//   let distance // distance of scroll                     (px)
//   let duration // scroll duration                        (ms)

//   let timeStart // time scroll started                    (ms)
//   let timeElapsed // time spent scrolling thus far          (ms)

//   let next // next scroll position                   (px)

//   let callback // to call when done scrolling            (function)

//   // rAF loop helper

//   function loop(timeCurrent) {
//     // store time scroll started, if not started already
//     if (!timeStart) {
//       timeStart = timeCurrent
//     }

//     // determine time spent scrolling so far
//     timeElapsed = timeCurrent - timeStart

//     // calculate next scroll position
//     next = easing(timeElapsed, start, distance, duration)

//     // scroll to it
//     window.scrollTo(0, next)

//     // check progress
//     timeElapsed < duration
//       ? window.requestAnimationFrame(loop) // continue scroll loop
//       : done() // scrolling is done
//   }

//   // scroll finished helper

//   function done() {
//     // account for rAF time rounding inaccuracies
//     window.scrollTo(0, start + distance)

//     // if scrolling to an element, and accessibility is enabled
//     if (element && a11y) {
//       // add tabindex indicating programmatic focus
//       element.setAttribute("tabindex", "-1")

//       // focus the element
//       element.focus()
//     }

//     // if it exists, fire the callback
//     if (typeof callback === "function") {
//       callback()
//     }

//     // reset time for next jump
//     timeStart = false
//   }

//   // API

//   function jump(target, options = {}) {
//     // start the loop
//     window.requestAnimationFrame(loop)
//   }

//   // expose only the jump method
//   return jump
// }

// // export singleton

// const singleton = jumper()

// export default singleton
