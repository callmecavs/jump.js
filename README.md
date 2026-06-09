# Jump.js

[![Jump.js on NPM](https://img.shields.io/npm/v/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js) [![Jump.js Monthly Downloads on NPM](https://img.shields.io/npm/dm/jump.js.svg?style=flat-square)](https://www.npmjs.com/package/jump.js)

Modern smooth scrolling for humans and agents.

## Usage

Follow these steps:

1. [Install](#install)
2. [Call](#call)
3. [Review Options](#options)

### Install

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

### Call

Jump is a function. Pass the [target](#target) as the 1st parameter.

```js
jump(".target")
```

### Options

Use the 2nd parameter, an optional configuration object, to customize the jump.

All the options have a sensible default, shown below:

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

- [target](#target)
- [a11y](#a11y)
- [axis](#axis)
- [callback](#callback)
- [duration](#duration)
- [easing](#easing)
- [offset](#offset)
- [root](#root)

### target

1. Scroll to an element by:

- Passing in an element, or
- Passing in a CSS selector string (matching element determined by `document.querySelector` internally)

```js
// 1. Passing in an element
const node = document.querySelector(".target")
jump(node)

// 2. Passing in a CSS selector string
jump(".target")
```

2. Scroll a fixed number of pixels by passing in a number:

```js
// 1. Scroll down `100px`
jump(100)

// 2. Scroll up `100px`
jump(-100)
```

### a11y

If enabled, and the `target` is an element, the `target` will be [`focus`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)ed when the jump completes.

```js
jump(".target", {
  a11y: true,
})
```

This option is disabled by default because `focus` comes with CSS implications. If enabling, make sure to check CSS `:focus` and `:focus-*` declarations.

### axis

Used to control the direction of the scroll.

```js
// scroll vertically (default)
jump(".target")

// scroll horizontally
jump(".target", { axis: "x" })
```

### callback

A function called after the `jump` has been completed.

```js
jump(".target", {
  callback: () => console.log("Jump completed!"),
})
```

Prefer to work with `async` / `await`? Use the `callback` to create a `Promise` wrapper:

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

### offset

Valid only when `jump`ing to an element. Adjust the `jump` by a number of pixels.

```js
// stop 100px before the leading edge of the target

jump(".target", {
  offset: -100,
})

// stop 100px after the leading edge of the target

jump(".target", {
  offset: 100,
})
```

This option is useful for accommodating `position: fixed` elements.

### easing

Easing function used for the `jump` animation.

```js
jump(".target", {
  easing: easeInOutQuad,
})
```

See [easing.js](https://github.com/callmecavs/jump.js/blob/master/src/easing.js) for the definition of `easeInOutQuad`, the default easing function. Credit for this function goes to Robert Penner.

## Browser Support

Jump depends on the following browser APIs:

- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

Consequently, it supports the following natively:

- Chrome 24+
- Firefox 23+
- Safari 6.1+
- Opera 15+
- IE 10+
- iOS Safari 7.1+
- Android Browser 4.4+

To add support for older browsers, consider including polyfills/shims for the APIs listed above. There are no plans to include any in the library, in the interest of file size.

## License

[MIT](https://opensource.org/licenses/MIT). © 2026 Michael Cavalea
