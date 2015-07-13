'use strict';

function Jumper() {

}

Jumper.prototype.jump = function(target, duration) {
  this.targetStart = window.pageYOffset;
  this.duration = duration;

  // to an element, or to a px value?
  if(target.nodeType === 1) {
    this.targetChange = target.getBoundingClientRect().top + this.targetStart;
  }
  else {
    this.targetChange = target - this.targetStart;
  }

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
  else {
    this._reset();
  }
}

Jumper.prototype._ease = function(timeCurrent, targetStart, targetChange, duration) {
  // Robert Penner's easeInQuad - http://robertpenner.com/easing/
  return targetChange * (timeCurrent /= duration) * timeCurrent + targetStart;
}

Jumper.prototype._reset = function() {
  delete this.targetChange;
  delete this.timeStart;
}
