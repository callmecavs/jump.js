# Jump.js

[![Jump.js on NPM](https://img.shields.io/npm/v/jump.js.svg)](https://www.npmjs.com/package/jump.js)

A small, modern, dependency-free smooth scrolling library.

* [Demo Page](http://callmecavs.github.io/jump.js/) (Click the arrows!)

## Usage

Jump was developed with a modern JavaScript workflow in mind. To use it, it's recommended you have a build system in place that can transpile ES6, and bundle modules. For a minimal boilerplate that fulfills those requirements, check out [outset](https://github.com/callmecavs/outset).

Follow these steps to get started:

* [Install](#install)
* [Instantiate](#instantiate)
* [Jump](#jump)

### Install

Using NPM, install Jump.js, and add it to your package.json dependencies.

```bash
$ npm install jump.js --save
```

### Instantiate

Simply import Jump, then instantiate it. No options are passed to the constructor.

```es6
// import Jump
import Jump from 'jump.js'

// create an instance
const Jump = new Jump()
```

It's recommended that you assign your Jump instance to a variable. One instance can make infinite jumps.

### Jump

Two parameters are required to make a jump:

* A [target](#target)
* An [options](#options) object

#### Target

To jump to an element, pass an element or a CSS selector string.

```es6
Jump.jump(element, {
  // options...
})

Jump.jump('.selector', {
  // options...
})
```

To scroll from the current position, pass a number of pixels, positive or negative.

```es6
// down one viewport height
Jump.jump(window.innerHeight, {
  // options...
})

// up 100px
Jump.jump(-100, {
  // options...
})
```

#### Options

Note that **duration is required** for every `jump()`.

Defaults are shown below, explanation of each option follows.

```es6
Jump.jump('.selector', {
  duration: /* REQUIRED, no default */,
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

##### duration

How long the `jump()` takes, in milliseconds.

```es6
Jump.jump('.selector', {
  duration: 1000
})
```

Or, a function accepting `distance` (in `px`) as an argument, and returning the duration (in milliseconds) as a number.

```es6
Jump.jump('.selector', {
  duration: (distance) => Math.abs(distance)
})
```

##### offset

Offset a `jump()`, _only if to an element_, in pixels.

Useful for accomodating elements fixed to the top/bottom of the screen.

```es6
Jump.jump('.selector', {
  offset: 100
})
```

##### callback

Fired after the `jump()` has been completed.

```es6
Jump.jump('.selector', {
  callback: () => {
    console.log('Jump completed!')
  }
})
```

##### easing

Easing function used to transition the `jump()`.

```es6
Jump.jump('.selector', {
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
