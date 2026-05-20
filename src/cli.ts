import { Command } from '@effect/platform'
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
import { Data, Effect } from 'effect'
import { Glob } from 'bun'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'

class CliCancelled extends Data.TaggedError('CliCancelled')<{
  readonly message: string
}> {}

const clackPrompt = <T>(prompt: () => Promise<T | symbol>): Effect.Effect<T, CliCancelled> =>
  Effect.tryPromise({
    try: prompt,
    catch: () => new CliCancelled({ message: 'Prompt failed' }),
  }).pipe(
    Effect.flatMap((value) =>
      isCancel(value)
        ? Effect.fail(new CliCancelled({ message: 'Operation cancelled.' }))
        : Effect.succeed(value as T),
    ),
  )

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

export const runCli = Effect.gen(function* () {
  const args = process.argv.slice(2)
  let flagName: string | undefined
  let flagTemplate: string | undefined
  let flagStructure: string | undefined
  let flagAddons: string | undefined
  let flagHelp = false

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
        flagHelp = true
        break
    }
  }

  if (flagHelp) {
    yield* Effect.sync(() =>
      console.log(`create-nosa - Project scaffolder for nosa

Usage:
  bun create nosa [options]

Options:
  -n, --name <name>         Project name (default: my-nosa-app)
  -t, --template <template> Template name (default: start)
  -s, --structure <type>    Codebase structure (simple, vertical)
  -a, --addons <list>       Comma-separated add-ons (shadcn,drizzle,betterauth)
  -h, --help                Show this help message

Examples:
  bun create nosa --name my-app --structure simple
  bun create nosa -n my-app -s vertical -a shadcn,drizzle`),
    )
    return
  }

  const defaultProjectName = 'my-nosa-app'

  yield* Effect.sync(() => intro('create-nosa'))

  const projectName =
    flagName ??
    (yield* clackPrompt(() =>
      text({
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
      }),
    ))

  const template =
    flagTemplate ??
    (yield* clackPrompt(() =>
      select({
        message: 'Select a template',
        options: [
          {
            value: 'start',
            label: 'Start',
          },
        ],
      }),
    ))

  const codebaseStructure =
    flagStructure ??
    (yield* clackPrompt(() =>
      select({
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
      }),
    ))

  const selectedAddons: string[] = flagAddons
    ? flagAddons.split(',')
    : yield* clackPrompt(() =>
        multiselect({
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
        }),
      )

  const addonSet = new Set(selectedAddons)

  if (addonSet.has('betterauth')) {
    addonSet.add('drizzle')
  }

  const addons = (['shadcn', 'drizzle', 'betterauth'] as const).filter((addon) =>
    addonSet.has(addon),
  )
  const templateFolder = [template, codebaseStructure, ...addons].join('-')

  if (!templateFolders.has(templateFolder)) {
    yield* Effect.die(new Error(`Unsupported template combination: ${templateFolder}`))
  }

  const normalizedProjectName = (projectName || defaultProjectName).trim()
  const targetPath = resolve(process.cwd(), normalizedProjectName)

  // Ensure target directory
  yield* Effect.tryPromise({
    try: async () => {
      const targetStats = await stat(targetPath).catch(() => undefined)

      if (!targetStats) {
        await mkdir(targetPath)
      } else if (!targetStats.isDirectory()) {
        throw new Error(`${targetPath} already exists and is not a directory.`)
      } else if ((await readdir(targetPath)).length > 0) {
        throw new Error(`${targetPath} already exists and is not empty.`)
      }
    },
    catch: (e) => e as Error,
  }).pipe(Effect.orDie)

  // Copy template files
  const templatePath = join(import.meta.dir, 'templates', templateFolder)

  yield* Effect.tryPromise({
    try: async () => {
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
    },
    catch: (e) => e as Error,
  }).pipe(Effect.orDie)

  // Rewrite package.json name
  yield* Effect.tryPromise({
    try: async () => {
      const packageJsonPath = join(targetPath, 'package.json')
      const packageJson = await Bun.file(packageJsonPath).json()
      const packageName = normalizedProjectName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z\d\-~]+/g, '-')

      packageJson.name = packageName || 'app'
      await Bun.write(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
    },
    catch: (e) => e as Error,
  }).pipe(Effect.orDie)

  const operation = spinner()

  // Install dependencies
  yield* Effect.sync(() => operation.start('Installing dependencies with Bun'))

  yield* Command.make('bun', 'install').pipe(
    Command.workingDirectory(targetPath),
    Command.exitCode,
    Effect.tapError(() =>
      Effect.sync(() => operation.error('Failed to install dependencies with Bun')),
    ),
    Effect.orDie,
  )

  yield* Effect.sync(() => operation.stop('Installed dependencies with Bun'))

  // Initialize git
  yield* Effect.sync(() => operation.start('Initializing git'))

  yield* Command.make('git', 'init').pipe(
    Command.workingDirectory(targetPath),
    Command.exitCode,
    Effect.tapError(() => Effect.sync(() => operation.error('Failed to initialize git'))),
    Effect.orDie,
  )

  yield* Effect.sync(() => operation.stop('Initialized git'))

  yield* Effect.sync(() =>
    log.warn('Read README.md to get started (set up your environment variables first).'),
  )

  yield* Effect.sync(() =>
    outro(`Created ${normalizedProjectName}
${addons.length > 0 ? `Add-ons: ${addons.join(', ')}` : 'No add-ons selected'}

Next commands:
  cd ${normalizedProjectName}
  bun run dev

Note: The first time you run \`bun run dev\`, the TanStack Router plugin will generate \`src/routeTree.gen.ts\` automatically.`),
  )
}).pipe(
  Effect.catchTag('CliCancelled', (e) =>
    Effect.sync(() => {
      cancel(e.message)
      process.exitCode = 0
    }),
  ),
)
