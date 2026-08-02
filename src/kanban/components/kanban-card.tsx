'use client'

import {
  createContext,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useContext,
} from 'react'
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

export type KanbanCardDisplay = 'full' | 'compact'

export interface KanbanCardProps extends ComponentProps<typeof Card> {
  dimmed?: boolean
  display?: KanbanCardDisplay
  children: ReactNode
}

export type KanbanCardActionProps = ComponentProps<typeof CardAction>
export type KanbanCardContentProps = ComponentProps<typeof CardContent>
export type KanbanCardDescriptionProps = ComponentProps<typeof CardDescription>
export type KanbanCardFooterProps = ComponentProps<typeof CardFooter>
export type KanbanCardHeaderProps = ComponentProps<typeof CardHeader>
export type KanbanCardTitleProps = ComponentProps<typeof CardTitle>

const KanbanCardDisplayContext = createContext<KanbanCardDisplay>('full')

export function KanbanCard({
  children,
  className,
  dimmed = false,
  display = 'full',
  render = <article />,
  ...props
}: KanbanCardProps): ReactElement {
  return (
    <KanbanCardDisplayContext.Provider value={display}>
      <Card
        className={cn('min-w-0 max-w-full overflow-hidden', dimmed && 'opacity-70', className)}
        data-display={display}
        render={render}
        {...props}
      >
        {children}
      </Card>
    </KanbanCardDisplayContext.Provider>
  )
}

export function KanbanCardHeader({ className, ...props }: KanbanCardHeaderProps): ReactElement {
  const display = useContext(KanbanCardDisplayContext)

  return (
    <CardHeader
      className={cn(display === 'compact' && 'flex min-w-0 items-center gap-2 p-3', className)}
      {...props}
    />
  )
}

export function KanbanCardTitle({ className, ...props }: KanbanCardTitleProps): ReactElement {
  const display = useContext(KanbanCardDisplayContext)

  return (
    <CardTitle
      className={cn(
        display === 'compact' && 'min-w-0 flex-1 truncate text-sm leading-normal',
        className,
      )}
      {...props}
    />
  )
}

export function KanbanCardDescription(props: KanbanCardDescriptionProps): ReactElement {
  const display = useContext(KanbanCardDisplayContext)

  return <CardDescription {...props} hidden={display === 'compact' || props.hidden} />
}

export function KanbanCardAction({ className, ...props }: KanbanCardActionProps): ReactElement {
  const display = useContext(KanbanCardDisplayContext)

  return (
    <CardAction
      className={cn(display === 'compact' && 'shrink-0 self-center', className)}
      {...props}
    />
  )
}

export function KanbanCardContent(props: KanbanCardContentProps): ReactElement {
  const display = useContext(KanbanCardDisplayContext)

  return <CardContent {...props} hidden={display === 'compact' || props.hidden} />
}

export function KanbanCardFooter(props: KanbanCardFooterProps): ReactElement {
  const display = useContext(KanbanCardDisplayContext)

  return <CardFooter {...props} hidden={display === 'compact' || props.hidden} />
}
