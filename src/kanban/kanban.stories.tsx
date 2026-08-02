import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ArrowUpDownIcon,
  BellIcon,
  CalendarIcon,
  CircleDotIcon,
  Columns3Icon,
  ExpandIcon,
  EyeIcon,
  FilterIcon,
  Rows2Icon,
  Rows3Icon,
  RotateCcwIcon,
  SettingsIcon,
  ShrinkIcon,
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
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'
import { Toolbar as CossToolbar, ToolbarButton, ToolbarGroup } from '@/components/ui/toolbar'
import {
  KanbanBadge,
  KanbanCard,
  KanbanCardContent,
  KanbanCardDescription,
  type KanbanCardDisplay,
  KanbanCardFooter,
  KanbanCardHeader,
  KanbanCardTitle,
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
  {
    assignee: 'Dana',
    creator: 'Marina',
    date: 'Later',
    id: 'record-5',
    label: 'Review release evidence',
    labels: ['QA'],
    priority: 'Low',
    summary: 'Confirm the package remains domain-neutral and accessible.',
    tags: ['QA'],
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

const toolbarFilterCards: ExampleCard[] = [
  {
    assignee: 'Ana',
    creator: 'Marina',
    date: 'Today',
    id: 'record-6',
    label: 'Map filter behavior',
    labels: ['API', 'Docs'],
    priority: 'Medium',
    summary: 'Exercise multiple values in one filter and the AND rule between fields.',
    tags: ['Filters', 'API'],
  },
  {
    assignee: 'Bruno',
    creator: 'Gabriel',
    date: 'This week',
    id: 'record-7',
    label: 'Add keyboard shortcuts',
    labels: ['A11y'],
    priority: 'High',
    summary: 'Keep menu actions discoverable for keyboard and assistive technology users.',
    tags: ['A11y', 'Keyboard'],
  },
  {
    assignee: 'Casey',
    creator: 'Priya',
    date: 'Later',
    id: 'record-8',
    label: 'Review empty states',
    labels: ['QA'],
    priority: 'Low',
    summary: 'Make a zero-result filter understandable and recoverable.',
    tags: ['QA', 'Empty state'],
  },
  {
    assignee: 'Dana',
    creator: 'Marina',
    date: 'Today',
    id: 'record-9',
    label: 'Define layout defaults',
    labels: ['State'],
    priority: 'Urgent',
    summary: 'Choose a predictable initial display for a new board.',
    tags: ['Settings', 'Defaults'],
  },
  {
    assignee: 'Ana',
    creator: 'Gabriel',
    date: 'This week',
    id: 'record-10',
    label: 'Audit column actions',
    labels: ['Docs'],
    priority: 'High',
    summary: 'Document add, settings, and expansion actions for every column.',
    tags: ['Columns', 'Actions'],
  },
  {
    assignee: 'Bruno',
    creator: 'Priya',
    date: 'Later',
    id: 'record-11',
    label: 'Test compact density',
    labels: ['API'],
    priority: 'Medium',
    summary: 'Compare compact and detailed cards without losing context.',
    tags: ['Cards', 'Compact'],
  },
  {
    assignee: 'Casey',
    creator: 'Marina',
    date: 'Today',
    id: 'record-12',
    label: 'Check persisted preferences',
    labels: ['QA'],
    priority: 'Low',
    summary: 'Verify a consumer can restore settings after a reload.',
    tags: ['Persistence', 'QA'],
  },
  {
    assignee: 'Dana',
    creator: 'Gabriel',
    date: 'This week',
    id: 'record-13',
    label: 'Handle stale snapshots',
    labels: ['A11y'],
    priority: 'Urgent',
    summary: 'Keep the optimistic order visible while a cache catches up.',
    tags: ['Cache', 'Optimistic UI'],
  },
  {
    assignee: 'Ana',
    creator: 'Priya',
    date: 'Later',
    id: 'record-14',
    label: 'Group cards by lane',
    labels: ['State'],
    priority: 'Medium',
    summary: 'Prepare a reusable grouping model for future swimlane settings.',
    tags: ['Swimlanes', 'Grouping'],
  },
  {
    assignee: 'Bruno',
    creator: 'Marina',
    date: 'Today',
    id: 'record-15',
    label: 'Prepare release notes',
    labels: ['API'],
    priority: 'High',
    summary: 'Describe the public surface for products integrating the provider.',
    tags: ['Release', 'API'],
  },
]

const toolbarFilterColumns: KanbanColumnData<ExampleCard>[] = [
  {
    cards: [cards[0]!, toolbarFilterCards[0]!, toolbarFilterCards[1]!],
    count: 3,
    id: 'backlog',
    title: 'Backlog',
  },
  {
    cards: [cards[1]!, toolbarFilterCards[2]!, toolbarFilterCards[3]!],
    count: 3,
    id: 'todo',
    title: 'Todo',
  },
  {
    cards: [cards[2]!, toolbarFilterCards[4]!, toolbarFilterCards[5]!],
    count: 3,
    id: 'in-progress',
    title: 'In Progress',
  },
  {
    cards: [cards[3]!, toolbarFilterCards[6]!, toolbarFilterCards[7]!],
    count: 3,
    id: 'in-review',
    title: 'In Review',
  },
  {
    cards: [cards[4]!, toolbarFilterCards[8]!, toolbarFilterCards[9]!],
    count: 3,
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
            <li
              className="min-w-0 max-w-full"
              data-long-tag={tag.length > 20 ? '' : undefined}
              key={tag}
              title={tag}
            >
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
          <UserIcon aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{card.assignee}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <CalendarIcon aria-hidden="true" className="size-3.5 shrink-0" />
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

type PersistenceExample = 'accept' | 'reject' | 'stale-cache'

function InteractiveBoard() {
  const [columns, setColumns] = useState(toolbarColumns)
  const [columnAction, setColumnAction] = useState('Nenhuma ação executada')

  return (
    <div className="h-[560px] min-h-0 p-4">
      <KanbanView
        columns={columns}
        getCardLabel={(card) => card.label}
        getColumnActions={(_column) => ({
          onAddCard: (columnId) => setColumnAction(`Adicionar em ${columnId}`),
          onOpenSettings: (columnId) => setColumnAction(`Configurar ${columnId}`),
        })}
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

function SettingsMenu({
  display,
  onDisplayChange,
}: Readonly<{
  display: KanbanCardDisplay
  onDisplayChange: (display: KanbanCardDisplay) => void
}>) {
  const [columnWidth, setColumnWidth] = useState('standard')
  const [swimlane, setSwimlane] = useState('none')
  const [expandedColumnIds, setExpandedColumnIds] = useState(() =>
    toolbarFilterColumns.map((column) => column.id),
  )

  const setAllColumnsExpanded = (expanded: boolean) => {
    setExpandedColumnIds(expanded ? toolbarFilterColumns.map((column) => column.id) : [])
  }

  const toggleColumn = (columnId: string) => {
    setExpandedColumnIds((current) =>
      current.includes(columnId)
        ? current.filter((currentColumnId) => currentColumnId !== columnId)
        : [...current, columnId],
    )
  }

  return (
    <Menu>
      <MenuTrigger render={<ToolbarButton render={<Button variant="secondary" />} />}>
        <SettingsIcon aria-hidden="true" />
        Settings
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuGroup>
          <MenuGroupLabel>Board</MenuGroupLabel>
          <MenuItem>
            <SlidersHorizontalIcon aria-hidden="true" />
            Details
          </MenuItem>
          <MenuItem>
            <BellIcon aria-hidden="true" />
            Notifications
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Layout</MenuGroupLabel>
          <MenuSub>
            <MenuSubTrigger>
              <Rows3Icon aria-hidden="true" />
              Cards
            </MenuSubTrigger>
            <MenuSubPopup>
              <MenuGroup>
                <MenuGroupLabel>Card detail</MenuGroupLabel>
                <MenuRadioGroup
                  onValueChange={(value) => {
                    if (value === 'full' || value === 'compact') onDisplayChange(value)
                  }}
                  value={display}
                >
                  <MenuRadioItem closeOnClick value="full">
                    Detailed
                  </MenuRadioItem>
                  <MenuRadioItem closeOnClick value="compact">
                    Compact
                  </MenuRadioItem>
                </MenuRadioGroup>
              </MenuGroup>
            </MenuSubPopup>
          </MenuSub>
          <MenuSub>
            <MenuSubTrigger>
              <Columns3Icon aria-hidden="true" />
              Columns
            </MenuSubTrigger>
            <MenuSubPopup>
              <MenuGroup>
                <MenuGroupLabel>Column width</MenuGroupLabel>
                <MenuRadioGroup onValueChange={setColumnWidth} value={columnWidth}>
                  <MenuRadioItem value="narrow">Narrow</MenuRadioItem>
                  <MenuRadioItem value="standard">Standard</MenuRadioItem>
                  <MenuRadioItem value="wide">Wide</MenuRadioItem>
                </MenuRadioGroup>
              </MenuGroup>
            </MenuSubPopup>
          </MenuSub>
          <MenuSub>
            <MenuSubTrigger>
              <Rows2Icon aria-hidden="true" />
              Swimlanes
            </MenuSubTrigger>
            <MenuSubPopup>
              <MenuGroup>
                <MenuGroupLabel>Group cards by</MenuGroupLabel>
                <MenuRadioGroup onValueChange={setSwimlane} value={swimlane}>
                  <MenuRadioItem value="none">None</MenuRadioItem>
                  <MenuRadioItem value="assignee">Assignee</MenuRadioItem>
                  <MenuRadioItem value="priority">Priority</MenuRadioItem>
                </MenuRadioGroup>
              </MenuGroup>
            </MenuSubPopup>
          </MenuSub>
          <MenuSub>
            <MenuSubTrigger>
              <EyeIcon aria-hidden="true" />
              Visibility
            </MenuSubTrigger>
            <MenuSubPopup>
              <MenuGroup>
                <MenuGroupLabel>Column visibility</MenuGroupLabel>
                <MenuItem closeOnClick={false} onClick={() => setAllColumnsExpanded(true)}>
                  <ExpandIcon aria-hidden="true" />
                  Expand all
                </MenuItem>
                <MenuItem closeOnClick={false} onClick={() => setAllColumnsExpanded(false)}>
                  <ShrinkIcon aria-hidden="true" />
                  Collapse all
                </MenuItem>
              </MenuGroup>
              <MenuSeparator />
              <MenuGroup>
                <MenuGroupLabel>Expanded columns</MenuGroupLabel>
                {toolbarFilterColumns.map((column) => (
                  <MenuCheckboxItem
                    checked={expandedColumnIds.includes(column.id)}
                    closeOnClick={false}
                    key={column.id}
                    onCheckedChange={() => toggleColumn(column.id)}
                  >
                    {column.title}
                  </MenuCheckboxItem>
                ))}
              </MenuGroup>
            </MenuSubPopup>
          </MenuSub>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  )
}

function ToolbarBoard() {
  const [columns, setColumns] = useState(toolbarFilterColumns)
  const [display, setDisplay] = useState<KanbanCardDisplay>('full')
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
          <SettingsMenu display={display} onDisplayChange={setDisplay} />
        </ToolbarGroup>
      </CossToolbar>

      <div className="min-h-0 min-w-0">
        <KanbanView
          columns={filteredColumns}
          getCardLabel={(card) => card.label}
          getColumnActions={(column) => ({
            addLabel: `Adicionar item à seção ${column.title}`,
            onAddCard: () => undefined,
            onOpenSettings: () => undefined,
            settingsLabel: `Configurar seção ${column.title}`,
          })}
          getKey={(card) => card.id}
          mobileStageHint="Select a workflow stage."
          onMoveCard={(move) => {
            setColumns((current) => moveCard(current, move))
            return true
          }}
          renderCard={(card) => <ExampleCardView card={card} display={display} />}
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
    await expect(canvas.queryByRole('button', { name: 'Change card display' })).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Configurar seção Backlog' })).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Adicionar item à seção Backlog' }),
    ).toBeVisible()
    const composedCards = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="card"]'),
    ).filter((card) => card.getClientRects().length > 0)

    await expect(composedCards).toHaveLength(5)
    for (const card of composedCards) {
      await expect(
        Array.from(card.children).map((section) => section.getAttribute('data-slot')),
      ).toEqual(['card-header', 'card-panel', 'card-footer'])
    }
  },
  render: () => <InteractiveBoard />,
}

export const CrossColumnMoveAcceptance: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const source = draggableCard(canvasElement, 'Mover card Define the public contract')
    const target = draggableCard(canvasElement, 'Mover card Validate keyboard drag')
    const sourceRect = source.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const sourcePoint = {
      clientX: sourceRect.left + sourceRect.width / 2,
      clientY: sourceRect.top + sourceRect.height / 2,
    }
    const targetPoint = {
      clientX: targetRect.left + targetRect.width / 2,
      clientY: targetRect.top + targetRect.height / 2,
    }

    fireEvent.pointerDown(source, {
      ...sourcePoint,
      button: 0,
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    await nextAnimationFrame()
    fireEvent.pointerMove(source, {
      ...sourcePoint,
      buttons: 1,
      clientY: sourcePoint.clientY + 12,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    await waitFor(() => expect(source).toHaveAttribute('aria-grabbed', 'true'))
    fireEvent.pointerMove(target, {
      ...targetPoint,
      buttons: 1,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    await nextAnimationFrame()
    fireEvent.pointerUp(target, {
      ...targetPoint,
      button: 0,
      buttons: 0,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })

    await waitFor(() =>
      expect(visibleBoardColumns(canvasElement).slice(0, 2)).toEqual([
        { cards: [], title: 'Backlog' },
        {
          cards: ['Mover card Define the public contract', 'Mover card Validate keyboard drag'],
          title: 'Todo',
        },
      ]),
    )
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
    await expect(longTag.title).toBe(cards[3]!.tags[3])
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
  parameters: {
    docs: {
      description: {
        story:
          'Teste manual: use Filter para combinar Status, Assignee, Creator, Priority, Labels e Date; selecione mais de uma opção no mesmo submenu para validar OR, combine submenus para validar AND e use Clear filters para restaurar os 15 cards. Em Settings, confira Detailed/Compact, Column width, Swimlanes e Visibility. A opção Expanded em Visibility é um mock visual do menu e não altera as colunas nesta story.',
      },
    },
  },
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

    await expect(await documentBody.findByText('Board')).toBeVisible()
    await expect(await documentBody.findByText('Layout')).toBeVisible()
    for (const setting of [
      'Details',
      'Notifications',
      'Cards',
      'Columns',
      'Swimlanes',
      'Visibility',
    ]) {
      const menuItem = documentBody.getByRole('menuitem', { name: setting })

      await expect(menuItem).toBeVisible()
      await expect(menuItem.querySelector('svg')).not.toBeNull()
    }

    await userEvent.hover(documentBody.getByRole('menuitem', { name: 'Columns' }))
    await expect(await documentBody.findByText('Column width')).toBeVisible()
    for (const width of ['Narrow', 'Standard', 'Wide']) {
      await expect(documentBody.getByRole('menuitemradio', { name: width })).toBeVisible()
    }
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(documentBody.queryByText('Column width')).toBeNull())

    await userEvent.hover(documentBody.getByRole('menuitem', { name: 'Swimlanes' }))
    await expect(await documentBody.findByText('Group cards by')).toBeVisible()
    for (const grouping of ['None', 'Assignee', 'Priority']) {
      await expect(documentBody.getByRole('menuitemradio', { name: grouping })).toBeVisible()
    }
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(documentBody.queryByText('Group cards by')).toBeNull())

    await userEvent.hover(documentBody.getByRole('menuitem', { name: 'Visibility' }))
    await expect(await documentBody.findByText('Column visibility')).toBeVisible()
    await expect(documentBody.getByRole('menuitem', { name: 'Expand all' })).toBeVisible()
    await expect(documentBody.getByRole('menuitem', { name: 'Collapse all' })).toBeVisible()

    await userEvent.click(documentBody.getByRole('menuitem', { name: 'Collapse all' }))
    for (const column of ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done']) {
      await expect(documentBody.getByRole('menuitemcheckbox', { name: column })).toHaveAttribute(
        'aria-checked',
        'false',
      )
    }
    await expect(
      canvas.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(columnTitles)
    await expect(visibleCardLabels(canvasElement)).toEqual(['Mover card Validate keyboard drag'])

    await userEvent.click(documentBody.getByRole('menuitemcheckbox', { name: 'Backlog' }))
    await expect(documentBody.getByRole('menuitemcheckbox', { name: 'Backlog' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await userEvent.click(documentBody.getByRole('menuitem', { name: 'Expand all' }))
    await expect(
      canvas.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(columnTitles)
    await expect(visibleCardLabels(canvasElement)).toEqual(['Mover card Validate keyboard drag'])
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(documentBody.queryByText('Column visibility')).toBeNull())

    await userEvent.hover(documentBody.getByRole('menuitem', { name: 'Cards' }))
    await expect(await documentBody.findByText('Card detail')).toBeVisible()
    await userEvent.click(await documentBody.findByRole('menuitemradio', { name: 'Compact' }))

    for (const card of canvas.getAllByRole('article')) {
      await expect(card).toHaveAttribute('data-display', 'compact')
    }
    await expect(canvas.queryByRole('button', { name: 'Change card display' })).toBeNull()
    await expect(canvas.queryByText(cards[1]!.summary)).not.toBeVisible()

    await waitFor(() => expect(settingsButton).not.toHaveAttribute('data-popup-open'))
    await nextAnimationFrame()
    await userEvent.click(settingsButton)
    await userEvent.hover(await documentBody.findByRole('menuitem', { name: 'Cards' }))
    const detailedItem = await documentBody.findByRole('menuitemradio', { name: 'Detailed' })
    await expect(detailedItem.getBoundingClientRect().height).toBeLessThanOrEqual(32)
    await userEvent.click(detailedItem)

    for (const card of canvas.getAllByRole('article')) {
      await expect(card).toHaveAttribute('data-display', 'full')
    }

    await waitFor(() => expect(settingsButton).not.toHaveAttribute('data-popup-open'))
    await nextAnimationFrame()
    await userEvent.click(filterButton)
    await userEvent.click(await documentBody.findByRole('menuitem', { name: 'Clear filters' }))

    await expect(filterButton).toHaveTextContent('Filter')
    await expect(visibleCardLabels(canvasElement)).toHaveLength(15)
  },
  render: () => <ToolbarBoard />,
}

export const FilterCombinationAcceptance: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const documentBody = within(canvasElement.ownerDocument.body)
    const filterButton = canvas.getByRole('button', { name: 'Filter' })

    await userEvent.click(filterButton)
    await userEvent.hover(await documentBody.findByRole('menuitem', { name: 'Status' }))
    await userEvent.click(await documentBody.findByRole('menuitemcheckbox', { name: 'Backlog' }))
    await userEvent.click(await documentBody.findByRole('menuitemcheckbox', { name: 'Todo' }))

    await expect(filterButton).toHaveTextContent('Filter (2)')
    await expect(visibleCardLabels(canvasElement)).toHaveLength(6)

    await userEvent.hover(documentBody.getByRole('menuitem', { name: 'Assignee' }))
    await userEvent.click(await documentBody.findByRole('menuitemcheckbox', { name: 'Dana' }))
    await expect(visibleCardLabels(canvasElement)).toEqual(['Mover card Define layout defaults'])

    await userEvent.hover(documentBody.getByRole('menuitem', { name: 'Creator' }))
    await userEvent.click(await documentBody.findByRole('menuitemcheckbox', { name: 'Gabriel' }))
    await expect(visibleCardLabels(canvasElement)).toHaveLength(0)

    await userEvent.click(documentBody.getByRole('menuitem', { name: 'Clear filters' }))
    await expect(visibleCardLabels(canvasElement)).toHaveLength(15)
  },
  render: () => <ToolbarBoard />,
}
