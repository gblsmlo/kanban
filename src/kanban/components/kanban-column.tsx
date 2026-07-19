import type { UniqueIdentifier } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ReactNode } from 'react'
import { useId, useMemo } from 'react'
import { ScrollArea } from '../../components/scroll-area'
import { Text } from '../../components/text'
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
  getCardDragId?: (card: TCard) => UniqueIdentifier
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
        <Text
          leading="none"
          render={<h2 id={titleId}>{column.title}</h2>}
          size="sm"
          truncate
          weight="semibold"
        />
        <KanbanBadge tone="neutral">{column.count}</KanbanBadge>
      </div>
    </header>
  )
}

interface KanbanColumnCardsProps<TCard> {
  cardDragIds: UniqueIdentifier[]
  column: KanbanColumnData<TCard>
  emptyLabel: string
  getCardDragId?: (card: TCard) => UniqueIdentifier
  getCardLabel: (card: TCard) => string
  getKey: (card: TCard) => string | number
  renderCard: (card: TCard) => ReactNode
  sortableCards: boolean
}

function KanbanColumnCards<TCard>({
  cardDragIds,
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

  return (
    <SortableContext items={cardDragIds} strategy={verticalListSortingStrategy}>
      {column.cards.map((card) => (
        <SortableKanbanCard
          columnId={column.id}
          dragLabel={`Mover card ${getCardLabel(card)}`}
          id={getCardDragId(card)}
          key={getKey(card)}
        >
          {renderCard(card)}
        </SortableKanbanCard>
      ))}
    </SortableContext>
  )
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
  const { setNodeRef } = useDroppable({
    id: createColumnDropId(column.id, instanceId),
    data: { columnId: column.id, type: 'column' },
    disabled: !sortableCards,
  })
  const cardDragIds = useMemo(
    () => (sortableCards && getCardDragId ? column.cards.map(getCardDragId) : []),
    [column.cards, getCardDragId, sortableCards],
  )

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
        <div ref={setNodeRef} className="grid h-full min-h-full content-start gap-2 px-2 pb-2">
          <KanbanColumnCards
            cardDragIds={cardDragIds}
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
