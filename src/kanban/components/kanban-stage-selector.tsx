import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

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
              <Button
                aria-pressed={selected}
                key={stage.value}
                onClick={() => onValueChange(stage.value)}
                size="sm"
                variant={selected ? 'secondary' : 'ghost'}
              >
                {stage.label}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
      {hint ? <p className="mt-2 text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}
