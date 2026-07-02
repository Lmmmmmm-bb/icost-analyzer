import { useCallback, useEffect, useRef, useState } from "react"
import type { DragEvent } from "react"

function hasDraggedFiles(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes("Files")
}

type UseFileDropOptions = {
  disabled?: boolean
}

export function useFileDrop(
  onFile: (file: File) => void,
  { disabled = false }: UseFileDropOptions = {}
) {
  const dragDepth = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  const resetDragging = useCallback(() => {
    dragDepth.current = 0
    setIsDragging(false)
  }, [])

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (disabled) return
      if (!hasDraggedFiles(event)) return
      event.preventDefault()
      dragDepth.current += 1
      if (dragDepth.current === 1) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (disabled) return
      if (!hasDraggedFiles(event)) return
      event.preventDefault()
    },
    [disabled]
  )

  const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      if (disabled) {
        resetDragging()
        return
      }
      const file = event.dataTransfer.files?.[0]
      resetDragging()
      if (file) onFile(file)
    },
    [disabled, onFile, resetDragging]
  )

  useEffect(() => {
    const handleGlobalDragEnd = () => resetDragging()

    window.addEventListener("drop", handleGlobalDragEnd)
    window.addEventListener("dragend", handleGlobalDragEnd)
    window.addEventListener("blur", handleGlobalDragEnd)

    return () => {
      window.removeEventListener("drop", handleGlobalDragEnd)
      window.removeEventListener("dragend", handleGlobalDragEnd)
      window.removeEventListener("blur", handleGlobalDragEnd)
    }
  }, [resetDragging])

  return {
    isDragging: disabled ? false : isDragging,
    dropProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onDragEnd: resetDragging,
    },
  }
}
