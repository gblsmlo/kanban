import { afterEach, describe, expect, test } from 'bun:test'
import { DndContext } from '@dnd-kit/core'

await import('../../test/dom')

const { act, cleanup, fireEvent, render, screen } = await import('@testing-library/react')
const { KanbanColumn } = await import('./kanban-column')
const { KanbanStageSelector } = await import('./kanban-stage-selector')

window.HTMLElement.prototype.scrollIntoView = () => undefined

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

  test('uses a nested control as the single keyboard drag activator', async () => {
    const column = {
      cards: [{ id: 'card-1' }, { id: 'card-2' }],
      count: 2,
      id: 'backlog',
      title: 'Backlog',
    }

    let dragStarts = 0
    const { container } = render(
      <DndContext
        onDragStart={() => {
          dragStarts += 1
        }}
      >
        <KanbanColumn
          column={column}
          getCardDragId={(card) => `kanban-card:${card.id}`}
          getCardLabel={(card) => card.id}
          getKey={(card) => card.id}
          renderCard={(card) => <button type="button">Abrir {card.id}</button>}
          sortableCards
        />
      </DndContext>,
    )
    await act(async () => undefined)

    const draggable = screen.getByRole('region', { name: 'Mover card card-1' })
    const buttons = screen.getAllByRole('button')
    const button = screen.getByRole('button', { name: 'Abrir card-1' })

    for (const card of screen.getAllByRole('region', { name: /Mover card/ })) {
      expect(card.getAttribute('tabindex')).toBe('-1')
    }
    expect(draggable.hasAttribute('aria-pressed')).toBeFalse()
    expect(button.getAttribute('aria-roledescription')).toBe('card arrastável')
    expect(button.getAttribute('aria-describedby')).toBeTruthy()
    expect(button.getAttribute('aria-keyshortcuts')).toBe('Space')
    expect(button.hasAttribute('data-kanban-card-activator')).toBeTrue()
    expect(Array.from(container.querySelectorAll('[tabindex="0"], button'))).toEqual(buttons)

    button.focus()
    fireEvent.keyDown(button, { code: 'Space', key: ' ' })
    await act(async () => undefined)
    expect(dragStarts).toBe(1)
  })

  test('keeps text fields separate from the keyboard drag activator', async () => {
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
          renderCard={() => <input aria-label="Título do card" />}
          sortableCards
        />
      </DndContext>,
    )
    await act(async () => undefined)

    expect(screen.getByRole('region', { name: 'Mover card card-1' }).getAttribute('tabindex')).toBe(
      '0',
    )
    expect(
      screen.getByRole('textbox', { name: 'Título do card' }).hasAttribute('aria-keyshortcuts'),
    ).toBeFalse()
  })
})
