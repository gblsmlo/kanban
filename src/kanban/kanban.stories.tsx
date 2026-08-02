import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { useState } from 'react'

import {
  KanbanBadge,
  KanbanCard,
  KanbanCardSkeleton,
  type KanbanCardMove,
  type KanbanColumnData,
  KanbanView,
} from './'

interface ExampleCard {
  id: string
  label: string
  summary: string
  tag: string
}

const cards: ExampleCard[] = [
  {
    id: 'record-1',
    label: 'Define the public contract',
    summary: 'Describe the data and callbacks owned by the consumer.',
    tag: 'API',
  },
  {
    id: 'record-2',
    label: 'Validate keyboard drag',
    summary: 'Keep movement accessible without nesting interactive controls.',
    tag: 'A11y',
  },
  {
    id: 'record-3',
    label: 'Document composition',
    summary: 'Show how products provide their own card content.',
    tag: 'Docs',
  },
  {
    id: 'record-4',
    label: 'Persist card priority',
    summary: 'Apply the requested target index in the consumer data source.',
    tag: 'State',
  },
  {
    id: 'record-5',
    label: 'Review release evidence',
    summary: 'Confirm the package remains domain-neutral and accessible.',
    tag: 'QA',
  },
]

const initialColumns: KanbanColumnData<ExampleCard>[] = [
  {
    cards: [cards[0]!, cards[1]!, cards[2]!],
    count: 3,
    id: 'backlog',
    title: 'Backlog',
  },
  {
    cards: [cards[3]!],
    count: 1,
    id: 'in-review',
    title: 'In review',
  },
  {
    cards: [cards[4]!],
    count: 1,
    id: 'done',
    title: 'Done',
  },
]

function moveCard(
  columns: KanbanColumnData<ExampleCard>[],
  move: KanbanCardMove<ExampleCard>,
): KanbanColumnData<ExampleCard>[] {
  const next = columns.map((column) => ({ ...column, cards: [...column.cards] }))
  const source = next.find((column) => column.id === move.sourceColumnId)
  const target = next.find((column) => column.id === move.targetColumnId)
  if (!source || !target) return columns

  const sourceIndex = source.cards.findIndex((card) => card.id === move.cardId)
  if (sourceIndex < 0) return columns

  const [card] = source.cards.splice(sourceIndex, 1)
  if (!card) return columns
  const targetIndex = Math.max(
    0,
    Math.min(move.targetIndex ?? target.cards.length, target.cards.length),
  )
  target.cards.splice(targetIndex, 0, card)

  return next.map((column) => ({ ...column, count: column.cards.length }))
}

function ExampleCardView({ card }: Readonly<{ card: ExampleCard }>) {
  return (
    <KanbanCard>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-sm">{card.label}</p>
          <KanbanBadge>{card.tag}</KanbanBadge>
        </div>
        <p className="text-muted-foreground text-xs leading-5">{card.summary}</p>
      </div>
    </KanbanCard>
  )
}

function InteractiveBoard() {
  const [columns, setColumns] = useState(initialColumns)

  return (
    <div className="h-[560px] min-h-0 p-4">
      <KanbanView
        columns={columns}
        getCardLabel={(card) => card.label}
        getKey={(card) => card.id}
        mobileStageHint="Select a column to inspect its cards on small screens."
        onMoveCard={(move) => {
          setColumns((current) => moveCard(current, move))
          return true
        }}
        renderCard={(card) => <ExampleCardView card={card} />}
      />
    </div>
  )
}

function visibleCardLabels(canvasElement: HTMLElement): string[] {
  return Array.from(
    canvasElement.querySelectorAll<HTMLElement>('[data-kanban-card-draggable]'),
  ).map((card) => card.getAttribute('aria-label') ?? '')
}

const meta = {
  component: KanbanView,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Patterns/Kanban',
} satisfies Meta

export default meta
type Story = StoryObj
type CardStory = StoryObj<{ loading?: boolean }>

export const Board: Story = {
  play: async ({ canvasElement }) => {
    await expect(visibleCardLabels(canvasElement).slice(0, 3)).toEqual([
      'Mover card Define the public contract',
      'Mover card Validate keyboard drag',
      'Mover card Document composition',
    ])
  },
  render: () => <InteractiveBoard />,
}

export const Card: CardStory = {
  args: {
    loading: false,
  },
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Substitui o conteúdo pelo card skeleton durante o carregamento.',
    },
  },
  render: ({ loading = false }) => (
    <div className="w-full max-w-sm p-4">
      {loading ? (
        <KanbanCardSkeleton label="Carregando card do board" />
      ) : (
        <ExampleCardView card={cards[0]!} />
      )}
    </div>
  ),
}

export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-kanban-board-viewport]')

    await expect(viewport).not.toBeNull()
    await expect(viewport).toHaveClass('cursor-default')
    await expect(viewport).not.toHaveClass('cursor-grab')
    await expect(canvasElement.querySelectorAll('[data-kanban-card-draggable]')).toHaveLength(0)
    await expect(window.getComputedStyle(viewport!).cursor).toBe('default')
  },
  render: () => (
    <div className="h-[560px] min-h-0 p-4">
      <KanbanView
        columns={initialColumns}
        getKey={(card) => card.id}
        renderCard={(card) => <ExampleCardView card={card} />}
      />
    </div>
  ),
}
