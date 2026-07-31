export const hasFocusMethod = (value: unknown): value is Element & HTMLOrSVGElement => {
  return isElement(value) && "focus" in value && typeof value.focus === "function"
}

export const isElement = (value: unknown): value is Element => {
  return typeof value === "object" && value !== null && (value as Element).nodeType === 1
}

export const isWindow = (value: unknown): value is Window => {
  return typeof value === "object" && value !== null && (value as Window).window === value
}
