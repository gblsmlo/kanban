import { afterEach, describe, expect, test } from 'bun:test'

await import('../../test/dom')

const { cleanup, fireEvent, render, screen, waitFor } = await import('@testing-library/react')
const { CollectionProvider } = await import('../../collection/components/collection-provider')
const { ListItem, ListItemHeader, ListItemTitle, ListView } = await import('../index')

afterEach(cleanup)

interface Task {
  assigneeId: string | null
  id: string
  statusId: string
  title: string
}

const collection = {
  assignees: [
    { id: 'ana', label: 'Ana' },
    { id: 'bruno', label: 'Bruno' },
  ],
  getAssigneeId: (item: Task) => item.assigneeId,
  getKey: (item: Task) => item.id,
  getLabel: (item: Task) => item.title,
  getStatusId: (item: Task) => item.statusId,
  items: [
    { assigneeId: 'ana', id: 'task-1', statusId: 'backlog', title: 'First task' },
    { assigneeId: null, id: 'task-2', statusId: 'done', title: 'Second task' },
  ],
  statuses: [
    { id: 'backlog', label: 'Backlog' },
    { id: 'done', label: 'Done' },
  ],
}

function renderItem(item: Task) {
  return (
    <ListItem aria-label={item.title}>
      <ListItemHeader>
        <ListItemTitle>{item.title}</ListItemTitle>
      </ListItemHeader>
    </ListItem>
  )
}

describe('ListView', () => {
  test('renders the collection grouped by status by default', () => {
    render(
      <CollectionProvider collection={collection} defaultPreferences={{ view: 'list' }}>
        <ListView collection={collection} grouping="status" renderItem={renderItem} />
      </CollectionProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Backlog' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Done' })).not.toBeNull()
    expect(screen.getByRole('article', { name: 'First task' })).not.toBeNull()
    expect(screen.getByRole('article', { name: 'Second task' })).not.toBeNull()
  })

  test('renders assignee groups from the provider preference', () => {
    render(
      <CollectionProvider
        collection={collection}
        defaultPreferences={{ groupBy: 'assignee', view: 'list' }}
      >
        <ListView collection={collection} grouping="assignee" renderItem={renderItem} />
      </CollectionProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Ana' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Bruno' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'No assignee' })).not.toBeNull()
  })

  test('collapses one group without removing the other groups', async () => {
    render(
      <CollectionProvider collection={collection} defaultPreferences={{ view: 'list' }}>
        <ListView collection={collection} grouping="status" renderItem={renderItem} />
      </CollectionProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Backlog' }))

    await waitFor(() => expect(screen.queryByRole('article', { name: 'First task' })).toBeNull())
    expect(screen.getByRole('article', { name: 'Second task' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Expand Backlog' })).not.toBeNull()
  })
})
