import { describe, expect, test } from 'bun:test'

import type { KanbanColumnData } from '../types'
import {
  createCardDragId,
  createColumnDropId,
  findCardInsertIndex,
  moveCardToPreviewColumn,
  parseCardDragId,
  parseColumnId,
  resolveCardMove,
  resolveTargetColumnId,
} from './drag-and-drop'

interface CardFixture {
  id: string
}

const columns: KanbanColumnData<CardFixture>[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    count: 2,
    cards: [{ id: 'card-1' }, { id: 'card-2' }],
  },
  {
    id: 'review',
    title: 'Review',
    count: 1,
    cards: [{ id: 'card-3' }],
  },
]

const getCardDragId = (card: CardFixture) => createCardDragId(card.id)

describe('kanban drag-and-drop', () => {
  test('creates and parses stable drag identifiers', () => {
    expect(createCardDragId('card-1')).toBe('kanban-card:card-1')
    expect(parseCardDragId('kanban-card:card-1')).toBe('card-1')
    expect(parseColumnId(createColumnDropId('backlog'))).toBe('backlog')
    expect(parseColumnId(createColumnDropId('needs:review', ':r1:'))).toBe('needs:review')
    expect(createColumnDropId('backlog', 'mobile')).not.toBe(
      createColumnDropId('backlog', 'desktop'),
    )
  })

  test('resolves the target column from drag data before the droppable id', () => {
    expect(resolveTargetColumnId(createColumnDropId('backlog'), { columnId: 'review' })).toBe(
      'review',
    )
  })

  test('moves a card into a preview without mutating the source columns', () => {
    const preview = moveCardToPreviewColumn(
      columns,
      createCardDragId('card-1'),
      'review',
      createCardDragId('card-3'),
      getCardDragId,
    )

    expect(preview[0]!.cards.map(({ id }) => id)).toEqual(['card-2'])
    expect(preview[1]!.cards.map(({ id }) => id)).toEqual(['card-1', 'card-3'])
    expect(columns[0]!.cards.map(({ id }) => id)).toEqual(['card-1', 'card-2'])
    expect(columns[1]!.cards.map(({ id }) => id)).toEqual(['card-3'])
  })

  test('keeps server-defined ordering when the card stays in its source column', () => {
    const preview = moveCardToPreviewColumn(
      columns,
      createCardDragId('card-1'),
      'backlog',
      createCardDragId('card-2'),
      getCardDragId,
    )

    expect(preview).toBe(columns)
  })

  test('inserts at the end when hovering the target column', () => {
    expect(
      findCardInsertIndex(columns, 'review', createColumnDropId('review'), getCardDragId),
    ).toBe(1)
  })

  test('inserts after the hovered card when the pointer crosses its midpoint', () => {
    expect(
      findCardInsertIndex(columns, 'review', createCardDragId('card-3'), getCardDragId, true),
    ).toBe(1)

    const preview = moveCardToPreviewColumn(
      columns,
      createCardDragId('card-1'),
      'review',
      createCardDragId('card-3'),
      getCardDragId,
      true,
    )

    expect(preview[1]!.cards.map(({ id }) => id)).toEqual(['card-3', 'card-1'])
  })

  test('keeps the requested third position in a populated target column', () => {
    const populatedColumns: KanbanColumnData<CardFixture>[] = [
      columns[0]!,
      {
        ...columns[1]!,
        cards: [{ id: 'card-3' }, { id: 'card-4' }, { id: 'card-5' }],
        count: 3,
      },
    ]

    const preview = moveCardToPreviewColumn(
      populatedColumns,
      createCardDragId('card-1'),
      'review',
      createCardDragId('card-4'),
      getCardDragId,
      true,
    )

    expect(preview[1]!.cards.map(({ id }) => id)).toEqual(['card-3', 'card-4', 'card-1', 'card-5'])
  })

  test('resolves the domain move from the original and preview columns', () => {
    const preview = moveCardToPreviewColumn(
      columns,
      createCardDragId('card-1'),
      'review',
      createCardDragId('card-3'),
      getCardDragId,
    )

    expect(
      resolveCardMove({
        activeDragId: createCardDragId('card-1'),
        columns,
        getCardDragId,
        overData: { columnId: 'review' },
        overId: createCardDragId('card-3'),
        sourceColumnId: 'backlog',
        visibleColumns: preview,
      }),
    ).toEqual({
      card: { id: 'card-1' },
      cardId: 'card-1',
      sourceColumnId: 'backlog',
      sourceIndex: 0,
      targetColumnId: 'review',
      targetIndex: 0,
    })
  })

  test('does not create a move inside the same column', () => {
    expect(
      resolveCardMove({
        activeDragId: createCardDragId('card-1'),
        columns,
        getCardDragId,
        overData: { columnId: 'backlog' },
        overId: createCardDragId('card-2'),
        sourceColumnId: 'backlog',
        visibleColumns: columns,
      }),
    ).toBeUndefined()
  })
})
