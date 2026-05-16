import { z } from 'zod'
import { basename } from 'node:path'

export const projectNameSchema = z
  .string()
  .trim()
  .min(1, 'Project name cannot be empty')
  .refine((value) => value !== '.' && value !== '..', {
    message: 'Project name must be a folder name',
  })
  .refine((value) => value === basename(value), {
    message: 'Project name must be a folder name, not a path',
  })
  .refine((value) => !value.includes('/') && !value.includes('\\'), {
    message: 'Project name must be a folder name, not a path',
  })

export const templateMetadataSchema = z.object({
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
})

export function getFirstZodIssueMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Invalid input'
}
