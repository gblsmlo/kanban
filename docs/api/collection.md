# Collection API

`CollectionProvider` is the shared state boundary for collection views. It owns
only view preferences and derived projections. The consumer owns items,
permissions, filters from remote queries, mutations, cache, and persistence.

## Definition

```ts
interface CollectionDefinition<TItem> {
  items: readonly TItem[]
  statuses: readonly CollectionOption[]
  assignees: readonly CollectionOption[]
  getKey: (item: TItem) => string | number
  getLabel: (item: TItem) => string
  getStatusId: (item: TItem) => string | null
  getAssigneeId: (item: TItem) => string | null
}
```

Adapters keep consumer models domain-neutral. `statuses` and `assignees`
provide stable ids, labels, optional icons, and display order. A `null` resolver
result belongs to `No status` or `No assignee`.

Every item must have a stable key. Changing an item key causes React and future
drag state to treat it as a different item.

## Preferences

```ts
interface CollectionPreferences {
  view: 'kanban' | 'list'
  groupBy: 'status' | 'assignee'
}
```

Uncontrolled usage reads `defaultPreferences`; omitted properties default to
`{ view: 'kanban', groupBy: 'status' }`.

Controlled usage passes `preferences` and publishes the next value immediately
from `onPreferencesChange`. The callback also receives
`{ reason: 'view' | 'grouping' }`. The package does not persist or roll back
consumer state.

The provider exposes the typed collection through its render prop. This keeps
the item inferred from `collection` instead of allowing a descendant hook to
assert an unrelated model:

```tsx
<CollectionProvider collection={collection}>
  {({ collection: typedCollection }) => (
    <CollectionViewOutlet
      collection={typedCollection}
      renderKanbanItem={(item) => <TaskCard task={item} />}
      renderListItem={(item) => <TaskRow task={item} />}
    />
  )}
</CollectionProvider>
```

`useCollectionPreferences()` exposes only `preferences` and `setPreferences`,
whose types do not depend on the item model. It throws a descriptive error
outside `CollectionProvider`. `setPreferences` accepts either a complete value
or a functional updater; prefer the updater when changing one preference.

`CollectionSettingsMenu` updates both preferences through its COSS menu:
`View → Grid | List` changes the active visualization and
`Grouping by → Status | Assignee` changes the sections rendered by either
visualization. The menu omits internal group labels so each level communicates
only the choice the user is making.

`CollectionViewOutlet<TItem>` is the public adapter between a collection and
the selected view. It projects groups, creates Kanban columns, and supplies the
same typed items to `renderKanbanItem` and `renderListItem`. View-specific
options remain available through its `kanban` and `list` props.

## Ownership

| Package | Consumer |
| --- | --- |
| Preference state and projection | Canonical item data |
| Status/assignee group ordering | Option catalogs and labels |
| Accessible structural composition | Domain content and actions |
| Change notification | URL/storage/remote persistence |
