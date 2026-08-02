'use client'

import { TagIcon } from 'lucide-react'
import {
  createContext,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useContext,
} from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'
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

export interface KanbanCardCompactMetadataProps extends ComponentProps<'div'> {
  date?: string
  dateLabel?: string
  emptyTagsLabel?: string
  label?: string
  tags: readonly string[]
  tagsLabel?: string
}

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

export function KanbanCardCompactMetadata({
  className,
  date,
  dateLabel = 'Date',
  emptyTagsLabel = 'No tags',
  hidden = false,
  label,
  tags,
  tagsLabel = 'Tags',
  ...props
}: KanbanCardCompactMetadataProps): ReactElement {
  const display = useContext(KanbanCardDisplayContext)
  const tagCountLabel = `${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}`
  const accessibleLabel = label ?? tagCountLabel

  if (display !== 'compact' || hidden) {
    return (
      <div
        className={className}
        data-compact-visible="false"
        data-slot="kanban-card-compact-metadata"
        hidden
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        'inline-flex min-w-0 shrink items-center gap-2 text-muted-foreground text-xs',
        className,
      )}
      data-compact-visible="true"
      data-slot="kanban-card-compact-metadata"
      {...props}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label={accessibleLabel}
              data-kanban-card-action=""
              size="xs"
              variant="ghost"
            />
          }
        >
          <TagIcon aria-hidden="true" />
          <span aria-hidden="true">{tags.length}</span>
        </TooltipTrigger>
        <TooltipPopup>
          <div className="grid max-w-64 gap-1.5">
            <div>
              <span className="font-medium">{tagsLabel}:</span>{' '}
              {tags.length ? tags.join(', ') : emptyTagsLabel}
            </div>
          </div>
        </TooltipPopup>
      </Tooltip>
      {date ? (
        <span
          className="inline-flex min-w-0 items-center gap-1"
          data-slot="kanban-card-compact-date"
        >
          <span className="sr-only">{dateLabel}: </span>
          <span className="truncate">{date}</span>
        </span>
      ) : null}
    </div>
  )
}
