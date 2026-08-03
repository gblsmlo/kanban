import { afterEach, describe, expect, test } from 'bun:test'

await import('../../test/dom')

const { cleanup, fireEvent, render, screen } = await import('@testing-library/react')
const { ListItem, ListItemHeader, ListItemTitle } = await import('../../components/views/list')
const { CollectionProvider, useCollectionPreferences } = await import('./collection-provider')
const { CollectionViewOutlet } = await import('./collection-view-outlet')

afterEach(cleanup)

interface Task {
  assigneeId: string | null
  id: string
  statusId: string
  title: string
}

const collection = {
  assignees: [{ id: 'ana', label: 'Ana' }],
  getAssigneeId: (task: Task) => task.assigneeId,
  getKey: (task: Task) => task.id,
  getLabel: (task: Task) => task.title,
  getStatusId: (task: Task) => task.statusId,
  items: [{ assigneeId: 'ana', id: 'task-1', statusId: 'backlog', title: 'First task' }],
  statuses: [{ id: 'backlog', label: 'Backlog' }],
}

function ViewControls() {
  const { setPreferences } = useCollectionPreferences()

  return (
    <>
      <button
        onClick={() => setPreferences((current) => ({ ...current, view: 'list' }), 'view')}
        type="button"
      >
        Show list
      </button>
      <button
        onClick={() =>
          setPreferences((current) => ({ ...current, groupBy: 'assignee' }), 'grouping')
        }
        type="button"
      >
        Group by assignee
      </button>
    </>
  )
}

describe('CollectionViewOutlet', () => {
  test('switches views and grouping without consumer projection glue', () => {
    render(
      <CollectionProvider collection={collection}>
        {({ collection: providerCollection }) => (
          <>
            <ViewControls />
            <CollectionViewOutlet
              collection={providerCollection}
              renderKanbanItem={(task) => <article>{task.title}</article>}
              renderListItem={(task) => (
                <ListItem aria-label={task.title}>
                  <ListItemHeader>
                    <ListItemTitle>{task.title}</ListItemTitle>
                  </ListItemHeader>
                </ListItem>
              )}
            />
          </>
        )}
      </CollectionProvider>,
    )

    expect(screen.getAllByRole('heading', { name: 'Backlog' }).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Show list' }))
    expect(screen.getByRole('article', { name: 'First task' })).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Backlog' })).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Group by assignee' }))
    expect(screen.getByRole('heading', { name: 'Ana' })).not.toBeNull()
  })
})
