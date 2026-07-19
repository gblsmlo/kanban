import type { UniqueIdentifier } from '@dnd-kit/core'

import type { KanbanCardMove, KanbanColumnData } from '../types'

const CARD_DRAG_PREFIX = 'kanban-card:'
const COLUMN_DROP_PREFIX = 'kanban-column:'

export interface CardLocation<TCard> {
  card: TCard
  cardIndex: number
  columnId: string
  columnIndex: number
}

export function createCardDragId(cardId: string | number): string {
  return `${CARD_DRAG_PREFIX}${String(cardId)}`
}

export function parseCardDragId(id: UniqueIdentifier): string {
  return String(id).replace(new RegExp(`^${CARD_DRAG_PREFIX}`), '')
}

export function createColumnDropId(columnId: string, instanceId?: string): string {
  const columnPart = encodeURIComponent(columnId)
  const instancePart = instanceId ? `:${encodeURIComponent(instanceId)}` : ''

  return `${COLUMN_DROP_PREFIX}${columnPart}${instancePart}`
}

export function parseColumnId(id: UniqueIdentifier): string {
  const value = String(id)

  if (!value.startsWith(COLUMN_DROP_PREFIX)) return ''

  const encodedColumnId = value.slice(COLUMN_DROP_PREFIX.length).split(':', 1)[0] ?? ''

  try {
    return decodeURIComponent(encodedColumnId)
  } catch {
    return encodedColumnId
  }
}

export function resolveTargetColumnId(
  overId: UniqueIdentifier,
  overData: Record<string, unknown> | undefined,
): string {
  return typeof overData?.columnId === 'string' ? overData.columnId : parseColumnId(overId)
}

export function findCardLocation<TCard>(
  columns: KanbanColumnData<TCard>[],
  cardDragId: string,
  getCardDragId: (card: TCard) => UniqueIdentifier,
): CardLocation<TCard> | undefined {
  for (const [columnIndex, column] of columns.entries()) {
    const cardIndex = column.cards.findIndex((card) => String(getCardDragId(card)) === cardDragId)

    if (cardIndex !== -1) {
      return {
        card: column.cards[cardIndex]!,
        cardIndex,
        columnId: column.id,
        columnIndex,
      }
    }
  }
}

export function findCardInsertIndex<TCard>(
  columns: KanbanColumnData<TCard>[],
  targetColumnId: string,
  overId: UniqueIdentifier,
  getCardDragId: (card: TCard) => UniqueIdentifier,
  insertAfter = false,
): number | undefined {
  const targetColumn = columns.find((column) => column.id === targetColumnId)
  if (!targetColumn) return undefined

  if (parseColumnId(overId) === targetColumnId) return targetColumn.cards.length

  const overCardIndex = targetColumn.cards.findIndex(
    (card) => String(getCardDragId(card)) === String(overId),
  )

  if (overCardIndex === -1) return targetColumn.cards.length
  return overCardIndex + Number(insertAfter)
}

export function moveCardToPreviewColumn<TCard>(
  columns: KanbanColumnData<TCard>[],
  activeDragId: string,
  targetColumnId: string,
  overId: UniqueIdentifier,
  getCardDragId: (card: TCard) => UniqueIdentifier,
  insertAfter = false,
): KanbanColumnData<TCard>[] {
  const sourceLocation = findCardLocation(columns, activeDragId, getCardDragId)
  if (!sourceLocation || sourceLocation.columnId === targetColumnId) return columns

  const targetColumnIndex = columns.findIndex((column) => column.id === targetColumnId)
  if (targetColumnIndex === -1) return columns

  const targetColumn = columns[targetColumnIndex]!
  const targetIndex = findCardInsertIndex(
    columns,
    targetColumnId,
    overId,
    getCardDragId,
    insertAfter,
  )
  const boundedTargetIndex = Math.max(
    0,
    Math.min(targetIndex ?? targetColumn.cards.length, targetColumn.cards.length),
  )
  const previewColumns = columns.map((column) => ({ ...column, cards: [...column.cards] }))

  previewColumns[sourceLocation.columnIndex]!.cards.splice(sourceLocation.cardIndex, 1)
  previewColumns[targetColumnIndex]!.cards.splice(boundedTargetIndex, 0, sourceLocation.card)

  return previewColumns
}

interface ResolveCardMoveOptions<TCard> {
  activeDragId: string
  columns: KanbanColumnData<TCard>[]
  getCardDragId: (card: TCard) => UniqueIdentifier
  overData: Record<string, unknown> | undefined
  overId: UniqueIdentifier
  sourceColumnId?: string | null
  visibleColumns: KanbanColumnData<TCard>[]
}

export function resolveCardMove<TCard>({
  activeDragId,
  columns,
  getCardDragId,
  overData,
  overId,
  sourceColumnId,
  visibleColumns,
}: ResolveCardMoveOptions<TCard>): KanbanCardMove<TCard> | undefined {
  const sourceLocation = findCardLocation(columns, activeDragId, getCardDragId)
  if (!sourceLocation) return undefined

  const previewLocation = findCardLocation(visibleColumns, activeDragId, getCardDragId)
  const resolvedSourceColumnId = sourceColumnId || sourceLocation.columnId
  const targetColumnId = resolveTargetColumnId(overId, overData) || previewLocation?.columnId

  if (!targetColumnId || targetColumnId === resolvedSourceColumnId) return undefined
  const targetIndex =
    previewLocation?.columnId === targetColumnId
      ? previewLocation.cardIndex
      : findCardInsertIndex(visibleColumns, targetColumnId, overId, getCardDragId)

  return {
    card: sourceLocation.card,
    cardId: parseCardDragId(activeDragId),
    sourceColumnId: resolvedSourceColumnId,
    sourceIndex: sourceLocation.cardIndex,
    targetColumnId,
    targetIndex,
  }
}
