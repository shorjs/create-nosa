import { Glob } from 'bun'
import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'

describe('template structure', () => {
  it('has all core template files for start-simple', async () => {
    const templatesPath = join(import.meta.dir, 'templates')

    const coreFiles = [
      'package.json',
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

  it('has all core template files for start-vertical', async () => {
    const templatesPath = join(import.meta.dir, 'templates')

    const coreFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'bunfig.toml',
      'src/router.tsx',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/routes/counter.tsx',
      'src/welcome/welcome.tsx',
      'src/counter/counter.tsx',
      'src/counter/counter.functions.ts',
      'src/styles.css',
    ]

    for (const file of coreFiles) {
      expect(await Bun.file(join(templatesPath, 'start-vertical', file)).exists()).toBe(true)
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
      'README.md',
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

  it('keeps start-simple-drizzle-betterauth aligned with start-simple except drizzle and betterauth files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-simple')
    const betterauthTemplatePath = join(templatesPath, 'start-simple-drizzle-betterauth')
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
    const betterauthFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: betterauthTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const betterauthChangedFiles = ['README.md', 'bun.lock', 'package.json', 'src/routes/index.tsx']

    expect([...betterauthFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'drizzle.config.ts',
      'src/db/auth-schema.ts',
      'src/db/index.ts',
      'src/db/schema.ts',
      'src/examples/betterauth.tsx',
      'src/examples/drizzle.tsx',
      'src/lib/auth-client.ts',
      'src/lib/auth.functions.ts',
      'src/lib/auth.ts',
      'src/routes/api/auth/$.ts',
    ])

    for (const filePath of baseFiles) {
      expect(betterauthFiles.has(filePath)).toBe(true)

      if (betterauthChangedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(betterauthTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-simple-shadcn-drizzle-betterauth aligned with start-simple except shadcn, drizzle and betterauth files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-simple')
    const shadcnBetterauthTemplatePath = join(
      templatesPath,
      'start-simple-shadcn-drizzle-betterauth',
    )
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
    const shadcnBetterauthFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: shadcnBetterauthTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const shadcnBetterauthChangedFiles = [
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect(
      [...shadcnBetterauthFiles].filter((filePath) => !baseFiles.has(filePath)).sort(),
    ).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/components/ui/button.tsx',
      'src/db/auth-schema.ts',
      'src/db/index.ts',
      'src/db/schema.ts',
      'src/examples/betterauth.tsx',
      'src/examples/drizzle.tsx',
      'src/examples/shadcn.tsx',
      'src/lib/auth-client.ts',
      'src/lib/auth.functions.ts',
      'src/lib/auth.ts',
      'src/lib/utils.ts',
      'src/routes/api/auth/$.ts',
    ])

    for (const filePath of baseFiles) {
      expect(shadcnBetterauthFiles.has(filePath)).toBe(true)

      if (shadcnBetterauthChangedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(shadcnBetterauthTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-vertical-shadcn aligned with start-vertical except shadcn files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-vertical')
    const variantTemplatePath = join(templatesPath, 'start-vertical-shadcn')
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
    const variantFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: variantTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const changedFiles = [
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      'components.json',
      'src/design-system/ui/button.tsx',
      'src/design-system/utils.ts',
      'src/examples/shadcn-example.tsx',
    ])

    for (const filePath of baseFiles) {
      expect(variantFiles.has(filePath)).toBe(true)

      if (changedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(variantTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-vertical-drizzle aligned with start-vertical except drizzle files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-vertical')
    const variantTemplatePath = join(templatesPath, 'start-vertical-drizzle')
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
    const variantFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: variantTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const changedFiles = ['README.md', 'bun.lock', 'package.json', 'src/routes/index.tsx']

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'drizzle.config.ts',
      'src/data/db/index.ts',
      'src/data/db/schema.ts',
      'src/examples/drizzle-example.tsx',
    ])

    for (const filePath of baseFiles) {
      expect(variantFiles.has(filePath)).toBe(true)

      if (changedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(variantTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-vertical-shadcn-drizzle aligned with start-vertical except shadcn and drizzle files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-vertical')
    const variantTemplatePath = join(templatesPath, 'start-vertical-shadcn-drizzle')
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
    const variantFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: variantTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const changedFiles = [
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/data/db/index.ts',
      'src/data/db/schema.ts',
      'src/design-system/ui/button.tsx',
      'src/design-system/utils.ts',
      'src/examples/drizzle-example.tsx',
      'src/examples/shadcn-example.tsx',
    ])

    for (const filePath of baseFiles) {
      expect(variantFiles.has(filePath)).toBe(true)

      if (changedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(variantTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-vertical-drizzle-betterauth aligned with start-vertical except drizzle and betterauth files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-vertical')
    const variantTemplatePath = join(templatesPath, 'start-vertical-drizzle-betterauth')
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
    const variantFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: variantTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const changedFiles = ['README.md', 'bun.lock', 'package.json', 'src/routes/index.tsx']

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'drizzle.config.ts',
      'src/auth/auth-schema.ts',
      'src/auth/auth.client.ts',
      'src/auth/auth.functions.ts',
      'src/auth/auth.server.ts',
      'src/data/db/index.ts',
      'src/data/db/schema.ts',
      'src/examples/betterauth-example.tsx',
      'src/examples/drizzle-example.tsx',
      'src/routes/api/auth/$.ts',
    ])

    for (const filePath of baseFiles) {
      expect(variantFiles.has(filePath)).toBe(true)

      if (changedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(variantTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })

  it('keeps start-vertical-shadcn-drizzle-betterauth aligned with start-vertical except shadcn, drizzle and betterauth files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const baseTemplatePath = join(templatesPath, 'start-vertical')
    const variantTemplatePath = join(templatesPath, 'start-vertical-shadcn-drizzle-betterauth')
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
    const variantFiles = new Set(
      await Array.fromAsync(
        files.scan({
          cwd: variantTemplatePath,
          dot: true,
          onlyFiles: true,
        }),
      ),
    )
    const changedFiles = [
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/auth/auth-schema.ts',
      'src/auth/auth.client.ts',
      'src/auth/auth.functions.ts',
      'src/auth/auth.server.ts',
      'src/data/db/index.ts',
      'src/data/db/schema.ts',
      'src/design-system/ui/button.tsx',
      'src/design-system/utils.ts',
      'src/examples/betterauth-example.tsx',
      'src/examples/drizzle-example.tsx',
      'src/examples/shadcn-example.tsx',
      'src/routes/api/auth/$.ts',
    ])

    for (const filePath of baseFiles) {
      expect(variantFiles.has(filePath)).toBe(true)

      if (changedFiles.includes(filePath)) {
        continue
      }

      expect(await Bun.file(join(variantTemplatePath, filePath)).text()).toBe(
        await Bun.file(join(baseTemplatePath, filePath)).text(),
      )
    }
  })
})
