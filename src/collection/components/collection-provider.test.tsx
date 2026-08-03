import { afterEach, describe, expect, mock, test } from 'bun:test'
import { useState } from 'react'
import type { CollectionPreferences } from '../types'

await import('../../test/dom')

const { cleanup, fireEvent, render, screen } = await import('@testing-library/react')
const { CollectionProvider, useCollectionPreferences } = await import('./collection-provider')

afterEach(cleanup)

const collection = {
  assignees: [{ id: 'ana', label: 'Ana' }],
  getAssigneeId: (item: { assigneeId: string | null }) => item.assigneeId,
  getKey: (item: { id: string }) => item.id,
  getLabel: (item: { title: string }) => item.title,
  getStatusId: (item: { statusId: string | null }) => item.statusId,
  items: [{ assigneeId: 'ana', id: 'task-1', statusId: 'backlog', title: 'Task' }],
  statuses: [{ id: 'backlog', label: 'Backlog' }],
}

function PreferenceProbe() {
  const { preferences, setPreferences } = useCollectionPreferences()

  return (
    <>
      <output aria-label="Grouping">{preferences.groupBy}</output>
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

function SequentialPreferenceProbe() {
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

function ControlledSnapshotProbe() {
  const { setPreferences } = useCollectionPreferences()

  return (
    <>
      <button
        onClick={() => setPreferences((current) => ({ ...current, view: 'list' }), 'view')}
        type="button"
      >
        Show list before rerender
      </button>
      <button
        onClick={() =>
          setPreferences((current) => ({ ...current, groupBy: 'assignee' }), 'grouping')
        }
        type="button"
      >
        Group after rerender
      </button>
    </>
  )
}

function ControlledSnapshotHarness({
  onPreferencesChange,
}: Readonly<{
  onPreferencesChange: (preferences: CollectionPreferences) => void
}>) {
  const [renderCount, setRenderCount] = useState(0)

  return (
    <CollectionProvider
      collection={collection}
      onPreferencesChange={(preferences) => onPreferencesChange(preferences)}
      preferences={{ groupBy: 'status', view: 'kanban' }}
    >
      <button onClick={() => setRenderCount((current) => current + 1)} type="button">
        Rerender {renderCount}
      </button>
      <ControlledSnapshotProbe />
    </CollectionProvider>
  )
}

describe('CollectionProvider', () => {
  test('updates uncontrolled preferences before notifying the consumer', () => {
    const onPreferencesChange = mock(() => undefined)

    render(
      <CollectionProvider collection={collection} onPreferencesChange={onPreferencesChange}>
        <PreferenceProbe />
      </CollectionProvider>,
    )

    expect(screen.getByRole('status', { name: 'Grouping' }).textContent).toBe('status')
    fireEvent.click(screen.getByRole('button', { name: 'Group by assignee' }))

    expect(screen.getByRole('status', { name: 'Grouping' }).textContent).toBe('assignee')
    expect(onPreferencesChange).toHaveBeenCalledWith(
      { groupBy: 'assignee', view: 'kanban' },
      { reason: 'grouping' },
    )
  })

  test('keeps controlled preferences authoritative until the consumer publishes them', () => {
    const onPreferencesChange = mock(() => undefined)

    render(
      <CollectionProvider
        collection={collection}
        onPreferencesChange={onPreferencesChange}
        preferences={{ groupBy: 'status', view: 'list' }}
      >
        <PreferenceProbe />
      </CollectionProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Group by assignee' }))

    expect(screen.getByRole('status', { name: 'Grouping' }).textContent).toBe('status')
    expect(onPreferencesChange).toHaveBeenCalledWith(
      { groupBy: 'assignee', view: 'list' },
      { reason: 'grouping' },
    )
  })

  test('composes consecutive controlled updates from the latest requested preferences', () => {
    const onPreferencesChange = mock(() => undefined)

    render(
      <CollectionProvider
        collection={collection}
        onPreferencesChange={onPreferencesChange}
        preferences={{ groupBy: 'status', view: 'kanban' }}
      >
        <SequentialPreferenceProbe />
      </CollectionProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Show list' }))
    fireEvent.click(screen.getByRole('button', { name: 'Group by assignee' }))

    expect(onPreferencesChange).toHaveBeenNthCalledWith(
      1,
      { groupBy: 'status', view: 'list' },
      { reason: 'view' },
    )
    expect(onPreferencesChange).toHaveBeenNthCalledWith(
      2,
      { groupBy: 'assignee', view: 'list' },
      { reason: 'grouping' },
    )
  })

  test('does not discard an optimistic preference after an unrelated controlled rerender', () => {
    const onPreferencesChange = mock(() => undefined)

    render(<ControlledSnapshotHarness onPreferencesChange={onPreferencesChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Show list before rerender' }))
    fireEvent.click(screen.getByRole('button', { name: /Rerender/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Group after rerender' }))

    expect(onPreferencesChange).toHaveBeenNthCalledWith(2, {
      groupBy: 'assignee',
      view: 'list',
    })
  })
})
