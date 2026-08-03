'use client'

import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from 'lucide-react'
import { Fragment, type ReactNode, useId } from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Empty, EmptyDescription } from '@/components/ui/empty'
import type { CollectionGroup } from '../../../../collection/types'

export interface ListGroupActions {
  addLabel?: string
  onAddItem?: (groupId: string) => void
}

export interface ListGroupProps<TItem> {
  actions?: ListGroupActions
  collapsed: boolean
  emptyLabel: ReactNode
  group: CollectionGroup<TItem>
  onCollapsedChange: (collapsed: boolean) => void
  renderItem: (item: TItem) => ReactNode
  getKey: (item: TItem) => string | number
}

export function ListGroup<TItem>({
  actions,
  collapsed,
  emptyLabel,
  getKey,
  group,
  onCollapsedChange,
  renderItem,
}: ListGroupProps<TItem>) {
  const instanceId = useId()
  const titleId = `list-group-title-${instanceId}`
  const groupLabel = typeof group.label === 'string' ? group.label : group.id

  return (
    <Collapsible onOpenChange={(open) => onCollapsedChange(!open)} open={!collapsed}>
      <section aria-labelledby={titleId} className="flex flex-col gap-0.5" data-slot="list-group">
        <div
          className="flex min-h-9 items-center justify-between rounded-lg bg-muted/50 px-1"
          data-slot="list-group-header"
        >
          <div className="flex min-w-0 items-center gap-1">
            <CollapsibleTrigger
              render={
                <Button
                  aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${groupLabel}`}
                  size="icon-xs"
                  variant="ghost"
                />
              }
            >
              {collapsed ? (
                <ChevronRightIcon aria-hidden="true" />
              ) : (
                <ChevronDownIcon aria-hidden="true" />
              )}
            </CollapsibleTrigger>
            <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
              {group.icon}
            </span>
            <h2 className="truncate font-medium text-sm" id={titleId}>
              {group.label}
            </h2>
            <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
              {group.count}
            </span>
          </div>
          {actions?.onAddItem ? (
            <Button
              aria-label={actions.addLabel ?? `Add item to ${groupLabel}`}
              onClick={() => actions.onAddItem?.(group.id)}
              size="icon-xs"
              variant="ghost"
            >
              <PlusIcon aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <CollapsiblePanel>
          <div className="flex flex-col" data-slot="list-group-items">
            {group.items.length ? (
              group.items.map((item) => <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>)
            ) : (
              <Empty>
                <EmptyDescription>{emptyLabel}</EmptyDescription>
              </Empty>
            )}
          </div>
        </CollapsiblePanel>
      </section>
    </Collapsible>
  )
}
