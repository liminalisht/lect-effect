/**
 * CLI pipeline that materializes the backend GraphQL schema into SDL.
 * @since 1.0.0
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileSystem } from '@effect/platform';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Effect } from 'effect';

const here = dirname(fileURLToPath(import.meta.url));
const schemaOutputPath = resolve(here, '..', 'schema.graphql');

type BackendSchemaModule = {
  makeSchema: (resolvers: readonly unknown[]) => unknown;
  printSortedSchema: (schema: unknown) => string;
};

type BackendResolversModule = {
  handlersToResolvers: (handlers: readonly unknown[]) => readonly unknown[];
};

type BackendAppModule = {
  selectHandlers: (config?: unknown) => readonly unknown[];
};

const backendAppModulePath = fileURLToPath(new URL('../../../apps/backend/dist/src/app.js', import.meta.url));
const backendSchemaModulePath = fileURLToPath(new URL('../../../apps/backend/dist/src/graphql/schema.js', import.meta.url));
const backendResolversModulePath = fileURLToPath(new URL('../../../apps/backend/dist/src/graphql/resolvers.js', import.meta.url));

const loadBackend = Effect.all({
  app: Effect.promise<BackendAppModule>(async () => import(backendAppModulePath) as Promise<BackendAppModule>),
  schema: Effect.promise<BackendSchemaModule>(async () => import(backendSchemaModulePath) as Promise<BackendSchemaModule>),
  resolvers: Effect.promise<BackendResolversModule>(async () => import(backendResolversModulePath) as Promise<BackendResolversModule>),
});

const buildSchemaSDL = Effect.gen(function * () {
  const backend = yield * loadBackend;
  const handlers = backend.app.selectHandlers();

  const schema = backend.schema.makeSchema(backend.resolvers.handlersToResolvers(handlers));
  return backend.schema.printSortedSchema(schema);
});

const writeSchema = Effect.gen(function * () {
  const fs = yield * FileSystem.FileSystem;
  const sdl = yield * buildSchemaSDL;

  yield * Effect.logInfo(`writing graphql schema to ${schemaOutputPath}`);
  yield * fs.writeFileString(schemaOutputPath, `${sdl}\n`);
  yield * Effect.logInfo('graphql schema written');
});

const main = writeSchema.pipe(
  Effect.tapErrorCause(cause => Effect.logError(cause)),
  Effect.provide(NodeContext.layer),
);

NodeRuntime.runMain(main);
