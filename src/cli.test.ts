import { Glob } from 'bun'
import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'

describe('template structure', () => {
  it('has all core template files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')

    const coreFiles = [
      'package.json',
      'bun.lock',
      'tsconfig.json',
      'vite.config.ts',
      'bunfig.toml',
      'src/router.tsx',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/examples/base.tsx',
      'src/styles.css',
    ]

    for (const file of coreFiles) {
      expect(await Bun.file(join(templatesPath, 'start-simple', file)).exists()).toBe(true)
    }
  })

  it('keeps placeholder templates installable for now', async () => {
    const templatesPath = join(import.meta.dir, 'templates')

    for (const templateFolder of [
      'start-simple-drizzle-betterauth',
      'start-simple-shadcn-drizzle-betterauth',
      'start-vertical',
      'start-vertical-shadcn',
      'start-vertical-drizzle',
      'start-vertical-drizzle-betterauth',
      'start-vertical-shadcn-drizzle',
      'start-vertical-shadcn-drizzle-betterauth',
    ]) {
      const packageJson = await Bun.file(join(templatesPath, templateFolder, 'package.json')).json()

      expect(packageJson).toEqual({
        name: templateFolder,
      })
    }
  })

  it('keeps start-simple-shadcn aligned with start-simple except shadcn files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-simple')
    const shadcnTemplatePath = join(templatesPath, 'start-simple-shadcn')
    const files = new Glob('**/*')
    const baseFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: baseTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const shadcnFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: shadcnTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const shadcnChangedFiles = [
      'bun.lock',
      'package.json',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...shadcnFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      'components.json',
      'src/components/ui/button.tsx',
      'src/examples/shadcn.tsx',
      'src/lib/utils.ts',
    ])

    for (const filePath of baseFiles) {
      expect(shadcnFiles.has(filePath)).toBe(true)

      if (shadcnChangedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(shadcnTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-simple-drizzle aligned with start-simple except drizzle files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-simple')
    const drizzleTemplatePath = join(templatesPath, 'start-simple-drizzle')
    const files = new Glob('**/*')
    const baseFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: baseTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const drizzleFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: drizzleTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const drizzleChangedFiles = ['README.md', 'bun.lock', 'package.json', 'src/routes/index.tsx']

    expect([...drizzleFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'drizzle.config.ts',
      'src/db/index.ts',
      'src/db/schema.ts',
      'src/examples/drizzle.tsx',
    ])

    for (const filePath of baseFiles) {
      expect(drizzleFiles.has(filePath)).toBe(true)

      if (drizzleChangedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(drizzleTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-simple-shadcn-drizzle aligned with start-simple except shadcn and drizzle files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-simple')
    const shadcnDrizzleTemplatePath = join(templatesPath, 'start-simple-shadcn-drizzle')
    const files = new Glob('**/*')
    const baseFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: baseTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const shadcnDrizzleFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: shadcnDrizzleTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const shadcnDrizzleChangedFiles = [
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...shadcnDrizzleFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/components/ui/button.tsx',
      'src/db/index.ts',
      'src/db/schema.ts',
      'src/examples/drizzle.tsx',
      'src/examples/shadcn.tsx',
      'src/lib/utils.ts',
    ])

    for (const filePath of baseFiles) {
      expect(shadcnDrizzleFiles.has(filePath)).toBe(true)

      if (shadcnDrizzleChangedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(shadcnDrizzleTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })
})
