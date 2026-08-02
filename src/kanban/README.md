## Kanban contract

Kanban is a domain-neutral board view. It owns responsive layout, stage
selection, horizontal click-and-drag scrolling, accessible card movement
between and within columns, and visual reconciliation while a consumer move is
pending.

The consumer owns card content, stage meaning, authorization, navigation,
remote state, mutations, and persistence. Omitting `onMoveCard` makes the board
read-only. The package reports the requested source and target indexes; the
consumer owns ordering rules and persistence.

Use `KanbanCardSkeleton` when a consumer has not loaded card data yet. The
placeholder is passive, keeps the card surface stable, and communicates its
loading state with `role="status"` and `aria-busy="true"` without requiring a
fake domain card. Its visual placeholders come from COSS `ui/skeleton`; the
source registry declares `@coss/skeleton` so the consumer owns that primitive
through the configured `ui` alias.

`onMoveCard` may return `boolean` or `Promise<boolean>`. While an asynchronous
decision is pending, Kanban keeps its optimistic preview across stale
`columns` snapshots. The consumer must update its cache optimistically, persist
the requested `targetIndex`, and either resolve `true` with canonical data or
restore the cache before resolving `false`.

Sortable-to-sortable preview, collision, group changes, keyboard movement,
feedback, and accessibility attributes come from the current dnd-kit API.
Kanban adapts the official `move()` helper only for entry into a plain empty
column and for translating the final dnd-kit event to `KanbanCardMove`.

When a sortable card contains an interactive action, its first button or link
becomes the keyboard drag activator so the item remains a single `Tab` stop.
`Space` starts dragging and `Enter` preserves the control action.
