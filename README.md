# jumper

A small, modern, dependency-free smooth scrolling library.

## Usage

Create an instance:

```javascript
var jumper = new Jumper();
```

Use the `jump` method:

```javascript
jumper.jump(target, duration, offset);
```

### target

Relative to the document:

```javascript
// scroll the page to 500px from the top
jumper.jump(500, duration, offset);
```

Relative to an element:

```javascript
// scroll the page to the top of .element
jumper.jump(document.querySelector('.element'), duration, offset);
```

## Roadmap

- [ ] Add `container` option
- [ ] Add `callback` option
- [ ] Add option to scroll at `px/s` instead of a fixed duration
- [ ] Add `duration` and `offset` instance defaults
- [ ] Change easing to easeInOutQuad? Easing option?
- [ ] Improve code commenting
