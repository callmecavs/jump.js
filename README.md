# Jump.js

[![Jump.js on NPM](https://img.shields.io/npm/v/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js) [![Jump.js Monthly Downloads on NPM](https://img.shields.io/npm/dm/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js)

Modern smooth scrolling for humans and agents.

## Contents

1. [Install](#install)
2. [Types](#types)
3. [Call](#call)
4. [Parameters](#parameters)
   1. [target](#target)
   2. [options](#options)
      1. [a11y](#a11y)
      2. [axis](#axis)
      3. [callback](#callback)
      4. [duration](#duration)
      5. [easing](#easing)
      6. [offset](#offset)
      7. [root](#root)
5. [Return Value](#return-value)
6. [Errors](#errors)
7. [Browser Support](#browser-support)
8. [License](#license)

## Install

Jump is ESM-only.

```bash
$ npm install jump.js
```

## Types

Jump ships with the following TypeScript definitions (`.d.ts`):

```ts
import type {
  Jump,
  JumpAxis,
  JumpCallback,
  JumpCancel,
  JumpDuration,
  JumpEasing,
  JumpOptions,
  JumpRoot,
  JumpTarget,
} from "jump.js"
```

Each `type` is re-surfaced in the relevant portion of this documentation.

## Call

Jump is a function that scrolls to a [target](#target) in a [configurable](#options) and [cancelable](#return-value) way.

```js
import jump from "jump.js"

const options = {
  // ...
}

const cancel = jump(".target", options)
```

## Parameters

```ts
type Jump = (target: JumpTarget, options?: JumpOptions) => JumpCancel
```

### target

```ts
type JumpTarget = Element | number | string
```

Scroll to an element by passing in:

- An element, or
- A CSS selector (matched using `document.querySelector`)

```js
// pass in an element
jump(document.querySelector(".target"))

// pass in a CSS selector
jump(".target")
```

Scroll a fixed amount by passing in a number of pixels:

```js
// scroll down `100px`
jump(100)

// scroll up `100px`
jump(-100)
```

### options

```ts
type JumpOptions = {
  a11y?: boolean
  axis?: JumpAxis
  callback?: JumpCallback
  duration?: JumpDuration // ms
  easing?: JumpEasing
  offset?: number // px
  root?: JumpRoot
}

type JumpAxis = "x" | "y"
type JumpCallback = () => void
type JumpDuration = number | ((distance: number) => number)
type JumpEasing = (progress: number) => number
type JumpRoot = Window | Element
```

Customize the scroll behavior by passing in an `options` object. Default `options` are shown below:

```ts
const defaults: JumpOptions = {
  a11y: false,
  axis: "y",
  callback: undefined,
  duration: 1000,
  easing: easeInOutQuad,
  offset: 0,
  root: window,
}
```

#### a11y

If enabled, and the `target` is an element, the `target` will be [`focus`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)ed when the `jump` completes:

```js
jump(".target", {
  a11y: true,
})
```

`Focus` comes with visual implications. If enabling this, check `:focus` and `:focus-*` styling.

#### axis

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

#### callback

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

```ts
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

#### duration

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

#### easing

Provide a custom easing function used for the `jump` animation. It should accept the progress (`0` to `1`), and return the eased progress.

```js
// linear easing
jump(".target", {
  easing: progress => progress,
})
```

#### offset

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

#### root

The element, or `window`, to scroll.

```js
const group = document.querySelector(".group")

// scroll `group` to `item`
jump(".item", {
  root: group,
})
```

## Return Value

```ts
type JumpCancel = () => void
```

Jump returns a function that can be used to cancel it.

## Errors

Before scrolling, `jump` validates the `target` and `options`. This validation can throw:

- `TypeError`s if the `target` and / or `options` are incorrect types:

```js
// TypeError: Expected "target" to be an Element, number, or string.
jump(null)

// TypeError: Expected "axis" to be "x" or "y".
jump(".target", {
  axis: "z",
})
```

- `Error`s if the `target` can't be resolved:

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
