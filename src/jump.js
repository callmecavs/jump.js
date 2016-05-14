import easeInOutQuad from './easing'

const jumper = () => {
  // globals
  let start         // where scroll starts (px)
  let stop          // where scroll stops (px)

  let offset        // adjustment from the stop position (px)
  let easing        // easing function

  let duration      // scroll duration
  let distance      // distance of scroll (px)

  let timeStart     // time scroll started
  let timeElapsed   // time scrolling thus far

  let next          // next scroll position (px)

  let callback      // fire when done scrolling

  function loop(timeCurrent) {
    // store time started scrolling when starting
    if(!timeStart) {
      timeStart = timeCurrent
    }

    // determine time spent scrolling so far
    timeElapsed = timeCurrent - timeStart

    // calculate next scroll position
    next = easing(timeElapsed, start, distance, duration)

    // scroll to it
    window.scrollTo(0, next)

    // continue looping or end
    timeElapsed < duration
      ? requestAnimationFrame(loop)
      : end()
  }

  function end() {
    // account for rounding inaccuracies
    window.scrollTo(0, start + distance)

    // if scrolling to an element, and accessibility is enabled, add tabindex to element
    if(element && a11y) {
      element.setAttribute('tabindex', '-1')
    }

    // if it exists, fire the callback
    if(typeof callback === 'function') {
      callback()
    }

    // reset for next jump
    timeStart = undefined
  }

  function jump(target, options = {}) {
    // cache starting position
    start = window.scrollY || window.pageYOffset

    // resolve duration, the only required option
    // if its not a number, assume its a function
    duration = typeof options.duration === 'number'
      ? options.duration
      : options.duration(distance)

    // resolve offset
    offset = options.offset || 0

    // resolve callback
    callback = options.callback

    // resolve easing
    easing = options.easing || easeInOutQuad

    // resolve accessibility
    a11y = options.a11y || false

    // resolve target
    switch(typeof target) {
      // scroll from current position
      case 'number':
        // no element to scroll to, make sure accessibility is off
        element = undefined
        a11y    = false
        stop    = start + target
      break

      // scroll to element (node)
      case 'object':
        element = target
        stop    = element.getBoundingClientRect().top
      break

      // scroll to element (selector)
      case 'string':
        element = document.querySelector(target)
        stop    = element.getBoundingClientRect().top
      break
    }

    // resolve distance
    distance = stop - start

    // start the loop
    requestAnimationFrame(loop)
  }

  return jump
}

// export singleton

const singleton = jumper()

export default singleton
