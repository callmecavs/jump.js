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
6. [Migrating](#migrating)
7. [Browser Support](#browser-support)
8. [License](#license)

## Install

Jump was developed with modern workflows in mind, and **requires ESM-compatible tooling**. Install it using your package manager:

```shell
npm install jump.js
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

1. A function that [`cancel`](#cancel)s the in-progress scroll.

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

Jump adheres to the following "logical direction" conventions:

| [`axis`](#axis) | Text direction      | Element [`target`](#target) alignment | Positive value direction | Negative value direction |
| :-------------- | :------------------ | :------------------------------------ | :----------------------- | :----------------------- |
| `y`             | Any                 | Top Edge                              | Down                     | Up                       |
| `x`             | LTR (left to right) | Left Edge                             | Right                    | Left                     |
| `x`             | RTL (right to left) | Right Edge                            | Left                     | Right                    |

For horizontal scrolls, Jump responds to the [`root`](#root)'s computed CSS [`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/direction).

These conventions are especially relevant to:

- [`target`](#target)
- [`axis`](#axis)
- [`duration`](#duration) functions
- [`offset`](#offset)

### target

```ts
type JumpTarget = Element | number | string
```

Scroll a static number of pixels by passing in a number:

```ts
// scroll down 100px
jump(100)

// scroll up 100px
jump(-100)
```

Scroll to an element by passing in either:

- an element, or
- a CSS selector string

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

Customize the scroll behavior by passing in a configuration object.

All [`options`](#options) have sensible defaults:

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

If enabled and the [`target`](#target) resolves to an element, Jump will attempt to focus it when the scroll completes:

```ts
jump(".target", { a11y: true })
```

Note that:

- If needed, Jump will temporarily add `tabindex="-1"`.
- Focus can affect the element's appearance. Remember to check your `:focus` and `:focus-*` styles.

#### axis

```ts
type JumpAxis = "x" | "y"
```

The axis along which the [`root`](#root) scrolls:

- `x`: horizontal
- `y`: vertical (default)

```ts
// scroll along the "x" axis (horizontal)
jump(".target", { axis: "x" })
```

#### callback

```ts
type JumpCallback = () => void
```

A function called after the scroll completes:

```ts
const callback = () => console.log("Jump completed.")

jump(".target", { callback })
```

It won't run if the scroll is canceled:

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

- It runs **in the animation frame after** scroll completion and any focus call triggered by [`a11y`](#a11y).
- If the scroll completes, calling the [`cancel`](#cancel) function will not prevent the [`callback`](#callback) from running.

#### duration

```ts
type JumpDuration = number | ((distance: number) => number)
```

To scroll for a fixed amount of time, pass in a number (`ms`):

```ts
jump(".target", { duration: 1000 })
```

To scroll for an amount of time relative to the scroll distance, pass in a function that:

1. Accepts the logically signed scroll distance as a number (`px`), and
2. Returns the scroll duration as a number (`ms`).

```ts
// scroll rate: 1px / ms
const duration = (distance: number) => Math.abs(distance)

jump(".target", { duration })
```

Jump scrolls instantly, without starting a `requestAnimationFrame` loop, when:

1. The resolved [`duration`](#duration) is `0`, or
2. The absolute scroll distance is less than `1px`.

This does not affect [`a11y`](#a11y) or [`callback`](#callback) behavior.

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

Adjusts the scroll by a number of `px`:

```ts
// stop 100px before the `target` reaches the relevant edge
jump(".target", { offset: -100 })

// stop 50px after the `target` reaches the relevant edge
jump(".target", { offset: 50 })
```

Ignored if the [`target`](#target) is a number:

```ts
// scroll down 150px (ignored)
jump(150, { offset: -150 })
```

It's useful for:

- Positioning the [`target`](#target) relative to the [`root`](#root).
- Accommodating `sticky` / `fixed` elements.

#### root

```ts
type JumpRoot = Window | Element
```

The `window` or element that is scrolled:

```ts
const container = document.querySelector(".container")

// scroll `container` down 100px
jump(100, { root: container })
```

Note that:

- Jump clamps every scroll to the [`root`](#root)'s actual scroll range.
- Jump resolves [`target`](#target) CSS selector strings via `querySelector` scoped to the [`root`](#root).

### cancel

```ts
type JumpCancel = () => void
```

A function that stops the in-progress scroll:

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

1. The `target` CSS selector string can't be resolved:

```ts
// Error: "target": CSS selector is invalid.
jump("1337")

// Error: "target": CSS selector did not match an element.
jump("#no-match")
```

2. The `target` is not contained by the `root`:

```html
<div class="root">
  <!-- ... -->
</div>

<div class="target">Target</div>
```

```ts
const root = document.querySelector(".root")
const target = document.querySelector(".target")

// Error: "target": element is not contained by "root".
jump(target, { root })
```

3. The `target` is not connected to a document.

```ts
const target = document.createElement("div")

// Error: "target": element is not connected to a document.
jump(target)
```

4. The `duration` can't be resolved:

```ts
// Error: "duration": expected a finite, non-negative number.
jump(100, { duration: Infinity })
jump(100, { duration: (distance: number) => -1 * distance })
```

## FAQs

<details>

<summary>Does Jump support <code>async</code> / <code>await</code>?</summary>

<br />

No, but it was designed such that you can implement this externally. Refer to the recipe: [`jump-promise.ts`](./recipes/jump-promise.ts).

</details>

<details>

<summary>Does Jump handle duplicate / overlapping / conflicting scrolls?</summary>

<br />

No, but it was designed such that you can implement this externally. Refer to the recipe: [`jump-idle.ts`](./recipes/jump-idle.ts).

</details>

<details>

<summary>Does Jump stop an in-progress scroll in response to user input?</summary>

<br />

No, but it was designed such that you can implement this externally. Refer to the recipe: [`cancel-on-user-input.ts`](./recipes/cancel-on-user-input.ts).

</details>

<details>

<summary>Does Jump handle <code>prefers-reduced-motion</code>?</summary>

<br />

No, but it was designed such that you can implement this externally. Refer to the recipe: [`prefers-reduced-motion.ts`](./recipes/prefers-reduced-motion.ts).

</details>

<details>

<summary>Does Jump handle dynamic content (<code>loading="lazy"</code> images, "infinite scroll", etc.)?</summary>

<br />

Jump calculates the start position, end position, and [`root`](#root)'s scroll range when called. It **does not** recalculate them as it scrolls. Dynamic content that changes the [`target`](#target)'s position, or the [`root`](#root)'s scroll range, may result in the scroll stopping at the wrong position.

For lazy-loaded images, reserve the necessary layout space with `width` / `height` attributes, or CSS `aspect-ratio`. Framework-specific image components, such as Next.js's [`Image`](https://nextjs.org/docs/app/api-reference/components/image#width-and-height), should handle this for you.

Other forms of dynamic content will likely require implementation-specific handling.

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

If you're already using `lenis`, use its [`scrollTo`](https://github.com/darkroomengineering/lenis#methods) method.

</details>

<details>

<summary>Is Jump compatible with GSAP's <a href="https://gsap.com/docs/v3/Plugins/ScrollSmoother/"><code>ScrollSmoother</code></a> plugin?</summary>

<br />

No, but you probably don't need both.

If you're already using `ScrollSmoother`, use its [`scrollTo`](<https://gsap.com/docs/v3/Plugins/ScrollSmoother/scrollTo()/>) method.

</details>

## Migrating

From `v1.x` to `v2.x`:

1. Ensure your build process is compatible with ESM-only packages. The following are no longer supported:
   - AMD
   - CommonJS
   - Browser global variable (`window.Jump`)
   - Imports from `jump.js/dist`
2. Import types directly from `jump.js` and remove `@types/jump.js` from your dependencies.
3. Update code that expects Jump to return `void`, as it now returns a [`cancel`](#cancel) function.
4. Check for runtime errors, as Jump now validates arguments (see [Error Handling](#error-handling)).
5. Update custom [`easing`](#easing) functions. They should now accept linear progress (`0` to `1`) and return eased progress.
6. Update [`duration`](#duration) functions. The `distance` they receive is now clamped and logically signed.
7. Update timing-related code:
   - Jumps with a `duration` of `0` or an absolute scroll distance less than `1px` now scroll instantly.
   - The [`callback`](#callback) now runs in the frame after the final scroll and [`a11y`](#a11y)-triggered focus.
8. Review code impacted by bug fixes:
   - Numeric [`target`](#target) values now ignore [`offset`](#offset).
   - [`a11y`](#a11y) now preserves existing `tabindex` attributes.
   - Jump now overrides CSS `scroll-behavior` and preserves the position of the non-scrolling axis.
9. Review the updated [Browser Support](#browser-support).

## Browser Support

Jump natively supports the following browsers:

| Browser      | Version | Limiting Feature                                                                                                                                                                         |
| :----------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chrome       | 86+     | [`scrollLeft`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft) / [`scrollX`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX) (negative RTL values) |
| Edge         | 86+     | [`scrollLeft`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft) / [`scrollX`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX) (negative RTL values) |
| Firefox      | 68+     | [`preventScroll` (focus option)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll)                                                                       |
| Opera        | 72+     | [`scrollLeft`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft) / [`scrollX`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX) (negative RTL values) |
| Safari       | 15+     | [`preventScroll` (focus option)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll)                                                                       |
| Safari (iOS) | 15.5+   | [`preventScroll` (focus option)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll)                                                                       |

Press "F" to pay respects to Internet Explorer.

## License

[MIT](https://opensource.org/licenses/MIT). © 2026 Michael "Cavs" Cavalea
