import easeInOutQuad from './easing'

export default class Jump {
  jump(target, options = {}) {
    this.start = window.pageYOffset

    this.options = {
      duration: options.duration,
      offset: options.offset || 0,
      callback: options.callback,
      easing: options.easing || easeInOutQuad,
      scrollCancelJump: options.scrollCancelJump
    }

    this.distance = typeof target === 'string'
      ? this.options.offset + document.querySelector(target).getBoundingClientRect().top
      : target

    this.duration = typeof this.options.duration === 'function'
      ? this.options.duration(this.distance)
      : this.options.duration

    requestAnimationFrame(time => this._loop(time))
  }

  _loop(time) {
    if(!this.timeStart) {
      this.timeStart = time
    }

    this.timeElapsed = time - this.timeStart
    this.next = this.options.easing(this.timeElapsed, this.start, this.distance, this.duration)

    if (!!this.options.scrollCancelJump &&
        !!this.lastScrollPosition &&
          this.lastScrollPosition != window.scrollY) {
      this._end()
      return;
    }

    window.scrollTo(0, this.next)

    this.lastScrollPosition = window.scrollY

    this.timeElapsed < this.duration
      ? requestAnimationFrame(time => this._loop(time))
      : this._lastStep()
  }

  _lastStep() {
    window.scrollTo(0, this.start + this.distance)
    this._end()
  }

  _end() {
    typeof this.options.callback === 'function' && this.options.callback()
    this.lastScrollPosition = false
    this.timeStart = false
  }
}
