import { describe, expect, test } from 'bun:test'
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/react'

import type { KanbanColumnData } from '../types'
import {
  createCardDragId,
  createColumnDropId,
  parseCardDragId,
  parseColumnId,
  projectKanbanColumns,
  resolveKanbanCardMove,
} from './drag-and-drop'

interface CardFixture {
  id: string
}

const getCardDragId = (card: CardFixture) => createCardDragId(card.id)

const fiveCardColumns: KanbanColumnData<CardFixture>[] = [
  {
    cards: [1, 2, 3, 4, 5].map((position) => ({ id: `card-${position}` })),
    count: 5,
    id: 'priority',
    title: 'Priority',
  },
]

interface SortableEventOptions {
  currentGroup?: string
  currentIndex: number
  initialGroup?: string
  initialIndex: number
  sourceId: string
  target?: {
    columnId?: string
    id: string
    type: 'card' | 'column'
    y?: number
  }
}

function sortableEvent({
  currentGroup = 'priority',
  currentIndex,
  initialGroup = 'priority',
  initialIndex,
  sourceId,
  target,
}: SortableEventOptions): DragEndEvent {
  const manager = {
    dragOperation: {
      position: { current: { x: 0, y: target?.y ?? 0 } },
      shape: { current: { center: { x: 0, y: target?.y ?? 0 } } },
    },
  }
  const source = {
    data: { cardId: parseCardDragId(sourceId), type: 'card' },
    group: currentGroup,
    id: sourceId,
    index: currentIndex,
    initialGroup,
    initialIndex,
    manager,
  }

  return {
    canceled: false,
    operation: {
      source,
      target: target
        ? {
            data: { columnId: target.columnId, type: target.type },
            id: target.id,
            shape: { center: { x: 0, y: 50 } },
          }
        : source,
    },
  } as unknown as DragEndEvent
}

function cardIds(columns: KanbanColumnData<CardFixture>[], columnId = 'priority') {
  return columns.find((column) => column.id === columnId)?.cards.map((card) => card.id)
}

describe('kanban dnd-kit adapter', () => {
  test('creates stable card and column identifiers', () => {
    expect(createCardDragId('card-1')).toBe('kanban-card:card-1')
    expect(parseCardDragId('kanban-card:card-1')).toBe('card-1')
    expect(parseColumnId(createColumnDropId('backlog'))).toBe('backlog')
    expect(parseColumnId(createColumnDropId('needs:review', ':r1:'))).toBe('needs:review')
    expect(createColumnDropId('backlog', 'mobile')).not.toBe(
      createColumnDropId('backlog', 'desktop'),
    )
  })

  test('uses the sortable source index to move card 3 to position 1', () => {
    const event = sortableEvent({
      currentIndex: 0,
      initialIndex: 2,
      sourceId: createCardDragId('card-3'),
    })

    const projected = projectKanbanColumns(fiveCardColumns, event, getCardDragId)

    expect(cardIds(projected)).toEqual(['card-3', 'card-1', 'card-2', 'card-4', 'card-5'])
    expect(cardIds(fiveCardColumns)).toEqual(['card-1', 'card-2', 'card-3', 'card-4', 'card-5'])
  })

  test('places card 3 between cards 1 and 2', () => {
    const projected = projectKanbanColumns(
      fiveCardColumns,
      sortableEvent({
        currentIndex: 1,
        initialIndex: 2,
        sourceId: createCardDragId('card-3'),
      }),
      getCardDragId,
    )

    expect(cardIds(projected)).toEqual(['card-1', 'card-3', 'card-2', 'card-4', 'card-5'])
  })

  test('keeps 1,2,3,4,5 when card 3 remains after card 2', () => {
    const projected = projectKanbanColumns(
      fiveCardColumns,
      sortableEvent({
        currentIndex: 2,
        initialIndex: 2,
        sourceId: createCardDragId('card-3'),
      }),
      getCardDragId,
    )

    expect(projected).toBe(fiveCardColumns)
    expect(cardIds(projected)).toEqual(['card-1', 'card-2', 'card-3', 'card-4', 'card-5'])
  })

  test('uses sortable groups to move a card between populated columns', () => {
    const columns: KanbanColumnData<CardFixture>[] = [
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
    const event = sortableEvent({
      currentGroup: 'review',
      currentIndex: 0,
      initialGroup: 'backlog',
      initialIndex: 1,
      sourceId: createCardDragId('card-2'),
    })

    const projected = projectKanbanColumns(columns, event, getCardDragId)

    expect(cardIds(projected, 'backlog')).toEqual(['card-1'])
    expect(cardIds(projected, 'review')).toEqual(['card-2', 'card-3'])
    expect(resolveKanbanCardMove(columns, projected, event, getCardDragId)).toEqual({
      card: { id: 'card-2' },
      cardId: 'card-2',
      sourceColumnId: 'backlog',
      sourceIndex: 1,
      targetColumnId: 'review',
      targetIndex: 0,
    })
  })

  test('uses the official move helper for a non-sortable empty-column target', () => {
    const columns: KanbanColumnData<CardFixture>[] = [
      {
        cards: [{ id: 'card-1' }],
        count: 1,
        id: 'backlog',
        title: 'Backlog',
      },
      { cards: [], count: 0, id: 'done', title: 'Done' },
    ]
    const event = sortableEvent({
      currentGroup: 'backlog',
      currentIndex: 0,
      initialGroup: 'backlog',
      initialIndex: 0,
      sourceId: createCardDragId('card-1'),
      target: {
        columnId: 'done',
        id: createColumnDropId('done', 'desktop'),
        type: 'column',
        y: 0,
      },
    })

    const projected = projectKanbanColumns(
      columns,
      event as unknown as DragOverEvent,
      getCardDragId,
    )

    expect(cardIds(projected, 'backlog')).toEqual([])
    expect(cardIds(projected, 'done')).toEqual(['card-1'])
  })
})
