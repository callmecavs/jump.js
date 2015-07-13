# Jumper.js

A small, modern, dependency-free smooth scrolling library.

## Usage

Create an instance. When doing so, set your defaults.

Note that these can be overridden on a per-jump basis.

```javascript
// defaults shown below

var jumper = new Jumper({
  duration: 1000,                     // ms
  offset: 0,                          // px
  callback: null,                     // function
  easing: function(t, b, c, d) {      // Robert Penner's easeInQuad - http://robertpenner.com/easing/
    return c * (t /= d) * t + b;
  }
});
```

Start jumping! Use the `jump` method.

```javascript
// scroll from the current position

jumper.jump(100);     // down 100px
jumper.jump(-100);    // up 100px

// scroll to an element

jumper.jump(document.querySelector('.demo-element'));

// override your defaults

jumper.jump(100, {
  ...
});
```

## Browser Support

Jumper natively supports **IE10+**.

For legacy support, consider including [Paul Irish's polyfill](https://gist.github.com/paulirish/1579671) for [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

## Roadmap

- [ ] Update docs
- [x] Add `callback` option
- [x] Add `duration` and `offset` defaults and overrides
- [x] Add `easing` option
- [ ] Add option to scroll at `px/s` instead of a fixed duration
- [x] Improve code commenting
- [ ] Add header to `dist` files

[![Fuck It, Ship It](http://forthebadge.com/images/badges/fuck-it-ship-it.svg)](http://forthebadge.com) [![Fo Sho](http://forthebadge.com/images/badges/fo-sho.svg)](http://forthebadge.com)
