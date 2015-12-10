import easeInOutQuad from './easing'

export default class Jump {
  jump(target, options = {}) {

    this.options = {
      duration: options.duration,
      offset: options.offset || 0,
      callback: options.callback,
      easing: options.easing || easeInOutQuad,
      container: document.querySelector(options.container) || null
    }

    this.distance = typeof target === 'string'
      ? this.options.offset + document.querySelector(target).getBoundingClientRect().top
      : target

    this.duration = typeof this.options.duration === 'function'
      ? this.options.duration(this.distance)
      : this.options.duration

    !!this.options.container
      ?  this.start = this.options.container.getBoundingClientRect().top
      :  this.start = window.pageYOffset

    requestAnimationFrame(time => this._loop(time))
  }

  _loop(time) {
    if(!this.timeStart) {
      this.timeStart = time
    }

    this.timeElapsed = time - this.timeStart
    this.next = this.options.easing(this.timeElapsed, this.start, this.distance, this.duration)

    !!this.options.container
      ? this.options.container.scrollTop = this.next
      : window.scrollTo(0, this.next)

    this.timeElapsed < this.duration
      ? requestAnimationFrame(time => this._loop(time))
      : this._end()
  }

  _end() {

    !!this.options.container
      ? this.options.container.scrollTop = this.next + this.distance
      : window.scrollTo(0, this.next + this.distance)

    typeof this.options.callback === 'function' && this.options.callback()
    this.timeStart = false
  }
}
