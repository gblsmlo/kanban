# Contributing

Contributions should preserve the package as a domain-neutral view. Product
stages, permissions, API clients, routing, and persistence belong in the
consumer.

## Local workflow

1. Use Bun `1.3.14` and Node `24.18.0`.
2. Run `bun install`.
3. Add or update tests and Storybook examples with neutral cards.
4. Run `bun run lint:ci`, `bun run typecheck`, `bun test`,
   `bun run test:storybook`, and `bun run build`.
5. Use Conventional Commits.

Changes to the public contract should include migration notes and must remain
independent from the COSS/Base UI rendering implementation.
