import { cancel, intro, isCancel, multiselect, outro, select, spinner, text } from '@clack/prompts'
import { $, Glob } from 'bun'
import { defineCommand, runMain } from 'citty'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { z } from 'zod'
import {
  templateMetadataSchema,
  projectNameSchema,
  getFirstZodIssueMessage,
  toValidPackageName,
} from './schemas'

const addons = [
  {
    id: 'shadcn',
    label: 'shadcn/ui',
    description: 'Prepare shadcn/ui with the Button component.',
    supportedTemplates: ['start'],
  },
]

const defaultProjectName = 'my-nosa-app'
const defaultShadcnPreset = 'nova'
const shadcnDemoRoute = `import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: App })

export function App() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
      </div>
    </div>
  )
}

export default App
`

export async function runCli() {
  const main = defineCommand({
    meta: async () => ({
      name: 'create-nosa',
      version: String(
        (await Bun.file(resolve(import.meta.dir, '..', 'package.json')).json()).version,
      ),
      description: 'Scaffolding for nosa projects.',
    }),
    args: {
      projectName: {
        type: 'positional',
        description: 'Project name',
        required: false,
      },
      template: {
        type: 'string',
        description: 'Template name to use for the generated project.',
        valueHint: 'name',
      },
      addon: {
        type: 'enum',
        description: 'Add on to apply without prompting.',
        valueHint: 'id',
        options: addons.map((addon) => addon.id),
      },
      shadcnPreset: {
        type: 'string',
        description: 'The shadcn/ui preset to use (only valid when shadcn is selected).',
      },
      yes: {
        type: 'boolean',
        description: 'Skip all prompts by accepting defaults.',
        alias: 'y',
      },
    },
    async run({ args }) {
      try {
        if (args.shadcnPreset !== undefined && args.addon !== 'shadcn') {
          throw new Error(
            'The --shadcn-preset flag can only be used when --addon shadcn is also provided.',
          )
        }

        intro('create-nosa')

        const templatesPath = resolve(import.meta.dir, '..', 'templates')
        const templateEntries = await readdir(templatesPath, { withFileTypes: true })
        const templates: Array<{
          id: string
          label: string
          description: string
          filesPath: string
        }> = []

        for (const entry of templateEntries) {
          if (!entry.isDirectory()) {
            continue
          }

          const templatePath = join(templatesPath, entry.name)
          const filesPath = join(templatePath, 'files')
          const metaPath = join(templatePath, 'meta.json')
          let metadata: z.infer<typeof templateMetadataSchema>

          try {
            metadata = templateMetadataSchema.parse(await Bun.file(metaPath).json())
          } catch (error) {
            throw new Error(
              `Template metadata at ${metaPath} must include label and description.`,
              {
                cause: error,
              },
            )
          }

          const filesPathStats = await stat(filesPath).catch(() => undefined)

          if (!filesPathStats?.isDirectory()) {
            throw new Error(`Template "${entry.name}" is missing a files directory.`)
          }

          templates.push({
            id: entry.name,
            label: metadata.label,
            description: metadata.description,
            filesPath,
          })
        }

        templates.sort((left, right) => left.id.localeCompare(right.id))

        if (templates.length === 0) {
          throw new Error('No templates found.')
        }

        let normalizedProjectName: string

        if (args.projectName !== undefined) {
          const projectNameResult = projectNameSchema.safeParse(args.projectName)

          if (!projectNameResult.success) {
            throw new Error(getFirstZodIssueMessage(projectNameResult.error))
          }

          normalizedProjectName = projectNameResult.data
        } else if (args.yes === true) {
          normalizedProjectName = defaultProjectName
        } else {
          const projectName = await text({
            message: 'Project name',
            placeholder: defaultProjectName,
            defaultValue: defaultProjectName,
            validate(value) {
              const projectNameResult = projectNameSchema.safeParse(value || defaultProjectName)

              if (!projectNameResult.success) {
                return getFirstZodIssueMessage(projectNameResult.error)
              }

              return undefined
            },
          })

          if (isCancel(projectName)) {
            cancel('Operation cancelled.')
            process.exit(0)
          }

          normalizedProjectName = projectNameSchema.parse(projectName)
        }

        let selectedTemplate: (typeof templates)[number]

        if (args.template !== undefined) {
          const template = templates.find((template) => template.id === args.template)

          if (!template) {
            throw new Error(
              `Template "${args.template}" was not found. Available templates: ${templates
                .map((template) => template.id)
                .join(', ')}.`,
            )
          }

          selectedTemplate = template
        } else if (args.yes === true) {
          const template = templates[0]

          if (!template) {
            throw new Error('No templates found.')
          }

          selectedTemplate = template
        } else {
          const selectedTemplateId = await select({
            message: 'Select a template',
            options: templates.map((template) => ({
              value: template.id,
              label: template.label,
              hint: template.description,
            })),
          })

          if (isCancel(selectedTemplateId)) {
            cancel('Operation cancelled.')
            process.exit(0)
          }

          const template = templates.find((template) => template.id === selectedTemplateId)

          if (!template) {
            throw new Error(`Template "${selectedTemplateId}" was not found.`)
          }

          selectedTemplate = template
        }

        const availableAddons = addons.filter((addon) =>
          addon.supportedTemplates.includes(selectedTemplate.id),
        )
        let selectedAddonIds: Array<(typeof addons)[number]['id']> = []

        if (args.addon !== undefined) {
          const addon = availableAddons.find((addon) => addon.id === args.addon)

          if (!addon) {
            const availableAddonIds = availableAddons.map((addon) => addon.id).join(', ')
            throw new Error(
              `Add on "${args.addon}" is not available for template "${selectedTemplate.id}".${
                availableAddonIds ? ` Available add ons: ${availableAddonIds}.` : ''
              }`,
            )
          }

          selectedAddonIds = [addon.id]
        } else if (args.yes !== true && availableAddons.length > 0) {
          const selectedAddons = await multiselect({
            message: 'Select add ons',
            required: false,
            options: availableAddons.map((addon) => ({
              value: addon.id,
              label: addon.label,
              hint: addon.description,
            })),
          })

          if (isCancel(selectedAddons)) {
            cancel('Operation cancelled.')
            process.exit(0)
          }

          selectedAddonIds = [...selectedAddons]
        }

        let shadcnPreset = args.shadcnPreset

        if (selectedAddonIds.includes('shadcn') && !shadcnPreset && args.yes !== true) {
          const presetResult = await text({
            message: 'shadcn/ui preset to use',
            placeholder: defaultShadcnPreset,
            defaultValue: defaultShadcnPreset,
          })

          if (isCancel(presetResult)) {
            cancel('Operation cancelled.')
            process.exit(0)
          }

          shadcnPreset = presetResult
        }

        if (!shadcnPreset) {
          shadcnPreset = defaultShadcnPreset
        }

        const targetPath = resolve(process.cwd(), normalizedProjectName)
        const targetStats = await stat(targetPath).catch(() => undefined)

        if (!targetStats) {
          await mkdir(targetPath)
        } else if (!targetStats.isDirectory()) {
          throw new Error(`${targetPath} already exists and is not a directory.`)
        } else {
          const targetEntries = await readdir(targetPath)

          if (targetEntries.length > 0) {
            throw new Error(`${targetPath} already exists and is not empty.`)
          }
        }

        const templateFiles = new Glob('**/*')

        for await (const filePath of templateFiles.scan({
          cwd: selectedTemplate.filesPath,
          dot: true,
          onlyFiles: true,
        })) {
          const sourceFilePath = join(selectedTemplate.filesPath, filePath)
          const targetRelativeFilePath = filePath
            .split('/')
            .map((pathSegment) => (pathSegment === '_gitignore' ? '.gitignore' : pathSegment))
            .join('/')
          const targetFilePath = join(targetPath, targetRelativeFilePath)

          await mkdir(dirname(targetFilePath), { recursive: true })
          await Bun.write(targetFilePath, Bun.file(sourceFilePath))
        }

        const packageJsonPath = join(targetPath, 'package.json')
        const packageJson = await Bun.file(packageJsonPath).json()
        const packageName = toValidPackageName(normalizedProjectName)

        packageJson.name = packageName || 'app'
        await Bun.write(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

        const operation = spinner()

        if (selectedAddonIds.includes('shadcn')) {
          operation.start('Applying shadcn/ui')

          try {
            await $`bunx --bun shadcn@latest init --template start --base radix --preset ${shadcnPreset} --yes --no-monorepo --silent button`
              .cwd(targetPath)
              .quiet()
            await Bun.write(join(targetPath, 'src', 'routes', 'index.tsx'), shadcnDemoRoute)
            operation.stop('Applied shadcn/ui')
          } catch (error) {
            operation.error('Failed to apply shadcn/ui')
            throw error
          }
        }

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
          await $`bunx --bun simple-git-hooks`.cwd(targetPath).quiet()
          await $`git add .`.cwd(targetPath).quiet()
          await $`git commit -m "feat: initial commit using ${selectedTemplate.id}"`
            .cwd(targetPath)
            .quiet()
          operation.stop('Git initialized. Repo commited')
        } catch (error) {
          operation.error('Failed to create the initial git commit')
          throw error
        }

        outro(`Created ${normalizedProjectName} using ${selectedTemplate.label}.
Add ons: ${selectedAddonIds.length > 0 ? selectedAddonIds.join(', ') : 'none'}
Next commands:
  cd ${normalizedProjectName}
  bun run dev`)
      } catch (error) {
        cancel(error instanceof Error ? error.message : 'Unexpected error.')
        process.exit(1)
      }
    },
  })

  await runMain(main, {
    rawArgs: Bun.argv.slice(2),
  })
}
