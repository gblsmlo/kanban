import { afterEach, describe, expect, test } from 'bun:test'

await import('../../test/dom')

const { act, cleanup, fireEvent, render, screen, waitFor } = await import('@testing-library/react')
const {
  KanbanCard,
  KanbanCardAction,
  KanbanCardContent,
  KanbanCardDescription,
  KanbanCardFooter,
  KanbanCardHeader,
  KanbanCardTitle,
} = await import('./kanban-card')
const { KanbanCardSkeleton } = await import('./kanban-card-skeleton')
const consumerApi = await import('../index')

afterEach(cleanup)

describe('KanbanCard', () => {
  test('exposes only the Kanban-owned card composition to consumers', () => {
    const publicComponents = [
      'KanbanCard',
      'KanbanCardAction',
      'KanbanCardContent',
      'KanbanCardDescription',
      'KanbanCardFooter',
      'KanbanCardHeader',
      'KanbanCardTitle',
    ]
    const internalComponents = [
      'Card',
      'CardAction',
      'CardContent',
      'CardDescription',
      'CardFooter',
      'CardHeader',
      'CardPanel',
      'CardTitle',
    ]

    for (const componentName of publicComponents) {
      expect(consumerApi).toHaveProperty(componentName)
    }
    for (const componentName of internalComponents) {
      expect(consumerApi).not.toHaveProperty(componentName)
    }
  })

  test('forwards card props and keeps article semantics', () => {
    render(
      <KanbanCard className="audit-marker" data-testid="card" dimmed>
        <KanbanCardHeader>
          <KanbanCardTitle>Conteúdo</KanbanCardTitle>
        </KanbanCardHeader>
      </KanbanCard>,
    )

    const card = screen.getByTestId('card')

    expect(card.tagName).toBe('ARTICLE')
    expect(card.getAttribute('data-slot')).toBe('card')
    expect(card.className).toContain('audit-marker')
    expect(card.className).toContain('opacity-70')
  })

  test('preserves canonical COSS sections as direct children', () => {
    render(
      <KanbanCard data-testid="card">
        <KanbanCardHeader data-testid="header">
          <KanbanCardTitle className="text-sm">Título</KanbanCardTitle>
          <KanbanCardDescription>Descrição</KanbanCardDescription>
          <KanbanCardAction data-testid="action">Ação</KanbanCardAction>
        </KanbanCardHeader>
        <KanbanCardContent data-testid="content">Conteúdo</KanbanCardContent>
        <KanbanCardFooter data-testid="footer">Rodapé</KanbanCardFooter>
      </KanbanCard>,
    )

    const card = screen.getByTestId('card')

    expect(Array.from(card.children).map((section) => section.getAttribute('data-slot'))).toEqual([
      'card-header',
      'card-panel',
      'card-footer',
    ])
    expect(screen.getByText('Título').className).toContain('text-sm')
    expect(screen.getByTestId('action').getAttribute('data-slot')).toBe('card-action')
    expect(screen.getByTestId('action').parentElement).toBe(screen.getByTestId('header'))
  })

  test('contains intrinsically wide consumer content inside the card width', () => {
    render(
      <KanbanCard data-testid="card">
        <KanbanCardContent>
          <span className="min-w-0 max-w-full whitespace-nowrap">
            tag-with-an-extremely-long-unbroken-value
          </span>
        </KanbanCardContent>
      </KanbanCard>,
    )

    const card = screen.getByTestId('card')

    expect(card.className).toContain('min-w-0')
    expect(card.className).toContain('max-w-full')
    expect(card.className).toContain('overflow-hidden')
  })

  test('keeps full as the default display while consumers control compact content', () => {
    const { rerender } = render(
      <KanbanCard data-testid="card">
        <KanbanCardHeader>
          <KanbanCardTitle>Título</KanbanCardTitle>
          <KanbanCardDescription>Descrição detalhada</KanbanCardDescription>
          <div data-compact-visible="false" data-testid="compact-metadata" hidden>
            Consumer content
          </div>
        </KanbanCardHeader>
        <KanbanCardContent>Conteúdo completo</KanbanCardContent>
        <KanbanCardFooter>Rodapé completo</KanbanCardFooter>
      </KanbanCard>,
    )

    const card = screen.getByTestId('card')
    const compactMetadata = screen.getByTestId('compact-metadata')

    expect(card.getAttribute('data-display')).toBe('full')
    expect(compactMetadata.getAttribute('data-compact-visible')).toBe('false')
    expect(compactMetadata.querySelector('[data-slot="tooltip-trigger"]')).toBeNull()

    rerender(
      <KanbanCard data-testid="card" display="compact">
        <KanbanCardHeader>
          <KanbanCardTitle>Título</KanbanCardTitle>
          <KanbanCardDescription>Descrição detalhada</KanbanCardDescription>
          <div data-compact-visible="true" data-testid="compact-metadata">
            Consumer content
          </div>
        </KanbanCardHeader>
        <KanbanCardContent>Conteúdo completo</KanbanCardContent>
        <KanbanCardFooter>Rodapé completo</KanbanCardFooter>
      </KanbanCard>,
    )

    expect(card.getAttribute('data-display')).toBe('compact')
    expect(compactMetadata.getAttribute('data-compact-visible')).toBe('true')
    expect(compactMetadata.textContent).toContain('Consumer content')
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
    expect(placeholders.length).toBe(6)
    expect(placeholders[0]?.className).toContain('animate-skeleton')
    expect(Array.from(card.children).map((section) => section.getAttribute('data-slot'))).toEqual([
      'card-header',
      'card-panel',
      'card-footer',
    ])
  })

  test('matches the compact card geometry when requested', () => {
    const { container } = render(
      <KanbanCardSkeleton display="compact" label="Carregando tarefa compacta" />,
    )

    const card = screen.getByRole('status', { name: 'Carregando tarefa compacta' })
    const placeholders = container.querySelectorAll('[data-slot="skeleton"]')

    expect(card.getAttribute('data-display')).toBe('compact')
    expect(placeholders).toHaveLength(5)
    expect(card.children[1]?.hasAttribute('hidden')).toBeTrue()
    expect(card.children[2]?.hasAttribute('hidden')).toBeTrue()
  })
})
