# Jumper.js

A small, modern, dependency-free smooth scrolling library.

## Usage

1. [Create an Instance](#create-an-instance)
2. [`jump` Method](#jump-method)
3. [Options](#options)

### Create an Instance

Create an instance, setting your `jump` defaults. Don't forget to read about the [options]()!

```javascript
// default options shown below

var jumper = new Jumper({
  duration: 1000,                     // ms
  offset: 0,                          // px
  callback: null,                     // function
  easing: function(t, b, c, d) {      // Robert Penner's easeInQuad
    return c * (t /= d) * t + b;
  }
});
```

### `jump` Method

To scroll the page, use the `jump` method in the following ways:

* [Jump to an Element](#jump-to-an-element)
* [Jump from Current Position](#jump-from-current-position)
* [Override Defaults](#override-defaults)

#### Jump to an Element

Pass an element node.

```javascript
jumper.jump(document.querySelector('.demo-element'));
```

#### Jump from Current Position

Pass a number of pixels, positive or negative.

```javascript
jumper.jump(window.innerHeight);      // down one screen height
jumper.jump(-100);                    // up 100px
```

#### Override Defaults

Pass an `overrides` object after your `jump` target.

```
jumper.jump(target, {
  // options can be overridden here
});
```

### Options

All options can be set when creating an instance, and overridden when calling `jump`.

* [duration](#duration)
* [offset](#offset)
* [callback](#callback)
* [easing](#easing)

#### duration

How long the `jump` takes, in milliseconds.

```
var jumper = new Jumper({
  duration: 1000
});
```

#### offset

Offset a `jump`, _only if to an element_, in pixels.

Useful for accomodating components fixed to the top/bottom of the screen.

```
var jumper = new Jumper({
  offset: 100
});
```

#### callback

Fired after the `jump` has been completed.

```
// `this` refers to your Jumper instance inside the function

var jumper = new Jumper({
  callback: function() {
    console.log('Jump completed!');
  }
});
```

#### easing

Customize the easing of the `jump`.

The easing function must accept 4 parameters, in this order:

1. (t) Current time
2. (b) Beginning scroll position
3. (c) Change in scroll position
4. (d) Duration

```javascript
var jumper = new Jumper({
  easing: function(t, b, c, d) {
    return c * (t /= d) * t + b;
  }
});
```

This library was made with [Robert Penner's easing functions](https://github.com/danro/jquery-easing/blob/master/jquery.easing.js) in mind.

## Browser Support

Jumper natively supports **IE10+**.

For legacy support, consider including [Paul Irish's polyfill](https://gist.github.com/paulirish/1579671) for [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

## Roadmap

- [ ] Add option to scroll at `px/s` instead of a fixed duration
- [ ] Add header to `dist` files

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
