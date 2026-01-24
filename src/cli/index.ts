import { execSync } from 'node:child_process';
import process from 'node:process';
import { Command, Options } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Effect, Option } from 'effect';

const runShell = (command: string) =>
  Effect.try({
    try: () => execSync(command, { stdio: 'inherit' }),
    catch: error => error as Error,
  });

const runAll = (commands: readonly string[]) =>
  Effect.gen(function * () {
    for (const cmd of commands) {
      yield * runShell(cmd);
    }
  });

const fullBuildSteps: readonly string[] = [
  'pnpm install --frozen-lockfile --recursive',
  'pnpm -C packages/domain clean',
  'pnpm -C apps/backend clean',
  'pnpm -C packages/graphql-schema clean',
  'pnpm -C apps/frontend clean',
  'pnpm -C docs clean',
  'pnpm -C packages/domain build',
  'pnpm -C apps/backend build',
  'pnpm -C packages/graphql-schema build',
  'pnpm -C packages/graphql-schema schema:generate',
  'pnpm -C apps/frontend run graphql:codegen',
  'pnpm -C apps/frontend build',
  'pnpm -C docs build',
];

const buildCommand = Command.make('build', {}, () => runAll(fullBuildSteps)).pipe(Command.withDescription('Install, clean, then build all workspace packages in dependency order.'));

const startCommand = Command.make('start', {}, () =>
  runAll([
    ...fullBuildSteps,
    'pnpm lect-effect/migrate/masterdata:up',
    'pnpm lect-effect/start',
  ])).pipe(Command.withDescription('Build everything, run migrations, then start backend+frontend.'));

const startBackendCommand = Command.make('start:backend', {}, () =>
  runAll([
    ...fullBuildSteps,
    'pnpm lect-effect/migrate/masterdata:up',
    'pnpm -C apps/backend start',
  ])).pipe(Command.withDescription('Build everything, migrate, then start backend only.'));

const startFrontendCommand = Command.make('start:frontend', {}, () =>
  runAll([
    ...fullBuildSteps,
    'pnpm -C apps/frontend start',
  ])).pipe(Command.withDescription('Build everything, then start frontend only.'));

const cleanCommand = Command.make('clean', {}, () =>
  runAll([
    'pnpm -C packages/domain clean',
    'pnpm -C apps/backend clean',
    'pnpm -C packages/graphql-schema clean',
    'pnpm -C apps/frontend clean',
    'pnpm -C docs clean',
  ])).pipe(Command.withDescription('Clean build artifacts for all workspace packages.'));

const installCommand = Command.make('install', {}, () =>
  runShell('pnpm install --frozen-lockfile --recursive')).pipe(Command.withDescription('Install workspace dependencies using the frozen lockfile.'));

const schemaCommand = Command.make('schema:generate', {}, () =>
  runShell('pnpm -C packages/graphql-schema schema:generate')).pipe(Command.withDescription('Regenerate the GraphQL schema artifact.'));

const lintCommand = Command.make('lint', {
  fix: Options.boolean('fix').pipe(Options.optional),
}, ({ fix }) => {
  const fixFlag = Option.match(fix, {
    onNone: () => '',
    onSome: () => ' --fix',
  });

  return runAll([...fullBuildSteps, `pnpm lect-effect/lint${fixFlag}`]);
}).pipe(Command.withDescription('Build everything, then lint (supports --fix).'));

const docsCommand = Command.make('docs', {}, () =>
  runAll([
    ...fullBuildSteps,
    'rm -rf docs/src/content/docs/{backend,frontend,domain}',
    'pnpm lect-effect/docs:generate',
    [
      'for section in backend frontend domain graphql-schema; do',
      'src="docs/src/content/docs/${section}/modules/index.md";',
      'dst="docs/src/content/docs/${section}/modules/_index.md";',
      'if [ -f "$src" ]; then mv "$src" "$dst"; fi;',
      'done',
    ].join(' '),
    'pnpm -C docs dev',
  ])).pipe(Command.withDescription('Build, regenerate docs content, and start docs dev server.'));

const testCommand = Command.make('test', {}, () =>
  runAll([
    ...fullBuildSteps,
    'pnpm lect-effect/migrate/test-masterdata:up',
    'pnpm lect-effect/test',
  ])).pipe(Command.withDescription('Build, run test DB migrations, then execute tests.'));

const rootCommand = Command.make('lect-effect', {}, () => Effect.succeed(undefined)).pipe(
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

const cli = Command.run(rootCommand, {
  name: 'lect-effect',
  version: '1.0.0',
});

const argv = process.argv.length > 2 ? process.argv : [...process.argv, '--help'];

const main = cli(argv).pipe(Effect.provide(NodeContext.layer));

NodeRuntime.runMain(main);
