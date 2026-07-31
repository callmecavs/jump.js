export const isElement = (value: unknown): value is Element => {
  return typeof value === "object" && value !== null && (value as Element).nodeType === 1
}

export const isFocusable = (value: unknown): value is HTMLElement | SVGElement => {
  return isElement(value) && typeof (value as HTMLElement | SVGElement).focus === "function"
}

export const isWindow = (value: unknown): value is Window => {
  return typeof value === "object" && value !== null && (value as Window).window === value
}
