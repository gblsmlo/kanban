import type { ComponentPropsWithoutRef, ReactElement } from 'react'

import { cn } from '../../../../lib/utils'

export interface ListItemProps extends ComponentPropsWithoutRef<'article'> {
  interactive?: boolean
}
export type ListItemActionProps = ComponentPropsWithoutRef<'div'>
export type ListItemContentProps = ComponentPropsWithoutRef<'div'>
export type ListItemDescriptionProps = ComponentPropsWithoutRef<'span'>
export type ListItemFooterProps = ComponentPropsWithoutRef<'footer'>
export type ListItemHeaderProps = ComponentPropsWithoutRef<'header'>
export type ListItemTitleProps = ComponentPropsWithoutRef<'h3'>

export function ListItem({ className, interactive = true, ...props }: ListItemProps): ReactElement {
  return (
    <article
      className={cn(
        'flex min-h-9 min-w-0 items-center gap-3 overflow-hidden rounded-lg px-2 py-1.5',
        interactive && 'hover:bg-muted/50',
        className,
      )}
      data-interactive={interactive ? '' : undefined}
      data-slot="list-item"
      {...props}
    />
  )
}

export function ListItemHeader({ className, ...props }: ListItemHeaderProps): ReactElement {
  return (
    <header
      className={cn('flex min-w-0 flex-1 items-center gap-2', className)}
      data-slot="list-item-header"
      {...props}
    />
  )
}

export function ListItemTitle({ className, ...props }: ListItemTitleProps): ReactElement {
  return (
    <h3
      className={cn('min-w-0 truncate font-medium text-sm', className)}
      data-slot="list-item-title"
      {...props}
    />
  )
}

export function ListItemDescription({
  className,
  ...props
}: ListItemDescriptionProps): ReactElement {
  return (
    <span
      className={cn('shrink-0 text-muted-foreground text-sm', className)}
      data-slot="list-item-description"
      {...props}
    />
  )
}

export function ListItemContent({ className, ...props }: ListItemContentProps): ReactElement {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center gap-1 truncate text-muted-foreground text-sm',
        className,
      )}
      data-slot="list-item-content"
      {...props}
    />
  )
}

export function ListItemFooter({ className, ...props }: ListItemFooterProps): ReactElement {
  return (
    <footer
      className={cn(
        'ms-auto flex shrink-0 items-center gap-2 text-muted-foreground text-sm tabular-nums',
        className,
      )}
      data-slot="list-item-footer"
      {...props}
    />
  )
}

export function ListItemAction({ className, ...props }: ListItemActionProps): ReactElement {
  return (
    <div
      className={cn('flex shrink-0 items-center', className)}
      data-slot="list-item-action"
      {...props}
    />
  )
}
