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
   1. [`TypeError`](#typeerror)
   2. [`Error`](#error)
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

Jump is a **function**.

It accepts two arguments:

1. A required [`target`](#target).
2. An optional [`options`](#options) object.

It returns:

1. A function that, when called, will [`cancel`](#cancel) the in-progress scroll.

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

Scroll a fixed number of pixels by passing a number:

```ts
// scroll down 100px
jump(100)

// scroll up 100px
jump(-100)
```

Scroll to an element by passing either:

- an Element, or
- a CSS selector string

```ts
// pass in an element
jump(document.querySelector(".target"))

// pass in a CSS selector string
jump(".target")
```

If the [`target`](#target) resolves to an element, Jump will attempt to scroll until its edge is aligned with the corresponding edge of the [`root`](#root). The scroll [`axis`](#axis) determines that edge:

- `axis === "y"`: top edge
- `axis === "x"`: left edge

Use the [`offset`](#offset) option to adjust the intended alignment.

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

Customize the scroll behavior by passing in a configuration object.

All options have sensible defaults:

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

If enabled and the [`target`](#target) resolves to an element, the [`target`](#target) will be focused when the scroll completes:

```ts
jump(".target", { a11y: true })
```

Focus may have a visual impact. Remember to check your `:focus` / `:focus-*` styles.

#### axis

```ts
type JumpAxis = "x" | "y"
```

Used to change the direction that the [`root`](#root) scrolls:

```ts
// scroll along the "x" axis (horizontal)
jump(".target", { axis: "x" })
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

It doesn't run if the scroll is canceled:

```ts
const callback = () => console.log("Jump completed.")
const duration = 1000 // default

const cancel = jump(".target", {
  callback,
  duration,
})

// canceled, `callback` doesn't run
window.setTimeout(cancel, duration / 2)
```

Note that:

1. It runs **in the frame after** the scroll completes, and after the `focus` call (when [`a11y`](#a11y) is enabled).
2. If the scroll completes, calling the [`cancel`](#cancel) function will not prevent the [`callback`](#callback) from running.

#### duration

```ts
type JumpDuration = number | ((distance: number) => number)
```

To scroll for a fixed amount of time, pass in a number (`ms`):

```ts
jump(".target", { duration: 1000 })
```

To scroll for an amount of time relative to the scroll distance, pass in a function:

- It will receive the signed scroll distance as a number (`px`), and
- It should return the scroll duration as a number (`ms`)

```ts
// scroll rate: 1px / ms
const duration = (distance: number) => Math.abs(distance)

jump(".target", { duration })
```

Jump scrolls instantly, without starting a `requestAnimationFrame` loop, when the resolved [`duration`](#duration) is `0` or the absolute scroll distance is less than `1px`. Instant scrolls complete normally, with no change to [`a11y`](#a11y) or [`callback`](#callback) behavior.

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
// scroll stops 100px before the target's top edge
jump(".target", { offset: -100 })

// scroll stops 50px after the target's top edge
jump(".target", { offset: 50 })
```

It's ignored if the [`target`](#target) is a number:

```ts
// scroll down 150px (offset ignored)
jump(150, { offset: -150 })
```

It's useful for:

- Aligning the [`target`](#target) within the [`root`](#root)
- Accommodating `sticky` / `fixed` elements

#### root

```ts
type JumpRoot = Window | Element
```

The `window` or element that is scrolled.

```ts
const container = document.querySelector(".container")

// scroll `container` down 100px
jump(100, { root: container })
```

Note that:

1. Jump clamps every scroll to the [`root`](#root)'s actual scroll range.
2. Jump resolves [`target`](#target) CSS selector strings via `querySelector` scoped to the [`root`](#root).

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

Jump performs runtime validation that can throw a `TypeError` or `Error`. All validation is done synchronously, before the scrolling begins.

### `TypeError`

Thrown when:

1. An argument doesn't match the expected type:

```ts
// TypeError: "target": expected an Element, a number, or a string.
jump(null)
```

### `Error`

Thrown when:

1. The `target` can't be resolved:

```ts
// Error: "target": CSS selector is invalid.
jump("1337")

// Error: "target": CSS selector did not match an Element.
jump("#no-match")
```

2. The `duration` can't be resolved:

```ts
// Error: "duration": expected a finite, non-negative number.
jump(100, { duration: Infinity })
jump(100, { duration: (distance: number) => -1 * distance })
```

## FAQs

<details>

<summary>Does Jump support <code>async</code> / <code>await</code>?</summary>

<br />

No, but it was designed so that you can implement this externally:

```ts
import type { JumpCancel, JumpOptions, JumpTarget } from "jump.js"
import jump from "jump.js"

type JumpPromiseResult = {
  promise: Promise<void>
  cancel: JumpCancel
}

const jumpPromise = (target: JumpTarget, options: JumpOptions = {}): JumpPromiseResult => {
  let resolve: (value: void | PromiseLike<void>) => void
  let reject: (reason?: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any

  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })

  let isSettled = false

  const callback = () => {
    if (isSettled) return

    isSettled = true
    resolve()
    options.callback?.()
  }

  const cancel = jump(target, { ...options, callback })

  return {
    promise,
    cancel: () => {
      if (isSettled) return

      isSettled = true
      cancel()
      reject()
    },
  }
}

export default jumpPromise
```

</details>

<details>

<summary>Does Jump handle duplicate / overlapping / conflicting scrolls?</summary>

<br />

No, but it was designed so that you can implement this externally:

```ts
import type { JumpCancel, JumpOptions, JumpTarget } from "jump.js"
import jump from "jump.js"

let isIdle = true

const jumpGuard = (target: JumpTarget, options: JumpOptions = {}): JumpCancel | undefined => {
  if (!isIdle) return

  isIdle = false

  let isStale = false

  const finish = () => {
    if (isStale) return

    isIdle = true
    isStale = true
  }

  const callback = () => {
    finish()
    options.callback?.()
  }

  try {
    const cancel = jump(target, { ...options, callback })

    return () => {
      if (isStale) return

      cancel()
      finish()
    }
  } catch (error) {
    finish()
    throw error
  }
}

export default jumpGuard
```

</details>

<details>

<summary>Does Jump stop an in-progress scroll in response to user input?</summary>

<br />

No, but it was designed so that you can implement this externally:

```ts
import jump from "jump.js"

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

// call Jump here so that, if it throws, event listeners aren't registered
const cancel = jump(".target", { callback: cleanup })

window.addEventListener("keydown", handleKeyDown)
window.addEventListener("pointerdown", handlePointerDown, { passive: true })
window.addEventListener("wheel", handleWheel, { passive: true })
```

</details>

<details>

<summary>Does Jump handle <code>prefers-reduced-motion</code>?</summary>

<br />

No, but it was designed so that you can implement this externally:

```ts
import jump from "jump.js"

// set duration based on motion preference
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const duration = prefersReducedMotion ? 0 : 1000

jump(".target", { duration })
```

</details>

<details>

<summary>Is Jump compatible with CSS scroll snap?</summary>

<br />

No, but scroll snap behavior can be mimicked with Jump and custom code:

| CSS Property              | Alternative Approach                            |
| :------------------------ | :---------------------------------------------- |
| `scroll-snap-type`        | `scrollend` event, `axis` option, `root` option |
| `scroll-snap-align`       | `offset` option                                 |
| `scroll-padding`          | `offset` option                                 |
| `scroll-margin`           | `offset` option                                 |
| `scroll-behavior: auto`   | `duration` option                               |
| `scroll-behavior: smooth` | `duration` and `easing` options                 |

</details>

<details>

<summary>Is Jump compatible with <a href="https://github.com/darkroomengineering/lenis"><code>lenis</code></a>?</summary>

<br />

No, but you probably don't need both.

If you're already using `lenis`, see the [`scrollTo`](https://github.com/darkroomengineering/lenis#methods) method. It handles much of what Jump can do, and has a very similar API.

</details>

## Browser Support

Jump natively supports the following browsers:

| Browser      | Version | Limiting Feature                                                                                                          |
| :----------- | :------ | :------------------------------------------------------------------------------------------------------------------------ |
| Chrome       | 80+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Edge         | 80+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Firefox      | 74+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Opera        | 67+     | [`?.` (optional chaining)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) |
| Safari       | 15+     | [`preventScroll` (focus option)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll)        |
| Safari (iOS) | 15.5+   | [`preventScroll` (focus option)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll)        |

## License

[MIT](https://opensource.org/licenses/MIT). © 2026 Michael Cavalea
