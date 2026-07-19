import type { ReactElement, ReactNode } from 'react'
import { Card, CardPanel, type CardProps } from '../../components/card'
import { cn } from '../../lib/utils'

export interface KanbanCardProps extends Omit<CardProps, 'density'> {
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
    <Card className={cn(dimmed && 'opacity-70', className)} density="sm" render={render} {...props}>
      {renderContent ? <CardPanel className={contentClassName}>{children}</CardPanel> : children}
    </Card>
  )
}
