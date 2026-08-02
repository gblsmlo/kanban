import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

interface RegistryFile {
  content?: string
  path: string
}

interface RegistryItem {
  files: RegistryFile[]
  name?: string
  registryDependencies?: string[]
}

const manifest = JSON.parse(readFileSync('registry.json', 'utf8')) as {
  items: RegistryItem[]
}
const distributedItem = JSON.parse(readFileSync('registry/kanban.json', 'utf8')) as RegistryItem
const manifestItem = manifest.items.find((item) => item.name === 'kanban')

describe('Kanban registry', () => {
  test('installs the official COSS ui/skeleton instead of copying a pattern-local primitive', () => {
    const cardSkeleton = distributedItem.files.find(
      (file) => file.path === 'src/kanban/components/kanban-card-skeleton.tsx',
    )

    expect(manifestItem?.registryDependencies).toContain('@coss/skeleton')
    expect(distributedItem.registryDependencies).toContain('@coss/skeleton')
    expect(
      distributedItem.files.some(
        (file) =>
          file.path === 'src/components/skeleton.tsx' ||
          file.path === 'src/components/ui/skeleton.tsx',
      ),
    ).toBeFalse()
    expect(cardSkeleton?.content).toContain("from '@/components/ui/skeleton'")
  })
})
