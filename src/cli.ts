import { cancel, intro, isCancel, outro, select, text } from '@clack/prompts'
import { Glob } from 'bun'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { z } from 'zod'

export async function runCli() {
  try {
    intro('create-nosa')

    const templatesPath = resolve(import.meta.dir, '..', 'templates')
    const templateEntries = await readdir(templatesPath, { withFileTypes: true })
    const templateMetadata = z.object({
      label: z.string().trim().min(1),
      description: z.string().trim().min(1),
    })
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
      let metadata: z.infer<typeof templateMetadata>

      try {
        metadata = templateMetadata.parse(await Bun.file(metaPath).json())
      } catch (error) {
        throw new Error(`Template metadata at ${metaPath} must include label and description.`, {
          cause: error,
        })
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

    if (templates.length === 0) {
      throw new Error('No templates found.')
    }

    const projectName = await text({
      message: 'Project name',
      placeholder: 'my-nosa-app',
      validate(value) {
        if (!value?.trim()) {
          return 'Project name is required'
        }

        const normalizedValue = value.trim()

        if (normalizedValue === '.' || normalizedValue === '..') {
          return 'Project name must be a folder name'
        }

        if (normalizedValue !== basename(normalizedValue)) {
          return 'Project name must be a folder name, not a path'
        }

        if (normalizedValue.includes('/') || normalizedValue.includes('\\')) {
          return 'Project name must be a folder name, not a path'
        }

        return undefined
      },
    })

    if (isCancel(projectName)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    const normalizedProjectName = projectName.trim()
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

    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId)

    if (!selectedTemplate) {
      throw new Error(`Template "${selectedTemplateId}" was not found.`)
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
      const targetFilePath = join(targetPath, filePath)

      await mkdir(dirname(targetFilePath), { recursive: true })
      await Bun.write(targetFilePath, Bun.file(sourceFilePath))
    }

    outro(`Created ${normalizedProjectName} using ${selectedTemplate.label}.

Next commands:
  cd ${normalizedProjectName}
  bun install
  bun run dev`)
  } catch (error) {
    cancel(error instanceof Error ? error.message : 'Unexpected error.')
    process.exit(1)
  }
}
