/*!
 * Jump.js 0.0.1 - A small, modern, dependency-free smooth scrolling library.
 * Copyright (c) 2015 Michael Cavalea - https://github.com/callmecavs/jump.js
 * License: MIT
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Jump = (function () {
  function Jump() {
    _classCallCheck(this, Jump);
  }

  _createClass(Jump, [{
    key: 'jump',
    value: function jump(target) {
      var _this = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.start = window.pageYOffset;

      this.options = {
        duration: options.duration,
        offset: options.offset || 0,
        callback: options.callback || undefined
      };

      this.distance = typeof target === 'string' ? this.options.offset + document.querySelector(target).getBoundingClientRect().top : target;

      requestAnimationFrame(function (time) {
        return _this._loop(time);
      });
    }
  }, {
    key: '_loop',
    value: function _loop(time) {
      var _this2 = this;

      if (!this.timeStart) {
        this.timeStart = time;
      }

      this.timeElapsed = time - this.timeStart;
      this.next = this._easing(this.timeElapsed, this.start, this.distance, this.options.duration);

      window.scrollTo(0, this.next);

      this.timeElapsed < this.options.duration ? requestAnimationFrame(function (time) {
        return _this2._loop(time);
      }) : this._end();
    }
  }, {
    key: '_end',
    value: function _end() {
      window.scrollTo(0, this.start + this.distance);

      typeof this.options.callback === 'function' && this.options.callback.call();
      this.timeStart = false;
    }
  }, {
    key: '_easing',
    value: function _easing(t, b, c, d) {
      // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
  }]);

  return Jump;
})();

exports.default = Jump;