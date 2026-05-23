import { $, Glob } from 'bun'
import { describe, expect, it } from 'bun:test'
import { rm, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('cli flags', () => {
  it('scaffolds a project with all flags', async () => {
    const tmpDir = join(tmpdir(), 'create-nosa-e2e')
    await rm(tmpDir, { recursive: true, force: true })
    await mkdir(tmpDir, { recursive: true })

    const index = join(import.meta.dir, '..', 'index.ts')
    const result =
      await $`bun run ${index} --name e2e-test --template start --structure vertical --addons tanstack-form,google-oauth`
        .cwd(tmpDir)
        .nothrow()

    expect(result.exitCode).toBe(0)

    const projectDir = join(tmpDir, 'e2e-test')

    expect(await Bun.file(join(projectDir, 'package.json')).exists()).toBe(true)
    expect(await Bun.file(join(projectDir, 'src/router.tsx')).exists()).toBe(true)
    expect(await Bun.file(join(projectDir, 'src/welcome/welcome.tsx')).exists()).toBe(true)
    expect(await Bun.file(join(projectDir, 'components.json')).exists()).toBe(true)
    expect(await Bun.file(join(projectDir, 'src/design-system/ui/field.tsx')).exists()).toBe(true)
    expect(await Bun.file(join(projectDir, 'drizzle.config.ts')).exists()).toBe(true)
    expect(await Bun.file(join(projectDir, 'src/auth/auth.server.ts')).exists()).toBe(true)
    expect(
      await Bun.file(join(projectDir, 'src/examples/tanstack-form-example.tsx')).exists(),
    ).toBe(true)
    expect(await Bun.file(join(projectDir, 'src/examples/betterauth-example.tsx')).exists()).toBe(
      true,
    )
    expect(await Bun.file(join(projectDir, 'src/examples/google-oauth-example.tsx')).exists()).toBe(
      true,
    )

    const pkg = JSON.parse(await Bun.file(join(projectDir, 'package.json')).text())
    expect(pkg.name).toBe('e2e-test')

    const authServer = await Bun.file(join(projectDir, 'src/auth/auth.server.ts')).text()
    expect(authServer).toContain('socialProviders')
    expect(authServer).toContain('google')

    const indexRoute = await Bun.file(join(projectDir, 'src/routes/index.tsx')).text()
    expect(indexRoute).toContain('TanstackFormExample')
    expect(indexRoute).toContain('TanStack Form')
    expect(indexRoute).toContain('GoogleOAuthExample')
    expect(indexRoute).toContain('Google OAuth')

    const envExample = await Bun.file(join(projectDir, '.env.example')).text()
    expect(envExample).toContain('GOOGLE_CLIENT_ID=')
    expect(envExample).toContain('GOOGLE_CLIENT_SECRET=')

    await $`bun run build`.cwd(projectDir).nothrow()
    const lint = await $`bun run lint`.cwd(projectDir).nothrow()
    expect(lint.exitCode).toBe(0)

    await rm(tmpDir, { recursive: true, force: true })
  }, 180_000)
})

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

  it('binds every template dev server to 127.0.0.1:7331', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const templateFiles = new Glob('*/vite.config.ts')
    const viteConfigs = await Array.fromAsync(
      templateFiles.scan({
        cwd: templatesPath,
        dot: true,
        onlyFiles: true,
      }),
    )

    expect(viteConfigs.length).toBeGreaterThan(0)

    for (const filePath of viteConfigs) {
      const viteConfig = await Bun.file(join(templatesPath, filePath)).text()

      expect(viteConfig).toContain("host: '127.0.0.1'")
      expect(viteConfig).toContain('port: 7331')
    }
  })

  it('keeps Better Auth templates method-neutral unless a provider add-on is selected', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const files = new Glob('**/*')
    const betterAuthConfigs = await Array.fromAsync(
      files.scan({
        cwd: templatesPath,
        dot: true,
        onlyFiles: true,
      }),
    ).then((filePaths) =>
      filePaths.filter(
        (filePath) =>
          filePath.includes('betterauth') &&
          (filePath.endsWith('src/lib/auth.ts') || filePath.endsWith('src/auth/auth.server.ts')),
      ),
    )

    expect(betterAuthConfigs.length).toBeGreaterThan(0)

    for (const filePath of betterAuthConfigs) {
      const authConfig = await Bun.file(join(templatesPath, filePath)).text()

      expect(authConfig).not.toContain('emailAndPassword')
      expect(authConfig).toContain(`plugins: [
    // tanstackStartCookies must be the last plugin in the list.
    tanstackStartCookies(),
  ]`)
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
      'AGENTS.md',
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...shadcnFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      'components.json',
      'src/components/theme-provider.tsx',
      'src/components/ui/button.tsx',
      'src/components/ui/sonner.tsx',
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
      'AGENTS.md',
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...shadcnDrizzleFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/components/theme-provider.tsx',
      'src/components/ui/button.tsx',
      'src/components/ui/sonner.tsx',
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
      'src/db/auth.schema.ts',
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
      'AGENTS.md',
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect(
      [...shadcnBetterauthFiles].filter((filePath) => !baseFiles.has(filePath)).sort(),
    ).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/components/theme-provider.tsx',
      'src/components/ui/button.tsx',
      'src/components/ui/sonner.tsx',
      'src/db/auth.schema.ts',
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
      'AGENTS.md',
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      'components.json',
      'src/design-system/theme-provider.tsx',
      'src/design-system/ui/button.tsx',
      'src/design-system/ui/sonner.tsx',
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
      'AGENTS.md',
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/data/db/index.ts',
      'src/data/db/schema.ts',
      'src/design-system/theme-provider.tsx',
      'src/design-system/ui/button.tsx',
      'src/design-system/ui/sonner.tsx',
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
      'src/auth/auth-client.ts',
      'src/auth/auth.schema.ts',
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
      'AGENTS.md',
      'README.md',
      'bun.lock',
      'package.json',
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/styles.css',
    ]

    expect([...variantFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual([
      '.env.example',
      'components.json',
      'drizzle.config.ts',
      'src/auth/auth-client.ts',
      'src/auth/auth.schema.ts',
      'src/auth/auth.functions.ts',
      'src/auth/auth.server.ts',
      'src/data/db/index.ts',
      'src/data/db/schema.ts',
      'src/design-system/theme-provider.tsx',
      'src/design-system/ui/button.tsx',
      'src/design-system/ui/sonner.tsx',
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

  it('keeps TanStack Form templates aligned with their shadcn templates except TanStack Form files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const files = new Glob('**/*')
    const simpleAddedFiles = [
      'src/components/ui/field.tsx',
      'src/components/ui/input-group.tsx',
      'src/components/ui/input.tsx',
      'src/components/ui/label.tsx',
      'src/components/ui/separator.tsx',
      'src/components/ui/textarea.tsx',
      'src/examples/tanstack-form.tsx',
    ]
    const verticalAddedFiles = [
      'src/design-system/ui/field.tsx',
      'src/design-system/ui/input-group.tsx',
      'src/design-system/ui/input.tsx',
      'src/design-system/ui/label.tsx',
      'src/design-system/ui/separator.tsx',
      'src/design-system/ui/textarea.tsx',
      'src/examples/tanstack-form-example.tsx',
    ]
    const changedFiles = ['AGENTS.md', 'README.md', 'package.json', 'src/routes/index.tsx']
    const variants = [
      {
        base: 'start-simple-shadcn',
        form: 'start-simple-shadcn-tanstack-form',
        addedFiles: simpleAddedFiles,
      },
      {
        base: 'start-simple-shadcn-drizzle',
        form: 'start-simple-shadcn-tanstack-form-drizzle',
        addedFiles: simpleAddedFiles,
      },
      {
        base: 'start-simple-shadcn-drizzle-betterauth',
        form: 'start-simple-shadcn-tanstack-form-drizzle-betterauth',
        addedFiles: simpleAddedFiles,
      },
      {
        base: 'start-simple-shadcn-drizzle-betterauth-google-oauth',
        form: 'start-simple-shadcn-tanstack-form-drizzle-betterauth-google-oauth',
        addedFiles: simpleAddedFiles,
      },
      {
        base: 'start-vertical-shadcn',
        form: 'start-vertical-shadcn-tanstack-form',
        addedFiles: verticalAddedFiles,
      },
      {
        base: 'start-vertical-shadcn-drizzle',
        form: 'start-vertical-shadcn-tanstack-form-drizzle',
        addedFiles: verticalAddedFiles,
      },
      {
        base: 'start-vertical-shadcn-drizzle-betterauth',
        form: 'start-vertical-shadcn-tanstack-form-drizzle-betterauth',
        addedFiles: verticalAddedFiles,
      },
      {
        base: 'start-vertical-shadcn-drizzle-betterauth-google-oauth',
        form: 'start-vertical-shadcn-tanstack-form-drizzle-betterauth-google-oauth',
        addedFiles: verticalAddedFiles,
      },
    ]

    for (const variant of variants) {
      const baseTemplatePath = join(templatesPath, variant.base)
      const formTemplatePath = join(templatesPath, variant.form)
      const baseFiles = new Set(
        await Array.fromAsync(
          files.scan({
            cwd: baseTemplatePath,
            dot: true,
            onlyFiles: true,
          }),
        ),
      )
      const formFiles = new Set(
        await Array.fromAsync(
          files.scan({
            cwd: formTemplatePath,
            dot: true,
            onlyFiles: true,
          }),
        ),
      )

      expect([...formFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual(
        variant.addedFiles,
      )

      for (const filePath of baseFiles) {
        if (changedFiles.includes(filePath)) {
          continue
        }

        expect(await Bun.file(join(formTemplatePath, filePath)).text()).toBe(
          await Bun.file(join(baseTemplatePath, filePath)).text(),
        )
      }
    }
  })

  it('keeps Google OAuth templates aligned with their Better Auth templates except Google OAuth files', async () => {
    const templatesPath = join(import.meta.dir, 'templates')
    const files = new Glob('**/*')
    const variants = [
      {
        base: 'start-simple-drizzle-betterauth',
        google: 'start-simple-drizzle-betterauth-google-oauth',
        changedFiles: [
          '.env.example',
          'README.md',
          'package.json',
          'src/lib/auth.ts',
          'src/routes/index.tsx',
        ],
        addedFiles: ['src/examples/google-oauth.tsx'],
      },
      {
        base: 'start-simple-shadcn-drizzle-betterauth',
        google: 'start-simple-shadcn-drizzle-betterauth-google-oauth',
        changedFiles: [
          '.env.example',
          'README.md',
          'package.json',
          'src/lib/auth.ts',
          'src/routes/index.tsx',
        ],
        addedFiles: ['src/examples/google-oauth.tsx'],
      },
      {
        base: 'start-vertical-drizzle-betterauth',
        google: 'start-vertical-drizzle-betterauth-google-oauth',
        changedFiles: [
          '.env.example',
          'README.md',
          'package.json',
          'src/auth/auth.server.ts',
          'src/routes/index.tsx',
        ],
        addedFiles: ['src/examples/google-oauth-example.tsx'],
      },
      {
        base: 'start-vertical-shadcn-drizzle-betterauth',
        google: 'start-vertical-shadcn-drizzle-betterauth-google-oauth',
        changedFiles: [
          '.env.example',
          'README.md',
          'package.json',
          'src/auth/auth.server.ts',
          'src/routes/index.tsx',
        ],
        addedFiles: ['src/examples/google-oauth-example.tsx'],
      },
    ]

    for (const variant of variants) {
      const baseTemplatePath = join(templatesPath, variant.base)
      const googleTemplatePath = join(templatesPath, variant.google)
      const baseFiles = new Set(
        await Array.fromAsync(
          files.scan({
            cwd: baseTemplatePath,
            dot: true,
            onlyFiles: true,
          }),
        ),
      )
      const googleFiles = new Set(
        await Array.fromAsync(
          files.scan({
            cwd: googleTemplatePath,
            dot: true,
            onlyFiles: true,
          }),
        ),
      )

      expect([...googleFiles].filter((filePath) => !baseFiles.has(filePath)).sort()).toEqual(
        variant.addedFiles,
      )

      for (const filePath of baseFiles) {
        if (variant.changedFiles.includes(filePath)) {
          continue
        }

        expect(await Bun.file(join(googleTemplatePath, filePath)).text()).toBe(
          await Bun.file(join(baseTemplatePath, filePath)).text(),
        )
      }
    }
  })
})
