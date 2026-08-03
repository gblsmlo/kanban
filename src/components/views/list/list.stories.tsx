import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  MoreHorizontalIcon,
} from 'lucide-react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CollectionProvider,
  CollectionSettingsMenu,
  CollectionToolbar,
  CollectionToolbarGroup,
  type CollectionDefinition,
  type CollectionPreferences,
} from '../../../collection'
import {
  ListItem,
  ListItemAction,
  ListItemContent,
  ListItemDescription,
  ListItemFooter,
  ListItemHeader,
  ListItemSkeleton,
  ListItemTitle,
  ListView,
} from './'

interface ExampleItem {
  assigneeId: string | null
  code: string
  date: string
  id: string
  label: string
  statusId: string
  summary: string
  title: string
}

const items: ExampleItem[] = [
  {
    assigneeId: 'ana',
    code: 'VIEW-60',
    date: 'Aug 2',
    id: 'task-1',
    label: 'Views 0.4',
    statusId: 'in-progress',
    summary: 'Ship the collection-first API for third-party projects',
    title: 'Define the shared collection contract',
  },
  {
    assigneeId: 'bruno',
    code: 'VIEW-62',
    date: 'Aug 2',
    id: 'task-2',
    label: 'List',
    statusId: 'backlog',
    summary: 'Match the density and hierarchy of the approved reference',
    title: 'Compose List groups from COSS primitives',
  },
  {
    assigneeId: 'ana',
    code: 'VIEW-63',
    date: 'Aug 3',
    id: 'task-3',
    label: 'Settings',
    statusId: 'backlog',
    summary: 'Project one collection without mutating consumer data',
    title: 'Switch grouping between Status and Assignee',
  },
  {
    assigneeId: null,
    code: 'VIEW-64',
    date: 'Aug 3',
    id: 'task-4',
    label: 'Docs',
    statusId: 'todo',
    summary: 'Keep cache and persistence responsibilities explicit',
    title: 'Document the provider ownership boundary',
  },
  {
    assigneeId: 'bruno',
    code: 'VIEW-65',
    date: 'Aug 4',
    id: 'task-5',
    label: 'Quality',
    statusId: 'in-review',
    summary: 'Cover Status, Assignee, collapse and read-only behavior',
    title: 'Validate grouped List use cases',
  },
  {
    assigneeId: 'camila',
    code: 'VIEW-66',
    date: 'Aug 4',
    id: 'task-6',
    label: 'Accessibility',
    statusId: 'done',
    summary: 'Preserve native disclosure semantics and keyboard focus',
    title: 'Audit List interaction semantics',
  },
  {
    assigneeId: 'camila',
    code: 'VIEW-67',
    date: 'Aug 5',
    id: 'task-7',
    label: 'Registry',
    statusId: 'done',
    summary: 'Keep npm and registry installations on the same API',
    title: 'Verify distribution parity',
  },
]

const assignees = {
  ana: { initials: 'AN', label: 'Ana' },
  bruno: { initials: 'BR', label: 'Bruno' },
  camila: { initials: 'CA', label: 'Camila' },
} as const

function AssigneeAvatar({ assigneeId }: { assigneeId: string }) {
  const assignee = assignees[assigneeId as keyof typeof assignees]

  return (
    <Avatar aria-label={assignee.label} className="size-5">
      <AvatarFallback>{assignee.initials}</AvatarFallback>
    </Avatar>
  )
}

const collection: CollectionDefinition<ExampleItem> = {
  assignees: Object.entries(assignees).map(([id, assignee]) => ({
    icon: <AssigneeAvatar assigneeId={id} />,
    id,
    label: assignee.label,
  })),
  getAssigneeId: (item) => item.assigneeId,
  getKey: (item) => item.id,
  getLabel: (item) => item.title,
  getStatusId: (item) => item.statusId,
  items,
  statuses: [
    { icon: <CircleDashedIcon aria-hidden="true" />, id: 'backlog', label: 'Backlog' },
    { icon: <CircleIcon aria-hidden="true" />, id: 'todo', label: 'Todo' },
    {
      icon: <CircleDotIcon aria-hidden="true" />,
      id: 'in-progress',
      label: 'In Progress',
    },
    { icon: <CircleDotIcon aria-hidden="true" />, id: 'in-review', label: 'In Review' },
    { icon: <CheckCircle2Icon aria-hidden="true" />, id: 'done', label: 'Done' },
  ],
}

function ExampleListItem({ item, readOnly = false }: { item: ExampleItem; readOnly?: boolean }) {
  return (
    <ListItem aria-label={item.title} interactive={!readOnly}>
      <ListItemHeader>
        <ListItemDescription>{item.code}</ListItemDescription>
        <CircleDotIcon aria-hidden="true" className="size-4 shrink-0" />
        <ListItemTitle>{item.title}</ListItemTitle>
        <ListItemContent>
          <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{item.summary}</span>
        </ListItemContent>
      </ListItemHeader>
      <ListItemFooter>
        <Badge variant="outline">{item.label}</Badge>
        {item.assigneeId ? <AssigneeAvatar assigneeId={item.assigneeId} /> : null}
        {item.date}
      </ListItemFooter>
      {readOnly ? null : (
        <ListItemAction>
          <Button aria-label={`Open actions for ${item.title}`} size="icon-xs" variant="ghost">
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </ListItemAction>
      )}
    </ListItem>
  )
}

function ListExample({
  defaultPreferences,
  readOnly = false,
}: {
  defaultPreferences?: Partial<CollectionPreferences>
  readOnly?: boolean
}) {
  const [lastAction, setLastAction] = useState('None')

  return (
    <CollectionProvider
      collection={collection}
      defaultPreferences={{ view: 'list', ...defaultPreferences }}
    >
      {({ collection: providerCollection, preferences }) => (
        <>
          <CollectionToolbar aria-label="Collection toolbar">
            <CollectionToolbarGroup aria-label="View context">
              Product delivery
            </CollectionToolbarGroup>
            <CollectionToolbarGroup aria-label="View actions">
              <CollectionSettingsMenu />
            </CollectionToolbarGroup>
          </CollectionToolbar>
          <ListView<ExampleItem>
            collection={providerCollection}
            grouping={preferences.groupBy}
            renderItem={(item) => <ExampleListItem item={item} readOnly={readOnly} />}
            {...(readOnly
              ? {}
              : {
                  getGroupActions: (group) => ({
                    onAddItem: () => setLastAction(`Add to ${group.id}`),
                  }),
                })}
          />
          <output aria-label="Last action" className="sr-only">
            {lastAction}
          </output>
        </>
      )}
    </CollectionProvider>
  )
}

const meta = {
  component: ListView,
  parameters: { layout: 'fullscreen' },
  title: 'Patterns/List',
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { name: 'Backlog' })).toBeVisible()
    await expect(canvas.getByRole('heading', { name: 'In Progress' })).toBeVisible()
    await expect(canvas.getByRole('heading', { name: 'Done' })).toBeVisible()
    await expect(
      canvas.getByRole('article', { name: 'Define the shared collection contract' }),
    ).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Add item to Backlog' }))
    await expect(canvas.getByRole('status', { name: 'Last action' })).toHaveTextContent(
      'Add to status:backlog',
    )
  },
  render: () => <ListExample />,
}

export const Assignee: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { name: 'Ana' })).toBeVisible()
    await expect(canvas.getByRole('heading', { name: 'Camila' })).toBeVisible()
    await expect(canvas.getByRole('heading', { name: 'No assignee' })).toBeVisible()
  },
  render: () => <ListExample defaultPreferences={{ groupBy: 'assignee' }} />,
}

export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.queryByRole('button', { name: /^Add item to/ })).toBeNull()
    await expect(canvas.queryByRole('button', { name: /^Open actions for/ })).toBeNull()
  },
  render: () => <ListExample readOnly />,
}

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-1 p-2">
      <ListItemSkeleton label="Loading first list item" />
      <ListItemSkeleton label="Loading second list item" />
      <ListItemSkeleton label="Loading third list item" />
    </div>
  ),
}
