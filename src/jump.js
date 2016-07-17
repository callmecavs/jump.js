import easeInOutQuad from './easing.js'

const jumper = () => {
  // private variable cache
  // no variables are created during a jump, preventing memory leaks

  let element         // element to scroll to                   (node)

  let start           // where scroll starts                    (px)
  let stop            // where scroll stops                     (px)

  let axis            // which axis the scroll is on            (string)
  let offset          // adjustment from the stop position      (px)
  let easing          // easing function                        (function)
  let a11y            // accessibility support flag             (boolean)

  let distance        // distance of scroll                     (px)
  let duration        // scroll duration                        (ms)

  let timeStart       // time scroll started                    (ms)
  let timeElapsed     // time spent scrolling thus far          (ms)

  let next            // next scroll position                   (px)

  let callback        // to call when done scrolling            (function)

  // scroll position helper

  function location(axis) {
    return (axis === 'y'
      ? window.scrollY || window.pageYOffset
      : window.scrollX || window.pageXOffset)
  }

  // element offset helper

  function elementOffset(element, axis) {
    return (axis === 'y'
      ? element.getBoundingClientRect().top + start
      : element.getBoundingClientRect().left + start)
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
    if (axis === 'y') {
      window.scrollTo(0, next)
    } else {
      window.scrollTo(next, 0)
    }

    // check progress
    timeElapsed < duration
      ? requestAnimationFrame(loop)       // continue scroll loop
      : done()                            // scrolling is done
  }

  // scroll finished helper

  function done() {
    // account for rAF time rounding inaccuracies
    if (axis === 'y') {
      window.scrollTo(0, start + distance)
    } else {
      window.scrollTo(start + distance, 0)
    }

    // if scrolling to an element, and accessibility is enabled
    if(element && a11y) {
      // add tabindex indicating programmatic focus
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
    // resolve options, or use defaults
    axis     = options.axis     || 'y'
    duration = options.duration || 1000
    offset   = options.offset   || 0
    callback = options.callback                       // "undefined" is a suitable default, and won't be called
    easing   = options.easing   || easeInOutQuad
    a11y     = options.a11y     || false

    // cache starting position
    start = location(axis)

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
        stop    = elementOffset(element, axis)
      break

      // scroll to element (selector)
      // bounding rect is relative to the viewport
      case 'string':
        element = document.querySelector(target)
        stop    = elementOffset(element, axis)
      break
    }

    // resolve scroll distance, accounting for offset
    distance = stop - start + offset

    // resolve duration
    switch(typeof options.duration) {
      // number in ms
      case 'number':
        duration = options.duration
      break

      // function passed the distance of the scroll
      case 'function':
        duration = options.duration(distance)
      break
    }

    // start the loop
    requestAnimationFrame(loop)
  }

  // expose only the jump method
  return jump
}

// export singleton

const singleton = jumper()

export default singleton
