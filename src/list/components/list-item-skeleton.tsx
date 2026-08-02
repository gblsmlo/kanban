import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { ListItem, ListItemFooter, ListItemHeader } from './list-item'

export interface ListItemSkeletonProps {
  label?: string
}

export function ListItemSkeleton({ label = 'Loading item' }: ListItemSkeletonProps): ReactElement {
  return (
    <ListItem aria-busy="true" aria-label={label} role="status">
      <ListItemHeader aria-hidden="true">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </ListItemHeader>
      <ListItemFooter aria-hidden="true">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </ListItemFooter>
    </ListItem>
  )
}
