import type {
  CollectionDefinition,
  CollectionGroup,
  CollectionGrouping,
  CollectionOption,
} from '../types'

export interface CollectionProjectionMessages {
  noAssignee: string
  noStatus: string
}

const defaultMessages: CollectionProjectionMessages = {
  noAssignee: 'No assignee',
  noStatus: 'No status',
}

interface MutableCollectionGroup<TItem> extends Omit<CollectionGroup<TItem>, 'items'> {
  items: TItem[]
}

function createGroup<TItem>(
  grouping: CollectionGrouping,
  option: CollectionOption,
): MutableCollectionGroup<TItem> {
  return {
    ...option,
    count: 0,
    grouping,
    items: [],
    value: option.id,
  }
}

export function projectCollection<TItem>(
  collection: CollectionDefinition<TItem>,
  grouping: CollectionGrouping,
  messages: CollectionProjectionMessages = defaultMessages,
): readonly CollectionGroup<TItem>[] {
  const options = grouping === 'status' ? collection.statuses : collection.assignees
  const getGroupId = grouping === 'status' ? collection.getStatusId : collection.getAssigneeId
  const groups = options.map((option) => createGroup<TItem>(grouping, option))
  const groupsByValue = new Map(groups.map((group) => [group.value, group]))
  let unassignedGroup: MutableCollectionGroup<TItem> | undefined

  for (const item of collection.items) {
    const value = getGroupId(item)
    let group = groupsByValue.get(value)

    if (value === null && !group) {
      unassignedGroup = {
        count: 0,
        grouping,
        id: `${grouping}:unassigned`,
        items: [],
        label: grouping === 'status' ? messages.noStatus : messages.noAssignee,
        value: null,
      }
      group = unassignedGroup
      groupsByValue.set(null, group)
    } else if (value !== null && !group) {
      group = createGroup(grouping, { id: value, label: value })
      groups.push(group)
      groupsByValue.set(value, group)
    }

    if (!group) continue
    group.items.push(item)
    group.count = group.items.length
  }

  if (unassignedGroup) groups.push(unassignedGroup)

  return groups.map((group) => ({
    ...group,
    id: group.value === null ? group.id : `${grouping}:${group.id}`,
  }))
}
