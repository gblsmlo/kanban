export interface KanbanColumnData<TCard = unknown> {
  id: string
  title: string
  count: number
  cards: TCard[]
}

export interface KanbanCardMove<TCard = unknown> {
  card: TCard
  cardId: string
  sourceColumnId: string
  sourceIndex?: number
  targetColumnId: string
  targetIndex?: number
}

export interface KanbanStageOption {
  label: string
  value: string
}
