# List API

`ListView<TItem>` renders an explicit typed collection as collapsible groups.
Use `CollectionViewOutlet` when Settings must switch between Kanban and List.

## Composition

```tsx
<ListView<Task>
  collection={collection}
  grouping="status"
  renderItem={(task) => (
    <ListItem aria-label={task.title}>
      <ListItemHeader>
        <ListItemDescription>{task.code}</ListItemDescription>
        <ListItemTitle>{task.title}</ListItemTitle>
        <ListItemContent>{task.summary}</ListItemContent>
      </ListItemHeader>
      <ListItemFooter>{/* assignee, date, metadata */}</ListItemFooter>
      <ListItemAction>{/* consumer action */}</ListItemAction>
    </ListItem>
  )}
/>
```

Passing `collection` and `grouping` explicitly keeps standalone List usage
type-safe. Under `CollectionProvider`, read both from the provider render prop.

The public `ListItem*` components form a dense semantic row (`article`, header,
content, metadata footer, and actions) without exposing the COSS API to the
consumer. A List row is intentionally not a Card: using Card/CardFrame here
creates nested surfaces and spacing that conflict with a scan-oriented list.

`ListGroup` composes the COSS Collapsible and Button primitives for disclosure
and actions. Consumer metadata can use COSS components such as Badge and Avatar
inside the package-owned slots. The package does not apply a consumer theme or
require primitive style overrides.

## Expansion

Groups start expanded. Use `defaultCollapsedGroupIds` for local defaults or
`collapsedGroupIds` with `onCollapsedGroupIdsChange` for controlled persistence.
Group ids include the active grouping, such as `status:backlog` and
`assignee:ana`, so preferences from both projections can coexist.

## Actions and read-only

`getGroupActions` can expose `onAddItem(groupId)` and an accessible `addLabel`.
Omitting it removes group mutation actions. Consumer actions belong inside
`ListItemAction`; omitting them produces a passive List. Set
`interactive={false}` on `ListItem` when a read-only row must not expose a hover
surface.

Item reordering and cross-group movement are not part of the first List slice.
They will use the existing DnD adapter and consumer-owned persistence rather
than introducing a second sorting implementation.

## Loading

`ListItemSkeleton` is a passive `role="status"` placeholder composed with the
COSS Skeleton primitive. It does not create fake collection items.
