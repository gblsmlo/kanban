import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useRef, useState } from 'react'

const DRAG_THRESHOLD = 8
const CLICK_SUPPRESSION_WINDOW_MS = 500
const EXCLUDED_TARGETS = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="slider"]',
  '[data-kanban-card-draggable]',
  '[data-slot="scroll-area-scrollbar"]',
].join(',')

interface DragOrigin {
  pointerId: number
  scrollLeft: number
  x: number
  y: number
  dragging: boolean
}

interface ReleasedDrag {
  at: number
  x: number
  y: number
}

function isExcludedTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(EXCLUDED_TARGETS) !== null
}

export function useHorizontalDragScroll() {
  const dragOriginRef = useRef<DragOrigin | null>(null)
  const releasedDragRef = useRef<ReleasedDrag | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const resetDrag = useCallback(() => {
    dragOriginRef.current = null
    setIsDragging(false)
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary || isExcludedTarget(event.target)) return

    releasedDragRef.current = null
    dragOriginRef.current = {
      dragging: false,
      pointerId: event.pointerId,
      scrollLeft: event.currentTarget.scrollLeft,
      x: event.clientX,
      y: event.clientY,
    }
  }, [])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOriginRef.current
    if (!origin || origin.pointerId !== event.pointerId) return

    const deltaX = event.clientX - origin.x
    const deltaY = event.clientY - origin.y

    if (!origin.dragging) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD && Math.abs(deltaY) < DRAG_THRESHOLD) return
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        dragOriginRef.current = null
        return
      }

      origin.dragging = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      setIsDragging(true)
    }

    event.preventDefault()
    const maximumScrollLeft = Math.max(
      0,
      event.currentTarget.scrollWidth - event.currentTarget.clientWidth,
    )
    event.currentTarget.scrollLeft = Math.min(
      maximumScrollLeft,
      Math.max(0, origin.scrollLeft - deltaX),
    )
  }, [])

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const origin = dragOriginRef.current
      if (!origin || origin.pointerId !== event.pointerId) return

      if (origin.dragging) {
        releasedDragRef.current = {
          at: Date.now(),
          x: event.clientX,
          y: event.clientY,
        }
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }

      resetDrag()
    },
    [resetDrag],
  )

  const handleClickCapture = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const releasedDrag = releasedDragRef.current
    if (!releasedDrag) return

    releasedDragRef.current = null
    const isReleasedDragClick =
      Date.now() - releasedDrag.at <= CLICK_SUPPRESSION_WINDOW_MS &&
      Math.abs(event.clientX - releasedDrag.x) <= 1 &&
      Math.abs(event.clientY - releasedDrag.y) <= 1

    if (isReleasedDragClick) {
      event.preventDefault()
      event.stopPropagation()
    }
  }, [])

  return {
    isDragging,
    viewportProps: {
      'data-drag-scrolling': isDragging ? '' : undefined,
      onClickCapture: handleClickCapture,
      onLostPointerCapture: resetDrag,
      onPointerCancel: handlePointerEnd,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
    },
  }
}
