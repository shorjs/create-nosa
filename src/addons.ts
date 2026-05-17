import { $ } from 'bun'

export type Template = {
  id: string
  label: string
  description: string
  filesPath: string
}

type AddonContext = {
  targetPath: string
  projectName: string
  packageName: string
  template: Template
}

export type Addon = {
  id: string
  label: string
  description: string
  supportedTemplates: Array<string>
  apply: (context: AddonContext) => Promise<void> | void
}

export const addons: Array<Addon> = [
  {
    id: 'shadcn',
    label: 'shadcn/ui',
    description: 'Prepare shadcn/ui with the Button component.',
    supportedTemplates: ['start'],
    async apply({ targetPath }) {
      await $`bunx --bun shadcn@latest init --template start --base radix --preset nova --yes --no-monorepo --silent button`
        .cwd(targetPath)
        .quiet()
    },
  },
]
