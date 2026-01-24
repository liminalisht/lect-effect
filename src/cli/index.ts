import { execSync } from 'node:child_process';
import process from 'node:process';
import { Command, Options } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Effect, Option } from 'effect';

type ShellRunError = {
  _tag: 'ShellRunError';
  command: string;
  cause: unknown;
};

type ShellCommand = {
  readonly name: string;
  readonly command: string;
};

const runShell: (command: string) => Effect.Effect<void, ShellRunError, never> = (command: string) =>
  Effect.try({
    try: () => execSync(command, { stdio: 'inherit' }),
    catch: cause => ({ _tag: 'ShellRunError', command, cause } satisfies ShellRunError),
  });

const runAll: (commands: readonly string[]) => Effect.Effect<void, ShellRunError, never> = (commands: readonly string[]) =>
  Effect.gen(function * () {
    for (const cmd of commands) {
      yield * runShell(cmd);
    }
  });

const installWorkspace: ShellCommand = { name: 'installWorkspace', command: 'pnpm install --frozen-lockfile --recursive' };

const cleanDomain: ShellCommand = { name: 'cleanDomain', command: 'pnpm -C packages/domain clean' };
const cleanBackend: ShellCommand = { name: 'cleanBackend', command: 'pnpm -C apps/backend clean' };
const cleanGraphqlSchema: ShellCommand = { name: 'cleanGraphqlSchema', command: 'pnpm -C packages/graphql-schema clean' };
const cleanFrontend: ShellCommand = { name: 'cleanFrontend', command: 'pnpm -C apps/frontend clean' };
const cleanDocs: ShellCommand = { name: 'cleanDocs', command: 'pnpm -C docs clean' };

const buildDomain: ShellCommand = { name: 'buildDomain', command: 'pnpm -C packages/domain build' };
const buildBackend: ShellCommand = { name: 'buildBackend', command: 'pnpm -C apps/backend build' };
const buildGraphqlSchema: ShellCommand = { name: 'buildGraphqlSchema', command: 'pnpm -C packages/graphql-schema build' };
const generateGraphqlSchema: ShellCommand = { name: 'generateGraphqlSchema', command: 'pnpm -C packages/graphql-schema schema:generate' };
const frontendCodegen: ShellCommand = { name: 'frontendCodegen', command: 'pnpm -C apps/frontend run graphql:codegen' };
const buildFrontend: ShellCommand = { name: 'buildFrontend', command: 'pnpm -C apps/frontend build' };
const buildDocs: ShellCommand = { name: 'buildDocs', command: 'pnpm -C docs build' };

const migrateMasterdataUp: ShellCommand = { name: 'migrateMasterdataUp', command: 'pnpm lect-effect/migrate/masterdata:up' };
const migrateTestMasterdataUp: ShellCommand = { name: 'migrateTestMasterdataUp', command: 'pnpm lect-effect/migrate/test-masterdata:up' };

const startBackendRuntime: ShellCommand = { name: 'startBackendRuntime', command: 'pnpm -C apps/backend start' };
const startFrontendRuntime: ShellCommand = { name: 'startFrontendRuntime', command: 'pnpm -C apps/frontend start' };
const startBackendAndFrontend: ShellCommand = { name: 'startBackendAndFrontend', command: 'pnpm concurrently --names backend,frontend --prefix-colors blue,green "pnpm -C apps/backend start" "pnpm -C apps/frontend start"' };

const docsPruneContent: ShellCommand = { name: 'docsPruneContent', command: 'rm -rf docs/src/content/docs/{backend,frontend,domain}' };
const docsGenerateContent: ShellCommand = { name: 'docsGenerateContent', command: 'pnpm lect-effect/docs:generate' };
const docsMoveModuleIndexes: ShellCommand = {
  name: 'docsMoveModuleIndexes',
  command: [
    'for section in backend frontend domain graphql-schema; do',
    'src="docs/src/content/docs/$section/modules/index.md";',
    'dst="docs/src/content/docs/$section/modules/_index.md";',
    'if [ -f "$src" ]; then mv "$src" "$dst"; fi;',
    'done',
  ].join(' '),
};
const docsDev: ShellCommand = { name: 'docsDev', command: 'pnpm -C docs dev' };

const lintShellCommand = (fix: Option.Option<boolean>): ShellCommand => ({
  name: 'lintWorkspace',
  command: `pnpm lect-effect/lint${Option.match(fix, { onNone: () => '', onSome: () => ' --fix' })}`,
});

const testWorkspace: ShellCommand = {
  name: 'testWorkspace',
  command: 'pnpm -C packages/domain test && pnpm -C apps/backend test && pnpm -C apps/frontend test',
};

const cleanSteps: readonly ShellCommand[] = [cleanDomain, cleanBackend, cleanGraphqlSchema, cleanFrontend, cleanDocs];

const fullBuildSteps: readonly ShellCommand[] = [
  installWorkspace,
  ...cleanSteps,
  buildDomain,
  buildBackend,
  buildGraphqlSchema,
  generateGraphqlSchema,
  frontendCodegen,
  buildFrontend,
  buildDocs,
];

const buildCommand = Command.make('build', {}, () => runAll(fullBuildSteps.map(step => step.command))).pipe(Command.withDescription('Install, clean, then build all workspace packages in dependency order.')) satisfies Command.Command<'build', never, ShellRunError, {}>;

const startCommand = Command.make('start', {}, () =>
  runAll([
    ...fullBuildSteps,
    migrateMasterdataUp,
    startBackendAndFrontend,
  ].map(step => step.command))).pipe(Command.withDescription('Build everything, run migrations, then start backend+frontend.')) satisfies Command.Command<'start', never, ShellRunError, {}>;

const startBackendCommand = Command.make('start:backend', {}, () =>
  runAll([
    ...fullBuildSteps,
    migrateMasterdataUp,
    startBackendRuntime,
  ].map(step => step.command))).pipe(Command.withDescription('Build everything, migrate, then start backend only.')) satisfies Command.Command<'start:backend', never, ShellRunError, {}>;

const startFrontendCommand = Command.make('start:frontend', {}, () =>
  runAll([
    ...fullBuildSteps,
    startFrontendRuntime,
  ].map(step => step.command))).pipe(Command.withDescription('Build everything, then start frontend only.')) satisfies Command.Command<'start:frontend', never, ShellRunError, {}>;

const cleanCommand = Command.make('clean', {}, () =>
  runAll(cleanSteps.map(step => step.command))).pipe(Command.withDescription('Clean build artifacts for all workspace packages.')) satisfies Command.Command<'clean', never, ShellRunError, {}>;

const installCommand = Command.make('install', {}, () =>
  runShell(installWorkspace.command)).pipe(Command.withDescription('Install workspace dependencies using the frozen lockfile.')) satisfies Command.Command<'install', never, ShellRunError, {}>;

const schemaCommand = Command.make('schema:generate', {}, () =>
  runShell(generateGraphqlSchema.command)).pipe(Command.withDescription('Regenerate the GraphQL schema artifact.')) satisfies Command.Command<'schema:generate', never, ShellRunError, {}>;

const lintCommand = Command.make('lint', {
  fix: Options.boolean('fix').pipe(Options.optional),
}, ({ fix }) => runAll([...fullBuildSteps, lintShellCommand(fix)].map(step => step.command))).pipe(Command.withDescription('Build everything, then lint (supports --fix).')) satisfies Command.Command<'lint', never, ShellRunError, { readonly fix: Option.Option<boolean> }>;

const docsCommand = Command.make('docs', {}, () =>
  runAll([
    ...fullBuildSteps,
    docsPruneContent,
    docsGenerateContent,
    docsMoveModuleIndexes,
    docsDev,
  ].map(step => step.command))).pipe(Command.withDescription('Build, regenerate docs content, and start docs dev server.')) satisfies Command.Command<'docs', never, ShellRunError, {}>;

const testCommand = Command.make('test', {}, () =>
  runAll([
    ...fullBuildSteps,
    migrateTestMasterdataUp,
    testWorkspace,
  ].map(step => step.command))).pipe(Command.withDescription('Build, run test DB migrations, then execute tests.')) satisfies Command.Command<'test', never, ShellRunError, {}>;

const rootCommand: Command.Command<'lect-effect', never, ShellRunError, { readonly subcommand: Option.Option<any> }> = Command.make('lect-effect', {}, () => Effect.succeed(undefined)).pipe(
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
  ]),
 );

const cli: ReturnType<typeof Command.run> = Command.run(rootCommand, {
  name: 'lect-effect',
  version: '1.0.0',
});

// default to showing help if no args are provided
const argv: readonly string[] = process.argv.length > 2 ? process.argv : [...process.argv, '--help'];

const main: Effect.Effect<unknown, unknown, unknown> = cli(argv).pipe(Effect.provide(NodeContext.layer));

NodeRuntime.runMain(main as Effect.Effect<unknown, unknown, never>);
