import type { JumpCancel, JumpOptions, JumpTarget } from "jump.js"
import scroll from "jump.js" // NOTE: import renamed, reserving `jump` for the export

type JumpResult = JumpCancel | undefined

let idle = true

const jump = (target: JumpTarget, options: JumpOptions = {}): JumpResult => {
  if (!idle) return

  idle = false

  let stale = false

  const reset = () => {
    if (stale) return

    idle = true
    stale = true
  }

  const mergedCallback = () => {
    reset()
    options.callback?.()
  }

  try {
    const cancel = scroll(target, { ...options, callback: mergedCallback })

    const mergedCancel = () => {
      if (stale) return

      cancel()
      reset()
    }

    return mergedCancel
  } catch (error) {
    reset()
    throw error
  }
}

export { jump }
