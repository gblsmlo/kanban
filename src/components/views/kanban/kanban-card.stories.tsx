import type { Meta, StoryObj } from '@storybook/react-vite'
import { TagIcon } from 'lucide-react'
import { expect, waitFor, within } from 'storybook/test'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'

import {
  KanbanBadge,
  KanbanCard,
  KanbanCardContent,
  KanbanCardDescription,
  type KanbanCardDisplay,
  KanbanCardFooter,
  KanbanCardHeader,
  KanbanCardSkeleton,
  KanbanCardTitle,
} from './'

interface ExampleCard {
  assignee: string
  creator: string
  date: string
  id: string
  label: string
  labels: string[]
  priority: string
  summary: string
  tags: string[]
}

const cards: ExampleCard[] = [
  {
    assignee: 'Ana',
    creator: 'Gabriel',
    date: 'Today',
    id: 'record-1',
    label: 'Define the public contract',
    labels: ['API'],
    priority: 'High',
    summary: 'Describe the data and callbacks owned by the consumer.',
    tags: ['API'],
  },
  {
    assignee: 'Bruno',
    creator: 'Marina',
    date: 'This week',
    id: 'record-2',
    label: 'Validate keyboard drag',
    labels: ['A11y'],
    priority: 'Urgent',
    summary: 'Keep movement accessible without nesting interactive controls.',
    tags: ['A11y', 'Keyboard'],
  },
  {
    assignee: 'Casey',
    creator: 'Gabriel',
    date: 'Later',
    id: 'record-3',
    label: 'Document composition',
    labels: ['Docs'],
    priority: 'Medium',
    summary: 'Show how products provide their own card content.',
    tags: ['Docs', 'Composition', 'API'],
  },
  {
    assignee: 'Ana',
    creator: 'Priya',
    date: 'This week',
    id: 'record-4',
    label: 'Persist card priority',
    labels: ['State'],
    priority: 'High',
    summary: 'Apply the requested target index in the consumer data source.',
    tags: ['State management', 'High priority', 'Optimistic interface', 'Cache synchronization'],
  },
]

function ExampleCardView({
  card,
  display = 'full',
}: Readonly<{
  card: ExampleCard
  display?: KanbanCardDisplay
}>) {
  return (
    <KanbanCard display={display}>
      <KanbanCardHeader>
        <KanbanCardTitle className="text-sm leading-normal">{card.label}</KanbanCardTitle>
        <KanbanCardDescription className="text-xs leading-5">{card.summary}</KanbanCardDescription>
        <CompactMetadata display={display} date={card.date} tags={card.tags} />
      </KanbanCardHeader>
      <KanbanCardContent>
        <ul
          aria-label={`Tags de ${card.label}`}
          className="flex min-w-0 max-w-full flex-wrap gap-1.5"
        >
          {card.tags.map((tag) => (
            <li className="min-w-0 max-w-full" key={tag} title={tag}>
              <KanbanBadge className="max-w-full overflow-hidden">
                <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {tag}
                </span>
              </KanbanBadge>
            </li>
          ))}
        </ul>
      </KanbanCardContent>
      <KanbanCardFooter className="justify-between gap-3 text-muted-foreground text-xs">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="truncate">{card.assignee}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="truncate">{card.date}</span>
        </span>
      </KanbanCardFooter>
    </KanbanCard>
  )
}

function CompactMetadata({
  date,
  display,
  tags,
}: Readonly<{ date: string; display: KanbanCardDisplay; tags: readonly string[] }>) {
  if (display !== 'compact') return null

  return (
    <div
      className="inline-flex min-w-0 shrink items-center gap-2 text-muted-foreground text-xs"
      data-compact-visible="true"
      data-slot="consumer-compact-metadata"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label={`${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}`}
              data-kanban-card-action=""
              size="xs"
              variant="ghost"
            />
          }
        >
          <TagIcon aria-hidden="true" />
          <span aria-hidden="true">{tags.length}</span>
        </TooltipTrigger>
        <TooltipPopup>
          <div>
            <span className="font-medium">Tags:</span> {tags.join(', ')}
          </div>
        </TooltipPopup>
      </Tooltip>
      <span className="inline-flex min-w-0 items-center gap-1" data-slot="kanban-card-compact-date">
        <span className="sr-only">Date: </span>
        <span className="truncate">{date}</span>
      </span>
    </div>
  )
}

function renderCard(card: ExampleCard, display: KanbanCardDisplay = 'full') {
  return (
    <div className="w-full max-w-sm px-4 py-6">
      <ExampleCardView card={card} display={display} />
    </div>
  )
}

const meta = {
  component: KanbanCard,
  title: 'Patterns/Card',
} satisfies Meta

export default meta
type Story = StoryObj

function expectTaglessLayout(canvasElement: HTMLElement, expectedTagCount: number) {
  return async () => {
    const card = within(canvasElement).getByRole('article')
    const tags = within(card).getAllByRole('listitem')

    await expect(tags).toHaveLength(expectedTagCount)
    for (const tag of tags) {
      const tagText = tag.querySelector<HTMLElement>('[data-slot="badge"] > span')

      await expect(tagText).not.toBeNull()
      await expect(window.getComputedStyle(tagText!).whiteSpace).toBe('nowrap')
    }
  }
}

export const OneTag: Story = {
  play: async ({ canvasElement }) => {
    await expectTaglessLayout(canvasElement, 1)()
    await expect(within(canvasElement).getAllByRole('article')[0]).not.toBeNull()
  },
  render: () => renderCard(cards[0]!),
}

export const TwoTags: Story = {
  play: async ({ canvasElement }) => {
    await expectTaglessLayout(canvasElement, 2)()
  },
  render: () => renderCard(cards[1]!),
}

export const ThreeTags: Story = {
  play: async ({ canvasElement }) => {
    await expectTaglessLayout(canvasElement, 3)()
  },
  render: () => renderCard(cards[2]!),
}

export const FourTags: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tags = canvas.getAllByRole('listitem')

    await expectTaglessLayout(canvasElement, 4)()
    await waitFor(() =>
      expect(tags[3]!.getBoundingClientRect().top).toBeGreaterThan(
        tags[0]!.getBoundingClientRect().top,
      ),
    )
  },
  render: () => renderCard(cards[3]!),
}

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('status')).toHaveLength(1)
  },
  render: () => (
    <div className="w-full max-w-sm px-4 py-6">
      <KanbanCardSkeleton label="Carregando card de exemplo" />
    </div>
  ),
}

export const Full: Story = {
  render: () => renderCard(cards[3]!, 'full'),
}

export const Compact: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const metadata = canvas.getByLabelText('4 tags')
    const card = canvas.getByRole('article')
    const date = card.querySelector('[data-slot="kanban-card-compact-date"]')

    if (!date) throw new Error('Visible compact date not found')

    await expect(card).toHaveAttribute('data-display', 'compact')
    await expect(canvas.getByText(cards[3]!.summary)).not.toBeVisible()
    await expect(metadata).toBeVisible()
    await expect(date).toBeVisible()
    await expect(date).toHaveTextContent('This week')
  },
  render: () => renderCard(cards[3]!, 'compact'),
}
