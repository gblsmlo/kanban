# Grouping API

Grouping defines the primary sections rendered by a collection view. It is not
a card or row style.

## Rules

- `status` is the default for Kanban and List.
- `assignee` uses the collection's assignee catalog and `getAssigneeId`.
- Catalog order defines section order.
- Original item order is preserved inside each section.
- Empty catalog sections remain visible with count zero.
- Unassigned items are placed in one final `No status` or `No assignee` section.
- Unknown non-null ids are kept in a stable fallback section instead of being
  dropped.
- Projection never mutates the items or option arrays supplied by the consumer.

`projectCollection(collection, grouping)` is exported from the main package and
`@tc96/kanban/core` for consumers that need the same deterministic projection
outside React.

`CollectionSettingsMenu` uses the documented COSS Menu hierarchy and updates
the provider through `Grouping by → Status | Assignee`. Labels can be
localized through its `messages` prop.

Grouping currently resolves one status and one assignee per item. Rendering
additional people inside an item is allowed, but multi-group membership is not
implicit in `0.4.0`.
