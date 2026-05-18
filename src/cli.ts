import { $, Glob } from 'bun'
import {
  cancel,
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  select,
  spinner,
  text,
} from '@clack/prompts'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'

export async function runCli() {
  try {
    const defaultProjectName = 'my-nosa-app'
    const templateFolders = new Set([
      'start-simple',
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
    ])

    intro('create-nosa')

    const projectName = await text({
      message: 'Project name',
      placeholder: defaultProjectName,
      defaultValue: defaultProjectName,
      validate(value) {
        const normalizedValue = (value || defaultProjectName).trim()

        if (normalizedValue.length === 0) {
          return 'Project name cannot be empty'
        }

        if (
          normalizedValue === '.' ||
          normalizedValue === '..' ||
          normalizedValue !== basename(normalizedValue) ||
          normalizedValue.includes('/') ||
          normalizedValue.includes('\\')
        ) {
          return 'Project name must be a folder name, not a path'
        }

        return undefined
      },
    })

    if (isCancel(projectName)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const template = await select({
      message: 'Select a template',
      options: [
        {
          value: 'start',
          label: 'Start',
        },
      ],
    })

    if (isCancel(template)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const codebaseStructure = await select({
      message: 'Select codebase structure',
      options: [
        {
          value: 'simple',
          label: 'Simple',
        },
        {
          value: 'vertical',
          label: 'Vertical',
        },
      ],
    })

    if (isCancel(codebaseStructure)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const selectedAddons = await multiselect({
      message: 'Select add-ons',
      required: false,
      options: [
        {
          value: 'shadcn',
          label: 'shadcn/ui',
        },
        {
          value: 'drizzle',
          label: 'Drizzle + PostgreSQL',
        },
        {
          value: 'betterauth',
          label: 'Better Auth',
        },
      ],
    })

    if (isCancel(selectedAddons)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const addonSet = new Set(selectedAddons)

    if (addonSet.has('betterauth')) {
      addonSet.add('drizzle')
    }

    const addons = (['shadcn', 'drizzle', 'betterauth'] as const).filter((addon) =>
      addonSet.has(addon),
    )
    const templateFolder = [template, codebaseStructure, ...addons].join('-')

    if (!templateFolders.has(templateFolder)) {
      throw new Error(`Unsupported template combination: ${templateFolder}`)
    }

    const normalizedProjectName = (projectName || defaultProjectName).trim()
    const targetPath = resolve(process.cwd(), normalizedProjectName)
    const targetStats = await stat(targetPath).catch(() => undefined)

    if (!targetStats) {
      await mkdir(targetPath)
    } else if (!targetStats.isDirectory()) {
      throw new Error(`${targetPath} already exists and is not a directory.`)
    } else if ((await readdir(targetPath)).length > 0) {
      throw new Error(`${targetPath} already exists and is not empty.`)
    }

    const templatePath = join(import.meta.dir, 'templates', templateFolder)
    const templateFiles = new Glob('**/*')

    for await (const filePath of templateFiles.scan({
      cwd: templatePath,
      dot: true,
      onlyFiles: true,
    })) {
      const targetRelativeFilePath = filePath
        .split('/')
        .map((pathSegment) => (pathSegment === '_gitignore' ? '.gitignore' : pathSegment))
        .join('/')
      const targetFilePath = join(targetPath, targetRelativeFilePath)

      await mkdir(dirname(targetFilePath), { recursive: true })
      await Bun.write(targetFilePath, Bun.file(join(templatePath, filePath)))
    }

    const packageJsonPath = join(targetPath, 'package.json')
    const packageJson = await Bun.file(packageJsonPath).json()
    const packageName = normalizedProjectName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^[._]/, '')
      .replace(/[^a-z\d\-~]+/g, '-')

    packageJson.name = packageName || 'app'
    await Bun.write(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

    const operation = spinner()

    operation.start('Installing dependencies with Bun')

    try {
      await $`bun install`.cwd(targetPath).quiet()
      operation.stop('Installed dependencies with Bun')
    } catch (error) {
      operation.error('Failed to install dependencies with Bun')
      throw error
    }

    operation.start('Initializing git')

    try {
      await $`git init`.cwd(targetPath).quiet()
      operation.stop('Initialized git')
    } catch (error) {
      operation.error('Failed to initialize git')
      throw error
    }

    log.warn('Read README.md to get started (set up your environment variables first).')

    outro(`Created ${normalizedProjectName}
${addons.length > 0 ? `Add-ons: ${addons.join(', ')}` : 'No add-ons selected'}

Next commands:
  cd ${normalizedProjectName}
  bun run dev`)
  } catch (error) {
    cancel(error instanceof Error ? error.message : 'Unexpected error.')
    process.exit(1)
  }
}
