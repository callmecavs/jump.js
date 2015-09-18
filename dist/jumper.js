/*!
 * Jumper.js 1.0.0 - A small, modern, dependency-free smooth scrolling library.
 * Copyright (c) 2015 Michael Cavalea - https://github.com/callmecavs/jumper.js
 * License: MIT
 */

(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define('Jumper', ['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.Jumper = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  function Jumper(defaults) {
    defaults = defaults || {};

    this.duration = defaults.duration || 1000; // ms
    this.offset = defaults.offset || 0; // px
    this.callback = defaults.callback || null; // function

    this.easing = defaults.easing || function (t, b, c, d) {
      // Robert Penner's easeInQuad - http://robertpenner.com/easing/
      return c * (t /= d) * t + b;
    };
  }

  Jumper.prototype.jump = function (target, overrides) {
    overrides = overrides || {};

    // cache starting position
    this.jumpStart = window.pageYOffset;

    // resolve configuration for this jump
    this.jumpDuration = overrides.duration || this.duration;
    this.jumpOffset = overrides.offset || this.offset;
    this.jumpCallback = overrides.callback || this.callback;
    this.jumpEasing = overrides.easing || this.easing;

    // resolve jump distance
    if (target.nodeType === 1) {
      // if element, determine element offset from current scroll position
      this.jumpDistance = this.jumpOffset + Math.round(target.getBoundingClientRect().top);
    } else {
      // if pixel value, scroll from current location
      this.jumpDistance = target;
    }

    // start scroll loop
    requestAnimationFrame(this._loop.bind(this));
  };

  Jumper.prototype._loop = function (timeCurrent) {
    // if necessary, cache start time
    if (!this.timeStart) {
      this.timeStart = timeCurrent;
    }

    // determine ellapsed time
    this.timeElapsed = timeCurrent - this.timeStart;

    // determine next step in the current jump
    this.jumpNext = this.jumpEasing(this.timeElapsed, this.jumpStart, this.jumpDistance, this.jumpDuration);

    // scroll to next step
    window.scrollTo(0, this.jumpNext);

    // determine how to proceed
    if (this.timeElapsed < this.jumpDuration) {
      // continue animation
      requestAnimationFrame(this._loop.bind(this));
    } else {
      // finish animation
      this._end();
    }
  };

  Jumper.prototype._end = function () {
    // compensate for rAF time and rounding inaccuracies
    window.scrollTo(0, this.jumpStart + this.jumpDistance);

    // fire the callback
    if (typeof this.jumpCallback === 'function') {
      this.jumpCallback();
    }

    // prepare for the next jump
    this.timeStart = false;
  };
});