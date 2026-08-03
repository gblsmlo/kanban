'use client'

import { type ReactNode, useMemo, useState } from 'react'

import { projectCollection } from '../../../../collection/lib/project-collection'
import type {
  CollectionDefinition,
  CollectionGroup,
  CollectionGrouping,
} from '../../../../collection/types'
import { ListGroup, type ListGroupActions } from './list-group'

export interface ListViewProps<TItem> {
  collection: CollectionDefinition<TItem>
  collapsedGroupIds?: readonly string[]
  defaultCollapsedGroupIds?: readonly string[]
  emptyGroupLabel?: ReactNode | ((group: CollectionGroup<TItem>) => ReactNode)
  getGroupActions?: (group: CollectionGroup<TItem>) => ListGroupActions | undefined
  grouping: CollectionGrouping
  onCollapsedGroupIdsChange?: (groupIds: readonly string[]) => void
  renderItem: (item: TItem) => ReactNode
}

export function ListView<TItem>({
  collection,
  collapsedGroupIds: controlledCollapsedGroupIds,
  defaultCollapsedGroupIds = [],
  emptyGroupLabel = 'No items in this group.',
  getGroupActions,
  grouping,
  onCollapsedGroupIdsChange,
  renderItem,
}: ListViewProps<TItem>) {
  const [uncontrolledCollapsedGroupIds, setUncontrolledCollapsedGroupIds] =
    useState<readonly string[]>(defaultCollapsedGroupIds)
  const collapsedGroupIds = controlledCollapsedGroupIds ?? uncontrolledCollapsedGroupIds
  const groups = useMemo(() => projectCollection(collection, grouping), [collection, grouping])

  const setGroupCollapsed = (groupId: string, collapsed: boolean) => {
    const nextGroupIds = collapsed
      ? [...collapsedGroupIds.filter((id) => id !== groupId), groupId]
      : collapsedGroupIds.filter((id) => id !== groupId)

    if (!controlledCollapsedGroupIds) setUncontrolledCollapsedGroupIds(nextGroupIds)
    onCollapsedGroupIdsChange?.(nextGroupIds)
  }

  return (
    <div
      className="flex min-w-0 flex-col gap-1 p-2"
      data-collection-grouping={grouping}
      data-slot="list-view"
    >
      {groups.map((group) => {
        const actions = getGroupActions?.(group)

        return (
          <ListGroup
            collapsed={collapsedGroupIds.includes(group.id)}
            emptyLabel={
              typeof emptyGroupLabel === 'function' ? emptyGroupLabel(group) : emptyGroupLabel
            }
            getKey={collection.getKey}
            group={group}
            key={group.id}
            onCollapsedChange={(collapsed) => setGroupCollapsed(group.id, collapsed)}
            renderItem={renderItem}
            {...(actions ? { actions } : {})}
          />
        )
      })}
    </div>
  )
}
