import type { ReactNode } from 'react'

import {
  CollectionProvider,
  type CollectionProviderValue,
  CollectionViewOutlet,
  type CollectionViewMode,
  ListView,
} from '../src'
import type { CollectionDefinition } from '../src/core'

interface Task {
  assigneeId: string | null
  id: string
  statusId: string | null
  title: string
}

const tasks: readonly Task[] = [
  { assigneeId: 'ana', id: 'task-1', statusId: 'backlog', title: 'First task' },
]

const collection = {
  assignees: [{ id: 'ana', label: 'Ana' }],
  getAssigneeId: (task) => task.assigneeId,
  getKey: (task) => task.id,
  getLabel: (task) => task.title,
  getStatusId: (task) => task.statusId,
  items: tasks,
  statuses: [{ id: 'backlog', label: 'Backlog' }],
} satisfies CollectionDefinition<Task>

const mode: CollectionViewMode = 'kanban'
void mode

function assertProviderInference(value: CollectionProviderValue<Task>): ReactNode {
  value.collection.items[0]?.title.toUpperCase()
  // @ts-expect-error The provider item must not be assignable to an unrelated model.
  value.collection.items[0]?.total.toFixed()

  return (
    <CollectionViewOutlet
      collection={value.collection}
      renderKanbanItem={(task) => <span>{task.title}</span>}
      renderListItem={(task) => <span>{task.title}</span>}
    />
  )
}

const provider = (
  <CollectionProvider collection={collection}>
    {(value) => assertProviderInference(value)}
  </CollectionProvider>
)
void provider

const list = (
  <ListView
    collection={collection}
    grouping="status"
    renderItem={(task) => <span>{task.title}</span>}
  />
)
void list

const invalidGrouping = (
  <ListView
    collection={collection}
    // @ts-expect-error Grouping is intentionally limited to supported collection adapters.
    grouping="priority"
    renderItem={(task) => <span>{task.title}</span>}
  />
)
void invalidGrouping
