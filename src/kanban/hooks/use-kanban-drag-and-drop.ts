import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  createCardDragId,
  findCardLocation,
  moveCardToPreviewColumn,
  resolveCardMove,
  resolveTargetColumnId,
} from '../lib/drag-and-drop'
import type { KanbanCardMove, KanbanColumnData } from '../types'

interface UseKanbanDragAndDropOptions<TCard> {
  columns: KanbanColumnData<TCard>[]
  getKey: (card: TCard) => string | number
  onMoveCard?: (move: KanbanCardMove<TCard>) => boolean
}

interface PendingCardMove {
  cardDragId: string
  targetColumnId: string
}

export function useKanbanDragAndDrop<TCard>({
  columns,
  getKey,
  onMoveCard,
}: UseKanbanDragAndDropOptions<TCard>) {
  const [previewColumns, setPreviewColumns] = useState<KanbanColumnData<TCard>[] | null>(null)
  const [activeCard, setActiveCard] = useState<TCard | null>(null)
  const previewColumnsRef = useRef<KanbanColumnData<TCard>[] | null>(null)
  const sourceColumnIdRef = useRef<string | null>(null)
  const pendingCardMoveRef = useRef<PendingCardMove | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const getCardDragId = useCallback((card: TCard) => createCardDragId(getKey(card)), [getKey])
  const cardsByDragId = useMemo(
    () =>
      new Map(
        columns.flatMap((column) =>
          column.cards.map((card) => [String(getCardDragId(card)), card] as const),
        ),
      ),
    [columns, getCardDragId],
  )

  const updatePreviewColumns = useCallback((nextColumns: KanbanColumnData<TCard>[] | null) => {
    previewColumnsRef.current = nextColumns
    setPreviewColumns(nextColumns)
  }, [])

  const resetDragState = useCallback(() => {
    pendingCardMoveRef.current = null
    sourceColumnIdRef.current = null
    setActiveCard(null)
    updatePreviewColumns(null)
  }, [updatePreviewColumns])

  useEffect(() => {
    const pendingCardMove = pendingCardMoveRef.current
    if (!pendingCardMove) return

    const cardLocation = findCardLocation(columns, pendingCardMove.cardDragId, getCardDragId)
    if (cardLocation?.columnId !== pendingCardMove.targetColumnId) return

    pendingCardMoveRef.current = null
    updatePreviewColumns(null)
  }, [columns, getCardDragId, updatePreviewColumns])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const isCardDrag = event.active.data.current?.type === 'card'
      pendingCardMoveRef.current = null
      sourceColumnIdRef.current = isCardDrag
        ? String(event.active.data.current?.columnId ?? '')
        : null
      updatePreviewColumns(isCardDrag ? columns : null)
      setActiveCard(isCardDrag ? (cardsByDragId.get(String(event.active.id)) ?? null) : null)
    },
    [cardsByDragId, columns, updatePreviewColumns],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over || active.data.current?.type !== 'card' || !onMoveCard) return

      const targetColumnId = resolveTargetColumnId(over.id, over.data.current)
      if (!targetColumnId) return
      const activeRect = active.rect?.current.translated ?? null
      const insertAfter =
        over.data.current?.type === 'card' &&
        activeRect !== null &&
        activeRect.top + activeRect.height / 2 > over.rect.top + over.rect.height / 2

      updatePreviewColumns(
        moveCardToPreviewColumn(
          previewColumnsRef.current ?? columns,
          String(active.id),
          targetColumnId,
          over.id,
          getCardDragId,
          insertAfter,
        ),
      )
    },
    [columns, getCardDragId, onMoveCard, updatePreviewColumns],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) {
        resetDragState()
        return
      }

      const activeData = active.data.current
      const overData = over.data.current

      if (activeData?.type === 'card' && onMoveCard) {
        const activeDragId = String(active.id)
        const move = resolveCardMove({
          activeDragId,
          columns,
          getCardDragId,
          overData,
          overId: over.id,
          sourceColumnId: sourceColumnIdRef.current || String(activeData.columnId),
          visibleColumns: previewColumnsRef.current ?? columns,
        })

        if (move) {
          const moveAccepted = onMoveCard(move)

          sourceColumnIdRef.current = null
          setActiveCard(null)

          if (!moveAccepted) {
            updatePreviewColumns(null)
          } else {
            pendingCardMoveRef.current = {
              cardDragId: activeDragId,
              targetColumnId: move.targetColumnId,
            }
          }
          return
        }
      }

      resetDragState()
    },
    [columns, getCardDragId, onMoveCard, resetDragState, updatePreviewColumns],
  )

  return {
    activeCard,
    cardDragEnabled: Boolean(onMoveCard),
    getCardDragId,
    handleDragCancel: resetDragState,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    sensors,
    visibleColumns: previewColumns ?? columns,
  }
}
