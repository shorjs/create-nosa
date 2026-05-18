import { Glob } from 'bun'
import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'

describe('template structure', () => {
  it('keeps placeholder templates installable for now', async () => {
    const templatesPath = join(import.meta.dir, 'templates')

    expect(await Bun.file(join(templatesPath, 'start-simple', 'package.json')).exists()).toBe(true)
    expect(await Bun.file(join(templatesPath, 'start-simple', 'bun.lock')).exists()).toBe(true)

    for (const templateFolder of [
      'start-simple-drizzle',
      'start-simple-drizzle-betterauth',
      'start-simple-shadcn-drizzle',
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
      expect(await Bun.file(join(templatesPath, templateFolder, '.gitkeep')).exists()).toBe(false)
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
    const shadcnOnlyFiles = ['components.json', 'src/components/ui/button.tsx', 'src/lib/utils.ts']
    const shadcnChangedFiles = [
      'bun.lock',
      'package.json',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...shadcnFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual(
      shadcnOnlyFiles,
    )

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
})
