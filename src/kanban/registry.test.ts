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

const manifest = JSON.parse(readFileSync('registry.json', 'utf8')) as {
  items: RegistryItem[]
}
const distributedItem = JSON.parse(readFileSync('registry/kanban.json', 'utf8')) as RegistryItem
const manifestItem = manifest.items.find((item) => item.name === 'kanban')

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
      '@coss/scroll-area',
      '@coss/skeleton',
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
      'src/components/scroll-area.tsx',
      'src/components/text.tsx',
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
    expect(cardSkeleton?.content).toContain("from '@/components/ui/skeleton'")
    expect(column?.content).toContain("from '@/components/ui/scroll-area'")
    expect(stageSelector?.content).toContain("from '@/components/ui/button'")
    expect(stageSelector?.content).toContain("from '@/components/ui/scroll-area'")
    expect(view?.content).toContain("from '@/components/ui/scroll-area'")

    for (const file of distributedItem.files) {
      expect(file.content ?? '').not.toContain("from '@base-ui/react")
    }
  })

  test('keeps direct Base UI imports inside the COSS ui source boundary', () => {
    const kanbanSources = findSourceFiles('src/kanban').filter(
      (path) => /\.[jt]sx?$/.test(path) && !path.includes('.test.'),
    )

    for (const path of kanbanSources) {
      expect(readFileSync(path, 'utf8')).not.toContain("from '@base-ui/react")
    }
  })
})
