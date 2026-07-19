import { afterEach, describe, expect, test } from 'bun:test'
import { DndContext } from '@dnd-kit/core'

await import('../../test/dom')

const { act, cleanup, render, screen } = await import('@testing-library/react')
const { KanbanColumn } = await import('./kanban-column')
const { KanbanStageSelector } = await import('./kanban-stage-selector')

afterEach(cleanup)

const emptyColumn = {
  cards: [],
  count: 0,
  id: 'backlog',
  title: 'Backlog',
}

describe('Kanban accessibility', () => {
  test('creates unique heading ids for duplicate responsive column instances', async () => {
    render(
      <DndContext>
        <KanbanColumn column={emptyColumn} getKey={(card) => String(card)} renderCard={String} />
        <KanbanColumn column={emptyColumn} getKey={(card) => String(card)} renderCard={String} />
      </DndContext>,
    )
    await act(async () => undefined)

    const headings = screen.getAllByRole('heading', { name: 'Backlog' })
    const headingIds = headings.map((heading) => heading.id)

    expect(new Set(headingIds).size).toBe(2)
    for (const heading of headings) {
      expect(heading.closest('section')?.getAttribute('aria-labelledby')).toBe(heading.id)
    }
  })

  test('creates unique stage selector labels when id is omitted', async () => {
    const props = {
      onValueChange: () => undefined,
      stages: [{ label: 'Backlog', value: 'backlog' }],
      value: 'backlog',
    }

    render(
      <>
        <KanbanStageSelector {...props} />
        <KanbanStageSelector {...props} />
      </>,
    )
    await act(async () => undefined)

    const labels = screen.getAllByText('Etapa')
    expect(new Set(labels.map((label) => label.id)).size).toBe(2)
  })

  test('exposes keyboard drag semantics without making a nested button invalid', async () => {
    const column = {
      cards: [{ id: 'card-1' }],
      count: 1,
      id: 'backlog',
      title: 'Backlog',
    }

    render(
      <DndContext>
        <KanbanColumn
          column={column}
          getCardDragId={(card) => `kanban-card:${card.id}`}
          getCardLabel={(card) => card.id}
          getKey={(card) => card.id}
          renderCard={() => <button type="button">Abrir card</button>}
          sortableCards
        />
      </DndContext>,
    )
    await act(async () => undefined)

    const draggable = screen.getByRole('region', { name: 'Mover card card-1' })

    expect(draggable.getAttribute('aria-roledescription')).toBe('card arrastável')
    expect(draggable.getAttribute('aria-describedby')).toBeTruthy()
    expect(draggable.hasAttribute('aria-pressed')).toBeFalse()
    expect(draggable.getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('button', { name: 'Abrir card' })).toBeTruthy()
  })
})
