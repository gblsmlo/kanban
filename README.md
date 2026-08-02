# Kanban

A domain-neutral, accessible Kanban view for React applications built with
[COSS](https://github.com/cosscom/coss) primitives, DnD Kit, and Tailwind CSS.

The package provides the interaction and presentation layer for SaaS board
views. Your application remains responsible for business stages, permissions,
remote state, mutations, navigation, and persistence.

## Highlights

- generic typed columns and consumer-rendered cards
- accessible card skeleton for consumer loading states
- consumer-controlled full and compact card presentations
- accessible pointer and keyboard drag-and-drop with the current DnD Kit React API
- native optimistic sorting within and between populated columns
- consumer-controlled move acceptance and rollback
- read-only mode when `onMoveCard` is omitted
- responsive desktop board and mobile stage selector
- horizontal desktop scrolling by clicking, holding, and dragging the board
- horizontal scrollbar visible only while that board-drag gesture is active
- minimal drag motion with DnD Kit DragOverlay, feedback, and accessibility plugins
- COSS-first visual primitives with no direct Base UI usage in the Kanban pattern

## Requirements

- React 19
- Base UI 1.x
- Lucide React 1.x
- Tailwind CSS 4

The package is COSS-first. Every Kanban component imports visual primitives from
`@/components/ui/*`; only the copy-owned COSS source in `src/components/ui`
depends on its Base UI internals. The source registry does not copy those files
into the pattern. It declares the official COSS registry dependencies so the
consumer receives them through its configured `ui` alias.

The view composes the canonical COSS `Badge`, `Button`, `Card`, `ScrollArea`,
`Skeleton`, and `Tooltip` primitives. The npm build bundles their
copy-owned source. The source registry instead declares `@coss/badge`,
`@coss/button`, `@coss/card`, `@coss/scroll-area`, `@coss/skeleton`, and
`@coss/tooltip`, installing them at `@/components/ui/*` through the consumer's
`ui` alias.

## Installation

Install the published package with your package manager:

```bash
pnpm add @tc96/kanban
# or: bun add @tc96/kanban
# or: npm install @tc96/kanban
```

The consumer must already provide the peer dependencies:

```bash
pnpm add react react-dom @base-ui/react lucide-react tailwindcss
```

### COSS source location

`@tc96/kanban` supports two installation modes. Use the npm package when you
want to import it from `node_modules`. Use the bundled registry item when you
want the source copied into the consuming app.

Keep `ui` mapped to your primitive components and add `patterns` for TC96
patterns. `patterns` is not a replacement for `ui`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "patterns": "@/components/patterns"
  }
}
```

After installing the package, add the local registry item:

```bash
bun add @tc96/kanban
bunx shadcn@latest add ./node_modules/@tc96/kanban/registry/kanban.json
```

The registry item targets `@components/patterns/kanban` for the pattern source
and declares every required `@coss/*` primitive as a registry dependency. The
shadcn CLI therefore installs visual primitives through `aliases.ui` while
keeping only Kanban-specific source under `./components/patterns/kanban`.

Tailwind must scan the installed package and your theme must expose the standard
COSS semantic tokens. The official
[COSS styling preset](https://coss.com/ui/docs/styling) also provides
`--animate-skeleton` and its keyframes:

```css
@import "tailwindcss";
@source "../node_modules/@tc96/kanban/dist";
```

## Quick start

```tsx
import {
  KanbanCard,
  KanbanCardHeader,
  KanbanCardTitle,
  KanbanView,
  type KanbanCardMove,
  type KanbanColumnData,
} from "@tc96/kanban";

type RecordItem = {
  id: string;
  title: string;
};

export function Board({
  columns,
  moveRecord,
  openCreateForm,
  openColumnSettings,
}: {
  columns: KanbanColumnData<RecordItem>[];
  moveRecord: (move: KanbanCardMove<RecordItem>) => boolean | Promise<boolean>;
  openCreateForm: (columnId: string) => void;
  openColumnSettings: (columnId: string) => void;
}) {
  return (
    <KanbanView
      columns={columns}
      getCardLabel={(record) => record.title}
      getColumnActions={(column) =>
        column.id === "backlog"
          ? {
              onAddCard: (columnId) => openCreateForm(columnId),
              onOpenSettings: (columnId) => openColumnSettings(columnId),
            }
          : undefined
      }
      getKey={(record) => record.id}
      onMoveCard={moveRecord}
      renderCard={(record) => (
        <KanbanCard>
          <KanbanCardHeader>
            <KanbanCardTitle className="text-sm">{record.title}</KanbanCardTitle>
          </KanbanCardHeader>
        </KanbanCard>
      )}
    />
  );
}
```

`KanbanCard` preserves the COSS card composition without exposing the consumer
to the underlying UI package. Render `KanbanCardHeader`, `KanbanCardContent`, and
`KanbanCardFooter` directly under it as needed. Use the content for labels and
other task data; reserve the footer for metadata such as assignee or date.
Consumers may adjust typography on `KanbanCardTitle` or
`KanbanCardDescription`, while the sections retain their spacing and structure.

### Card display modes

`KanbanCard` defaults to the existing `full` presentation. Set its controlled
`display` prop to `compact` to retain only the title, compact metadata, and
date. The consumer owns the control and persistence of this preference; keep
the control outside draggable cards, such as in the board toolbar settings:

```tsx
import {
  KanbanCard,
  KanbanCardCompactMetadata,
  KanbanCardContent,
  KanbanCardDescription,
  KanbanCardFooter,
  KanbanCardHeader,
  KanbanCardTitle,
  type KanbanCardDisplay,
} from "@tc96/kanban";

export function TaskCard({
  display,
  task,
}: {
  display: KanbanCardDisplay;
  task: Task;
}) {
  return (
    <KanbanCard display={display}>
      <KanbanCardHeader>
        <KanbanCardTitle>{task.title}</KanbanCardTitle>
        <KanbanCardDescription>{task.description}</KanbanCardDescription>
        <KanbanCardCompactMetadata date={task.date} tags={task.tags} />
      </KanbanCardHeader>
      <KanbanCardContent>{/* Full tags */}</KanbanCardContent>
      <KanbanCardFooter>{/* Assignee and date */}</KanbanCardFooter>
    </KanbanCard>
  );
}
```

The toolbar in Storybook demonstrates a board-wide `Full` or `Compact` setting.
Compact metadata keeps the order title, tags, and date without adding a card
action. The date stays visible beside the tag count; hovering or focusing the
tag count opens the COSS tooltip with every tag. Supply `label`, `tagsLabel`, and
`dateLabel` when the defaults do not match the product locale.

`getColumnActions` enables the settings and add controls independently for each
column. The package renders accessible icon buttons and reports the logical
column id; the consumer owns permissions, menu or form content, mutations, and
persistence. Omit it, return `undefined`, or omit either callback to keep that
action out of the column header. Use `settingsLabel` and `addLabel` when the
default Portuguese accessible labels do not match the product locale.

Omit `onMoveCard` to render a read-only board. Returning or resolving `false`
rejects the interaction and restores the previous view. A rejected optimistic
mutation must also restore the consumer-owned cache.

`onMoveCard` is also called when a card changes position inside its current
column. In that case, `sourceColumnId` and `targetColumnId` are equal while
`sourceIndex` and `targetIndex` describe the requested reorder. Apply and
persist that ordering in the consumer, update `columns`, and return `true` to
keep the preview. For asynchronous persistence, return `Promise<boolean>`.
While it is pending, the requested order stays visible even if `columns`
temporarily receives an older cache snapshot. Resolve `true` after the
canonical data accepts the order, or roll the consumer cache back and resolve
`false` when persistence fails.

The board uses `DragDropProvider`, `useSortable`, sortable `group`/`index`, the
native `OptimisticSortingPlugin`, and the official `move()` helper. The plugin
reorders the DOM during sortable drag-over without forcing a React list render.
The current `DragOverlay` source callback renders the moving card without
package-owned active-card state, leaving the original sortable element free to
occupy the optimistic slot.
React state is used only when a plain column droppable is needed to enter an
empty list and after drop to shield the optimistic order from stale consumer
snapshots. There is no package-owned before/after collision algorithm.

### Loading cards

Use `KanbanCardSkeleton` while card data is unavailable. It preserves the card
surface without creating placeholder domain records or enabling drag behavior:

```tsx
import { KanbanCardSkeleton } from "@tc96/kanban";

export function LoadingCard() {
  return <KanbanCardSkeleton label="Loading task" />;
}
```

The skeleton exposes `role="status"` and `aria-busy="true"`. Its `label` is
announced by assistive technology while its visual placeholders remain
decorative. Its visual primitive is the COSS `ui/skeleton`; the Kanban package
only composes its card-specific geometry and loading semantics.

### Long consumer content

Kanban columns, sortable wrappers, and cards clamp their intrinsic width so a
long unbroken value cannot resize a column or the board. The sortable wrapper
does not clip overflow, keeping tooltips, menus, focus halos, and shadows under
consumer control. The card clips visual overflow as a final layout safeguard,
which the consumer can override when needed. The consumer still owns how a tag
is presented and made fully available—for example, combine `max-w-full`,
`truncate`, and a `title` or tooltip containing the complete label. The `Card`
story demonstrates that strategy with a long tag; wrapping is equally valid
when it better matches the product.

For sortable cards with an interactive action, the first button or link is also
the keyboard drag activator. Press `Space` to drag or `Enter` to keep the
control's normal action without adding a second `Tab` stop.

Use `@tc96/kanban/core` when a non-visual layer only needs the public types and
the DnD Kit event-to-Kanban projection helpers.

## Ownership boundary

| Package owns | Consumer owns |
| --- | --- |
| board layout and responsive stage navigation | business meaning and order of stages |
| DnD Kit sensor configuration and native sortable preview | permission to move a specific card |
| stable visual card and column identities | server state and canonical ordering |
| visual reconciliation while a move is pending | mutations, optimistic updates, rollback, and errors |
| presentation-level move callback | workflows, automation, and persistence |

The package reports both cross-column moves and same-column reorders through
`onMoveCard`. The consumer remains responsible for its ordering rules and for
persisting the requested `targetIndex`.

## Development

Use Bun `1.3.14` and Node `24.18.0`.

```bash
bun install
bun run storybook
bun run lint:ci
bun run typecheck
bun test
bun run test:storybook
bun run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow and
[ADR-001](docs/architecture/adr-001-coss-first-adapter.md) for the adapter
decision.

## License

[MIT](LICENSE) © Gabriel Melo.
