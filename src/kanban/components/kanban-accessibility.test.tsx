import { afterEach, describe, expect, mock, test } from 'bun:test'
import { DragDropProvider } from '@dnd-kit/react'

await import('../../test/dom')

class TestPointerEvent extends window.MouseEvent {
  isPrimary: boolean
  pointerId: number

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.isPrimary = init.isPrimary ?? false
    this.pointerId = init.pointerId ?? 0
  }
}

Object.assign(window, { PointerEvent: TestPointerEvent })
Object.assign(globalThis, { PointerEvent: TestPointerEvent })

const { act, cleanup, fireEvent, render, screen, waitFor } = await import('@testing-library/react')
const { KanbanCard, KanbanCardContent } = await import('./kanban-card')
const { KanbanColumn } = await import('./kanban-column')
const { KanbanStageSelector } = await import('./kanban-stage-selector')
const { KanbanView } = await import('./kanban-view')

window.HTMLElement.prototype.scrollIntoView = () => undefined

afterEach(cleanup)

const emptyColumn = {
  cards: [],
  count: 0,
  id: 'backlog',
  title: 'Backlog',
}

describe('Kanban accessibility', () => {
  test('renders optional per-column actions and identifies their column', async () => {
    const onAddCard = mock(() => undefined)
    const onOpenSettings = mock(() => undefined)
    const columns = [emptyColumn, { ...emptyColumn, id: 'done', title: 'Done' }]

    render(
      <KanbanView
        columns={columns}
        getColumnActions={(column) =>
          column.id === 'backlog' ? { onAddCard, onOpenSettings } : undefined
        }
        getKey={(card) => String(card)}
        renderCard={String}
      />,
    )
    await act(async () => undefined)

    const settings = screen.getAllByRole('button', { name: 'Configurar seção Backlog' })[0]!
    const add = screen.getAllByRole('button', { name: 'Adicionar item à seção Backlog' })[0]!

    expect(screen.queryByRole('button', { name: 'Configurar seção Done' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Adicionar item à seção Done' })).toBeNull()

    settings.focus()
    expect(document.activeElement).toBe(settings)
    fireEvent.click(settings)
    add.focus()
    expect(document.activeElement).toBe(add)
    fireEvent.click(add)

    expect(onOpenSettings).toHaveBeenCalledWith('backlog')
    expect(onAddCard).toHaveBeenCalledWith('backlog')
  })

  test('creates unique heading ids for duplicate responsive column instances', async () => {
    render(
      <DragDropProvider>
        <KanbanColumn column={emptyColumn} getKey={(card) => String(card)} renderCard={String} />
        <KanbanColumn column={emptyColumn} getKey={(card) => String(card)} renderCard={String} />
      </DragDropProvider>,
    )
    await act(async () => undefined)

    const headings = screen.getAllByRole('heading', { name: 'Backlog' })
    const headingIds = headings.map((heading) => heading.id)

    expect(new Set(headingIds).size).toBe(2)
    for (const heading of headings) {
      expect(heading.closest('section')?.getAttribute('aria-labelledby')).toBe(heading.id)
    }
  })

  test('keeps read-only and sortable card containers shrinkable', async () => {
    const column = {
      cards: [{ id: 'card-1' }],
      count: 1,
      id: 'backlog',
      title: 'Backlog',
    }
    const renderCard = () => (
      <KanbanCard>
        <KanbanCardContent>
          <span className="min-w-0 max-w-full whitespace-nowrap">
            tag-with-an-extremely-long-unbroken-value
          </span>
        </KanbanCardContent>
      </KanbanCard>
    )

    const { container } = render(
      <DragDropProvider>
        <KanbanColumn column={column} getKey={(card) => card.id} renderCard={renderCard} />
        <KanbanColumn
          column={column}
          getCardDragId={(card) => `kanban-card:${card.id}`}
          getKey={(card) => card.id}
          renderCard={renderCard}
          sortableCards
        />
      </DragDropProvider>,
    )
    await act(async () => undefined)

    const cardContainers = container.querySelectorAll<HTMLElement>('[data-kanban-card-container]')

    expect(cardContainers).toHaveLength(2)
    for (const cardContainer of cardContainers) {
      expect(cardContainer.className).toContain('min-w-0')
      expect(cardContainer.className).toContain('max-w-full')
    }
    expect(cardContainers[1]?.className).not.toContain('overflow-hidden')
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
      <DragDropProvider
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
      </DragDropProvider>,
    )
    await act(async () => undefined)

    const draggable = screen.getByRole('region', { name: 'Mover card card-1' })
    const buttons = screen.getAllByRole('button')
    const button = screen.getByRole('button', { name: 'Abrir card-1' })

    await waitFor(() => expect(button.getAttribute('aria-describedby')).toBeTruthy())

    for (const card of screen.getAllByRole('region', { name: /Mover card/ })) {
      expect(card.hasAttribute('tabindex')).toBeFalse()
    }
    expect(draggable.hasAttribute('aria-pressed')).toBeFalse()
    expect(button.getAttribute('aria-roledescription')).toBe('draggable')
    expect(button.getAttribute('aria-describedby')).toBeTruthy()
    expect(Array.from(container.querySelectorAll('[tabindex="0"], button'))).toEqual(buttons)

    button.focus()
    fireEvent.keyDown(button, { code: 'Enter', key: 'Enter' })
    await act(async () => undefined)
    expect(dragStarts).toBe(0)

    fireEvent.keyDown(button, { code: 'Space', key: ' ' })
    await act(async () => undefined)
    expect(dragStarts).toBe(1)

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
      <DragDropProvider>
        <KanbanColumn
          column={column}
          getCardDragId={(card) => `kanban-card:${card.id}`}
          getCardLabel={(card) => card.id}
          getKey={(card) => card.id}
          renderCard={() => <input aria-label="Título do card" />}
          sortableCards
        />
      </DragDropProvider>,
    )
    await act(async () => undefined)

    await waitFor(() =>
      expect(screen.getByLabelText('Mover card card-1').getAttribute('tabindex')).toBe('0'),
    )
    expect(
      screen.getByRole('textbox', { name: 'Título do card' }).hasAttribute('aria-describedby'),
    ).toBeFalse()
  })

  test('shows the board scrollbar only during an active horizontal drag', async () => {
    const column = {
      cards: [{ id: 'card-1' }],
      count: 1,
      id: 'backlog',
      title: 'Backlog',
    }
    const { container } = render(
      <KanbanView
        columns={[column]}
        getKey={(card) => card.id}
        onMoveCard={() => true}
        renderCard={(card) => <article>{card.id}</article>}
      />,
    )
    await act(async () => undefined)

    const scrollArea = container.querySelector<HTMLElement>('[data-kanban-board-scroll-area]')!
    const viewport = scrollArea.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!
    const dragSurface = scrollArea.querySelector<HTMLElement>('h2')!

    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 300 },
      scrollLeft: { configurable: true, value: 120, writable: true },
      scrollWidth: { configurable: true, value: 900 },
    })
    viewport.setPointerCapture = () => undefined
    viewport.hasPointerCapture = () => true
    viewport.releasePointerCapture = () => undefined

    expect(scrollArea.getAttribute('data-kanban-horizontal-scrollbar')).toBe('hidden')
    expect(scrollArea.className).toContain('!delay-0')
    fireEvent.pointerOver(dragSurface)
    expect(scrollArea.getAttribute('data-kanban-horizontal-scrollbar')).toBe('hidden')

    fireEvent.pointerDown(dragSurface, {
      button: 0,
      clientX: 200,
      clientY: 20,
      isPrimary: true,
      pointerId: 1,
    })
    fireEvent.pointerMove(viewport, {
      buttons: 1,
      clientX: 120,
      clientY: 20,
      isPrimary: true,
      pointerId: 1,
    })

    expect(scrollArea.getAttribute('data-kanban-horizontal-scrollbar')).toBe('visible')
    expect(viewport.scrollLeft).toBe(200)

    fireEvent.pointerUp(viewport, {
      clientX: 120,
      clientY: 20,
      isPrimary: true,
      pointerId: 1,
    })
    expect(scrollArea.getAttribute('data-kanban-horizontal-scrollbar')).toBe('hidden')
  })

  test('keeps a read-only board passive with the default pointer', async () => {
    const column = {
      cards: [{ id: 'card-1' }],
      count: 1,
      id: 'backlog',
      title: 'Backlog',
    }

    const { container } = render(
      <KanbanView
        columns={[column]}
        getKey={(card) => card.id}
        renderCard={(card) => <article>{card.id}</article>}
      />,
    )
    await act(async () => undefined)

    const scrollArea = container.querySelector<HTMLElement>('[data-kanban-board-scroll-area]')
    const viewport = scrollArea?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    expect(scrollArea).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect(scrollArea?.className).toContain('cursor-default')
    expect(scrollArea?.className).not.toContain('cursor-grab')
    expect(container.querySelector('[data-kanban-card-draggable]')).toBeNull()

    Object.defineProperties(viewport!, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 900 },
    })
    fireEvent.pointerDown(viewport!, {
      button: 0,
      clientX: 200,
      clientY: 20,
      isPrimary: true,
      pointerId: 1,
    })
    fireEvent.pointerMove(viewport!, {
      buttons: 1,
      clientX: 100,
      clientY: 20,
      isPrimary: true,
      pointerId: 1,
    })

    expect(viewport?.scrollLeft).toBe(0)
    expect(scrollArea?.hasAttribute('data-drag-scrolling')).toBeFalse()
  })
})
