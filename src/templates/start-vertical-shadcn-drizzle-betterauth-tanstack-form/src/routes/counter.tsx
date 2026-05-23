import { Counter } from '@/counter/counter'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/counter')({ component: Counter })
