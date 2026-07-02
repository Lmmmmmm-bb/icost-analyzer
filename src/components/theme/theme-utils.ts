export type Theme = "dark" | "light" | "system"
export type ResolvedTheme = "dark" | "light"

export type RootViewTransition = {
  ready: Promise<void>
}

export type ViewTransitionDocument = Document & {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>
  ) => RootViewTransition
}

export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
export const SKIP_THEME_VIEW_TRANSITION_SELECTOR =
  "[data-skip-theme-view-transition='true']"

const THEME_VALUES: Theme[] = ["dark", "light", "system"]

export function isTheme(value: string | null): value is Theme {
  if (value === null) {
    return false
  }

  return THEME_VALUES.includes(value as Theme)
}

export function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark"
  }

  return "light"
}

export function getResolvedTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

export function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

export function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export function shouldSkipThemeViewTransition() {
  return Boolean(document.querySelector(SKIP_THEME_VIEW_TRANSITION_SELECTOR))
}

export function getToggledTheme(currentTheme: Theme): ResolvedTheme {
  if (currentTheme === "dark") {
    return "light"
  }

  if (currentTheme === "light") {
    return "dark"
  }

  return getSystemTheme() === "dark" ? "light" : "dark"
}

export function getViewTransitionRadius(x: number, y: number) {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
  if (editableParent) {
    return true
  }

  return false
}
