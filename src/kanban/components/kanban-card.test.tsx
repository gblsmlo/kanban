import { afterEach, describe, expect, test } from 'bun:test'

await import('../../test/dom')

const { cleanup, render, screen } = await import('@testing-library/react')
const { KanbanCard } = await import('./kanban-card')

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
    expect(card.className).toContain('audit-marker')
    expect(card.className).toContain('opacity-70')
    expect(card.getAttribute('data-density')).toBe('sm')
  })

  test('applies layout overrides to the content slot', () => {
    render(<KanbanCard contentClassName="grid gap-3">Conteúdo</KanbanCard>)

    const content = screen.getByText('Conteúdo')

    expect(content.getAttribute('data-slot')).toBe('card-panel')
    expect(content.className).toContain('grid')
    expect(content.className).toContain('gap-3')
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
