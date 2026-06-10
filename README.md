# Jump.js

[![Jump.js on NPM](https://img.shields.io/npm/v/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js) [![Jump.js Monthly Downloads on NPM](https://img.shields.io/npm/dm/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js)

Modern smooth scrolling for humans and agents.

Follow these steps to get started:

1. [Install](#install)
2. [Call](#call)
3. [Review Options](#options)

## Install

1. Using a package manager (recommended):

```bash
$ npm install jump.js
```

2. Using a modern script tag (`type="module"`):

```html
<script src="" type="module">
```

3. Using a legacy script tag (`UMD`):

```html
<script src="">
```

Note that the `UMD` export exposes the library via `window.Jump`.

## Call

`Jump` is just a function. The only required parameter is the [target](#target):

```js
jump(".target")
```

It returns a function that can be used to cancel it:

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

`Jump` accepts an optional 2nd parameter - a configuration object - to customize it.

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

If enabled, and the `target` is an element, the `target` will be [`focus`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)ed when the jump completes.

```js
jump(".target", {
  a11y: true,
})
```

Remember that `focus` comes with visual implications. When enabling, make sure to check CSS `:focus` and `:focus-*` styles.

### axis

Change the `jump` direction.

```js
// horizontal
jump(".target", {
  axis: "x",
})

// vertical
jump(".target", {
  axis: "y",
})
```

### callback

A function called after the `jump` has completed.

```js
jump(".target", {
  callback: () => console.log("Jump complete."),
})
```

Prefer `async` / `await`? Use the `callback` to make a `Promise` wrapper:

```js
const promisedJump = (options: JumpOptions): Promise<void> =>
  new Promise((resolve) =>
    jump(".target", {
      ...options,
      callback: () => {
        options.callback?.()
        resolve()
      },
    }),
  )

await promisedJump('.target')
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

- Is passed the `jump` distance, as a `number` of pixels, and
- Returns the `jump` duration (`ms`)

```js
jump(".target", {
  duration: distance => Math.abs(distance),
})
```

### easing

The easing function used for the `jump` animation.

```js
jump(".target", {
  easing: easeInOutQuad,
})
```

### offset

Valid only when `jump`ing to an element. Adjust the `jump` by a number of pixels.

```js
// stop 100px before the leading edge of the target
jump(".target", {
  offset: -100,
})

// stop 50px after the leading edge of the target
jump(".target", {
  offset: 50,
})
```

Useful for accommodating `sticky` / `fixed` elements, among other things.

### root

The element, or `window`, to scroll.

```js

```

## Browser Support

The newest ECMAScript feature used is [Error `cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause).

As such, it supports the following natively:

- Chrome 93+
- Edge 93+
- Firefox 91+
- Opera 79+
- Safari 15+

## License

[MIT](https://opensource.org/licenses/MIT). © 2026 Michael Cavalea
