# Jump.js

[![Jump.js on NPM](https://img.shields.io/npm/v/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js) [![Jump.js Monthly Downloads on NPM](https://img.shields.io/npm/dm/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js)

Modern smooth scrolling for humans and agents.

Follow these steps to get started:

1. [Install](#install)
2. [Call](#call)
3. [Options](#options)
4. [Errors](#errors)

## Install

1. Using a package manager and an ESM-compatible bundler (recommended):

```bash
$ npm install jump.js
```

```js
import jump from "jump.js"

import type {
  JumpAxis,
  JumpCallback,
  JumpCancel,
  JumpDuration,
  JumpEasing,
  JumpOptions,
  JumpResolvedTarget,
  JumpRoot,
  JumpTarget,
} from "jump.js"
```

2. Using a script tag (legacy):

```html
<!-- UMD format supports: AMD, CommonJS, and global variable (window.Jump) -->
<script src="https://unpkg.com/jump.js@latest/dist/index.umd.min.js"></script>
```

## Call

`Jump` is a function. The only required parameter is a [target](#target):

```js
jump(".target")
```

It returns a function that, when called, cancels it:

```js
const cancel = jump(".target")
```

### target

1. Scroll to an element by:

- Passing in an element, or
- Passing in a CSS selector string (matched using `document.querySelector`)

```js
// passing in an element
const element = document.querySelector(".target")
jump(element)

// passing in a CSS selector string
jump(".target")
```

2. Scroll a fixed number of pixels by passing in a number:

```js
// scroll down `100px`
jump(100)

// scroll up `100px`
jump(-100)
```

## Options

`Jump` accepts an optional 2nd parameter - a configuration object - to customize its behavior.

All options have sensible defaults, shown below:

```js
jump(".target", {
  a11y: false,
  axis: "y",
  callback: undefined,
  duration: 1000, // ms
  easing: easeInOutQuad,
  offset: 0,
  root: window,
})
```

Explanation of each option follows:

- [a11y](#a11y)
- [axis](#axis)
- [callback](#callback)
- [duration](#duration)
- [easing](#easing)
- [offset](#offset)
- [root](#root)

### a11y

If enabled, and the `target` is an element, the `target` will be [`focus`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)ed when the `jump` completes:

```js
jump(".target", {
  a11y: true,
})
```

`Focus` comes with visual implications. If enabling this, check `:focus` and `:focus-*` styling.

### axis

Change the `jump`'s direction:

```js
// scroll horizontally
jump(".target", {
  axis: "x",
})

// scroll vertically (default)
jump(".target", {
  axis: "y",
})
```

### callback

Called after the `jump` has completed:

```js
jump(".target", {
  callback: () => console.log("Jump complete."),
})
```

Doesn't run if the `jump` is `cancel`ed:

```js
// start a jump, storing the `cancel` function
const cancel = jump(".target", {
  callback: () => console.log("Jump complete."),
  duration: 1000, // default
})

// jump cancelled, `callback` doesn't run
setTimeout(cancel, 250)
```

Make a `Promise` wrapper to `jump` with `async` / `await`:

```js
const scroll = (target: JumpTarget, options: JumpOptions = {}): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      jump(target, {
        ...options,
        callback: () => {
          options.callback?.()
          resolve()
        },
      })
    } catch (error) {
      reject(error)
    }
  })

await scroll(".target")
```

### duration

Set how long the `jump` takes by:

1. Passing in an amount of time (`ms`):

```js
jump(".target", {
  duration: 1000,
})
```

2. Passing in a function that:

- Receives the signed `jump` distance as a `number` of pixels, and
- Returns the `jump` duration (`ms`)

```js
jump(".target", {
  duration: distance => Math.abs(distance),
})
```

### easing

Provide a custom easing function used for the `jump` animation. It should accept the animation progress (`0` to `1`), and return the eased progress.

```js
// linear easing
jump(".target", {
  easing: progress => progress,
})
```

### offset

Valid only when `jump`ing to an element. Adjust the `jump` by a number of pixels.

```js
// scrolls down 150px (`offset` ignored)
jump(150, {
  offset: -150,
})

// stop 100px before the leading edge of the target
jump(".target", {
  offset: -100,
})

// stop 50px after the leading edge of the target
jump(".target", {
  offset: 50,
})
```

Useful for:

- Aligning the `target`
- Accommodating `sticky` / `fixed` elements

### root

The element, or `window`, to scroll.

```js
const group = document.querySelector(".group")

// scroll `group` to `item`
jump(".item", {
  root: group,
})
```

## Errors

1. `TypeError`s if the `target` or `options` are an incorrect type:

```js
// TypeError: Expected "target" to be an Element, number, or string.
jump(null)

// TypeError: Expected "axis" to be "x" or "y".
jump(".target", {
  axis: "z",
})
```

2. `Error`s when `target` can't be resolved:

```js
// Error: Failed to resolve "target" string: CSS selector is invalid.
jump("...")

// Error: Failed to resolve "target" string: CSS selector didn't match.
jump(".missing")
```

## Browser Support

The newest ECMAScript feature used in the codebase is [Error `cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause). As such, `jump` supports the following natively:

- Chrome 93+
- Edge 93+
- Firefox 91+
- Opera 79+
- Safari 15+

## License

[MIT](https://opensource.org/licenses/MIT). © 2026 Michael Cavalea
