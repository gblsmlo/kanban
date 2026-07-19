import { useId } from 'react'
import { ScrollArea } from '../../components/scroll-area'
import { cn } from '../../lib/utils'

import type { KanbanStageOption } from '../types'

export interface KanbanStageSelectorProps {
  id?: string
  label?: string
  stages: KanbanStageOption[]
  value: string
  onValueChange: (value: string) => void
  hint?: string
}

export function KanbanStageSelector({
  id,
  label = 'Etapa',
  stages,
  value,
  onValueChange,
  hint,
}: KanbanStageSelectorProps) {
  const generatedId = useId()
  const selectorId = id ?? `kanban-stage-${generatedId}`

  return (
    <div className="md:hidden">
      <div className="mb-1.5 font-medium text-muted-foreground text-xs" id={`${selectorId}-label`}>
        {label}
      </div>
      <ScrollArea aria-labelledby={`${selectorId}-label`} className="h-9" scrollbarGutter>
        <div className="flex w-max gap-1">
          {stages.map((stage) => {
            const selected = stage.value === value
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  'h-8 shrink-0 rounded-md px-2.5 font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'bg-card text-foreground'
                    : 'bg-card/45 text-muted-foreground hover:bg-card/70 hover:text-foreground',
                )}
                key={stage.value}
                onClick={() => onValueChange(stage.value)}
                type="button"
              >
                {stage.label}
              </button>
            )
          })}
        </div>
      </ScrollArea>
      {hint ? <p className="mt-2 text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}
