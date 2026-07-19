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

The root entry point ships the COSS/Base UI view and a domain-neutral Kanban
contract. The `core` entry point exposes visual-independent types and drag
calculations. The repository owns only the COSS primitives required by this
view.

A future Radix implementation will use a dedicated adapter or entry point while
preserving the public data and callback contract.

## Consequences

- consumers get a complete COSS-compatible view today;
- business stages, authorization, mutations, and persistence stay outside;
- COSS source changes can be reviewed with this component;
- a Radix adapter is added only after real consumer requirements are known;
- visual adapters may differ internally, but cannot redefine view semantics.
