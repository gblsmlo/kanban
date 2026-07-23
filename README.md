# Kanban

A domain-neutral, accessible Kanban view for React applications built with
[COSS](https://github.com/cosscom/coss), Base UI, DnD Kit, and Tailwind CSS.

The package provides the interaction and presentation layer for SaaS board
views. Your application remains responsible for business stages, permissions,
remote state, mutations, navigation, and persistence.

## Highlights

- generic typed columns and consumer-rendered cards
- accessible pointer and keyboard drag-and-drop with DnD Kit
- cross-column insertion preview with stable card identities
- consumer-controlled move acceptance and rollback
- read-only mode when `onMoveCard` is omitted
- responsive desktop board and mobile stage selector
- horizontal desktop scrolling by clicking, holding, and dragging the board
- minimal drag motion and a dedicated overlay
- COSS visual primitives implemented on Base UI

## Requirements

- React 19
- Base UI 1.x
- Tailwind CSS 4

The package is COSS-first. COSS is distributed as source through its component
registry, so this repository owns the small set of COSS primitives required by
the view. A future Radix implementation will be a separate adapter and will not
change the domain-neutral contract.

## Installation

Install the published package with your package manager:

```bash
pnpm add @tc96/kanban
# or: bun add @tc96/kanban
# or: npm install @tc96/kanban
```

The consumer must already provide the peer dependencies:

```bash
pnpm add react react-dom @base-ui/react tailwindcss
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

The registry item targets `@components/patterns/kanban`, which resolves through
`aliases.components` and keeps `./components/ui` untouched.

Tailwind must scan the installed package and your theme must expose the standard
COSS semantic tokens:

```css
@import "tailwindcss";
@source "../node_modules/@tc96/kanban/dist";
```

## Quick start

```tsx
import {
  KanbanCard,
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
}: {
  columns: KanbanColumnData<RecordItem>[];
  moveRecord: (move: KanbanCardMove<RecordItem>) => boolean;
}) {
  return (
    <KanbanView
      columns={columns}
      getCardLabel={(record) => record.title}
      getKey={(record) => record.id}
      onMoveCard={moveRecord}
      renderCard={(record) => (
        <KanbanCard>
          <strong>{record.title}</strong>
        </KanbanCard>
      )}
    />
  );
}
```

Omit `onMoveCard` to render a read-only board. Returning `false` from the
callback rejects the interaction and restores the previous view.

For sortable cards with an interactive action, the first button or link is also
the keyboard drag activator. Press `Space` to drag or `Enter` to keep the
control's normal action without adding a second `Tab` stop.

Use `@tc96/kanban/core` when a non-visual layer only needs the public types
and drag-and-drop calculation helpers.

## Ownership boundary

| Package owns | Consumer owns |
| --- | --- |
| board layout and responsive stage navigation | business meaning and order of stages |
| accessible drag sensors and insertion preview | permission to move a specific card |
| stable visual card and column identities | server state and canonical ordering |
| local acceptance or rollback behavior | mutations, optimistic updates, and errors |
| presentation-level move callback | workflows, automation, and persistence |

The package intentionally supports cross-column movement only. Reordering
inside the same column remains consumer/server-owned until a durable ordering
contract is defined.

## Development

Use Bun `1.3.14` and Node `24.18.0`.

```bash
bun install
bun run storybook
bun run lint:ci
bun run typecheck
bun test
bun run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow and
[ADR-001](docs/architecture/adr-001-coss-first-adapter.md) for the adapter
decision.

## License

[MIT](LICENSE) © Gabriel Melo.
