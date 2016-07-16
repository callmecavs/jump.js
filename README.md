# Jump.js

[![Jump.js on NPM](https://img.shields.io/npm/v/jump.js.svg)](https://www.npmjs.com/package/jump.js)

A small, modern, dependency-free smooth scrolling library.

* [Demo Page](http://callmecavs.github.io/jump.js/) (Click the arrows!)

## Usage

Jump was developed with a modern JavaScript workflow in mind. To use it, it's recommended you have a build system in place that can transpile ES6, and bundle modules. For a minimal boilerplate that fulfills those requirements, check out [outset](https://github.com/callmecavs/outset).

Follow these steps to get started:

1. [Install](#install)
2. [Import](#import)
3. [Call](#call)

### Install

Using NPM, install Jump, and save it to your `package.json` dependencies.

```bash
$ npm install jump.js --save
```

### Import

Import Jump, naming it according to your preference.

```es6
// import Jump

import jump from 'jump.js'
```

### Call

Jump exports a _singleton_, so there's no need to create an instance. Just call it, passing in a [target](#target).

```es6
// call Jump

jump('.target')
```

Note that the singleton can make an infinite number of jumps.

## Options

All options, _except [target](#target)_, are optional, and have sensible defaults.

Default options are shown below.

```es6
jump('.target', {
  duration: 1000,
  offset: 0,
  callback: undefined,
  easing: easeInOutQuad,
  a11y: false
})
```

Explanation of each option follows:

* [target](#target)
* [duration](#duration)
* [offset](#offset)
* [callback](#callback)
* [easing](#easing)
* [a11y](#a11y)

### target

Scroll from the current position by passing a number of pixels.

```es6
// scroll down 100px

jump(100)

// scroll up 100px

jump(-100)
```

Scroll to an element by passing a node or a selector.

```es6
// passing a node

const node = document.querySelector('#target')

jump(node)

// passing a selector
// the element is resolved using document.querySelector

jump('#target')
```

### duration

How long the `jump()` takes, in milliseconds.

```es6
jump('.target', {
  duration: 1000
})
```

Or, a function accepting `distance` (in `px`) as an argument, and returning the duration (in milliseconds) as a number.

```es6
jump('.target', {
  duration: distance => Math.abs(distance)
})
```

### offset

Offset a `jump()`, _only if to an element_, in pixels.

Useful for accommodating elements fixed to the top/bottom of the screen.

```es6
jump('.target', {
  offset: 100
})
```

### callback

A function called after the `jump()` has been completed.

```es6
jump('.target', {
  callback: () => console.log('Jump completed!')
})
```

### easing

Easing function used to transition the `jump()`.

```es6
jump('.target', {
  easing: easeInOutQuad
})
```

See [easing.js](https://github.com/callmecavs/jump.js/blob/master/src/easing.js) for the definition of the default easing function, originally written by Robert Penner.

### a11y

If enabled, _and scrolling to an element_, add a [`tabindex`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex) and [`focus`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus) the element.

```es6
jump('.target', {
  a11y: true
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
