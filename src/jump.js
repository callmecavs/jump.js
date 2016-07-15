import easeInOutQuad from './easing'

const jumper = () => {
  // private

  let element         // element to scroll to                   (node)

  let start           // where scroll starts                    (px)
  let stop            // where scroll stops                     (px)

  let offset          // adjustment from the stop position      (px)
  let easing          // easing function                        (function)
  let a11y            // accessibility support flag             (boolean)

  let duration        // scroll duration                        (ms)
  let distance        // distance of scroll                     (px)

  let timeStart       // time scroll started                    (ms)
  let timeElapsed     // time scrolling thus far                (ms)

  let next            // next scroll position                   (px)

  let callback        // fire when done scrolling               (function)

  // scroll position helper

  function location() {
    return window.scrollY || window.pageYOffset
  }

  // rAF loop helper

  function loop(timeCurrent) {
    // store time scroll started, if not started already
    if(!timeStart) {
      timeStart = timeCurrent
    }

    // determine time spent scrolling so far
    timeElapsed = timeCurrent - timeStart

    // calculate next scroll position
    next = easing(timeElapsed, start, distance, duration)

    // scroll to it
    window.scrollTo(0, next)

    // check progress
    timeElapsed < duration
      ? requestAnimationFrame(loop)       // continue looping
      : done()                            // scrolling is done
  }

  // scroll finished helper

  function done() {
    // account for rAF time rounding inaccuracies
    window.scrollTo(0, start + distance)

    // if scrolling to an element, and accessibility is enabled
    if(element && a11y) {
      // add tabindex
      element.setAttribute('tabindex', '-1')

      // focus the element
      element.focus()
    }

    // if it exists, fire the callback
    if(typeof callback === 'function') {
      callback()
    }

    // reset time for next jump
    timeStart = false
  }

  // API

  function jump(target, options = {}) {
    // cache starting position
    start = location()

    // resolve target
    switch(typeof target) {
      // scroll from current position
      case 'number':
        element = undefined           // no element to scroll to
        a11y    = false               // make sure accessibility is off
        stop    = start + target
      break

      // scroll to element (node)
      // bounding rect is relative to the viewport
      case 'object':
        element = target
        stop    = element.getBoundingClientRect().top + location()
      break

      // scroll to element (selector)
      // bounding rect is relative to the viewport
      case 'string':
        element = document.querySelector(target)
        stop    = element.getBoundingClientRect().top + location()
      break
    }

    // resolve scroll distance
    distance = stop - start + offset

    // resolve duration
    switch(typeof options.duration) {
      // number in ms
      case 'number':
        duration = options.duration
      break

      // function that can utilize the distance of the scroll
      case 'function':
        duration = options.duration(distance)
      break

      // default to 1000ms
      default:
        duration = 1000
      break
    }

    // resolve options
    offset   = options.offset || 0
    callback = options.callback
    easing   = options.easing || easeInOutQuad
    a11y     = options.a11y || false

    // start the loop
    requestAnimationFrame(loop)
  }

  // expose only the jump method
  return jump
}

// export singleton

const singleton = jumper()

export default singleton
