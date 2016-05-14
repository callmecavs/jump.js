import easeInOutQuad from './easing'

const jumper = ({

  // defaults
  offset = 0,
  easing = easeInOutQuad

} = {}) => {

  // globals
  let start         // where scroll starts (px)
  let stop          // where scroll stops (px)

  let adjust        // adjustment from the stop position (px)
  let timing        // easing function

  let duration      // scroll duration
  let distance      // distance of scroll (px)

  let timeStart     // time scroll started
  let timeElapsed   // time scrolling thus far

  let next          // next scroll position (px)

  let callback      // fire when done scrolling

  function loop(timeCurrent) {
    if(!timeStart) {
      timeStart = timeCurrent
    }

    // determine time spent scrolling so far
    timeElapsed = timeCurrent - timeStart

    // calculate next scroll position
    next = timing(timeElapsed, start, distance, duration)

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
    adjust = options.offset || offset

    // resolve callback
    callback = options.callback

    // resolve easing
    timing = options.easing || easing

    // resolve target
    switch(typeof target) {
      // scroll from current position
      case 'number':
        stop = start + target
      break

      // scroll to element (node)
      case 'object':
        stop = target.getBoundingClientRect().top
      break

      // scroll to element (selector)
      case 'string':
        stop = document.querySelector(target).getBoundingClientRect().top
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
