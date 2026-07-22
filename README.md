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

`@tc96/kanban` is installed from npm and imported from `node_modules`. It does
not need a `components.json`. Add that file only when the consuming app uses the
COSS/shadcn CLI. Map the `ui` alias to `components/patterns` so COSS primitives
are owned by the app in that directory:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "tsx": true,
  "aliases": { "ui": "@/components/patterns" }
}
```

Then run `pnpm dlx shadcn@latest add @coss/ui` (or the Bun/npm equivalent).

Tailwind must scan the installed package and your theme must expose the standard
COSS semantic tokens:

```css
@import "tailwindcss";
@source "../node_modules/@gblsmlo/kanban/dist";
```

## Quick start

```tsx
import {
  KanbanCard,
  KanbanView,
  type KanbanCardMove,
  type KanbanColumnData,
} from "@gblsmlo/kanban";

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

Use `@gblsmlo/kanban/core` when a non-visual layer only needs the public types
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
