import { closestCorners, DndContext, DragOverlay } from '@dnd-kit/core'
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
  onMoveCard?: (move: KanbanCardMove<TCard>) => boolean
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
    activeCard,
    cardDragEnabled,
    getCardDragId,
    handleDragCancel,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    sensors,
    visibleColumns,
  } = useKanbanDragAndDrop({ columns, getKey, onMoveCard })
  const { isDragging: isBoardDragging, viewportProps } = useHorizontalDragScroll()
  const stageOptions = useMemo(() => createStageOptions(columns), [columns])
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
      <DndContext
        collisionDetection={closestCorners}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
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
              ...viewportProps,
              className: isBoardDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
              'data-kanban-board-viewport': '',
            }}
          >
            <div className="grid h-full min-h-full w-max auto-cols-[minmax(19rem,22rem)] grid-flow-col gap-2">
              {visibleColumns.map((column) => (
                <KanbanColumn column={column} key={column.id} {...columnProps} />
              ))}
            </div>
          </ScrollArea>
        </div>

        <DragOverlay dropAnimation={null} zIndex={20}>
          {activeCard ? <div className="pointer-events-none">{renderCard(activeCard)}</div> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function createStageOptions(columns: KanbanColumnData[]): KanbanStageOption[] {
  return columns.map((column) => ({
    label: `${column.title} · ${column.count}`,
    value: column.id,
  }))
}
