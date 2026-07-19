# Agent instructions

- Use Bun `1.3.14` and Node.js `24.18.0`.
- Run `sh scripts/check-toolchain.sh` before diagnosing tool failures.
- Keep the package domain-neutral. Consumers own card content, permissions,
  remote state, ordering rules and persistence.
- The current view adapter targets COSS/Base UI and Tailwind CSS v4.
- Do not add Radix dependencies until a separate Radix adapter is implemented.
- Preserve keyboard drag semantics, stable card identity and minimal motion.
- Run `bun run lint:ci`, `bun run typecheck`, `bun run test`,
  `bun run build` and `bun run storybook:build` before release.
- Use Conventional Commits without AI attribution trailers.
