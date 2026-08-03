'use client'

import { ListIcon, Rows2Icon, SettingsIcon, SquareKanbanIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from '@/components/ui/menu'
import { ToolbarButton } from '@/components/ui/toolbar'
import { useCollectionPreferences } from './collection-provider'

export interface CollectionSettingsMenuMessages {
  assignee: string
  grid: string
  groupingBy: string
  list: string
  settings: string
  status: string
  view: string
}

export interface CollectionSettingsMenuProps {
  messages?: Partial<CollectionSettingsMenuMessages>
}

const defaultMessages: CollectionSettingsMenuMessages = {
  assignee: 'Assignee',
  grid: 'Grid',
  groupingBy: 'Grouping by',
  list: 'List',
  settings: 'Settings',
  status: 'Status',
  view: 'View',
}

export function CollectionSettingsMenu({
  messages: messageOverrides,
}: CollectionSettingsMenuProps) {
  const { preferences, setPreferences } = useCollectionPreferences()
  const messages = { ...defaultMessages, ...messageOverrides }

  return (
    <Menu>
      <MenuTrigger render={<ToolbarButton render={<Button variant="secondary" />} />}>
        <SettingsIcon aria-hidden="true" />
        {messages.settings}
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuSub>
          <MenuSubTrigger>
            {preferences.view === 'kanban' ? (
              <SquareKanbanIcon aria-hidden="true" />
            ) : (
              <ListIcon aria-hidden="true" />
            )}
            {messages.view}
          </MenuSubTrigger>
          <MenuSubPopup>
            <MenuRadioGroup
              onValueChange={(view) => {
                if (view !== 'kanban' && view !== 'list') return
                setPreferences((current) => ({ ...current, view }), 'view')
              }}
              value={preferences.view}
            >
              <MenuRadioItem value="kanban">{messages.grid}</MenuRadioItem>
              <MenuRadioItem value="list">{messages.list}</MenuRadioItem>
            </MenuRadioGroup>
          </MenuSubPopup>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>
            <Rows2Icon aria-hidden="true" />
            {messages.groupingBy}
          </MenuSubTrigger>
          <MenuSubPopup>
            <MenuRadioGroup
              onValueChange={(groupBy) => {
                if (groupBy !== 'status' && groupBy !== 'assignee') return
                setPreferences((current) => ({ ...current, groupBy }), 'grouping')
              }}
              value={preferences.groupBy}
            >
              <MenuRadioItem value="status">{messages.status}</MenuRadioItem>
              <MenuRadioItem value="assignee">{messages.assignee}</MenuRadioItem>
            </MenuRadioGroup>
          </MenuSubPopup>
        </MenuSub>
      </MenuPopup>
    </Menu>
  )
}
