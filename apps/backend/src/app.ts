/**
 * Application bootstrap wiring for GraphQL server startup.
 * @since 1.0.0
 */
import { Effect } from 'effect';
import { type Scope } from 'effect/Scope';
import { type GraphQLSchema } from 'graphql';
import { logSchema, makeSchema, type GraphQLResolver } from './graphql/schema.js';
import * as server from './graphql/server.js';
import { type Yoga, makeYoga } from './graphql/yoga.js';
import { type AppServices } from '@lect-effect/services/app';
import { type AppConfig, AppConfigService } from '@lect-effect/services/appConfig';
import { type ServerStartError } from './graphql/errors.js';
import { handlersToResolvers, type AnyHandler } from './graphql/resolvers.js';
import { helloHandlers } from '@lect-effect/handlers/hello';
import { itemHandlers } from '@lect-effect/handlers/item';
import { productHandlers } from '@lect-effect/handlers/product';

/**
 * Loads configuration from the AppConfigService.
 * @since 1.0.0
 * @category Application Setup
 */
export const getAppConfig = (): Effect.Effect<AppConfig, never, AppConfigService> => Effect.gen(function * () {
  yield * Effect.logDebug('getting config...');
  const appConfig = yield * AppConfigService;
  yield * Effect.logDebug('appConfig:', appConfig);
  return appConfig;
});

/**
 * Builds and logs the GraphQL schema.
 * @since 1.0.0
 * @category Application Setup
 */
export const makeGraphQLSchema = (resolvers: readonly GraphQLResolver[]): Effect.Effect<GraphQLSchema, never, AppServices> => Effect.gen(function * () {
  yield * Effect.logDebug('making graphql schema...');
  const schema = makeSchema(resolvers);
  yield * Effect.logDebug('logging graphql schema...');
  yield * logSchema(schema);
  return schema;
});

/**
 * Constructs the Yoga server instance with the provided schema.
 * @since 1.0.0
 * @category Application Setup
 */
export const makeYogaServer = (schema: GraphQLSchema): Effect.Effect<Yoga<AppServices>, never, AppServices> => Effect.gen(function * () {
  yield * Effect.logDebug('making yoga server instance...');
  const yoga = yield * makeYoga<AppServices>(schema);
  return yoga;
});

const runYogaServer = (yoga: Yoga<AppServices>, appConfig: AppConfig): Effect.Effect<never, ServerStartError, Scope> => Effect.gen(function * () {
  yield * Effect.logDebug('starting graphql server...');
  yield * server.listen<AppServices>(yoga, appConfig.port);
  yield * Effect.logInfo(`graphql server is running on http://localhost:${appConfig.port}/graphql`);
  return yield * Effect.never;
});

/**
 * Selects the set of GraphQL handlers to be included in the application.
 * @since 1.0.0
 * @category Application Setup
 */
export const selectHandlers = (_appConfig?: AppConfig): readonly AnyHandler[] => ([
  ...helloHandlers,
  ...itemHandlers,
  ...productHandlers,
]);

const makeResolvers = (handlers: readonly AnyHandler[]): readonly GraphQLResolver[] =>
  handlersToResolvers(handlers) as readonly GraphQLResolver[];

/**
 * Top-level application Effect that wires configuration, schema, and server startup.
 * @since 1.0.0
 * @category Application Setup
 */
export const app: Effect.Effect<never, ServerStartError, AppServices>
  = Effect.scoped(Effect.gen(function * () {
    const appConfig = yield * getAppConfig();
    const handlers = selectHandlers(appConfig);
    const resolvers = makeResolvers(handlers);
    const schema = yield * makeGraphQLSchema(resolvers);
    const yoga = yield * makeYogaServer(schema);
    return yield * runYogaServer(yoga, appConfig);
  }));
