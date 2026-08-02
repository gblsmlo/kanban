import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/react'

import { createCardDragId, createColumnDropId } from '../lib/drag-and-drop'
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
    cards: [{ id: 'card-1' }, { id: 'card-2' }, { id: 'card-3' }],
    count: 3,
    id: 'backlog',
    title: 'Backlog',
  },
  { cards: [], count: 0, id: 'done', title: 'Done' },
]

const secondCardFirstColumns: KanbanColumnData<CardFixture>[] = [
  {
    ...initialColumns[0]!,
    cards: [{ id: 'card-2' }, { id: 'card-1' }, { id: 'card-3' }],
  },
  initialColumns[1]!,
]

interface EventOptions {
  canceled?: boolean
  currentGroup?: string
  currentIndex: number
  initialGroup?: string
  initialIndex: number
  sourceId: string
  target?: {
    columnId: string
    id: string
    type: 'card' | 'column'
  }
}

function createOperation({
  currentGroup = 'backlog',
  currentIndex,
  initialGroup = 'backlog',
  initialIndex,
  sourceId,
  target,
}: EventOptions) {
  const manager = {
    dragOperation: {
      position: { current: { x: 0, y: 0 } },
      shape: { current: { center: { x: 0, y: 0 } } },
    },
  }
  const source = {
    data: { cardId: sourceId, type: 'card' },
    group: currentGroup,
    id: sourceId,
    index: currentIndex,
    initialGroup,
    initialIndex,
    manager,
  }

  return {
    source,
    target: target
      ? {
          data: { columnId: target.columnId, type: target.type },
          id: target.id,
          shape: { center: { x: 0, y: 50 } },
        }
      : source,
  }
}

function createDragEvents(options: EventOptions) {
  const operation = createOperation(options)
  const resume = mock(() => undefined)
  const abort = mock(() => undefined)
  const suspend = mock(() => ({ abort, resume }))

  return {
    abort,
    end: {
      canceled: options.canceled ?? false,
      operation,
      suspend,
    } as unknown as DragEndEvent,
    over: { operation } as unknown as DragOverEvent,
    resume,
    start: { operation } as unknown as DragStartEvent,
    suspend,
  }
}

function ids(columns: KanbanColumnData<CardFixture>[], columnId = 'backlog') {
  return columns.find((column) => column.id === columnId)?.cards.map((card) => card.id)
}

describe('useKanbanDragAndDrop', () => {
  test('persists the native sortable projection and resumes an accepted drop', () => {
    let columns = initialColumns
    const onMoveCard = mock(() => true)
    const events = createDragEvents({
      currentIndex: 0,
      initialIndex: 1,
      sourceId: createCardDragId('card-2'),
    })
    const { result, rerender } = renderHook(() =>
      useKanbanDragAndDrop({
        columns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard,
      }),
    )

    act(() => result.current.handleDragStart(events.start))
    act(() => result.current.handleDragEnd(events.end))

    expect(onMoveCard).toHaveBeenCalledWith({
      card: { id: 'card-2' },
      cardId: 'card-2',
      sourceColumnId: 'backlog',
      sourceIndex: 1,
      targetColumnId: 'backlog',
      targetIndex: 0,
    })
    expect(ids(result.current.visibleColumns)).toEqual(['card-2', 'card-1', 'card-3'])
    expect(events.suspend).toHaveBeenCalledTimes(1)
    expect(events.resume).toHaveBeenCalledTimes(1)
    expect(events.abort).not.toHaveBeenCalled()

    columns = initialColumns.map((column) => ({ ...column, cards: [...column.cards] }))
    rerender()
    expect(ids(result.current.visibleColumns)).toEqual(['card-2', 'card-1', 'card-3'])

    columns = secondCardFirstColumns
    rerender()
    expect(result.current.visibleColumns).toBe(secondCardFirstColumns)
  })

  test('does not create a React preview when the native sortable plugin owns drag-over', () => {
    const events = createDragEvents({
      currentIndex: 0,
      initialIndex: 1,
      sourceId: createCardDragId('card-2'),
      target: {
        columnId: 'backlog',
        id: createCardDragId('card-1'),
        type: 'card',
      },
    })
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard: () => true,
      }),
    )

    act(() => result.current.handleDragStart(events.start))
    act(() => result.current.handleDragOver(events.over))

    expect(result.current.visibleColumns).toBe(initialColumns)
  })

  test('uses a React projection only while entering an empty column', () => {
    const events = createDragEvents({
      currentIndex: 0,
      initialIndex: 0,
      sourceId: createCardDragId('card-1'),
      target: {
        columnId: 'done',
        id: createColumnDropId('done', 'desktop'),
        type: 'column',
      },
    })
    const canceledEvents = createDragEvents({
      canceled: true,
      currentIndex: 0,
      initialIndex: 0,
      sourceId: createCardDragId('card-1'),
    })
    const onMoveCard = mock(() => true)
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard,
      }),
    )

    act(() => result.current.handleDragStart(events.start))
    act(() => result.current.handleDragOver(events.over))
    expect(ids(result.current.visibleColumns, 'backlog')).toEqual(['card-2', 'card-3'])
    expect(ids(result.current.visibleColumns, 'done')).toEqual(['card-1'])

    act(() => result.current.handleDragEnd(canceledEvents.end))
    expect(result.current.visibleColumns).toBe(initialColumns)
    expect(onMoveCard).not.toHaveBeenCalled()
    expect(canceledEvents.suspend).not.toHaveBeenCalled()
  })

  test('keeps the accepted projection through optimistic and stale snapshots until async persistence confirms', async () => {
    let columns = initialColumns
    let resolvePersistence: ((accepted: boolean) => void) | undefined
    const persistence = new Promise<boolean>((resolve) => {
      resolvePersistence = resolve
    })
    const events = createDragEvents({
      currentIndex: 0,
      initialIndex: 1,
      sourceId: createCardDragId('card-2'),
    })
    const { result, rerender } = renderHook(() =>
      useKanbanDragAndDrop({
        columns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard: () => persistence,
      }),
    )

    act(() => result.current.handleDragStart(events.start))
    act(() => result.current.handleDragEnd(events.end))
    expect(events.resume).toHaveBeenCalledTimes(1)

    columns = secondCardFirstColumns
    rerender()
    columns = initialColumns.map((column) => ({ ...column, cards: [...column.cards] }))
    rerender()
    expect(ids(result.current.visibleColumns)).toEqual(['card-2', 'card-1', 'card-3'])

    columns = secondCardFirstColumns
    rerender()
    await act(async () => {
      resolvePersistence?.(true)
      await persistence
    })

    expect(events.resume).toHaveBeenCalledTimes(1)
    expect(events.abort).not.toHaveBeenCalled()
    expect(result.current.visibleColumns).toBe(secondCardFirstColumns)
  })

  test('aborts the suspended operation and restores columns when persistence rejects', () => {
    const events = createDragEvents({
      currentIndex: 0,
      initialIndex: 1,
      sourceId: createCardDragId('card-2'),
    })
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard: () => false,
      }),
    )

    act(() => result.current.handleDragStart(events.start))
    act(() => result.current.handleDragEnd(events.end))

    expect(events.abort).toHaveBeenCalledTimes(1)
    expect(events.resume).not.toHaveBeenCalled()
    expect(result.current.reconciliationKey).toBe(1)
    expect(ids(result.current.visibleColumns)).toEqual(['card-1', 'card-2', 'card-3'])
  })

  test('finishes pointer feedback immediately and reconciles when async persistence rejects', async () => {
    let rejectPersistence: ((accepted: boolean) => void) | undefined
    const persistence = new Promise<boolean>((resolve) => {
      rejectPersistence = resolve
    })
    const events = createDragEvents({
      currentIndex: 0,
      initialIndex: 1,
      sourceId: createCardDragId('card-2'),
    })
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard: () => persistence,
      }),
    )

    act(() => result.current.handleDragStart(events.start))
    act(() => result.current.handleDragEnd(events.end))
    expect(events.resume).toHaveBeenCalledTimes(1)

    await act(async () => {
      rejectPersistence?.(false)
      await persistence
    })

    expect(events.abort).not.toHaveBeenCalled()
    expect(ids(result.current.visibleColumns)).toEqual(['card-1', 'card-2', 'card-3'])
    expect(result.current.reconciliationKey).toBeGreaterThanOrEqual(1)
  })

  test('does not suspend or persist an unchanged position', () => {
    const onMoveCard = mock(() => true)
    const events = createDragEvents({
      currentIndex: 1,
      initialIndex: 1,
      sourceId: createCardDragId('card-2'),
    })
    const { result } = renderHook(() =>
      useKanbanDragAndDrop({
        columns: initialColumns,
        getKey: (card: CardFixture) => card.id,
        onMoveCard,
      }),
    )

    act(() => result.current.handleDragStart(events.start))
    act(() => result.current.handleDragEnd(events.end))

    expect(onMoveCard).not.toHaveBeenCalled()
    expect(events.suspend).not.toHaveBeenCalled()
    expect(result.current.visibleColumns).toBe(initialColumns)
  })
})
