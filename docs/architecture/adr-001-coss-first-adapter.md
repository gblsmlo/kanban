# ADR-001: COSS-first rendering with a stable view contract

- Status: Accepted
- Date: 2026-07-19

## Context

The Kanban must be reusable across SaaS products without importing their
business rules. Current consumers use COSS primitives implemented on Base UI.
COSS is registry-based source rather than a runtime package dependency. Radix
support is desirable later, but designing a universal primitive abstraction now
would add an unvalidated API.

## Decision

The root entry point ships a COSS-first view and a domain-neutral Kanban
contract. The `core` entry point exposes visual-independent types and drag
calculations. Pattern and domain files may only consume visual primitives from
`@/components/ui/*`; they do not import Base UI directly.

For the npm build, the repository keeps copy-owned COSS source under
`src/components/ui`. For source installation, the Kanban registry contains only
pattern files and declares the required official `@coss/*` dependencies. The
consumer's `ui` alias is therefore the single primitive boundary in both modes.

A future Radix implementation will use a dedicated adapter or entry point while
preserving the public data and callback contract.

## Consequences

- consumers get a complete COSS-compatible view today;
- source consumers receive canonical COSS primitives outside the Kanban pattern;
- business stages, authorization, mutations, and persistence stay outside;
- COSS source changes can be reviewed with this component;
- a Radix adapter is added only after real consumer requirements are known;
- visual adapters may differ internally, but cannot redefine view semantics.
