import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import type { ReactNode } from 'react'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '../../lib/utils'

import { useActiveColumnId } from '../hooks/use-active-column-id'
import { useHorizontalDragScroll } from '../hooks/use-horizontal-drag-scroll'
import { useKanbanDragAndDrop } from '../hooks/use-kanban-drag-and-drop'
import type {
  KanbanCardMove,
  KanbanColumnActions,
  KanbanColumnData,
  KanbanStageOption,
} from '../types'
import { KanbanColumn } from './kanban-column'
import { KanbanStageSelector } from './kanban-stage-selector'

export interface KanbanViewProps<TCard = unknown> {
  columns: KanbanColumnData<TCard>[]
  renderCard: (card: TCard) => ReactNode
  getKey: (card: TCard) => string | number
  getCardLabel?: (card: TCard) => string
  getColumnActions?: (column: KanbanColumnData<TCard>) => KanbanColumnActions | undefined
  emptyColumnLabel?: string
  mobileStageHint?: string
  onMoveCard?: (move: KanbanCardMove<TCard>) => boolean | Promise<boolean>
}

export function KanbanView<TCard>({
  columns,
  renderCard,
  getKey,
  getCardLabel,
  getColumnActions,
  emptyColumnLabel,
  mobileStageHint,
  onMoveCard,
}: KanbanViewProps<TCard>) {
  const [activeColumnId, setActiveColumnId] = useActiveColumnId(columns)
  const {
    cardDragEnabled,
    focusCardDragId,
    getCardDragId,
    handleCardFocusRestored,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    reconciliationKey,
    visibleColumns,
  } = useKanbanDragAndDrop({ columns, getKey, onMoveCard })
  const { isDragging: isBoardDragging, rootRef } = useHorizontalDragScroll()
  const boardContentRef = useRef<HTMLDivElement | null>(null)
  const stageOptions = useMemo(() => createStageOptions(columns), [columns])
  const cardsByDragId = useMemo(
    () =>
      new Map(
        visibleColumns.flatMap((column) =>
          column.cards.map((card) => [getCardDragId(card), card] as const),
        ),
      ),
    [getCardDragId, visibleColumns],
  )
  const activeColumn = useMemo(
    () => visibleColumns.find((column) => column.id === activeColumnId) ?? visibleColumns[0],
    [activeColumnId, visibleColumns],
  )
  const columnProps = {
    emptyLabel: emptyColumnLabel,
    getCardLabel,
    getCardDragId,
    getKey,
    renderCard,
    sortableCards: cardDragEnabled,
  }
  const showHorizontalScrollbar = cardDragEnabled && isBoardDragging

  useLayoutEffect(() => {
    if (!focusCardDragId) return

    const frame = requestAnimationFrame(() => {
      const card = Array.from(
        boardContentRef.current?.querySelectorAll<HTMLElement>('[data-kanban-card-drag-id]') ?? [],
      ).find((element) => element.dataset.kanbanCardDragId === focusCardDragId)

      if (!card) return
      card.focus({ preventScroll: true })
      card.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' })
      handleCardFocusRestored()
    })

    return () => cancelAnimationFrame(frame)
  }, [focusCardDragId, handleCardFocusRestored])

  return (
    <div className="h-full min-h-0">
      <DragDropProvider
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <div className="flex h-full min-h-0 flex-col gap-2">
          <KanbanStageSelector
            hint={mobileStageHint}
            onValueChange={setActiveColumnId}
            stages={stageOptions}
            value={activeColumnId}
          />

          <div className="grid min-h-0 flex-1 gap-2 md:hidden">
            {activeColumn ? (
              <KanbanColumn
                actions={getColumnActions?.(activeColumn)}
                column={activeColumn}
                {...columnProps}
                sortableCards={false}
              />
            ) : null}
          </div>

          <ScrollArea
            className={cn(
              'hidden min-h-0 flex-1 md:block',
              '[&_[data-orientation=horizontal][data-slot=scroll-area-scrollbar]]:!delay-0',
              showHorizontalScrollbar
                ? '[&_[data-orientation=horizontal][data-slot=scroll-area-scrollbar]]:!opacity-100'
                : '[&_[data-orientation=horizontal][data-slot=scroll-area-scrollbar]]:!pointer-events-none [&_[data-orientation=horizontal][data-slot=scroll-area-scrollbar]]:!opacity-0',
              cardDragEnabled
                ? '[&_[data-slot=scroll-area-viewport]]:cursor-grab [&_[data-slot=scroll-area-viewport]]:select-none'
                : '[&_[data-slot=scroll-area-viewport]]:cursor-default',
              showHorizontalScrollbar && '[&_[data-slot=scroll-area-viewport]]:cursor-grabbing',
            )}
            data-kanban-board-scroll-area=""
            data-kanban-horizontal-scrollbar={showHorizontalScrollbar ? 'visible' : 'hidden'}
            fill
            ref={cardDragEnabled ? rootRef : undefined}
            scrollbarGutter
            scrollFade
          >
            <div
              className="grid h-full min-h-full w-max auto-cols-[minmax(19rem,22rem)] grid-flow-col gap-2"
              data-kanban-reconciliation-key={reconciliationKey}
              key={reconciliationKey}
              ref={boardContentRef}
            >
              {visibleColumns.map((column) => (
                <KanbanColumn
                  actions={getColumnActions?.(column)}
                  column={column}
                  key={column.id}
                  {...columnProps}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
        <DragOverlay className="pointer-events-none" dropAnimation={null}>
          {(source) => {
            const card = cardsByDragId.get(String(source.id))
            return card ? renderCard(card) : null
          }}
        </DragOverlay>
      </DragDropProvider>
    </div>
  )
}

function createStageOptions(columns: KanbanColumnData[]): KanbanStageOption[] {
  return columns.map((column) => ({
    label: `${column.title} · ${column.count}`,
    value: column.id,
  }))
}
