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
5. [FAQs](#faqs)
6. [Browser Support](#browser-support)
7. [License](#license)

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

- **Required**: Import it and call it, passing it a [target](#target).
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

Scroll a number of pixels by passing a number:

```ts
// scroll down 100px
jump(100)

// scroll up 100px
jump(-100)
```

Scroll to an element by passing an:

- Element, or
- CSS selector string (resolved against the `root`, via `querySelector`)

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

Focus can have a visual impact. Be mindful of your CSS (`:focus` / `:focus-*`).

#### axis

```ts
type JumpAxis = "x" | "y"
```

The `axis` along which the `root` will be scrolled:

```ts
jump(".target", { axis: "x" }) // horizontal scroll
jump(".target", { axis: "y" }) // vertical scroll (default)
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

It doesn't run if the jump is cancelled:

```ts
const callback = () => console.log("Jump completed.")
const duration = 1000 // default

const cancel = jump(".target", {
  callback,
  duration,
})

// cancelled, `callback` doesn't run
window.setTimeout(cancel, duration / 2)
```

It runs **in the frame after**:

1. The final scroll call, and
2. The focus call (if `a11y` is enabled)

#### duration

```ts
type JumpDuration = number | ((distance: number) => number)
```

To scroll over a fixed amount of time, pass in a number (`ms`):

```ts
jump(".target", { duration: 1000 })
```

To scroll over an amount of time relative to the scroll distance, pass in a function:

- It will recieve the signed scroll distance as a number (`px`), and
- It should return the scroll duration as a number (`ms`)

```ts
// scroll rate: 1px / ms
const duration = (distance: number) => Math.abs(distance)

jump(".target", { duration })
```

#### easing

```ts
type JumpEasing = (progress: number) => number
```

The easing function used for the scroll animation. It should:

1. Accept the linear progress (`0` to `1`), and
2. Return the eased progress.

```ts
// linear easing
const easing = (progress: number) => progress

jump(".target", { easing })
```

#### offset

```ts
number
```

It adjusts the scroll by a number of `px`:

```ts
// scroll stops 100px BEFORE the target's top edge
jump(".target", { offset: -100 })

// scroll stops 50px AFTER the target's top edge
jump(".target", { offset: 50 })
```

It's ignored if the `target` is a number:

```ts
// scrolls down 150px
jump(150, { offset: -150 })
```

It's useful for:

- Aligning the `target` within the `root`
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
jump(children[0], { root: parent })
```

### cancel

```ts
type JumpCancel = () => void
```

A function that stops the in-progress scroll.

```ts
// start scroll
const cancel = jump(".target", { duration: 1000 })

// cancel it
window.setTimeout(cancel, 500)
```

## Error Handling

Jump will throw:

1. `TypeError`s when invalid parameters are passed:

```ts
// TypeError: Expected "target" to be an Element, number, or string.
jump(null)
```

2. `Error`s when:

The `target` can't be resolved:

```ts
// Error: "target" string: CSS selector is invalid.
jump("1337")

// Error: "target" string: CSS selector didn't match.
jump(".no-match")
```

## FAQs

<details>

<summary>Is Jump compatible with <code>async</code> / <code>await</code>?</summary>

<br>

Not by default, but it's easy to add by leveraging the `callback`:

```ts
import type { JumpOptions, JumpTarget } from "jump.js"
import jump from "jump.js"

const jumpAsync = (target: JumpTarget, options: JumpOptions = {}): Promise<void> =>
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

</details>

<details>

<summary>Does Jump respect <code>prefers-reduced-motion</code>?</summary>

<br>

Not by default, but it's easily handled externally:

```ts
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

// set duration based on user's motion preference
const duration = prefersReducedMotion ? 0 : 1000

jump(".target", { duration })
```

</details>

<details>

<summary>Will an in-progress scroll stop on user input?</summary>

<br>

Not by default, but the code below approximates this behavior:

```ts
const SCROLL_KEYS = [
  " ", // Spacebar
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  "Tab", // can cause indirect scroll via focus change
]

// call Jump first so that, if it throws, event listeners don't register
const cancel = jump(".target", { callback: () => cleanup() })

const cleanup = () => {
  window.removeEventListener("keydown", handleKeyDown)
  window.removeEventListener("pointerdown", handlePointerDown)
  window.removeEventListener("wheel", handleWheel)
}

const handleUserInput = () => {
  cleanup()
  cancel()
}

// keyboard input
const handleKeyDown = ({ key }: KeyboardEvent) => {
  if (SCROLL_KEYS.includes(key)) handleUserInput()
}

// touch or pen input
const handlePointerDown = ({ pointerType }: PointerEvent) => {
  if (pointerType !== "mouse") handleUserInput()
}

// mouse wheel or trackpad input
const handleWheel = () => handleUserInput()

window.addEventListener("keydown", handleKeyDown)
window.addEventListener("pointerdown", handlePointerDown, { passive: true })
window.addEventListener("wheel", handleWheel, { passive: true })
```

</details>

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
