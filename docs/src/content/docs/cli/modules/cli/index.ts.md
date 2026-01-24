---
title: cli/index.ts
nav_order: 1
parent: Modules
---

## index overview

lect-effect CLI entrypoint and command composition layer.
Keeps primitives in shellCommands.ts and wires them into @effect/cli commands.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [CLI](#cli)
  - [ShellRunError (type alias)](#shellrunerror-type-alias)
  - [archiveCommand](#archivecommand)
  - [argv](#argv)
  - [buildCommand](#buildcommand)
  - [cleanCommand](#cleancommand)
  - [cli](#cli-1)
  - [docsCommand](#docscommand)
  - [docsPrerequisiteSteps](#docsprerequisitesteps)
  - [emptyConfig](#emptyconfig)
  - [installCommand](#installcommand)
  - [iterateCommand](#iteratecommand)
  - [lintCommand](#lintcommand)
  - [main](#main)
  - [rootCommand](#rootcommand)
  - [runAll](#runall)
  - [runShell](#runshell)
  - [schemaCommand](#schemacommand)
  - [startBackendCommand](#startbackendcommand)
  - [startCommand](#startcommand)
  - [startFrontendCommand](#startfrontendcommand)
  - [testCommand](#testcommand)

---

# CLI

## ShellRunError (type alias)

Error type for shell command execution failures.

**Signature**

```ts
export type ShellRunError = {
  _tag: "ShellRunError"
  command: string
  cause: unknown
}
```

Added in v1.0.0

## archiveCommand

Create archive.zip from HEAD.

**Signature**

```ts
export declare const archiveCommand: Command.Command<"archive", never, ShellRunError, {}>
```

Added in v1.0.0

## argv

Command-line arguments (defaults to --help if none provided).

**Signature**

```ts
export declare const argv: readonly string[]
```

Added in v1.0.0

## buildCommand

Build all workspace packages in dependency order.

**Signature**

```ts
export declare const buildCommand: Command.Command<"build", never, ShellRunError, {}>
```

Added in v1.0.0

## cleanCommand

Clean build artifacts across all workspaces.

**Signature**

```ts
export declare const cleanCommand: Command.Command<"clean", never, ShellRunError, {}>
```

Added in v1.0.0

## cli

CLI runner with name/version metadata.

**Signature**

```ts
export declare const cli: (
  args: ReadonlyArray<string>
) => Effect.Effect<void, unknown | ValidationError, unknown | CliApp.Environment>
```

Added in v1.0.0

## docsCommand

Build, regenerate docs content, and start docs dev server.

**Signature**

```ts
export declare const docsCommand: Command.Command<"docs", never, ShellRunError, {}>
```

Added in v1.0.0

## docsPrerequisiteSteps

Prerequisites required before generating docs (install, clean, build, lint).

**Signature**

```ts
export declare const docsPrerequisiteSteps: readonly ShellCommand[]
```

Added in v1.0.0

## emptyConfig

Empty config placeholder for commands without options.

**Signature**

```ts
export declare const emptyConfig: {}
```

Added in v1.0.0

## installCommand

Install workspace dependencies (frozen lockfile).

**Signature**

```ts
export declare const installCommand: Command.Command<"install", never, ShellRunError, {}>
```

Added in v1.0.0

## iterateCommand

Git iterate helper (add/commit/push).

**Signature**

```ts
export declare const iterateCommand: Command.Command<"iterate", never, ShellRunError, {}>
```

Added in v1.0.0

## lintCommand

Build, then lint (optionally fixing) across the workspace.

**Signature**

```ts
export declare const lintCommand: Command.Command<
  "lint",
  never,
  ShellRunError,
  { readonly fix: Option.Option<boolean> }
>
```

Added in v1.0.0

## main

Program entrypoint wiring NodeContext.

**Signature**

```ts
export declare const main: Effect.Effect<unknown, unknown, unknown>
```

Added in v1.0.0

## rootCommand

Root command wiring all subcommands.

**Signature**

```ts
export declare const rootCommand: Command.Command<
  "lect-effect",
  never,
  ShellRunError,
  { readonly subcommand: Option.Option<any> }
>
```

Added in v1.0.0

## runAll

Run a sequence of shell commands in order.

**Signature**

```ts
export declare const runAll: (commands: readonly string[]) => Effect.Effect<void, ShellRunError>
```

Added in v1.0.0

## runShell

Execute a shell command, logging it at debug level and tagging failures.

**Signature**

```ts
export declare const runShell: (command: string) => Effect.Effect<void, ShellRunError>
```

Added in v1.0.0

## schemaCommand

Regenerate GraphQL schema artifacts.

**Signature**

```ts
export declare const schemaCommand: Command.Command<"schema:generate", never, ShellRunError, {}>
```

Added in v1.0.0

## startBackendCommand

Build, migrate, and start backend only.

**Signature**

```ts
export declare const startBackendCommand: Command.Command<"start:backend", never, ShellRunError, {}>
```

Added in v1.0.0

## startCommand

Build, migrate, and start backend+frontend together.

**Signature**

```ts
export declare const startCommand: Command.Command<"start", never, ShellRunError, {}>
```

Added in v1.0.0

## startFrontendCommand

Build and start frontend only.

**Signature**

```ts
export declare const startFrontendCommand: Command.Command<"start:frontend", never, ShellRunError, {}>
```

Added in v1.0.0

## testCommand

Build, migrate test DB, then run tests.

**Signature**

```ts
export declare const testCommand: Command.Command<"test", never, ShellRunError, {}>
```

Added in v1.0.0
