'use strict';

function Jumper() {

}

Jumper.prototype.jump = function(target, duration) {
  this.targetStart = window.pageYOffset;
  this.targetChange = target - this.targetStart;     // pixels, add element target support
  this.duration = duration;

  requestAnimationFrame(this._loop.bind(this));
}

Jumper.prototype._loop = function(time) {
  if(!this.timeStart) {
    this.timeStart = time;
  }

  this.timeElapsed = time - this.timeStart;
  this.targetNew = this._ease(this.timeElapsed, this.targetStart, this.targetChange, this.duration);

  window.scrollTo(0, this.targetNew);

  if(this.timeElapsed < this.duration) {
    requestAnimationFrame(this._loop.bind(this));
  }
}

Jumper.prototype._ease = function(timeCurrent, targetStart, targetChange, duration) {
  // Robert Penner's easeInQuad - http://robertpenner.com/easing/
  return targetChange * (timeCurrent /= duration) * timeCurrent + targetStart;
}
