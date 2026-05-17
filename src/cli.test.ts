import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { $ } from 'bun'
import { mkdir, rm, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const CLI_PATH = resolve(import.meta.dir, '../index.ts')
const TEST_DIR = resolve(import.meta.dir, '../.test-runs')

describe('create-nosa cli', () => {
  beforeAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true })
    await mkdir(TEST_DIR, { recursive: true })
  })

  afterAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it('scaffolds a project with default template when --yes is passed', async () => {
    const projectName = 'test-app'
    const targetPath = join(TEST_DIR, projectName)

    const result = await $`bun ${CLI_PATH} ${projectName} --yes`.cwd(TEST_DIR).quiet()
    expect(result.exitCode).toBe(0)

    const targetStats = await stat(targetPath)
    expect(targetStats.isDirectory()).toBe(true)

    const packageJsonPath = join(targetPath, 'package.json')
    const packageJsonFile = Bun.file(packageJsonPath)
    expect(await packageJsonFile.exists()).toBe(true)

    const packageJson = await packageJsonFile.json()
    expect(packageJson.name).toBe(projectName)

    const gitDirStats = await stat(join(targetPath, '.git'))
    expect(gitDirStats.isDirectory()).toBe(true)

    const nodeModulesStats = await stat(join(targetPath, 'node_modules'))
    expect(nodeModulesStats.isDirectory()).toBe(true)
  }, 60000)

  it('errors when target directory already exists and is not empty', async () => {
    const projectName = 'existing-app'
    const targetPath = join(TEST_DIR, projectName)

    await mkdir(targetPath)
    await Bun.write(join(targetPath, 'dummy.txt'), 'hello')

    const result = await $`bun ${CLI_PATH} ${projectName} --yes`.cwd(TEST_DIR).quiet().nothrow()
    expect(result.exitCode).not.toBe(0)
    expect(result.stdout.toString()).toContain('already exists and is not empty')
  })

  it('allows applying shadcn addon with default preset using --addon flag', async () => {
    const projectName = 'shadcn-app'
    const targetPath = join(TEST_DIR, projectName)

    const result = await $`bun ${CLI_PATH} ${projectName} --yes --addon shadcn`
      .cwd(TEST_DIR)
      .quiet()
    expect(result.exitCode).toBe(0)

    const packageJsonFile = Bun.file(join(targetPath, 'package.json'))
    expect(await packageJsonFile.exists()).toBe(true)

    // Check if shadcn dependency was added (e.g., class-variance-authority, clsx, tailwind-merge, or simply components.json)
    const componentsJsonFile = Bun.file(join(targetPath, 'components.json'))
    expect(await componentsJsonFile.exists()).toBe(true)
  }, 60000)
  it('errors when an invalid project name is provided', async () => {
    const projectName = 'a/b'
    const result = await $`bun ${CLI_PATH} ${projectName} --yes`.cwd(TEST_DIR).quiet().nothrow()
    expect(result.exitCode).not.toBe(0)
    expect(result.stdout.toString()).toContain('Project name must be a folder name, not a path')
  })

  it('errors when --shadcn-preset is used without --addon shadcn', async () => {
    const projectName = 'preset-error-app'
    const result = await $`bun ${CLI_PATH} ${projectName} --yes --shadcn-preset default`
      .cwd(TEST_DIR)
      .quiet()
      .nothrow()
    expect(result.exitCode).not.toBe(0)
    expect(result.stdout.toString()).toContain(
      '--shadcn-preset flag can only be used when --addon shadcn',
    )
  })

  it('errors when an invalid template is provided', async () => {
    const projectName = 'template-error-app'
    const result = await $`bun ${CLI_PATH} ${projectName} --yes --template nonexistent-template`
      .cwd(TEST_DIR)
      .quiet()
      .nothrow()
    expect(result.exitCode).not.toBe(0)
    expect(result.stdout.toString()).toContain('was not found')
  })

  it('errors when an invalid addon is provided', async () => {
    const projectName = 'addon-error-app'
    // 'citty' enum parsing actually throws an error for invalid enum value before CLI logic runs.
    const result = await $`bun ${CLI_PATH} ${projectName} --yes --addon nonexistent-addon`
      .cwd(TEST_DIR)
      .quiet()
      .nothrow()
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.toString()).toMatch(/Invalid value for argument:.*--addon/)
  })
})
