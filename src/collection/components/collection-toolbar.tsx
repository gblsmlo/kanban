import type { ComponentProps, ReactElement } from 'react'

import { Toolbar, ToolbarGroup } from '@/components/ui/toolbar'
import { cn } from '../../lib/utils'

export type CollectionToolbarProps = ComponentProps<typeof Toolbar>
export type CollectionToolbarGroupProps = ComponentProps<typeof ToolbarGroup>

export function CollectionToolbar({ className, ...props }: CollectionToolbarProps): ReactElement {
  return <Toolbar className={cn('justify-between', className)} {...props} />
}

export function CollectionToolbarGroup(props: CollectionToolbarGroupProps): ReactElement {
  return <ToolbarGroup {...props} />
}
