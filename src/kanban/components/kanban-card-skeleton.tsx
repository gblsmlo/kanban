import type { ReactElement } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '../../lib/utils'
import {
  KanbanCard,
  KanbanCardContent,
  KanbanCardFooter,
  KanbanCardHeader,
  type KanbanCardProps,
} from './kanban-card'

export interface KanbanCardSkeletonProps
  extends Omit<KanbanCardProps, 'aria-busy' | 'aria-label' | 'children' | 'role'> {
  label?: string
}

export function KanbanCardSkeleton({
  className,
  label = 'Carregando card',
  ...props
}: KanbanCardSkeletonProps): ReactElement {
  return (
    <KanbanCard
      {...props}
      aria-busy="true"
      aria-label={label}
      className={cn('pointer-events-none select-none', className)}
      role="status"
    >
      <KanbanCardHeader aria-hidden="true">
        <Skeleton className="h-4 w-2/3" />
        <div className="grid gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </KanbanCardHeader>
      <KanbanCardContent aria-hidden="true">
        <Skeleton className="h-6 w-12 rounded-full" />
      </KanbanCardContent>
      <KanbanCardFooter aria-hidden="true" className="justify-between gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </KanbanCardFooter>
    </KanbanCard>
  )
}
