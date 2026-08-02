export interface KanbanColumnData<TCard = unknown> {
  id: string
  title: string
  count: number
  cards: TCard[]
}

export interface KanbanCardMove<TCard = unknown> {
  card: TCard
  cardId: string
  /** Column containing the card when the interaction started. */
  sourceColumnId: string
  /** Original zero-based position in the source column. */
  sourceIndex?: number
  /** Destination column; equal to sourceColumnId for an in-column reorder. */
  targetColumnId: string
  /** Requested zero-based position for consumer-owned persistence. */
  targetIndex?: number
}

export interface KanbanStageOption {
  label: string
  value: string
}
