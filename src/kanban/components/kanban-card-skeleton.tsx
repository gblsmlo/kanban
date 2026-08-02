import type { ReactElement } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '../../lib/utils'
import { KanbanCard, type KanbanCardProps } from './kanban-card'

export interface KanbanCardSkeletonProps
  extends Omit<
    KanbanCardProps,
    'aria-busy' | 'aria-label' | 'children' | 'renderContent' | 'role'
  > {
  label?: string
}

export function KanbanCardSkeleton({
  className,
  contentClassName,
  label = 'Carregando card',
  ...props
}: KanbanCardSkeletonProps): ReactElement {
  return (
    <KanbanCard
      {...props}
      aria-busy="true"
      aria-label={label}
      className={cn('pointer-events-none select-none', className)}
      contentClassName={cn('grid min-h-[6.75rem] gap-3', contentClassName)}
      role="status"
    >
      <div aria-hidden="true" className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="grid gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </KanbanCard>
  )
}
