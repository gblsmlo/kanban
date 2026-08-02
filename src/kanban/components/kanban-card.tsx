import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Card, CardPanel } from '@/components/ui/card'
import { cn } from '../../lib/utils'

export interface KanbanCardProps extends ComponentProps<typeof Card> {
  dimmed?: boolean
  contentClassName?: string
  renderContent?: boolean
  children: ReactNode
}

export function KanbanCard({
  children,
  className,
  contentClassName,
  dimmed = false,
  render = <article />,
  renderContent = true,
  ...props
}: KanbanCardProps): ReactElement {
  return (
    <Card className={cn(dimmed && 'opacity-70', className)} render={render} {...props}>
      {renderContent ? (
        <CardPanel className={cn('p-4', contentClassName)}>{children}</CardPanel>
      ) : (
        children
      )}
    </Card>
  )
}
