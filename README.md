# Jump.js

[![Jump.js on NPM](https://img.shields.io/npm/v/jump.js.svg)](https://www.npmjs.com/package/jump.js)

A small, modern, dependency-free smooth scrolling library.

* [Demo Page](http://callmecavs.github.io/jump.js/) (Click the arrows!)

## Usage

Jump was developed with a modern JavaScript workflow in mind. To use it, it's recommended you have a build system in place that can transpile ES6, and bundle modules. For a minimal boilerplate that fulfills those requirements, check out [outset](https://github.com/callmecavs/outset).

Follow these steps to get started:

* [Install](#install)
* [Import](#import)
* [Call](#call)

### Install

Using NPM, install Jump.js, and add it to your package.json dependencies.

```bash
$ npm install jump.js --save
```

### Import

Import Jump, naming it what you prefer.

```es6
// import Jump
import jump from 'jump.js'
```

### Call

Jump exports a singleton. There's no need to create an instance.

Simply call it, passing in your [target](#target).

```es6
// call Jump
jump('.selector')
```

The singleton can make an infinite number of jumps.

## Options

All options have sensible defaults, shown below. Explanation of each option follows.

```es6
jump('.selector', {
  duration: 1000,
  offset: 0,
  callback: undefined,
  easing: (t, b, c, d) => {
    // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
    t /= d / 2
    if(t < 1) return c / 2 * t * t + b
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
  }
})
```

### target



### duration

How long the `jump()` takes, in milliseconds.

```es6
jump('.selector', {
  duration: 1000
})
```

Or, a function accepting `distance` (in `px`) as an argument, and returning the duration (in milliseconds) as a number.

```es6
jump('.selector', {
  duration: (distance) => Math.abs(distance)
})
```

##### offset

Offset a `jump()`, _only if to an element_, in pixels.

Useful for accomodating elements fixed to the top/bottom of the screen.

```es6
jump('.selector', {
  offset: 100
})
```

##### callback

Fired after the `jump()` has been completed.

```es6
jump('.selector', {
  callback: () => {
    console.log('Jump completed!')
  }
})
```

##### easing

Easing function used to transition the `jump()`.

```es6
jump('.selector', {
  easing: (t, b, c, d) => {
    return c * (t /= d) * t + b
  }
})
```

## Browser Support

Jump depends on the following browser APIs:

* [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

Consequently, it supports the following natively:

* Chrome 24+
* Firefox 23+
* Safari 6.1+
* Opera 15+
* IE 10+
* iOS Safari 7.1+
* Android Browser 4.4+

To add support for older browsers, consider including polyfills/shims for the APIs listed above. There are no plans to include any in the library, in the interest of file size.

## License

[MIT](https://opensource.org/licenses/MIT). © 2016 Michael Cavalea

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
