import easeInOutQuad from './easing'

const jumper = ({

  // defaults
  offset = 0,
  easing = easeInOutQuad

} = {}) => {

  // globals
  let start         // position where scroll starts
  let stop          // position where scroll stops

  let adjust        // adjustment from the stop position
  let timing        // equation dictating how to scroll from start to stop

  let duration      // time the scroll takes
  let distance      // distance, in px, the scroll covers

  let callback      // function to run when scroll is finished

  let timeStart     // time the scrolling started
  let timeElapsed   // time spent scrolling so far

  function loop(timeCurrent) {
    if(!timeStart) {
      timeStart = timeCurrent
    }

    // determine time spent scrolling so far
    timeElapsed = timeCurrent - timeStart

    // calculate next scroll position
    const next = timing(timeElapsed, start, distance, duration)

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

    // start the loop
    requestAnimationFrame(loop)
  }

  return {
    jump
  }
}
