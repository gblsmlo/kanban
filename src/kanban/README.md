## Kanban contract

Kanban is a domain-neutral board view. It owns responsive layout, stage
selection, accessible cross-column drag-and-drop, insertion preview, and local
rollback when a consumer rejects a move.

The consumer owns card content, stage meaning, authorization, navigation,
remote state, mutations, and persistence. Omitting `onMoveCard` makes the board
read-only. Ordering within the same column remains consumer/server-owned.
