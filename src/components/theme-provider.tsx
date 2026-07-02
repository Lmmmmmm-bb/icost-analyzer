/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { useThemeKeyboardShortcut } from "./theme/use-theme-keyboard-shortcut"
import {
  COLOR_SCHEME_QUERY,
  type ResolvedTheme,
  type Theme,
  type ViewTransitionDocument,
  disableTransitionsTemporarily,
  getResolvedTheme,
  getSystemTheme,
  getToggledTheme,
  getViewTransitionRadius,
  isTheme,
  prefersReducedMotion,
  shouldSkipThemeViewTransition,
} from "./theme/theme-utils"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey)
    if (isTheme(storedTheme)) {
      return storedTheme
    }

    return defaultTheme
  })
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(
    () => {
      const storedTheme = localStorage.getItem(storageKey)
      return getResolvedTheme(isTheme(storedTheme) ? storedTheme : defaultTheme)
    }
  )
  const isThemeTransitioningRef = React.useRef(false)

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
      setResolvedTheme(getResolvedTheme(nextTheme))
    },
    [storageKey]
  )

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      const root = document.documentElement
      const resolvedTheme =
        nextTheme === "system" ? getSystemTheme() : nextTheme
      const restoreTransitions = disableTransitionOnChange
        ? disableTransitionsTemporarily()
        : null

      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)

      if (restoreTransitions) {
        restoreTransitions()
      }
    },
    [disableTransitionOnChange]
  )

  const commitTheme = React.useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
      setResolvedTheme(getResolvedTheme(nextTheme))
    },
    [storageKey]
  )

  const toggleThemeWithViewTransition = React.useCallback(
    (currentTheme: Theme) => {
      const nextTheme = getToggledTheme(currentTheme)
      const transitionDocument = document as ViewTransitionDocument

      if (isThemeTransitioningRef.current) {
        return
      }

      if (
        !transitionDocument.startViewTransition ||
        prefersReducedMotion() ||
        shouldSkipThemeViewTransition()
      ) {
        commitTheme(nextTheme)
        return
      }

      const x = 0
      const y = 0
      const endRadius = getViewTransitionRadius(x, y)
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      isThemeTransitioningRef.current = true

      const transition = transitionDocument.startViewTransition(() => {
        applyTheme(nextTheme)
        commitTheme(nextTheme)
      })

      transition.ready
        .then(() => {
          const animation = document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration: 650,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          )

          return animation.finished
        })
        .finally(() => {
          isThemeTransitioningRef.current = false
        })
    },
    [applyTheme, commitTheme]
  )

  React.useEffect(() => {
    applyTheme(theme)

    if (theme !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      setResolvedTheme(getSystemTheme())
      applyTheme("system")
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, applyTheme])

  useThemeKeyboardShortcut({
    theme,
    onToggleTheme: toggleThemeWithViewTransition,
  })

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }

      if (event.key !== storageKey) {
        return
      }

      if (isTheme(event.newValue)) {
        setThemeState(event.newValue)
        setResolvedTheme(getResolvedTheme(event.newValue))
        return
      }

      setThemeState(defaultTheme)
      setResolvedTheme(getResolvedTheme(defaultTheme))
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultTheme, storageKey])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
