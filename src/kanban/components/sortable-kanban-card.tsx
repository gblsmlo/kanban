import type { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties, ReactNode } from 'react'

interface SortableKanbanCardProps {
  children: ReactNode
  columnId: string
  dragLabel: string
  id: UniqueIdentifier
}

export function SortableKanbanCard({ children, columnId, dragLabel, id }: SortableKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    animateLayoutChanges: () => false,
    attributes: {
      role: 'region',
      roleDescription: 'card arrastável',
      tabIndex: 0,
    },
    data: { cardId: String(id), columnId, type: 'card' },
    id,
    transition: null,
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
  }
  const { 'aria-pressed': _ariaPressed, role: _role, ...dragAttributes } = attributes

  return (
    <section
      aria-label={dragLabel}
      className="relative touch-none cursor-grab rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      ref={setNodeRef}
      style={style}
      {...dragAttributes}
      {...listeners}
    >
      {children}
    </section>
  )
}
