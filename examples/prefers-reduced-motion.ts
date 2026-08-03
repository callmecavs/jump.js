import jump from "jump.js"

// detect user's motion preference
const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

// set `duration` option based on preference
const duration = isReducedMotion ? 0 : 1000

jump(".target", { duration })
