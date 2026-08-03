import { describe, expect, test } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

interface RegistryFile {
  content?: string
  path: string
}

interface RegistryItem {
  dependencies?: string[]
  files: RegistryFile[]
  name?: string
  registryDependencies?: string[]
}

interface PackageManifest {
  dependencies?: Record<string, string>
}

const manifest = JSON.parse(readFileSync('registry.json', 'utf8')) as {
  items: RegistryItem[]
}
const distributedItem = JSON.parse(readFileSync('registry/kanban.json', 'utf8')) as RegistryItem
const manifestItem = manifest.items.find((item) => item.name === 'kanban')
const packageManifest = JSON.parse(readFileSync('package.json', 'utf8')) as PackageManifest

function findSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? findSourceFiles(path) : [path]
  })
}

describe('Kanban registry', () => {
  test('installs every UI primitive from the official COSS registry', () => {
    const expectedDependencies = [
      '@coss/badge',
      '@coss/button',
      '@coss/card',
      '@coss/collapsible',
      '@coss/empty',
      '@coss/menu',
      '@coss/scroll-area',
      '@coss/skeleton',
      '@coss/toolbar',
      '@coss/tooltip',
    ]

    expect(manifestItem?.registryDependencies?.toSorted()).toEqual(expectedDependencies)
    expect(distributedItem.registryDependencies?.toSorted()).toEqual(expectedDependencies)
    expect(manifestItem?.dependencies).toContain('lucide-react@1.28.0')
    expect(distributedItem.dependencies).toContain('lucide-react@1.28.0')
  })

  test('keeps COSS primitives out of the Kanban pattern payload', () => {
    const copiedPrimitivePaths = [
      'src/components/badge.tsx',
      'src/components/card.tsx',
      'src/components/collapsible.tsx',
      'src/components/empty.tsx',
      'src/components/menu.tsx',
      'src/components/scroll-area.tsx',
      'src/components/text.tsx',
      'src/components/toolbar.tsx',
    ]

    for (const path of copiedPrimitivePaths) {
      expect(manifestItem?.files.some((file) => file.path === path)).toBeFalse()
      expect(distributedItem.files.some((file) => file.path === path)).toBeFalse()
    }
    expect(distributedItem.dependencies ?? []).not.toContain('@base-ui/react@1.6.0')
  })

  test('imports UI through the consumer COSS alias', () => {
    const badge = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-badge.tsx',
    )
    const card = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-card.tsx',
    )
    const cardSkeleton = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-card-skeleton.tsx',
    )
    const column = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-column.tsx',
    )
    const stageSelector = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-stage-selector.tsx',
    )
    const view = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-view.tsx',
    )

    expect(badge?.content).toContain("from '@/components/ui/badge'")
    expect(card?.content).toContain("from '@/components/ui/card'")
    expect(card?.content).not.toContain("from '@/components/ui/tooltip'")
    expect(card?.content).not.toContain("from '@/components/ui/menu'")
    expect(cardSkeleton?.content).toContain("from '@/components/ui/skeleton'")
    expect(column?.content).toContain("from '@/components/ui/scroll-area'")
    expect(stageSelector?.content).toContain("from '@/components/ui/button'")
    expect(stageSelector?.content).toContain("from '@/components/ui/scroll-area'")
    expect(view?.content).toContain("from '@/components/ui/scroll-area'")

    for (const file of distributedItem.files) {
      expect(file.content ?? '').not.toContain("from '@base-ui/react")
    }
  })

  test('ships the Kanban-owned card composition API', () => {
    const publicApi = distributedItem.files.find((file) => file.path === 'src/kanban/index.ts')
    const card = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-card.tsx',
    )
    const componentNames = [
      'KanbanCardAction',
      'KanbanCardContent',
      'KanbanCardDescription',
      'KanbanCardFooter',
      'KanbanCardHeader',
      'KanbanCardTitle',
    ]

    for (const componentName of componentNames) {
      expect(publicApi?.content).toContain(componentName)
      expect(card?.content).toContain(`export function ${componentName}`)
    }

    expect(publicApi?.content).not.toContain("from '@/components/ui/card'")
    expect(publicApi?.content).not.toContain('KanbanCardCompactMetadata')
    expect(card?.content).not.toContain('KanbanCardCompactMetadata')
  })

  test('ships collection and List APIs through the same registry item', () => {
    const publicApi = distributedItem.files.find((file) => file.path === 'src/index.ts')
    const collectionApi = distributedItem.files.find(
      (file) => file.path === 'src/collection/index.ts',
    )
    const collectionSettings = distributedItem.files.find(
      (file) => file.path === 'src/collection/components/collection-settings-menu.tsx',
    )
    const collectionViewOutlet = distributedItem.files.find(
      (file) => file.path === 'src/collection/components/collection-view-outlet.tsx',
    )
    const listApi = distributedItem.files.find((file) => file.path === 'src/list/index.ts')
    const listView = distributedItem.files.find(
      (file) => file.path === 'src/list/components/list-view.tsx',
    )
    const listGroup = distributedItem.files.find(
      (file) => file.path === 'src/list/components/list-group.tsx',
    )
    const listItem = distributedItem.files.find(
      (file) => file.path === 'src/list/components/list-item.tsx',
    )

    expect(publicApi?.content).toContain("export * from './collection'")
    expect(publicApi?.content).toContain("export * from './list'")
    expect(collectionApi?.content).toContain('CollectionProvider')
    expect(collectionApi?.content).toContain('CollectionSettingsMenu')
    expect(collectionApi?.content).toContain('CollectionViewOutlet')
    expect(collectionSettings?.content).toContain(
      "setPreferences((current) => ({ ...current, view }), 'view')",
    )
    expect(collectionSettings?.content).toContain(
      "setPreferences((current) => ({ ...current, groupBy }), 'grouping')",
    )
    expect(collectionSettings?.content).toContain("grid: 'Grid'")
    expect(collectionSettings?.content).toContain("groupingBy: 'Grouping by'")
    expect(collectionSettings?.content).not.toContain('MenuGroupLabel')
    expect(collectionSettings?.content).not.toContain('Display as')
    expect(collectionViewOutlet?.content).toContain('projectCollection(collection')
    expect(collectionViewOutlet?.content).toContain('<KanbanView')
    expect(collectionViewOutlet?.content).toContain('<ListView')
    expect(listApi?.content).toContain('ListView')
    expect(listApi?.content).toContain('ListItemSkeleton')
    expect(listView?.content).toContain('collection: CollectionDefinition<TItem>')
    expect(listView?.content).toContain('grouping: CollectionGrouping')
    expect(listGroup?.content).toContain("from '@/components/ui/collapsible'")
    expect(listGroup?.content).toContain("from '@/components/ui/button'")
    expect(listItem?.content).toContain('data-slot="list-item"')
    expect(listItem?.content).not.toContain("from '@/components/ui/card'")
  })

  test('keeps direct Base UI imports inside the COSS ui source boundary', () => {
    const patternSources = ['src/collection', 'src/kanban', 'src/list'].flatMap((directory) =>
      findSourceFiles(directory).filter(
        (path) => /\.[jt]sx?$/.test(path) && !path.includes('.test.'),
      ),
    )

    for (const path of patternSources) {
      expect(readFileSync(path, 'utf8')).not.toContain("from '@base-ui/react")
    }
  })

  test('ships the current dnd-kit React sorting contract without legacy adapters', () => {
    const currentPackages = [
      '@dnd-kit/abstract',
      '@dnd-kit/collision',
      '@dnd-kit/dom',
      '@dnd-kit/helpers',
      '@dnd-kit/react',
    ]
    const packageDependencies = packageManifest.dependencies ?? {}
    const registryDependencies = distributedItem.dependencies ?? []
    const source = findSourceFiles('src/kanban')
      .filter((path) => /\.[jt]sx?$/.test(path) && !path.includes('.test.'))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n')
    const distributedSource = distributedItem.files.map((file) => file.content ?? '').join('\n')

    for (const packageName of currentPackages) {
      expect(packageDependencies[packageName]).toBe('0.5.0')
      expect(registryDependencies).toContain(`${packageName}@0.5.0`)
    }

    expect(source).toContain("from '@dnd-kit/react'")
    expect(source).toContain("from '@dnd-kit/react/sortable'")
    expect(source).toContain("from '@dnd-kit/helpers'")
    expect(source).not.toContain("from '@dnd-kit/core'")
    expect(source).not.toContain('SortableContext')
    expect(source).not.toContain('useSensors')
    expect(source).not.toContain('CSS.Transform')
    expect(distributedSource).not.toContain("from '@dnd-kit/core'")
    expect(distributedSource).not.toContain('SortableContext')
  })
})
