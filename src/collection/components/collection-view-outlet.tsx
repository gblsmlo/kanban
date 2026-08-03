'use client'

import { type ReactNode, useMemo } from 'react'

import {
  KanbanView,
  type KanbanViewProps,
} from '../../components/views/kanban/components/kanban-view'
import type { KanbanColumnData } from '../../components/views/kanban/types'
import { ListView, type ListViewProps } from '../../components/views/list/components/list-view'
import { projectCollection } from '../lib/project-collection'
import type { CollectionDefinition } from '../types'
import { useCollectionPreferences } from './collection-provider'

export type CollectionKanbanViewProps<TItem> = Omit<
  KanbanViewProps<TItem>,
  'columns' | 'getKey' | 'renderCard'
>

export type CollectionListViewProps<TItem> = Omit<
  ListViewProps<TItem>,
  'collection' | 'grouping' | 'renderItem'
>

export interface CollectionViewOutletProps<TItem> {
  collection: CollectionDefinition<TItem>
  kanban?: CollectionKanbanViewProps<TItem>
  list?: CollectionListViewProps<TItem>
  renderKanbanItem: (item: TItem) => ReactNode
  renderListItem: (item: TItem) => ReactNode
}

export function CollectionViewOutlet<TItem>({
  collection,
  kanban,
  list,
  renderKanbanItem,
  renderListItem,
}: CollectionViewOutletProps<TItem>) {
  const { preferences } = useCollectionPreferences()
  const columns = useMemo<KanbanColumnData<TItem>[]>(() => {
    if (preferences.view !== 'kanban') return []

    return projectCollection(collection, preferences.groupBy).map((group) => ({
      cards: [...group.items],
      count: group.count,
      id: group.id,
      title: group.label,
    }))
  }, [collection, preferences.groupBy, preferences.view])

  if (preferences.view === 'list') {
    return (
      <ListView
        collection={collection}
        grouping={preferences.groupBy}
        renderItem={renderListItem}
        {...list}
      />
    )
  }

  return (
    <KanbanView
      columns={columns}
      getCardLabel={collection.getLabel}
      getKey={collection.getKey}
      renderCard={renderKanbanItem}
      {...kanban}
    />
  )
}
