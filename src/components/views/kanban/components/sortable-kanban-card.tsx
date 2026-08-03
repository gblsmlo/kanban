import { pointerIntersection } from '@dnd-kit/collision'
import { KeyboardSensor, PointerSensor } from '@dnd-kit/dom'
import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { useSortable } from '@dnd-kit/react/sortable'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { useCallback, useLayoutEffect, useRef } from 'react'
import { cn } from '../../../../lib/utils'

const ACTIONABLE_DESCENDANT_SELECTOR = [
  'a[href]:not([data-kanban-card-action])',
  'button:not([disabled]):not([data-kanban-card-action])',
  '[role="button"]:not([aria-disabled="true"]):not([data-kanban-card-action])',
  '[role="link"]:not([aria-disabled="true"]):not([data-kanban-card-action])',
].join(',')

const KANBAN_CARD_SENSORS = [
  PointerSensor,
  KeyboardSensor.configure({
    keyboardCodes: {
      cancel: ['Escape'],
      down: ['ArrowDown'],
      end: ['Space', 'Tab'],
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
      start: ['Space'],
      up: ['ArrowUp'],
    },
  }),
]

interface SortableKanbanCardProps {
  children: ReactNode
  columnId: string
  dragLabel: string
  id: string
  index: number
}

export function SortableKanbanCard({
  children,
  columnId,
  dragLabel,
  id,
  index,
}: SortableKanbanCardProps) {
  const { handleRef, isDragSource, ref } = useSortable({
    accept: 'kanban-card',
    collisionDetector: pointerIntersection,
    data: { cardId: id, columnId, type: 'card' },
    group: columnId,
    id,
    index,
    // React owns the column/card tree. The default optimistic plugin moves the
    // active DOM node between column parents, which races React's reconciliation
    // when the consumer persists the move on drag end.
    plugins: (defaults) => defaults.filter((plugin) => plugin !== OptimisticSortingPlugin),
    sensors: KANBAN_CARD_SENSORS,
    transition: null,
    type: 'kanban-card',
  })
  const wrapperRef = useRef<HTMLElement | null>(null)
  const setWrapperRef = useCallback(
    (node: HTMLElement | null) => {
      wrapperRef.current = node
      ref(node)
    },
    [ref],
  )

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const contentActivator = wrapper?.querySelector<HTMLElement>(ACTIONABLE_DESCENDANT_SELECTOR)

    handleRef(contentActivator ?? wrapper)
    return () => handleRef(null)
  })

  const handlePointerDownCapture = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target
    if (target instanceof Element && target.closest('[data-kanban-card-action]')) {
      event.stopPropagation()
    }
  }

  return (
    <section
      aria-label={dragLabel}
      className={cn(
        'relative min-w-0 max-w-full touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'cursor-grab active:cursor-grabbing',
        isDragSource && 'opacity-0',
      )}
      data-kanban-card-container=""
      data-kanban-card-drag-id={id}
      data-kanban-card-draggable=""
      onPointerDownCapture={handlePointerDownCapture}
      ref={setWrapperRef}
    >
      {children}
    </section>
  )
}
