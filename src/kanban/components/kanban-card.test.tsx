import { afterEach, describe, expect, test } from 'bun:test'

await import('../../test/dom')

const { cleanup, render, screen } = await import('@testing-library/react')
const { KanbanCard } = await import('./kanban-card')
const { KanbanCardSkeleton } = await import('./kanban-card-skeleton')

afterEach(cleanup)

describe('KanbanCard', () => {
  test('forwards card props and keeps article semantics', () => {
    render(
      <KanbanCard className="audit-marker" data-testid="card" dimmed>
        Conteúdo
      </KanbanCard>,
    )

    const card = screen.getByTestId('card')

    expect(card.tagName).toBe('ARTICLE')
    expect(card.getAttribute('data-slot')).toBe('card')
    expect(card.className).toContain('audit-marker')
    expect(card.className).toContain('opacity-70')
  })

  test('applies layout overrides to the content slot', () => {
    render(<KanbanCard contentClassName="grid gap-3">Conteúdo</KanbanCard>)

    const content = screen.getByText('Conteúdo')

    expect(content.getAttribute('data-slot')).toBe('card-panel')
    expect(content.className).toContain('grid')
    expect(content.className).toContain('gap-3')
  })

  test('contains intrinsically wide consumer content inside the card width', () => {
    render(
      <KanbanCard data-testid="card">
        <span className="whitespace-nowrap">tag-with-an-extremely-long-unbroken-value</span>
      </KanbanCard>,
    )

    const card = screen.getByTestId('card')
    const content = screen.getByText('tag-with-an-extremely-long-unbroken-value').parentElement!

    expect(card.className).toContain('min-w-0')
    expect(card.className).toContain('max-w-full')
    expect(card.className).toContain('overflow-hidden')
    expect(content.className).toContain('min-w-0')
    expect(content.className).toContain('max-w-full')
  })

  test('allows composed card sections to remain direct children', () => {
    render(
      <KanbanCard renderContent={false}>
        <div data-testid="section">Conteúdo composto</div>
      </KanbanCard>,
    )

    const section = screen.getByTestId('section')

    expect(section.parentElement?.getAttribute('data-slot')).toBe('card')
  })
})

describe('KanbanCardSkeleton', () => {
  test('renders a passive, accessible loading placeholder with the card dimensions', () => {
    const { container } = render(
      <KanbanCardSkeleton className="loading-card" label="Carregando tarefa" />,
    )

    const card = screen.getByRole('status', { name: 'Carregando tarefa' })
    const placeholders = container.querySelectorAll('[data-slot="skeleton"]')

    expect(card.tagName).toBe('ARTICLE')
    expect(card.getAttribute('aria-busy')).toBe('true')
    expect(card.className).toContain('loading-card')
    expect(card.className).toContain('pointer-events-none')
    expect(placeholders.length).toBe(4)
    expect(placeholders[0]?.className).toContain('animate-skeleton')
  })
})
