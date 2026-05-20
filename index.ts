#!/usr/bin/env bun

import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Effect } from 'effect'
import { runCli } from './src/cli.ts'

BunRuntime.runMain(runCli.pipe(Effect.provide(BunContext.layer)))
