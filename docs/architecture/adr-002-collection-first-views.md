# ADR-002: Collection-first core for multiple views

## Status

Proposed for `0.4.0`.

## Context

Version `0.3.0` exposes a column-first Kanban API. That representation works for
a board grouped by status, but it makes the column structure the canonical data
model. The next version must also render a grouped List and expose `Status` and
`Assignee` grouping without introducing a second collection model.

The package is a UI provider for third-party React projects. It cannot own a
business entity shape, query cache, permissions, mutations, or persistence. The
repository remains named `kanban`, but the `0.4.0` npm publication is named
`@tc96/collection-views` because the package now exposes more than Kanban.

## Options considered

| Option | Benefits | Costs |
| --- | --- | --- |
| Keep columns canonical and convert them into List rows | Smallest initial change | Assignee grouping requires rebuilding columns outside the package; future views receive an unnatural nested input; filters and settings remain Kanban-specific |
| Require items to contain fixed `status` and `assignee` properties | Simple internal access | Breaks domain neutrality and forces third-party models to match package-owned field names |
| Use a flat collection plus required field adapters | One source supports Kanban, List, filters, and future views; consumer models remain arbitrary | Adds a projection layer and a compatibility adapter for the existing `columns` API |

## Decision

Adopt a collection-first internal core. A collection is a flat, ordered list of
consumer-owned items plus adapters and option catalogs for status and assignee.
Status and assignee availability are mandatory for the new provider contract,
but their property names and rendered content remain consumer-owned.

The intended public shape is:

```ts
export type CollectionGrouping = 'status' | 'assignee'
export type CollectionViewMode = 'kanban' | 'list'

export interface CollectionOption {
  id: string
  label: string
  icon?: ReactNode
}

export interface CollectionDefinition<TItem> {
  items: readonly TItem[]
  statuses: readonly CollectionOption[]
  assignees: readonly CollectionOption[]
  getKey: (item: TItem) => string
  getLabel: (item: TItem) => string
  getStatusId: (item: TItem) => string | null
  getAssigneeId: (item: TItem) => string | null
}

export interface CollectionPreferences {
  view: CollectionViewMode
  groupBy: CollectionGrouping
}
```

`getAssigneeId` intentionally resolves one grouping owner per item in `0.4.0`.
A row may render more people through consumer content, but duplicating the same
logical item into several draggable groups would make identity, selection, and
persistence ambiguous. Multi-group membership can be added later through an
explicit projection policy rather than an implicit array convention.

An internal pure projection converts the collection into ordered groups. It
uses the option catalog order, preserves item order within each group, and adds
a final package-labeled unassigned group for `null`. Unknown non-null ids are
reported in development and placed in a stable unresolved group rather than
silently dropped.

The provider owns only serializable view state and derived projections. The
consumer owns canonical data and responds to move requests. A generic movement
event identifies the active grouping, source/target group, and indexes; the
existing `KanbanCardMove` remains available through an adapter.

`KanbanView` keeps its current `columns` contract throughout `0.4.x`. New
compositions use `CollectionProvider`, `CollectionToolbar`,
`CollectionViewOutlet`, and `ListView`. The provider render prop is the typed
boundary for collection items; the shared context contains only non-generic
preferences. No third view or dead view value is exported in `0.4.0`. A future
view must consume the same collection and preference boundary rather than
introduce a parallel data model.

## Trade-offs

- The package temporarily has both the legacy column-first API and the new
  collection-first API. Shared projection and rendering internals prevent two
  independent Kanban implementations.
- Status and assignee become required capabilities of the new collection API.
  This is more opinionated than arbitrary grouping definitions, but matches the
  release contract and gives filters, Settings, Kanban, and List one predictable
  baseline. Additional groupings remain additive definitions in later versions.
- Grouping changes can alter every visible section. Stable item keys, group keys,
  and memoized projections are therefore required; changing grouping must not
  mutate the input collection or reset consumer-owned item state.
- The package name now describes the collection abstraction. Internal `Kanban*`
  names remain intentionally stable for component compatibility.

## Consequences

### Positive

- Kanban and List share filters, grouping, visibility, loading, empty-state, and
  persistence semantics.
- Third-party item types do not need to implement package-owned interfaces.
- Future views can be added without another canonical data model.
- `Status` remains the default grouping for both implemented views while
  `Assignee` is a controlled or uncontrolled preference.

### Negative

- `0.4.0` needs compatibility tests for two input contracts.
- Drag-and-drop grouped by assignee requires a consumer callback to change both
  membership and order; the package cannot infer the domain mutation.
- The generic provider and public naming need careful documentation while the
  package is published as `@tc96/collection-views`; the repository name and
  internal `Kanban*` component names remain compatible for this migration.

### Mitigation

- Build the projection as a framework-free pure function and test identity,
  ordering, empty groups, missing assignments, and immutable input first.
- Keep callbacks controlled and optimistic, with complete next state plus a
  reason, and document URL/storage/remote persistence recipes.
- Validate npm and registry export parity in every delivery PR.

## Revisit triggers

- A consumer needs one item displayed in multiple assignee groups.
- A third view requires a distinct interaction model or field schema beyond the
  current status/assignee facets.
