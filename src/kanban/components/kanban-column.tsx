import { CollisionPriority } from '@dnd-kit/abstract'
import { useDroppable } from '@dnd-kit/react'
import type { ReactNode } from 'react'
import { useId } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '../../lib/utils'

import { createColumnDropId } from '../lib/drag-and-drop'
import type { KanbanColumnData } from '../types'
import { KanbanBadge } from './kanban-badge'
import { SortableKanbanCard } from './sortable-kanban-card'

export interface KanbanColumnProps<TCard = unknown> {
  column: KanbanColumnData<TCard>
  renderCard: (card: TCard) => ReactNode
  getKey: (card: TCard) => string | number
  emptyLabel?: string
  className?: string
  getCardDragId?: (card: TCard) => string
  getCardLabel?: (card: TCard) => string
  sortableCards?: boolean
}

function KanbanEmptyState({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      className={cn(
        'rounded-md border border-dashed px-3 py-6 text-center text-muted-foreground text-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

function KanbanColumnHeader<TCard>({
  column,
  titleId,
}: Readonly<{ column: KanbanColumnData<TCard>; titleId: string }>) {
  return (
    <header className="mb-3 flex shrink-0 items-center justify-between gap-3 px-3 pt-3">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate font-semibold text-sm leading-none" id={titleId}>
          {column.title}
        </h2>
        <KanbanBadge tone="neutral">{column.count}</KanbanBadge>
      </div>
    </header>
  )
}

interface KanbanColumnCardsProps<TCard> {
  column: KanbanColumnData<TCard>
  emptyLabel: string
  getCardDragId?: (card: TCard) => string
  getCardLabel: (card: TCard) => string
  getKey: (card: TCard) => string | number
  renderCard: (card: TCard) => ReactNode
  sortableCards: boolean
}

function KanbanColumnCards<TCard>({
  column,
  emptyLabel,
  getCardDragId,
  getCardLabel,
  getKey,
  renderCard,
  sortableCards,
}: KanbanColumnCardsProps<TCard>) {
  if (!column.cards.length) {
    return <KanbanEmptyState className="bg-card/60 py-10">{emptyLabel}</KanbanEmptyState>
  }

  if (!sortableCards || !getCardDragId) {
    return column.cards.map((card) => <div key={getKey(card)}>{renderCard(card)}</div>)
  }

  return column.cards.map((card, index) => (
    <SortableKanbanCard
      columnId={column.id}
      dragLabel={`Mover card ${getCardLabel(card)}`}
      id={getCardDragId(card)}
      index={index}
      key={getKey(card)}
    >
      {renderCard(card)}
    </SortableKanbanCard>
  ))
}

export function KanbanColumn<TCard>({
  column,
  renderCard,
  getKey,
  emptyLabel = 'Nenhum item nesta coluna.',
  className,
  getCardDragId,
  getCardLabel = (card) => String(getKey(card)),
  sortableCards = false,
}: KanbanColumnProps<TCard>) {
  const instanceId = useId()
  const titleId = `kanban-column-title-${instanceId}`
  const { ref } = useDroppable({
    accept: 'kanban-card',
    collisionPriority: CollisionPriority.Lowest,
    id: createColumnDropId(column.id, instanceId),
    data: { columnId: column.id, type: 'column' },
    disabled: !sortableCards,
    type: 'kanban-column',
  })

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex h-full min-h-0 flex-col rounded-lg bg-card/30 shadow-black/5 shadow-inner',
        className,
      )}
    >
      <KanbanColumnHeader column={column} titleId={titleId} />

      <ScrollArea className="min-h-0 flex-1" fill scrollbarGutter scrollFade>
        <div ref={ref} className="grid h-full min-h-full content-start gap-2 px-2 pb-2">
          <KanbanColumnCards
            column={column}
            emptyLabel={emptyLabel}
            getCardDragId={getCardDragId}
            getCardLabel={getCardLabel}
            getKey={getKey}
            renderCard={renderCard}
            sortableCards={sortableCards}
          />
        </div>
      </ScrollArea>
    </section>
  )
}
