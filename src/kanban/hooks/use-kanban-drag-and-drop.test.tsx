import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'

import type { KanbanColumnData } from '../types'

await import('../../test/dom')

const { act, cleanup, renderHook } = await import('@testing-library/react')
const { useKanbanDragAndDrop } = await import('./use-kanban-drag-and-drop')

afterEach(cleanup)

interface CardFixture {
  id: string
}

const initialColumns: KanbanColumnData<CardFixture>[] = [
  {
    cards: [{ id: 'card-1' }, { id: 'card-2' }],
    count: 2,
    id: 'backlog',
    title: 'Backlog',
  },
  {
    cards: [{ id: 'card-3' }],
    count: 1,
    id: 'review',
    title: 'Review',
  },
]

const movedColumns: KanbanColumnData<CardFixture>[] = [
  {
    ...initialColumns[0]!,
    cards: [{ id: 'card-2' }],
    count: 1,
  },
  {
    ...initialColumns[1]!,
    cards: [{ id: 'card-1' }, { id: 'card-3' }],
    count: 2,
  },
]

function cardActive(columnId = 'backlog') {
  return {
    data: { current: { columnId, type: 'card' } },
    id: 'kanban-card:card-1',
  }
}

function targetCard() {
  return {
    data: { current: { cardId: 'card-3', columnId: 'review', type: 'card' } },
    id: 'kanban-card:card-3',
  }
}

function dragStartEvent(): DragStartEvent {
  return { active: cardActive() } as unknown as DragStartEvent
}

function dragOverEvent(): DragOverEvent {
  return {
    active: cardActive(),
    over: targetCard(),
  } as unknown as DragOverEvent
}

function dragOverAfterTargetEvent(): DragOverEvent {
  return {
    active: {
      ...cardActive(),
      rect: {
        current: {
          initial: null,
          translated: { height: 100, left: 0, top: 200, width: 100 },
        },
      },
    },
    over: {
      ...targetCard(),
      rect: { height: 100, left: 0, top: 100, width: 100 },
    },
  } as unknown as DragOverEvent
}

function dragEndEvent(): DragEndEvent {
  return {
    active: cardActive(),
    over: targetCard(),
  } as unknown as DragEndEvent
}

describe('useKanbanDragAndDrop', () => {
  test('previews, accepts, and reconciles a cross-column move', () => {
    let columns = initialColumns
    const onMoveCard = mock(() => true)
    const { result, rerender } = renderHook(() =>
      useKanbanDragAndDrop({
        columns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard,
      }),
    )

    act(() => result.current.handleDragStart(dragStartEvent()))
    expect(result.current.activeCard).toEqual({ id: 'card-1' })

    act(() => result.current.handleDragOver(dragOverEvent()))
    expect(result.current.visibleColumns[1]!.cards.map(({ id }) => id)).toEqual([
      'card-1',
      'card-3',
    ])

    act(() => result.current.handleDragEnd(dragEndEvent()))
    expect(onMoveCard).toHaveBeenCalledWith({
      card: { id: 'card-1' },
      cardId: 'card-1',
      sourceColumnId: 'backlog',
      sourceIndex: 0,
      targetColumnId: 'review',
      targetIndex: 0,
    })
    expect(result.current.activeCard).toBeNull()

    columns = movedColumns
    rerender()
    expect(result.current.visibleColumns).toBe(movedColumns)
  })

  test('rolls back the preview when the consumer rejects the move', () => {
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard: () => false,
      }),
    )

    act(() => result.current.handleDragStart(dragStartEvent()))
    act(() => result.current.handleDragOver(dragOverEvent()))
    act(() => result.current.handleDragEnd(dragEndEvent()))

    expect(result.current.activeCard).toBeNull()
    expect(result.current.visibleColumns).toBe(initialColumns)
  })

  test('keeps the card after the hovered target when dragged below its midpoint', () => {
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard: () => true,
      }),
    )

    act(() => result.current.handleDragStart(dragStartEvent()))
    act(() => result.current.handleDragOver(dragOverAfterTargetEvent()))

    expect(result.current.visibleColumns[1]!.cards.map(({ id }) => id)).toEqual([
      'card-3',
      'card-1',
    ])
  })

  test('clears the drag state on cancellation', () => {
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard: () => true,
      }),
    )

    act(() => result.current.handleDragStart(dragStartEvent()))
    act(() => result.current.handleDragCancel())

    expect(result.current.activeCard).toBeNull()
    expect(result.current.visibleColumns).toBe(initialColumns)
  })
})
