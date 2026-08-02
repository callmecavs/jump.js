# Jump.js

[![Jump.js on npm](https://img.shields.io/npm/v/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js) [![Jump.js Monthly Downloads on npm](https://img.shields.io/npm/dm/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js)

Modern smooth scrolling for humans and agents.

## Contents

1. [Install](#install)
2. [Basic Usage](#basic-usage)
3. [API](#api)
   1. [target](#target)
   2. [options](#options)
      1. [a11y](#a11y)
      2. [axis](#axis)
      3. [callback](#callback)
      4. [duration](#duration)
      5. [easing](#easing)
      6. [offset](#offset)
      7. [root](#root)
   3. [cancel](#cancel)
4. [Error Handling](#error-handling)
5. [Browser Support](#browser-support)
6. [License](#license)

## Install

Jump was developed with modern workflows in mind, and **requires ESM-compatible tooling**. Install it using your package manager:

```bash
$ npm install jump.js
```

Though not required, it's recommended to use Jump with TypeScript. Jump ships with the following `type` definitions (`.d.ts`):

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

Each `type` is detailed in the relevant section of this documentation.

## Basic Usage

Jump is **simply a function**.

- **Required**: Import it and call it, passing in a [target](#target).
- Optional: Pass it a [configuration](#options) object.
- Optional: Store the returned [cancel](#cancel) function.

```ts
import jump from "jump.js"

const options = {
  // ...
}

const cancel = jump(".target", options)
```

## API

```ts
type Jump = (target: JumpTarget, options?: JumpOptions) => JumpCancel
```

### target

```ts
type JumpTarget = Element | number | string
```

Scroll a number of pixels:

```ts
// scroll down `100px`
jump(100)

// scroll up `100px`
jump(-100)
```

Scroll to an element by passing in:

- An element, or
- A CSS selector (resolved against the `root`, via `querySelector`)

```ts
// pass in an element
jump(document.querySelector(".target"))

// pass in a CSS selector string
jump(".target")
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
```

Customize the scroll behavior by passing in an `options` object.

All `options` have sensible defaults:

```ts
const defaults: JumpOptions = {
  a11y: false,
  axis: "y",
  callback: undefined,
  duration: 1000, // ms
  easing: easeInOutQuad,
  offset: 0, // px
  root: window,
}
```

#### a11y

```ts
boolean
```

If enabled, and the `target` resolves to an element, the `target` will be focused when the scroll completes:

```ts
jump(".target", { a11y: true })
```

Beware of visual changes caused by CSS `:focus` / `:focus-*` styling.

#### axis

```ts
type JumpAxis = "x" | "y"
```

The direction the `root` is scrolled:

```ts
jump(".target", { axis: "x" }) // horizontal
jump(".target", { axis: "y" }) // vertical (default)
```

#### callback

```ts
type JumpCallback = () => void
```

A function called after the scroll has completed:

```ts
const callback = () => console.log("Jump completed.")

jump(".target", { callback })
```

It won't be called if the jump is cancelled:

```ts
const callback = () => console.log("Jump completed.")
const duration = 1000 // default

const cancel = jump(".target", {
  callback,
  duration,
})

// cancelled, `callback` never runs
window.setTimeout(cancel, duration / 2)
```

For usage with `async` / `await`, make a `Promise` wrapper:

```ts
const jumpAsync = (target, options = {}) =>
  new Promise(resolve => {
    jump(target, {
      ...options,
      callback: () => {
        options.callback?.()
        resolve()
      },
    })
  })

await jumpAsync(".target")
```

It **runs in the frame after**:

1. The final scroll call, and
2. The focus call (when `a11y` is enabled)

#### duration

```ts
type JumpDuration = number | ((distance: number) => number)
```

Scroll over a fixed amount of time by passing in a number of milliseconds (`ms`):

```ts
jump(".target", { duration: 1000 })
```

Scroll over an amount of time relative to the distance by passing in a function that:

- Receives the signed scroll distance as a number of pixels, and
- Returns the scroll duration in milliseconds (`ms`)

```ts
// scroll at 1px / ms
const duration = (distance: number) => Math.abs(distance)

jump(".target", { duration })
```

#### easing

```ts
type JumpEasing = (progress: number) => number
```

The easing function used for the scroll animation. It must:

1. Accept the progress (`0` to `1`), and
2. Return the eased progress.

```ts
// custom linear easing function
const easing = (progress: number) => progress

jump(".target", { easing })
```

#### offset

If the `target` resolves to an element, adjust the scroll by a number of pixels.

```ts
// stop 100px before the leading edge of the target
jump(".target", {
  offset: -100,
})

// stop 50px after the leading edge of the target
jump(".target", {
  offset: 50,
})

// scroll down `150px` (ignored)
jump(150, {
  offset: -150,
})
```

Useful for:

- Aligning the `target`
- Accommodating `sticky` / `fixed` elements

#### root

```ts
type JumpRoot = Window | Element
```

The `window`, or element, that is scrolled.

```ts
const parent = document.querySelector(".parent")
const children = Array.from(parent.children)

// scroll `parent` to 1st `child`
jump(children[0], {
  root: parent,
})
```

### cancel

```ts
type JumpCancel = () => void
```

A function that, when called, stops a scroll-in-progress.

```ts
// start scrolling (default `duration` of 1000ms)
const cancel = jump(".target")

// cancel scrolling halfway through
setTimeout(cancel, 500)
```

Conflicting scrolls are not handled by the library. Use this `cancel` function to prevent / manage them.

## Error Handling

Jump will throw:

- `TypeError`s if invalid parameters are passed:

```ts
// TypeError: Expected "target" to be an Element, number, or string.
jump(null)

// TypeError: Expected "axis" to be "x" or "y".
jump(".target", {
  axis: "z",
})
```

- Generic `Error`s if the `target` can't be resolved:

```ts
// Error: Failed to resolve "target" string: CSS selector is invalid.
jump("1337")

// Error: Failed to resolve "target" string: CSS selector didn't match.
jump(".no-match")
```

## Browser Support

Jump supports the following natively:

| Browser      | Version | Limiting Feature                                                                                                          |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Chrome       | 80+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Edge         | 80+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Firefox      | 74+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Opera        | 67+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Safari       | 15+     | [`preventScroll` (focus option)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll)        |
| Safari (iOS) | 15.5+   | [`preventScroll` (focus option)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll)        |

## License

[MIT](https://opensource.org/licenses/MIT). © 2026 Michael Cavalea
