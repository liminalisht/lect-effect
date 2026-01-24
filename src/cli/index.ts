import { Command } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Effect } from 'effect';
import { execSync } from 'node:child_process';

const runShell = (command: string) =>
  Effect.try({
    try: () => execSync(command, { stdio: 'inherit' }),
    catch: error => error as Error,
  });

const runAll = (commands: ReadonlyArray<string>) =>
  Effect.forEach(commands, cmd => runShell(cmd), { discard: true });

const buildCommand = Command.make('build', {}, () =>
  runAll([
    'pnpm -C packages/domain build',
    'pnpm -C apps/backend build',
    'pnpm -C packages/graphql-schema build',
    'pnpm -C packages/graphql-schema schema:generate',
    'pnpm -C apps/frontend build',
    'pnpm -C docs build',
  ])
).pipe(Command.withDescription('Build all workspace packages in dependency order.'));

const cleanCommand = Command.make('clean', {}, () =>
  runAll([
    'pnpm -C packages/domain clean',
    'pnpm -C apps/backend clean',
    'pnpm -C packages/graphql-schema clean',
    'pnpm -C apps/frontend clean',
    'pnpm -C docs clean',
  ])
).pipe(Command.withDescription('Clean build artifacts for all workspace packages.'));

const installCommand = Command.make('install', {}, () =>
  runShell('pnpm install --frozen-lockfile --recursive')
).pipe(Command.withDescription('Install workspace dependencies using the frozen lockfile.'));

const schemaCommand = Command.make('schema:generate', {}, () =>
  runShell('pnpm -C packages/graphql-schema schema:generate')
).pipe(Command.withDescription('Regenerate the GraphQL schema artifact.'));

const rootCommand = Command.make('lect-effect', {}, () => Effect.succeed(undefined)).pipe(
  Command.withDescription('Workspace CLI entrypoint for lect-effect.'),
  Command.withSubcommands([buildCommand, cleanCommand, installCommand, schemaCommand])
);

const cli = Command.run(rootCommand, {
  name: 'lect-effect',
  version: '1.0.0',
});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
