import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ArrowUpDownIcon,
  BellIcon,
  CalendarIcon,
  CircleDotIcon,
  FilterIcon,
  Rows3Icon,
  RotateCcwIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  TagIcon,
  UserIcon,
  UserPlusIcon,
  type LucideIcon,
} from 'lucide-react'
import { expect, userEvent, within } from 'storybook/test'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from '@/components/ui/menu'
import { Toolbar as CossToolbar, ToolbarButton, ToolbarGroup } from '@/components/ui/toolbar'
import {
  KanbanBadge,
  KanbanCard,
  KanbanCardSkeleton,
  type KanbanCardMove,
  type KanbanColumnData,
  KanbanView,
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
  tag: string
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
    tag: 'API',
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
    tag: 'A11y',
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
    tag: 'Docs',
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
    tag: 'State',
  },
  {
    assignee: 'Dana',
    creator: 'Marina',
    date: 'Later',
    id: 'record-5',
    label: 'Review release evidence',
    labels: ['QA'],
    priority: 'Low',
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

const orderingColumns: KanbanColumnData<ExampleCard>[] = [
  {
    cards,
    count: cards.length,
    id: 'backlog',
    title: 'Backlog',
  },
  {
    cards: [],
    count: 0,
    id: 'done',
    title: 'Done',
  },
]

const toolbarColumns: KanbanColumnData<ExampleCard>[] = [
  {
    cards: [cards[0]!],
    count: 1,
    id: 'backlog',
    title: 'Backlog',
  },
  {
    cards: [cards[1]!],
    count: 1,
    id: 'todo',
    title: 'Todo',
  },
  {
    cards: [cards[2]!],
    count: 1,
    id: 'in-progress',
    title: 'In Progress',
  },
  {
    cards: [cards[3]!],
    count: 1,
    id: 'in-review',
    title: 'In Review',
  },
  {
    cards: [cards[4]!],
    count: 1,
    id: 'done',
    title: 'Done',
  },
]

type BoardFilterKey = 'assignee' | 'creator' | 'date' | 'labels' | 'priority' | 'status'
type BoardFilters = Record<BoardFilterKey, string[]>

interface BoardFilterDefinition {
  icon: LucideIcon
  key: BoardFilterKey
  label: string
  options: string[]
}

const emptyBoardFilters: BoardFilters = {
  assignee: [],
  creator: [],
  date: [],
  labels: [],
  priority: [],
  status: [],
}

const boardFilterDefinitions: BoardFilterDefinition[] = [
  {
    icon: CircleDotIcon,
    key: 'status',
    label: 'Status',
    options: ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'],
  },
  {
    icon: UserIcon,
    key: 'assignee',
    label: 'Assignee',
    options: ['Ana', 'Bruno', 'Casey', 'Dana'],
  },
  {
    icon: UserPlusIcon,
    key: 'creator',
    label: 'Creator',
    options: ['Gabriel', 'Marina', 'Priya'],
  },
  {
    icon: ArrowUpDownIcon,
    key: 'priority',
    label: 'Priority',
    options: ['Urgent', 'High', 'Medium', 'Low'],
  },
  {
    icon: TagIcon,
    key: 'labels',
    label: 'Labels',
    options: ['API', 'A11y', 'Docs', 'State', 'QA'],
  },
  {
    icon: CalendarIcon,
    key: 'date',
    label: 'Date',
    options: ['Today', 'This week', 'Later'],
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
          <Button
            aria-label={`Open ${card.label}`}
            className="h-auto min-w-0 justify-start border-0 p-0 text-left font-medium text-sm"
            onClick={() => undefined}
            variant="link"
          >
            {card.label}
          </Button>
          <KanbanBadge>{card.tag}</KanbanBadge>
        </div>
        <p className="text-muted-foreground text-xs leading-5">{card.summary}</p>
      </div>
    </KanbanCard>
  )
}

function InteractiveBoard() {
  const [columns, setColumns] = useState(orderingColumns)

  return (
    <div className="grid h-[560px] min-h-0 grid-rows-[auto_1fr] gap-2 p-4">
      <div className="flex justify-end">
        <Button onClick={() => setColumns(orderingColumns)} size="sm" variant="secondary">
          <RotateCcwIcon aria-hidden="true" />
          Restore order
        </Button>
      </div>
      <div className="min-h-0">
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
    </div>
  )
}

function toggleBoardFilter(
  filters: BoardFilters,
  key: BoardFilterKey,
  value: string,
): BoardFilters {
  const currentValues = filters[key]
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues, value]

  return { ...filters, [key]: nextValues }
}

function filterBoardColumns(
  columns: KanbanColumnData<ExampleCard>[],
  filters: BoardFilters,
): KanbanColumnData<ExampleCard>[] {
  return columns.map((column) => {
    const cards = column.cards.filter((card) => {
      if (filters.status.length && !filters.status.includes(column.title)) return false
      if (filters.assignee.length && !filters.assignee.includes(card.assignee)) return false
      if (filters.creator.length && !filters.creator.includes(card.creator)) return false
      if (filters.priority.length && !filters.priority.includes(card.priority)) return false
      if (filters.date.length && !filters.date.includes(card.date)) return false
      if (filters.labels.length && !card.labels.some((label) => filters.labels.includes(label))) {
        return false
      }

      return true
    })

    return { ...column, cards, count: cards.length }
  })
}

function FilterSubmenu({
  definition,
  filters,
  onToggle,
}: Readonly<{
  definition: BoardFilterDefinition
  filters: BoardFilters
  onToggle: (key: BoardFilterKey, value: string) => void
}>) {
  const Icon = definition.icon

  return (
    <MenuSub>
      <MenuSubTrigger>
        <Icon aria-hidden="true" />
        {definition.label}
      </MenuSubTrigger>
      <MenuSubPopup>
        <MenuGroup>
          <MenuGroupLabel>{definition.label}</MenuGroupLabel>
          {definition.options.map((option) => (
            <MenuCheckboxItem
              checked={filters[definition.key].includes(option)}
              closeOnClick={false}
              key={option}
              onCheckedChange={() => onToggle(definition.key, option)}
            >
              {option}
            </MenuCheckboxItem>
          ))}
        </MenuGroup>
      </MenuSubPopup>
    </MenuSub>
  )
}

function FilterMenu({
  filters,
  onClear,
  onToggle,
}: Readonly<{
  filters: BoardFilters
  onClear: () => void
  onToggle: (key: BoardFilterKey, value: string) => void
}>) {
  const activeFilterCount = Object.values(filters).reduce(
    (total, values) => total + values.length,
    0,
  )

  return (
    <Menu>
      <MenuTrigger render={<ToolbarButton render={<Button variant="secondary" />} />}>
        <FilterIcon aria-hidden="true" />
        {activeFilterCount ? `Filter (${activeFilterCount})` : 'Filter'}
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuGroup>
          <MenuGroupLabel>Filter board</MenuGroupLabel>
          {boardFilterDefinitions.map((definition) => (
            <FilterSubmenu
              definition={definition}
              filters={filters}
              key={definition.key}
              onToggle={onToggle}
            />
          ))}
        </MenuGroup>
        <MenuSeparator />
        <MenuItem disabled={!activeFilterCount} onClick={onClear}>
          <RotateCcwIcon aria-hidden="true" />
          Clear filters
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}

function SettingsMenu({ onReset }: Readonly<{ onReset: () => void }>) {
  return (
    <Menu>
      <MenuTrigger render={<ToolbarButton render={<Button variant="secondary" />} />}>
        <SettingsIcon aria-hidden="true" />
        Settings
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuGroup>
          <MenuGroupLabel>Board settings</MenuGroupLabel>
          <MenuItem>
            <SlidersHorizontalIcon aria-hidden="true" />
            Board preferences
          </MenuItem>
          <MenuItem>
            <BellIcon aria-hidden="true" />
            Notifications
          </MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              <Rows3Icon aria-hidden="true" />
              Card density
            </MenuSubTrigger>
            <MenuSubPopup>
              <MenuRadioGroup defaultValue="comfortable">
                <MenuRadioItem value="compact">Compact</MenuRadioItem>
                <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
                <MenuRadioItem value="spacious">Spacious</MenuRadioItem>
              </MenuRadioGroup>
            </MenuSubPopup>
          </MenuSub>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem onClick={onReset}>
          <RotateCcwIcon aria-hidden="true" />
          Reset filters
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}

function ToolbarBoard() {
  const [columns, setColumns] = useState(toolbarColumns)
  const [filters, setFilters] = useState(emptyBoardFilters)
  const filteredColumns = useMemo(() => filterBoardColumns(columns, filters), [columns, filters])
  const resetFilters = () => setFilters(emptyBoardFilters)

  return (
    <div className="grid h-[640px] min-h-0 min-w-0 grid-rows-[auto_1fr] gap-3 p-4">
      <CossToolbar aria-label="Board toolbar">
        <ToolbarGroup aria-label="Board context" data-toolbar-side="left">
          <div className="min-w-0 px-1">
            <h1 className="truncate font-semibold text-sm">Product delivery</h1>
            <p className="text-muted-foreground text-xs">5 workflow stages</p>
          </div>
        </ToolbarGroup>

        <div aria-hidden="true" className="flex-1" />

        <ToolbarGroup aria-label="Board actions" data-toolbar-side="right">
          <FilterMenu
            filters={filters}
            onClear={resetFilters}
            onToggle={(key, value) =>
              setFilters((currentFilters) => toggleBoardFilter(currentFilters, key, value))
            }
          />
          <SettingsMenu onReset={resetFilters} />
        </ToolbarGroup>
      </CossToolbar>

      <div className="min-h-0 min-w-0">
        <KanbanView
          columns={filteredColumns}
          getCardLabel={(card) => card.label}
          getKey={(card) => card.id}
          mobileStageHint="Select a workflow stage."
          onMoveCard={(move) => {
            setColumns((current) => moveCard(current, move))
            return true
          }}
          renderCard={(card) => <ExampleCardView card={card} />}
        />
      </div>
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
    const canvas = within(canvasElement)
    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual([
      'Mover card Define the public contract',
      'Mover card Validate keyboard drag',
      'Mover card Document composition',
      'Mover card Persist card priority',
      'Mover card Review release evidence',
    ])

    const thirdCard = canvas.getByRole('button', { name: 'Open Document composition' })
    thirdCard.focus()
    await expect(thirdCard).toHaveFocus()
    await userEvent.keyboard('[Space]')
    await userEvent.keyboard('[ArrowUp]')
    await userEvent.keyboard('[Space]')
    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual([
      'Mover card Define the public contract',
      'Mover card Document composition',
      'Mover card Validate keyboard drag',
      'Mover card Persist card priority',
      'Mover card Review release evidence',
    ])

    await userEvent.click(canvas.getByRole('button', { name: 'Restore order' }))
    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual([
      'Mover card Define the public contract',
      'Mover card Validate keyboard drag',
      'Mover card Document composition',
      'Mover card Persist card priority',
      'Mover card Review release evidence',
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
    const scrollArea = canvasElement.querySelector<HTMLElement>('[data-kanban-board-scroll-area]')
    const viewport = scrollArea?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')

    await expect(scrollArea).not.toBeNull()
    await expect(viewport).not.toBeNull()
    await expect(scrollArea?.className).toContain('cursor-default')
    await expect(scrollArea?.className).not.toContain('cursor-grab')
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

export const Toolbar: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const documentBody = within(canvasElement.ownerDocument.body)
    const toolbar = canvas.getByRole('toolbar', { name: 'Board toolbar' })
    const filterButton = canvas.getByRole('button', { name: 'Filter' })
    const settingsButton = canvas.getByRole('button', { name: 'Settings' })
    const columnTitles = canvas
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)

    await expect(toolbar.querySelector('[data-toolbar-side="left"]')).not.toBeNull()
    await expect(toolbar.querySelector('[data-toolbar-side="right"]')).not.toBeNull()
    await expect(columnTitles).toEqual(['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'])
    await expect(filterButton).toHaveClass('bg-secondary')
    await expect(settingsButton).toHaveClass('bg-secondary')

    await userEvent.click(filterButton)
    const statusSubmenu = await documentBody.findByRole('menuitem', { name: 'Status' })

    for (const field of ['Status', 'Assignee', 'Creator', 'Priority', 'Labels', 'Date']) {
      const menuItem = documentBody.getByRole('menuitem', { name: field })

      await expect(menuItem).toBeVisible()
      await expect(menuItem.querySelector('svg')).not.toBeNull()
    }

    await userEvent.hover(statusSubmenu)
    await userEvent.click(await documentBody.findByRole('menuitemcheckbox', { name: 'Todo' }))

    await expect(filterButton).toHaveTextContent('Filter (1)')

    for (const [field, option] of [
      ['Assignee', 'Bruno'],
      ['Creator', 'Marina'],
      ['Priority', 'Urgent'],
      ['Labels', 'A11y'],
      ['Date', 'This week'],
    ] as const) {
      await userEvent.hover(documentBody.getByRole('menuitem', { name: field }))
      await userEvent.click(await documentBody.findByRole('menuitemcheckbox', { name: option }))
    }

    await expect(filterButton).toHaveTextContent('Filter (6)')
    await expect(visibleCardLabels(canvasElement)).toEqual(['Mover card Validate keyboard drag'])

    await userEvent.keyboard('{Escape}{Escape}')
    await userEvent.click(settingsButton)

    await expect(await documentBody.findByText('Board settings')).toBeVisible()
    for (const setting of ['Board preferences', 'Notifications', 'Card density']) {
      const menuItem = documentBody.getByRole('menuitem', { name: setting })

      await expect(menuItem).toBeVisible()
      await expect(menuItem.querySelector('svg')).not.toBeNull()
    }

    await userEvent.click(documentBody.getByRole('menuitem', { name: 'Reset filters' }))

    await expect(filterButton).toHaveTextContent('Filter')
    await expect(visibleCardLabels(canvasElement)).toHaveLength(5)
  },
  render: () => <ToolbarBoard />,
}
