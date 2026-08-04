import jump from "jump.js"

// NOTE: The `prefers-reduced-motion` media query doesn't match the "Browser Support" shown on the README.
// detect motion preference
const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

// set `duration` based on preference
const duration = isReducedMotion ? 0 : 1000

jump(".target", { duration })
