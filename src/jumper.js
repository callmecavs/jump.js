'use strict';

function Jumper(defaults) {
  defaults = defaults || {};

  this.duration = defaults.duration || 1000;      // ms
  this.offset = defaults.offset || 0;             // px
  this.callback = defaults.callback || null;      // function

  this.easing = defaults.easing || function(timeCurrent, jumpStart, jumpChange, jumpDuration) {
    // Robert Penner's easeInQuad - http://robertpenner.com/easing/
    return jumpChange * (timeCurrent /= jumpDuration) * timeCurrent + jumpStart;
  }
}

Jumper.prototype.jump = function(target, overrides) {
  overrides = overrides || {};

  // cache starting position
  this.jumpStart = window.pageYOffset;

  // resolve configuration for this jump
  this.jumpDuration = overrides.duration || this.duration;
  this.jumpOffset = overrides.offset || this.offset;
  this.jumpCallback = overrides.callback || this.callback;

  // resolve jump distance
  this.jumpDistance = this.jumpOffset;

  if(target.nodeType === 1) {
    // if element, determine element offset from current scroll position
    this.jumpDistance += Math.round(target.getBoundingClientRect().top);
  }
  else {
    // if pixel value, scroll from current location
    this.jumpDistance += target;
  }

  // start scroll loop
  requestAnimationFrame(this._loop.bind(this));
}

Jumper.prototype._loop = function(timeCurrent) {
  // if necessary, cache start time
  if(!this.timeStart) {
    this.timeStart = timeCurrent;
  }

  // determine ellapsed time
  this.timeElapsed = timeCurrent - this.timeStart;

  // determine next step in the current jump
  this.jumpNext = this.easing(this.timeElapsed, this.jumpStart, this.jumpDistance, this.jumpDuration);

  // scroll to next step
  window.scrollTo(0, this.jumpNext);

  // determine how to proceed
  if(this.timeElapsed < this.jumpDuration) {
    // continue animation
    requestAnimationFrame(this._loop.bind(this));
  }
  else {
    // finish animation
    this._end();
  }
}

Jumper.prototype._end = function() {
  // compensate for rAF time and rounding inaccuracies
  window.scrollTo(0, this.jumpStart + this.jumpDistance);

  // fire the callback
  if(typeof this.jumpCallback === 'function') {
    this.jumpCallback();
  }

  // prepare for the next jump
  this.timeStart = false;
}
