import type { ReactNode } from 'react'

export type CollectionGrouping = 'status' | 'assignee'
export type CollectionViewMode = 'kanban' | 'list'

/** @deprecated Use CollectionViewMode. */
export type CollectionView = CollectionViewMode

export interface CollectionOption {
  icon?: ReactNode
  id: string
  label: string
}

export interface CollectionDefinition<TItem = unknown> {
  assignees: readonly CollectionOption[]
  getAssigneeId: (item: TItem) => string | null
  getKey: (item: TItem) => string | number
  getLabel: (item: TItem) => string
  getStatusId: (item: TItem) => string | null
  items: readonly TItem[]
  statuses: readonly CollectionOption[]
}

export interface CollectionPreferences {
  groupBy: CollectionGrouping
  view: CollectionViewMode
}

export type CollectionPreferencesChangeReason = 'grouping' | 'view'

export interface CollectionPreferencesChangeDetails {
  reason: CollectionPreferencesChangeReason
}

export interface CollectionGroup<TItem = unknown> extends CollectionOption {
  count: number
  grouping: CollectionGrouping
  items: readonly TItem[]
  value: string | null
}
