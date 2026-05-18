import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'

describe('template structure', () => {
  it('keeps placeholder templates installable for now', async () => {
    const templatesPath = join(import.meta.dir, 'templates')

    expect(await Bun.file(join(templatesPath, 'start-simple', 'package.json')).exists()).toBe(true)
    expect(await Bun.file(join(templatesPath, 'start-simple', 'bun.lock')).exists()).toBe(true)

    for (const templateFolder of [
      'start-simple-shadcn',
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
})
