import type { JumpCancel, JumpOptions, JumpTarget } from "jump.js"
import scroll from "jump.js" // NOTE: import renamed, reserving `jump` for the export

const SCROLL_KEYS = [
  " ",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  "Tab", // focus change can cause indirect scrolling
]

const jump = (target: JumpTarget, options: JumpOptions = {}): JumpCancel => {
  let cancel: JumpCancel

  const handleCancel = () => {
    cleanup()
    cancel()
  }

  // keyboard input
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    if (SCROLL_KEYS.includes(key)) handleCancel()
  }

  // touch or pen input
  const handlePointerDown = ({ pointerType }: PointerEvent) => {
    if (pointerType !== "mouse") handleCancel()
  }

  // mouse wheel or trackpad input
  const handleWheel = () => handleCancel()

  const setup = () => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("wheel", handleWheel, { passive: true })
  }

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("pointerdown", handlePointerDown)
    window.removeEventListener("wheel", handleWheel)
  }

  const mergedCallback = () => {
    cleanup()
    options.callback?.()
  }

  try {
    cancel = scroll(target, { ...options, callback: mergedCallback })

    setup()

    return handleCancel
  } catch (error) {
    cleanup()
    throw error
  }
}

export { jump }
