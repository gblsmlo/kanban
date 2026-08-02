import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { ScrollArea } from '../../components/scroll-area'

import { useActiveColumnId } from '../hooks/use-active-column-id'
import { useHorizontalDragScroll } from '../hooks/use-horizontal-drag-scroll'
import { useKanbanDragAndDrop } from '../hooks/use-kanban-drag-and-drop'
import type { KanbanCardMove, KanbanColumnData, KanbanStageOption } from '../types'
import { KanbanColumn } from './kanban-column'
import { KanbanStageSelector } from './kanban-stage-selector'

export interface KanbanViewProps<TCard = unknown> {
  columns: KanbanColumnData<TCard>[]
  renderCard: (card: TCard) => ReactNode
  getKey: (card: TCard) => string | number
  getCardLabel?: (card: TCard) => string
  emptyColumnLabel?: string
  mobileStageHint?: string
  onMoveCard?: (move: KanbanCardMove<TCard>) => boolean | Promise<boolean>
}

export function KanbanView<TCard>({
  columns,
  renderCard,
  getKey,
  getCardLabel,
  emptyColumnLabel,
  mobileStageHint,
  onMoveCard,
}: KanbanViewProps<TCard>) {
  const [activeColumnId, setActiveColumnId] = useActiveColumnId(columns)
  const {
    cardDragEnabled,
    getCardDragId,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    reconciliationKey,
    visibleColumns,
  } = useKanbanDragAndDrop({ columns, getKey, onMoveCard })
  const { isDragging: isBoardDragging, viewportProps } = useHorizontalDragScroll()
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
              <KanbanColumn column={activeColumn} {...columnProps} sortableCards={false} />
            ) : null}
          </div>

          <ScrollArea
            className="hidden min-h-0 flex-1 md:block"
            fill
            scrollbarGutter
            scrollFade
            viewportProps={{
              ...(cardDragEnabled ? viewportProps : {}),
              className: cardDragEnabled
                ? isBoardDragging
                  ? 'cursor-grabbing select-none'
                  : 'cursor-grab'
                : 'cursor-default',
              'data-kanban-board-viewport': '',
            }}
          >
            <div
              className="grid h-full min-h-full w-max auto-cols-[minmax(19rem,22rem)] grid-flow-col gap-2"
              data-kanban-reconciliation-key={reconciliationKey}
              key={reconciliationKey}
            >
              {visibleColumns.map((column) => (
                <KanbanColumn column={column} key={column.id} {...columnProps} />
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
