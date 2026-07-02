import * as React from "react"

import type { Theme } from "./theme-utils"
import { isEditableTarget } from "./theme-utils"

type UseThemeKeyboardShortcutParams = {
  theme: Theme
  onToggleTheme: (theme: Theme) => void
}

export function useThemeKeyboardShortcut({
  theme,
  onToggleTheme,
}: UseThemeKeyboardShortcutParams) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      onToggleTheme(theme)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [theme, onToggleTheme])
}
