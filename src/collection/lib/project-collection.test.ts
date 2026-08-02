import { describe, expect, test } from 'bun:test'

import type { CollectionDefinition } from '../types'
import { projectCollection } from './project-collection'

interface Task {
  assigneeId: string | null
  id: string
  statusId: string | null
  title: string
}

const items: Task[] = [
  { assigneeId: 'ana', id: 'task-1', statusId: 'backlog', title: 'First task' },
  { assigneeId: null, id: 'task-2', statusId: 'done', title: 'Second task' },
  { assigneeId: 'bruno', id: 'task-3', statusId: 'backlog', title: 'Third task' },
]

const collection: CollectionDefinition<Task> = {
  assignees: [
    { id: 'ana', label: 'Ana' },
    { id: 'bruno', label: 'Bruno' },
  ],
  getAssigneeId: (item) => item.assigneeId,
  getKey: (item) => item.id,
  getLabel: (item) => item.title,
  getStatusId: (item) => item.statusId,
  items,
  statuses: [
    { id: 'backlog', label: 'Backlog' },
    { id: 'done', label: 'Done' },
  ],
}

describe('projectCollection', () => {
  test('groups by status using catalog and item order without mutating the collection', () => {
    const originalItems = [...collection.items]
    const groups = projectCollection(collection, 'status')

    expect(groups.map((group) => group.id)).toEqual(['status:backlog', 'status:done'])
    expect(groups.map((group) => group.label)).toEqual(['Backlog', 'Done'])
    expect(groups.map((group) => group.items.map((item) => item.id))).toEqual([
      ['task-1', 'task-3'],
      ['task-2'],
    ])
    expect(collection.items).toEqual(originalItems)
  })

  test('groups by assignee and exposes a final unassigned section', () => {
    const groups = projectCollection(collection, 'assignee')

    expect(groups.map((group) => group.id)).toEqual([
      'assignee:ana',
      'assignee:bruno',
      'assignee:unassigned',
    ])
    expect(groups.map((group) => group.label)).toEqual(['Ana', 'Bruno', 'No assignee'])
    expect(groups.map((group) => group.count)).toEqual([1, 1, 1])
    expect(groups[2]?.items[0]?.id).toBe('task-2')
  })

  test('keeps empty catalog groups so the view can communicate zero items', () => {
    const groups = projectCollection(
      {
        ...collection,
        items: collection.items.filter((item) => item.statusId === 'backlog'),
      },
      'status',
    )

    expect(groups.map((group) => [group.id, group.count])).toEqual([
      ['status:backlog', 2],
      ['status:done', 0],
    ])
  })
})
