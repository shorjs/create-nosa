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
import { addons, type Addon, type Template } from './addons'

const defaultProjectName = 'my-nosa-app'

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
      yes: {
        type: 'boolean',
        description: 'Skip all prompts by accepting defaults.',
        alias: 'y',
      },
    },
    async run({ args }) {
      try {
        intro('create-nosa')

        const templatesPath = resolve(import.meta.dir, '..', 'templates')
        const templateEntries = await readdir(templatesPath, { withFileTypes: true })
        const templates: Array<Template> = []

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
        let selectedAddonIds: Array<Addon['id']> = []

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
        const selectedAddons = availableAddons.filter((addon) =>
          selectedAddonIds.includes(addon.id),
        )

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
        const initialCommitMessage = `feat: initial commit using ${selectedTemplate.id}`

        for (const addon of selectedAddons) {
          operation.start(`Applying ${addon.label}`)

          try {
            await addon.apply({
              targetPath,
              projectName: normalizedProjectName,
              packageName: packageJson.name,
              template: selectedTemplate,
            })
            operation.stop(`Applied ${addon.label}`)
          } catch (error) {
            operation.error(`Failed to apply ${addon.label}`)
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

        operation.start('Creating the initial git commit')

        try {
          await $`git init`.cwd(targetPath).quiet()
          await $`bunx --bun simple-git-hooks`.cwd(targetPath).quiet()
          await $`git add .`.cwd(targetPath).quiet()
          await $`git commit -m ${initialCommitMessage}`.cwd(targetPath).quiet()
          operation.stop('Created the initial git commit')
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
