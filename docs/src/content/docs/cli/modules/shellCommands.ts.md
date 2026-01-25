---
title: shellCommands.ts
nav_order: 2
parent: Modules
---

## shellCommands overview

Primitive shell command definitions used by the lect-effect CLI.
Each command is intentionally kept as a single shell string so higher-level
composition can orchestrate ordering without bundling behavior here.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [ShellCommand](#shellcommand)
  - [ShellCommand (type alias)](#shellcommand-type-alias)
  - [buildBackend](#buildbackend)
  - [buildDocs](#builddocs)
  - [buildDomain](#builddomain)
  - [buildFrontend](#buildfrontend)
  - [buildGraphqlSchema](#buildgraphqlschema)
  - [buildHandlers](#buildhandlers)
  - [buildServices](#buildservices)
  - [cleanBackend](#cleanbackend)
  - [cleanDocs](#cleandocs)
  - [cleanDomain](#cleandomain)
  - [cleanFrontend](#cleanfrontend)
  - [cleanGraphqlSchema](#cleangraphqlschema)
  - [cleanHandlers](#cleanhandlers)
  - [cleanServices](#cleanservices)
  - [docsDev](#docsdev)
  - [docsGenerateBackend](#docsgeneratebackend)
  - [docsGenerateCLI](#docsgeneratecli)
  - [docsGenerateContentSteps](#docsgeneratecontentsteps)
  - [docsGenerateDomain](#docsgeneratedomain)
  - [docsGenerateFrontend](#docsgeneratefrontend)
  - [docsGenerateGraphqlSchema](#docsgenerategraphqlschema)
  - [docsGenerateHandlers](#docsgeneratehandlers)
  - [docsGenerateServices](#docsgenerateservices)
  - [docsMoveModuleIndexes](#docsmovemoduleindexes)
  - [docsPruneContent](#docsprunecontent)
  - [frontendCodegen](#frontendcodegen)
  - [generateGraphqlSchema](#generategraphqlschema)
  - [gitAddAll](#gitaddall)
  - [gitArchiveHead](#gitarchivehead)
  - [gitCommitIterate](#gitcommititerate)
  - [gitCreateBranch](#gitcreatebranch)
  - [gitIterateSteps](#gititeratesteps)
  - [gitListBranchesByDate](#gitlistbranchesbydate)
  - [gitPushHead](#gitpushhead)
  - [installWorkspace](#installworkspace)
  - [lintShellCommand](#lintshellcommand)
  - [migrateMasterdataUp](#migratemasterdataup)
  - [migrateTestMasterdataUp](#migratetestmasterdataup)
  - [startBackendAndFrontend](#startbackendandfrontend)
  - [startBackendRuntime](#startbackendruntime)
  - [startFrontendRuntime](#startfrontendruntime)
  - [testWorkspace](#testworkspace)
- [ShellCommand[]](#shellcommand)
  - [cleanSteps](#cleansteps)
  - [fullBuildSteps](#fullbuildsteps)

---

# ShellCommand

## ShellCommand (type alias)

Structured shell command used by higher-level CLI flows.

**Signature**

```ts
export type ShellCommand = {
  readonly name: string
  readonly command: string
}
```

Added in v1.0.0

## buildBackend

Build backend app.

**Signature**

```ts
export declare const buildBackend: ShellCommand
```

Added in v1.0.0

## buildDocs

Build docs site.

**Signature**

```ts
export declare const buildDocs: ShellCommand
```

Added in v1.0.0

## buildDomain

Build domain package.

**Signature**

```ts
export declare const buildDomain: ShellCommand
```

Added in v1.0.0

## buildFrontend

Build frontend app.

**Signature**

```ts
export declare const buildFrontend: ShellCommand
```

Added in v1.0.0

## buildGraphqlSchema

Build GraphQL schema package.

**Signature**

```ts
export declare const buildGraphqlSchema: ShellCommand
```

Added in v1.0.0

## buildHandlers

Build handlers package.

**Signature**

```ts
export declare const buildHandlers: ShellCommand
```

Added in v1.0.0

## buildServices

Build services package.

**Signature**

```ts
export declare const buildServices: ShellCommand
```

Added in v1.0.0

## cleanBackend

Clean backend app artifacts.

**Signature**

```ts
export declare const cleanBackend: ShellCommand
```

Added in v1.0.0

## cleanDocs

Clean docs build artifacts.

**Signature**

```ts
export declare const cleanDocs: ShellCommand
```

Added in v1.0.0

## cleanDomain

Clean domain package artifacts.

**Signature**

```ts
export declare const cleanDomain: ShellCommand
```

Added in v1.0.0

## cleanFrontend

Clean frontend app artifacts.

**Signature**

```ts
export declare const cleanFrontend: ShellCommand
```

Added in v1.0.0

## cleanGraphqlSchema

Clean GraphQL schema package artifacts.

**Signature**

```ts
export declare const cleanGraphqlSchema: ShellCommand
```

Added in v1.0.0

## cleanHandlers

Clean handlers package artifacts.

**Signature**

```ts
export declare const cleanHandlers: ShellCommand
```

Added in v1.0.0

## cleanServices

Clean services package artifacts.

**Signature**

```ts
export declare const cleanServices: ShellCommand
```

Added in v1.0.0

## docsDev

Start the docs dev server.

**Signature**

```ts
export declare const docsDev: ShellCommand
```

Added in v1.0.0

## docsGenerateBackend

Generate backend docs content.

**Signature**

```ts
export declare const docsGenerateBackend: ShellCommand
```

Added in v1.0.0

## docsGenerateCLI

Generate CLI docs content.

**Signature**

```ts
export declare const docsGenerateCLI: ShellCommand
```

Added in v1.0.0

## docsGenerateContentSteps

Ordered steps to regenerate docs content across packages.

**Signature**

```ts
export declare const docsGenerateContentSteps: readonly ShellCommand[]
```

Added in v1.0.0

## docsGenerateDomain

Generate domain docs content.

**Signature**

```ts
export declare const docsGenerateDomain: ShellCommand
```

Added in v1.0.0

## docsGenerateFrontend

Generate frontend docs content.

**Signature**

```ts
export declare const docsGenerateFrontend: ShellCommand
```

Added in v1.0.0

## docsGenerateGraphqlSchema

Generate GraphQL schema docs content.

**Signature**

```ts
export declare const docsGenerateGraphqlSchema: ShellCommand
```

Added in v1.0.0

## docsGenerateHandlers

Generate handlers docs content.

**Signature**

```ts
export declare const docsGenerateHandlers: ShellCommand
```

Added in v1.0.0

## docsGenerateServices

Generate services docs content.

**Signature**

```ts
export declare const docsGenerateServices: ShellCommand
```

Added in v1.0.0

## docsMoveModuleIndexes

Move module indexes to \_index.md for Starlight routing expectations.

**Signature**

```ts
export declare const docsMoveModuleIndexes: ShellCommand
```

Added in v1.0.0

## docsPruneContent

Remove generated docs content before regeneration.

**Signature**

```ts
export declare const docsPruneContent: ShellCommand
```

Added in v1.0.0

## frontendCodegen

Run frontend GraphQL codegen.

**Signature**

```ts
export declare const frontendCodegen: ShellCommand
```

Added in v1.0.0

## generateGraphqlSchema

Generate GraphQL schema artifacts.

**Signature**

```ts
export declare const generateGraphqlSchema: ShellCommand
```

Added in v1.0.0

## gitAddAll

Git add all tracked/untracked files.

**Signature**

```ts
export declare const gitAddAll: ShellCommand
```

Added in v1.0.0

## gitArchiveHead

Archive the current HEAD to archive.zip.

**Signature**

```ts
export declare const gitArchiveHead: ShellCommand
```

Added in v1.0.0

## gitCommitIterate

Git commit with the fixed "iterate" message.

**Signature**

```ts
export declare const gitCommitIterate: ShellCommand
```

Added in v1.0.0

## gitCreateBranch

Create a new branch under the lect-effect/ prefix.

**Signature**

```ts
export declare const gitCreateBranch: (branchName: string) => ShellCommand
```

Added in v1.0.0

## gitIterateSteps

Ordered steps for the iterate workflow.

**Signature**

```ts
export declare const gitIterateSteps: readonly ShellCommand[]
```

Added in v1.0.0

## gitListBranchesByDate

List branches sorted by last commit date.

**Signature**

```ts
export declare const gitListBranchesByDate: ShellCommand
```

Added in v1.0.0

## gitPushHead

Git push HEAD to origin with upstream tracking.

**Signature**

```ts
export declare const gitPushHead: ShellCommand
```

Added in v1.0.0

## installWorkspace

Install all workspace dependencies with frozen lockfile.

**Signature**

```ts
export declare const installWorkspace: ShellCommand
```

Added in v1.0.0

## lintShellCommand

Workspace lint command with optional --fix flag.

**Signature**

```ts
export declare const lintShellCommand: (fix: Option.Option<boolean>) => ShellCommand
```

Added in v1.0.0

## migrateMasterdataUp

Run main DB migrations against MASTERDATA_PG_URL.

**Signature**

```ts
export declare const migrateMasterdataUp: ShellCommand
```

Added in v1.0.0

## migrateTestMasterdataUp

Run test DB migrations against TEST_MASTERDATA_PG_URL.

**Signature**

```ts
export declare const migrateTestMasterdataUp: ShellCommand
```

Added in v1.0.0

## startBackendAndFrontend

Start backend and frontend concurrently with labeled output.

**Signature**

```ts
export declare const startBackendAndFrontend: ShellCommand
```

Added in v1.0.0

## startBackendRuntime

Start backend runtime.

**Signature**

```ts
export declare const startBackendRuntime: ShellCommand
```

Added in v1.0.0

## startFrontendRuntime

Start frontend runtime.

**Signature**

```ts
export declare const startFrontendRuntime: ShellCommand
```

Added in v1.0.0

## testWorkspace

Run test suites for domain, backend, and frontend.

**Signature**

```ts
export declare const testWorkspace: ShellCommand
```

Added in v1.0.0

# ShellCommand[]

## cleanSteps

Ordered clean steps across all workspaces.

**Signature**

```ts
export declare const cleanSteps: readonly ShellCommand[]
```

Added in v1.0.0

## fullBuildSteps

Full build pipeline in dependency order.

**Signature**

```ts
export declare const fullBuildSteps: readonly ShellCommand[]
```

Added in v1.0.0
