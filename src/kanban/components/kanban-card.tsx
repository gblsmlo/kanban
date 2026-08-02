import type { ComponentProps, ReactElement, ReactNode } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '../../lib/utils'

export interface KanbanCardProps extends ComponentProps<typeof Card> {
  dimmed?: boolean
  children: ReactNode
}

export type KanbanCardActionProps = ComponentProps<typeof CardAction>
export type KanbanCardContentProps = ComponentProps<typeof CardContent>
export type KanbanCardDescriptionProps = ComponentProps<typeof CardDescription>
export type KanbanCardFooterProps = ComponentProps<typeof CardFooter>
export type KanbanCardHeaderProps = ComponentProps<typeof CardHeader>
export type KanbanCardTitleProps = ComponentProps<typeof CardTitle>

export function KanbanCard({
  children,
  className,
  dimmed = false,
  render = <article />,
  ...props
}: KanbanCardProps): ReactElement {
  return (
    <Card
      className={cn('min-w-0 max-w-full overflow-hidden', dimmed && 'opacity-70', className)}
      render={render}
      {...props}
    >
      {children}
    </Card>
  )
}

export function KanbanCardHeader(props: KanbanCardHeaderProps): ReactElement {
  return <CardHeader {...props} />
}

export function KanbanCardTitle(props: KanbanCardTitleProps): ReactElement {
  return <CardTitle {...props} />
}

export function KanbanCardDescription(props: KanbanCardDescriptionProps): ReactElement {
  return <CardDescription {...props} />
}

export function KanbanCardAction(props: KanbanCardActionProps): ReactElement {
  return <CardAction {...props} />
}

export function KanbanCardContent(props: KanbanCardContentProps): ReactElement {
  return <CardContent {...props} />
}

export function KanbanCardFooter(props: KanbanCardFooterProps): ReactElement {
  return <CardFooter {...props} />
}
