/**
 * Centralized docs generator run from the docs package.
 * Sequentially invokes docgen for each workspace package so the docs site owns generation.
 */
/* eslint-disable */
import {execFile} from 'node:child_process';
import {constants as fsConstants} from 'node:fs';
import {access, rename} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {promisify} from 'node:util';
import {Effect} from 'effect';

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const resolveFromRoot = relativePath => path.join(repoRoot, relativePath);
const docgenBin = resolveFromRoot('docs/node_modules/.bin/docgen');

const docgenTasks = Object.freeze([
  {
    name: 'backend',
    cwd: 'apps/backend',
    tsconfig: 'tsconfig.json',
    src: 'src/',
    out: 'docs/src/content/docs/backend/',
    excludes: ['**/test/**', '**/*.d.ts'],
  },
  {
    name: 'domain',
    cwd: 'packages/domain',
    tsconfig: 'tsconfig.json',
    src: 'src/',
    out: 'docs/src/content/docs/domain/',
    excludes: ['**/test/**', '**/*.d.ts'],
  },
  {
    name: 'services',
    cwd: 'packages/services',
    tsconfig: 'tsconfig.json',
    src: 'src/',
    out: 'docs/src/content/docs/services/',
    excludes: ['**/test/**', '**/*.d.ts'],
  },
  {
    name: 'handlers',
    cwd: 'packages/handlers',
    tsconfig: 'tsconfig.json',
    src: 'src/',
    out: 'docs/src/content/docs/handlers/',
    excludes: ['**/test/**', '**/*.d.ts'],
  },
  {
    name: 'graphql-schema',
    cwd: 'packages/graphql-schema',
    tsconfig: 'tsconfig.json',
    src: 'src/',
    out: 'docs/src/content/docs/graphql-schema/',
    excludes: ['**/test/**', '**/*.d.ts'],
  },
  {
    name: 'frontend',
    cwd: 'apps/frontend',
    tsconfig: 'tsconfig.app.json',
    src: 'src/',
    out: 'docs/src/content/docs/frontend/',
    excludes: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts', 'src/graphql/generated/**'],
  },
  {
    name: 'cli',
    cwd: 'apps/cli',
    tsconfig: 'tsconfig.json',
    src: 'src/',
    out: 'docs/src/content/docs/cli/',
    excludes: ['**/test/**', '**/*.d.ts'],
  },
]);

const sectionNames = docgenTasks.map(task => task.name);

const buildDocgenArgs = task => [
  '--project',
  task.tsconfig,
  '--src',
  task.src,
  '--out',
  resolveFromRoot(task.out),
  ...task.excludes.flatMap(pattern => ['--exclude', pattern]),
];

const runDocgenTask = task =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`→ docs:generate ${task.name}`);
    const {stdout, stderr} = yield* Effect.tryPromise(() =>
      execFileAsync(docgenBin, buildDocgenArgs(task), {cwd: resolveFromRoot(task.cwd), env: process.env, encoding: 'utf8'}),
    );
    if (stdout) {
      process.stdout.write(stdout);
    }
    if (stderr) {
      process.stderr.write(stderr);
    }
    yield* Effect.logInfo(`✓ docs:generate ${task.name}`);
  });

const moveModuleIndex = section =>
  Effect.gen(function* () {
    const src = path.join(repoRoot, 'docs', 'src', 'content', 'docs', section, 'modules', 'index.md');
    const dst = path.join(repoRoot, 'docs', 'src', 'content', 'docs', section, 'modules', '_index.md');
    const exists = yield* Effect.tryPromise({
      try: async () => {
        try {
          await access(src, fsConstants.F_OK);
          return true;
        } catch {
          return false;
        }
      },
      catch: () => false,
    });
    if (exists) {
      yield* Effect.tryPromise({try: () => rename(src, dst)});
      yield* Effect.logInfo(`→ moved module index for ${section}`);
    }
  });

const program = Effect.gen(function* () {
  for (const task of docgenTasks) {
    yield* runDocgenTask(task);
  }
  for (const section of sectionNames) {
    yield* moveModuleIndex(section);
  }
  yield* Effect.logInfo('docs:generate complete');
});

try {
  await Effect.runPromise(program);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
