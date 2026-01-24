import { execSync } from 'node:child_process';
import process from 'node:process';
import { Command, Options } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Effect, type Option } from 'effect';
import {
  cleanSteps,
  docsDev,
  docsGenerateContentSteps,
  docsMoveModuleIndexes,
  docsPruneContent,
  fullBuildSteps,
  generateGraphqlSchema,
  gitArchiveHead,
  gitIterateSteps,
  installWorkspace,
  lintShellCommand,
  migrateMasterdataUp,
  migrateTestMasterdataUp,
  startBackendAndFrontend,
  startBackendRuntime,
  startFrontendRuntime,
  testWorkspace,
} from './shellCommands.js';

type ShellRunError = {
  _tag: 'ShellRunError';
  command: string;
  cause: unknown;
};

const runShell: (command: string) => Effect.Effect<void, ShellRunError> = (command: string) =>
  Effect.gen(function * () {
    yield * Effect.logDebug(`$ ${command}`);
    return yield * Effect.try({
      try: () => execSync(command, { stdio: 'inherit' }),
      catch: cause => ({ _tag: 'ShellRunError', command, cause } satisfies ShellRunError),
    });
  });

const runAll: (commands: readonly string[]) => Effect.Effect<void, ShellRunError> = (commands: readonly string[]) =>
  Effect.gen(function * () {
    for (const cmd of commands) {
      yield * runShell(cmd);
    }
  });
const emptyConfig = {} as const satisfies Record<string, never>;

const buildCommand = Command
  .make('build', emptyConfig, () => runAll(fullBuildSteps.map(step => step.command)))
  .pipe(Command.withDescription('Install, clean, then build all workspace packages in dependency order.')) satisfies Command.Command<'build', never, ShellRunError, Record<string, never>>;

const startCommand = Command
  .make('start', emptyConfig, () =>
    runAll([
      ...fullBuildSteps,
      migrateMasterdataUp,
      startBackendAndFrontend,
    ].map(step => step.command)))
  .pipe(Command.withDescription('Build everything, run migrations, then start backend+frontend.')) satisfies Command.Command<'start', never, ShellRunError, Record<string, never>>;

const startBackendCommand = Command
  .make('start:backend', emptyConfig, () =>
    runAll([
      ...fullBuildSteps,
      migrateMasterdataUp,
      startBackendRuntime,
    ].map(step => step.command)))
  .pipe(Command.withDescription('Build everything, migrate, then start backend only.')) satisfies Command.Command<'start:backend', never, ShellRunError, Record<string, never>>;

const startFrontendCommand = Command
  .make('start:frontend', emptyConfig, () =>
    runAll([
      ...fullBuildSteps,
      startFrontendRuntime,
    ].map(step => step.command)))
  .pipe(Command.withDescription('Build everything, then start frontend only.')) satisfies Command.Command<'start:frontend', never, ShellRunError, Record<string, never>>;

const cleanCommand = Command
  .make('clean', emptyConfig, () => runAll(cleanSteps.map(step => step.command)))
  .pipe(Command.withDescription('Clean build artifacts for all workspace packages.')) satisfies Command.Command<'clean', never, ShellRunError, Record<string, never>>;

const installCommand = Command
  .make('install', emptyConfig, () => runShell(installWorkspace.command))
  .pipe(Command.withDescription('Install workspace dependencies using the frozen lockfile.')) satisfies Command.Command<'install', never, ShellRunError, Record<string, never>>;

const schemaCommand = Command
  .make('schema:generate', emptyConfig, () => runShell(generateGraphqlSchema.command))
  .pipe(Command.withDescription('Regenerate the GraphQL schema artifact.')) satisfies Command.Command<'schema:generate', never, ShellRunError, Record<string, never>>;

const lintCommand = Command
  .make('lint', { fix: Options.boolean('fix').pipe(Options.optional) }, ({ fix }) =>
    runAll([...fullBuildSteps, lintShellCommand(fix)].map(step => step.command)))
  .pipe(Command.withDescription('Build everything, then lint (supports --fix).')) satisfies Command.Command<'lint', never, ShellRunError, {readonly fix: Option.Option<boolean>}>;

const docsCommand = Command
  .make('docs', emptyConfig, () =>
    runAll([
      ...fullBuildSteps,
      docsPruneContent,
      ...docsGenerateContentSteps,
      docsMoveModuleIndexes,
      docsDev,
    ].map(step => step.command)))
  .pipe(Command.withDescription('Build, regenerate docs content, and start docs dev server.')) satisfies Command.Command<'docs', never, ShellRunError, Record<string, never>>;

const testCommand = Command
  .make('test', emptyConfig, () =>
    runAll([
      ...fullBuildSteps,
      migrateTestMasterdataUp,
      testWorkspace,
    ].map(step => step.command)))
  .pipe(Command.withDescription('Build, run test DB migrations, then execute tests.')) satisfies Command.Command<'test', never, ShellRunError, Record<string, never>>;

const iterateCommand = Command
  .make('iterate', emptyConfig, () => runAll(gitIterateSteps.map(step => step.command)))
  .pipe(Command.withDescription('Git add ., commit "iterate", and push HEAD.')) satisfies Command.Command<'iterate', never, ShellRunError, Record<string, never>>;

const archiveCommand = Command
  .make('archive', emptyConfig, () => runShell(gitArchiveHead.command))
  .pipe(Command.withDescription('Create archive.zip from HEAD.')) satisfies Command.Command<'archive', never, ShellRunError, Record<string, never>>;

const rootCommand: Command.Command<'lect-effect', never, ShellRunError, {readonly subcommand: Option.Option<any>}> = Command
  .make('lect-effect', emptyConfig, () => Effect.succeed(undefined))
  .pipe(
    Command.withDescription('Workspace CLI entrypoint for lect-effect.'),
    Command.withSubcommands([
      buildCommand,
      cleanCommand,
      installCommand,
      schemaCommand,
      startCommand,
      startBackendCommand,
      startFrontendCommand,
      lintCommand,
      docsCommand,
      testCommand,
      iterateCommand,
      archiveCommand,
    ]),
  );

const cli: ReturnType<typeof Command.run> = Command.run(rootCommand, {
  name: 'lect-effect',
  version: '1.0.0',
});

// default to showing help if no args are provided
const argv: readonly string[] = process.argv.length > 2 ? process.argv : [...process.argv, '--help'];

const main: Effect.Effect<unknown, unknown, unknown> = cli(argv).pipe(Effect.provide(NodeContext.layer));

NodeRuntime.runMain(main as Effect.Effect<unknown, unknown>);
