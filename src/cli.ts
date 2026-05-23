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
import { styleText } from 'node:util'

export async function runCli() {
  const args = process.argv.slice(2)
  let flagName: string | undefined
  let flagTemplate: string | undefined
  let flagStructure: string | undefined
  let flagAddons: string | undefined

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
      case '-n':
        flagName = args[++i]
        break
      case '--template':
      case '-t':
        flagTemplate = args[++i]
        break
      case '--structure':
      case '-s':
        flagStructure = args[++i]
        break
      case '--addons':
      case '-a':
        flagAddons = args[++i]
        break
      case '--help':
      case '-h':
        console.log(`create-nosa - Project scaffolder for nosa

Usage:
  bun create nosa [options]

Options:
  -n, --name <name>         Project name (default: my-nosa-app)
  -t, --template <template> Template name (default: start)
  -s, --structure <type>    Codebase structure (simple, vertical)
  -a, --addons <list>       Comma-separated add-ons (shadcn,tanstack-form,drizzle,betterauth,google-oauth)
  -h, --help                Show this help message

Examples:
  bun create nosa --name my-app --structure simple
  bun create nosa -n my-app -s vertical -a shadcn,google-oauth`)
        process.exit(0)
    }
  }

  try {
    const defaultProjectName = 'my-nosa-app'
    const templateFolders = new Set([
      'start-simple',
      'start-simple-shadcn',
      'start-simple-shadcn-tanstack-form',
      'start-simple-drizzle',
      'start-simple-drizzle-betterauth',
      'start-simple-drizzle-betterauth-google-oauth',
      'start-simple-shadcn-drizzle',
      'start-simple-shadcn-drizzle-betterauth',
      'start-simple-shadcn-drizzle-betterauth-google-oauth',
      'start-vertical',
      'start-vertical-shadcn',
      'start-vertical-drizzle',
      'start-vertical-drizzle-betterauth',
      'start-vertical-drizzle-betterauth-google-oauth',
      'start-vertical-shadcn-drizzle',
      'start-vertical-shadcn-drizzle-betterauth',
      'start-vertical-shadcn-drizzle-betterauth-google-oauth',
    ])

    intro('create-nosa')

    const projectName =
      flagName ??
      (await text({
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
      }))

    if (isCancel(projectName)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const template =
      flagTemplate ??
      (await select({
        message: 'Select a template',
        options: [
          {
            value: 'start',
            label: 'Start',
          },
        ],
      }))

    if (isCancel(template)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const codebaseStructure =
      flagStructure ??
      (await select({
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
      }))

    if (isCancel(codebaseStructure)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const selectedAddons = flagAddons
      ? flagAddons.split(',')
      : await multiselect({
          message: 'Select add-ons',
          required: false,
          options: [
            {
              value: 'shadcn',
              label: 'shadcn/ui',
            },
            {
              value: 'tanstack-form',
              label: 'TanStack Form',
            },
            {
              value: 'drizzle',
              label: 'Drizzle + PostgreSQL',
            },
            {
              value: 'betterauth',
              label: 'Better Auth',
            },
            {
              value: 'google-oauth',
              label: 'Google OAuth',
            },
          ],
        })

    if (isCancel(selectedAddons)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const addonSet = new Set(selectedAddons)

    if (addonSet.has('google-oauth')) {
      addonSet.add('betterauth')
    }

    if (addonSet.has('betterauth')) {
      addonSet.add('drizzle')
    }

    if (addonSet.has('tanstack-form')) {
      addonSet.add('shadcn')
    }

    const addons = (
      ['shadcn', 'tanstack-form', 'drizzle', 'betterauth', 'google-oauth'] as const
    ).filter((addon) => addonSet.has(addon))
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

    log.warn(
      styleText(
        'yellow',
        'Read README.md to get started (set up your environment variables first).',
      ),
    )

    outro(`Created ${normalizedProjectName}
${addons.length > 0 ? `Add-ons: ${addons.join(', ')}` : 'No add-ons selected'}

Next commands:
  cd ${normalizedProjectName}
  bun run dev

Note: The first time you run \`bun run dev\`, the TanStack Router plugin will generate \`src/routeTree.gen.ts\` automatically.`)
  } catch (error) {
    cancel(error instanceof Error ? error.message : 'Unexpected error.')
    process.exit(1)
  }
}
