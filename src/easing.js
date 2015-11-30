// Robert Penner's easeInOutQuad - http://robertpenner.com/easing/

export default (t, b, c, d) => {
  t /= d / 2
  if(t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}
