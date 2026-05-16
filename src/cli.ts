import { cancel, intro, isCancel, outro, select, spinner, text } from '@clack/prompts'
import { $, Glob } from 'bun'
import { defineCommand, runMain } from 'citty'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { z } from 'zod'
import { templateMetadataSchema, projectNameSchema, getFirstZodIssueMessage } from './schemas'

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

        const operation = spinner()
        const initialCommitMessage = `feat: initial commit using ${selectedTemplate.id}`

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
Installed dependencies and committed the initial project.

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
