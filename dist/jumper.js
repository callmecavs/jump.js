/*!
 * Jumper.js 1.0.0 - A small, modern, dependency-free smooth scrolling library.
 * Copyright (c) 2015 Michael Cavalea - https://github.com/callmecavs/jumper.js
 * License: MIT
 */

(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define('Jumper', ['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.Jumper = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Jumper = (function () {
    function Jumper() {
      var defaults = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Jumper);

      this.duration = defaults.duration || 1000;
      this.offset = defaults.offset || 0;
      this.callback = defaults.callback || undefined;

      this.easing = defaults.easing || function (t, b, c, d) {
        // Robert Penner's easeInQuad - http://robertpenner.com/easing/
        return c * (t /= d) * t + b;
      };
    }

    _createClass(Jumper, [{
      key: 'jump',
      value: function jump(target) {
        var _this = this;

        var overrides = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        this.jumpStart = window.pageYOffset;

        this.jumpDuration = overrides.duration || this.duration;
        this.jumpOffset = overrides.offset || this.offset;
        this.jumpCallback = overrides.callback || this.callback;
        this.jumpEasing = overrides.easing || this.easing;

        this.jumpDistance = target.nodeType === 1 ? this.jumpOffset + Math.round(target.getBoundingClientRect().top) : target;

        requestAnimationFrame(function (time) {
          return _this._loop(time);
        });
      }
    }, {
      key: '_loop',
      value: function _loop(currentTime) {
        var _this2 = this;

        if (!this.timeStart) {
          this.timeStart = currentTime;
        }

        this.timeElapsed = currentTime - this.timeStart;
        this.jumpNext = this.jumpEasing(this.timeElapsed, this.jumpStart, this.jumpDistance, this.jumpDuration);

        window.scrollTo(0, this.jumpNext);

        this.timeElapsed < this.jumpDuration ? requestAnimationFrame(function (time) {
          return _this2._loop(time);
        }) : this._end();
      }
    }, {
      key: '_end',
      value: function _end() {
        window.scrollTo(0, this.jumpStart + this.jumpDistance);

        typeof this.jumpCallback === 'function' && this.jumpCallback.call();
        this.timeStart = false;
      }
    }]);

    return Jumper;
  })();

  module.exports = Jumper;
});