import type { JumpCancel, JumpOptions, JumpTarget } from "jump.js"
import scroll from "jump.js" // NOTE: import renamed, reserving `jump` for the export

type JumpResult = {
  promise: Promise<void>
  cancel: JumpCancel
}

// NOTE: `Promise.withResolvers` makes this cleaner, but exceeds the "Browser Support" noted on the README.
const jump = (target: JumpTarget, options: JumpOptions = {}): JumpResult => {
  let resolve: (value: void | PromiseLike<void>) => void
  let reject: (reason?: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any

  const promise = new Promise<void>((succeed, fail) => {
    resolve = succeed
    reject = fail
  })

  let stale = false

  const mergedCallback = () => {
    if (stale) return

    stale = true
    resolve()
    options.callback?.()
  }

  const cancel = scroll(target, { ...options, callback: mergedCallback })

  const mergedCancel = () => {
    if (stale) return

    stale = true
    cancel()
    reject()
  }

  return {
    promise,
    cancel: mergedCancel,
  }
}

export { jump }
