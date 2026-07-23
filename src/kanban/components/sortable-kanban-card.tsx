import type { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

const ACTIONABLE_DESCENDANT_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]:not([aria-disabled="true"])',
].join(',')

interface SortableKanbanCardProps {
  children: ReactNode
  columnId: string
  dragLabel: string
  id: UniqueIdentifier
}

export function SortableKanbanCard({ children, columnId, dragLabel, id }: SortableKanbanCardProps) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform } = useSortable({
    animateLayoutChanges: () => false,
    attributes: {
      role: 'region',
      roleDescription: 'card arrastável',
      tabIndex: 0,
    },
    data: { cardId: String(id), columnId, type: 'card' },
    id,
    transition: null,
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
  }
  const wrapperRef = useRef<HTMLElement | null>(null)
  const [hasContentActivator, setHasContentActivator] = useState(false)
  const setWrapperRef = useCallback(
    (node: HTMLElement | null) => {
      wrapperRef.current = node
      setNodeRef(node)
    },
    [setNodeRef],
  )
  const {
    'aria-describedby': dragDescriptionId,
    'aria-disabled': dragDisabled,
    'aria-pressed': _ariaPressed,
    'aria-roledescription': dragRoleDescription,
    role: _role,
    tabIndex: dragTabIndex,
    ...dragAttributes
  } = attributes

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const contentActivator = wrapper?.querySelector<HTMLElement>(ACTIONABLE_DESCENDANT_SELECTOR)
    const activator = contentActivator ?? wrapper

    setActivatorNodeRef(activator)
    setHasContentActivator(Boolean(contentActivator))

    if (!contentActivator) {
      return () => setActivatorNodeRef(null)
    }

    const restorations = [
      setTokenAttribute(contentActivator, 'aria-describedby', dragDescriptionId),
      setTokenAttribute(contentActivator, 'aria-keyshortcuts', 'Space'),
      setDefaultAttribute(contentActivator, 'aria-roledescription', dragRoleDescription),
      setDefaultAttribute(contentActivator, 'aria-disabled', dragDisabled),
    ]
    contentActivator.dataset.kanbanCardActivator = ''

    return () => {
      for (const restore of restorations) restore()
      delete contentActivator.dataset.kanbanCardActivator
      setActivatorNodeRef(null)
    }
  })

  return (
    <section
      aria-describedby={hasContentActivator ? undefined : dragDescriptionId}
      aria-disabled={hasContentActivator ? undefined : dragDisabled}
      aria-label={dragLabel}
      aria-roledescription={hasContentActivator ? undefined : dragRoleDescription}
      className="relative touch-none cursor-grab rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      data-kanban-card-draggable=""
      ref={setWrapperRef}
      style={style}
      tabIndex={hasContentActivator ? -1 : dragTabIndex}
      {...dragAttributes}
      {...listeners}
    >
      {children}
    </section>
  )
}

function setTokenAttribute(
  element: HTMLElement,
  name: string,
  value: boolean | string | undefined,
): () => void {
  if (value === undefined || value === false) return () => undefined

  const previousValue = element.getAttribute(name)
  const stringValue = String(value)
  const mergedValue =
    previousValue && previousValue !== stringValue
      ? Array.from(new Set(`${previousValue} ${stringValue}`.split(/\s+/))).join(' ')
      : stringValue

  element.setAttribute(name, mergedValue)

  return () => {
    if (element.getAttribute(name) !== mergedValue) return
    if (previousValue === null) element.removeAttribute(name)
    else element.setAttribute(name, previousValue)
  }
}

function setDefaultAttribute(
  element: HTMLElement,
  name: string,
  value: boolean | string | undefined,
): () => void {
  if (value === undefined || value === false || element.hasAttribute(name)) return () => undefined

  const appliedValue = String(value)
  element.setAttribute(name, appliedValue)

  return () => {
    if (element.getAttribute(name) === appliedValue) element.removeAttribute(name)
  }
}
