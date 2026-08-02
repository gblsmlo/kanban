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
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
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
    tag: 'API contract requiring backwards-compatible migration planning',
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

function cloneColumns(columns: KanbanColumnData<ExampleCard>[]): KanbanColumnData<ExampleCard>[] {
  return columns.map((column) => ({ ...column, cards: [...column.cards] }))
}

function ExampleCardView({ card }: Readonly<{ card: ExampleCard }>) {
  return (
    <KanbanCard>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 font-medium text-sm">{card.label}</p>
          <div
            className="min-w-0 max-w-[50%]"
            data-long-tag={card.tag.length > 20 ? '' : undefined}
            title={card.tag}
          >
            <KanbanBadge className="max-w-full overflow-hidden">
              <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {card.tag}
              </span>
            </KanbanBadge>
          </div>
        </div>
        <p className="text-muted-foreground text-xs leading-5">{card.summary}</p>
      </div>
    </KanbanCard>
  )
}

type PersistenceExample = 'accept' | 'reject' | 'stale-cache'

function InteractiveBoard() {
  const [columns, setColumns] = useState(toolbarColumns)
  const [columnAction, setColumnAction] = useState('Nenhuma ação executada')

  return (
    <div className="h-[560px] min-h-0 p-4">
      <KanbanView
        columns={columns}
        getCardLabel={(card) => card.label}
        getColumnActions={(column) =>
          column.id === 'backlog'
            ? {
                onAddCard: (columnId) => setColumnAction(`Adicionar em ${columnId}`),
                onOpenSettings: (columnId) => setColumnAction(`Configurar ${columnId}`),
              }
            : undefined
        }
        getKey={(card) => card.id}
        mobileStageHint="Select a column to inspect its cards on small screens."
        onMoveCard={(move) => {
          setColumns((current) => moveCard(current, move))
          return true
        }}
        renderCard={(card) => <ExampleCardView card={card} />}
      />
      <output className="sr-only" data-column-action="">
        {columnAction}
      </output>
    </div>
  )
}

function OrderingAcceptanceBoard({
  persistence = 'accept',
}: Readonly<{ persistence?: PersistenceExample }>) {
  const [columns, setColumns] = useState(orderingColumns)
  const [persistenceStatus, setPersistenceStatus] = useState('idle')
  const [columnAction, setColumnAction] = useState('Nenhuma ação executada')

  return (
    <div className="grid h-[560px] min-h-0 min-w-0 grid-rows-[1fr] p-4" style={{ width: 480 }}>
      <div className="min-h-0 min-w-0">
        <KanbanView
          columns={columns}
          getCardLabel={(card) => card.label}
          getColumnActions={(column) =>
            column.id === 'backlog'
              ? {
                  onAddCard: (columnId) => setColumnAction(`Adicionar em ${columnId}`),
                  onOpenSettings: (columnId) => setColumnAction(`Configurar ${columnId}`),
                }
              : undefined
          }
          getKey={(card) => card.id}
          mobileStageHint="Select a column to inspect its cards on small screens."
          onMoveCard={(move) => {
            if (persistence === 'accept') {
              setColumns((current) => moveCard(current, move))
              setPersistenceStatus('accepted')
              return true
            }

            const persistedColumns = moveCard(columns, move)
            setPersistenceStatus('pending')
            setColumns(cloneColumns(orderingColumns))

            return new Promise<boolean>((resolve) => {
              window.setTimeout(() => {
                const accepted = persistence === 'stale-cache'
                setColumns(accepted ? persistedColumns : cloneColumns(orderingColumns))
                setPersistenceStatus(accepted ? 'accepted' : 'rejected')
                resolve(accepted)
              }, 600)
            })
          }}
          renderCard={(card) => <ExampleCardView card={card} />}
        />
      </div>
      <output className="sr-only" data-column-action="">
        {columnAction}
      </output>
      <output className="sr-only" data-persistence-status="">
        {persistenceStatus}
      </output>
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

function visibleBoardColumns(canvasElement: HTMLElement) {
  return Array.from(canvasElement.querySelectorAll<HTMLElement>('section[aria-labelledby]'))
    .filter((column) => column.getClientRects().length > 0)
    .map((column) => ({
      cards: visibleCardLabels(column),
      title: column.querySelector('h2')?.textContent,
    }))
}

function draggableCard(canvasElement: HTMLElement, label: string): HTMLElement {
  const card = Array.from(
    canvasElement.querySelectorAll<HTMLElement>('[data-kanban-card-draggable]'),
  ).find((candidate) => candidate.getAttribute('aria-label') === label)

  if (!card) throw new Error(`Draggable card not found: ${label}`)
  return card
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()))
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
  render: () => <InteractiveBoard />,
}

export const BoardPresentationAcceptance: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(visibleBoardColumns(canvasElement)).toEqual([
      {
        cards: ['Mover card Define the public contract'],
        title: 'Backlog',
      },
      {
        cards: ['Mover card Validate keyboard drag'],
        title: 'Todo',
      },
      {
        cards: ['Mover card Document composition'],
        title: 'In Progress',
      },
      {
        cards: ['Mover card Persist card priority'],
        title: 'In Review',
      },
      {
        cards: ['Mover card Review release evidence'],
        title: 'Done',
      },
    ])
    await expect(canvas.queryByRole('button', { name: 'Restore order' })).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Configurar seção Backlog' })).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Adicionar item à seção Backlog' }),
    ).toBeVisible()
  },
  render: () => <InteractiveBoard />,
}

const initialOrderingLabels = [
  'Mover card Define the public contract',
  'Mover card Validate keyboard drag',
  'Mover card Document composition',
  'Mover card Persist card priority',
  'Mover card Review release evidence',
]

const prioritizedOrderingLabels = [
  'Mover card Define the public contract',
  'Mover card Document composition',
  'Mover card Validate keyboard drag',
  'Mover card Persist card priority',
  'Mover card Review release evidence',
]

async function moveThirdCardUpWithKeyboard(canvasElement: HTMLElement) {
  const thirdCard = draggableCard(canvasElement, 'Mover card Document composition')

  await waitFor(() => expect(thirdCard).toHaveAttribute('tabindex', '0'))
  thirdCard.focus()
  await expect(thirdCard).toHaveFocus()
  await userEvent.keyboard('[Space][ArrowUp][Space]')
}

export const PointerOrderingAcceptance: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const scrollArea = canvasElement.querySelector<HTMLElement>('[data-kanban-board-scroll-area]')
    const viewport = scrollArea?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    const longTag = canvasElement.querySelector<HTMLElement>('[data-long-tag]')!
    const card = longTag.closest<HTMLElement>('[data-slot="card"]')!
    const column = longTag.closest<HTMLElement>('section[aria-labelledby]')!
    const settings = canvas.getAllByRole('button', { name: 'Configurar seção Backlog' })[0]!
    const add = canvas.getAllByRole('button', { name: 'Adicionar item à seção Backlog' })[0]!
    const thirdCard = draggableCard(canvasElement, 'Mover card Document composition')
    const secondCard = draggableCard(canvasElement, 'Mover card Validate keyboard drag')
    const sourceRect = thirdCard.getBoundingClientRect()
    const targetRect = secondCard.getBoundingClientRect()
    const sourcePoint = {
      clientX: sourceRect.left + sourceRect.width / 2,
      clientY: sourceRect.top + sourceRect.height / 2,
    }
    const targetPoint = {
      clientX: targetRect.left + targetRect.width / 2,
      clientY: targetRect.top + targetRect.height / 4,
    }

    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual(initialOrderingLabels)
    await expect(scrollArea?.getAttribute('data-kanban-horizontal-scrollbar')).toBe('hidden')
    await expect(viewport).not.toBeNull()
    await waitFor(() =>
      expect(
        scrollArea?.querySelector(
          '[data-orientation="horizontal"][data-slot="scroll-area-scrollbar"]',
        ),
      ).not.toBeNull(),
    )
    const horizontalScrollbar = scrollArea!.querySelector<HTMLElement>(
      '[data-orientation="horizontal"][data-slot="scroll-area-scrollbar"]',
    )!
    await userEvent.hover(viewport!)
    await expect(scrollArea?.getAttribute('data-kanban-horizontal-scrollbar')).toBe('hidden')
    await expect(window.getComputedStyle(horizontalScrollbar!).opacity).toBe('0')
    await expect(window.getComputedStyle(horizontalScrollbar!).transitionDelay).toBe('0s')
    await expect(longTag.title).toBe(cards[0]!.tag)
    await expect(card.getBoundingClientRect().width).toBeLessThanOrEqual(
      column.getBoundingClientRect().width,
    )
    await expect(longTag.getBoundingClientRect().width).toBeLessThanOrEqual(
      card.getBoundingClientRect().width,
    )
    await expect(canvas.queryByRole('button', { name: 'Configurar seção Done' })).toBeNull()
    settings.focus()
    await expect(settings).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(canvasElement.querySelector('[data-column-action]')).toHaveTextContent(
      'Configurar backlog',
    )
    add.focus()
    await userEvent.keyboard('{Enter}')
    await expect(canvasElement.querySelector('[data-column-action]')).toHaveTextContent(
      'Adicionar em backlog',
    )
    await waitFor(() => expect(thirdCard).toHaveAttribute('tabindex', '0'))
    fireEvent.pointerDown(thirdCard, {
      ...sourcePoint,
      button: 0,
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    await nextAnimationFrame()
    fireEvent.pointerMove(thirdCard, {
      ...sourcePoint,
      buttons: 1,
      clientY: sourcePoint.clientY - 12,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    await waitFor(() => expect(thirdCard).toHaveAttribute('aria-grabbed', 'true'))
    fireEvent.pointerMove(secondCard, {
      ...targetPoint,
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    await nextAnimationFrame()
    fireEvent.pointerUp(secondCard, {
      ...targetPoint,
      button: 0,
      buttons: 0,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })

    await waitFor(() =>
      expect(canvasElement.querySelector('[data-persistence-status]')).toHaveTextContent(
        'accepted',
      ),
    )
    await waitFor(() =>
      expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual(prioritizedOrderingLabels),
    )
  },
  render: () => <OrderingAcceptanceBoard />,
}

export const StaleCacheAcceptance: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    await moveThirdCardUpWithKeyboard(canvasElement)

    await expect(canvasElement.querySelector('[data-persistence-status]')).toHaveTextContent(
      'pending',
    )
    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual(prioritizedOrderingLabels)
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-persistence-status]')).toHaveTextContent(
        'accepted',
      ),
    )
    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual(prioritizedOrderingLabels)
  },
  render: () => <OrderingAcceptanceBoard persistence="stale-cache" />,
}

export const RollbackAcceptance: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    await moveThirdCardUpWithKeyboard(canvasElement)

    await expect(canvasElement.querySelector('[data-persistence-status]')).toHaveTextContent(
      'pending',
    )
    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual(prioritizedOrderingLabels)
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-persistence-status]')).toHaveTextContent(
        'rejected',
      ),
    )
    await expect(visibleCardLabels(canvasElement).slice(0, 5)).toEqual(initialOrderingLabels)
  },
  render: () => <OrderingAcceptanceBoard persistence="reject" />,
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
