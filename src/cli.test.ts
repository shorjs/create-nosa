import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'

describe('template structure', () => {
  it('keeps start-simple as the only complete template for now', async () => {
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
      expect(await Bun.file(join(templatesPath, templateFolder, '.gitkeep')).exists()).toBe(true)
    }
  })
})
