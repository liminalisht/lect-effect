/**
 * Application bootstrap wiring for GraphQL server startup.
 * @since 1.0.0
 */
import { Effect } from 'effect';
import { type GraphQLSchema } from 'graphql';
import { type Scope } from 'effect/Scope';
import { logSchema, makeSchema, type GraphQLResolver } from './graphql/schema.js';
import * as server from './graphql/server.js';
import { type Yoga, makeYoga } from './graphql/yoga.js';
// import { ConfigService, type Config } from './services/config/interface.js';
import { type AppServices } from './services/app/interface.js';
import { type ServerStartError } from './graphql/errors.js';
import { handlersToResolvers, type AnyHandler } from './graphql/resolvers.js';
import { helloHandlers } from './handlers/hello.js';
import { itemHandlers } from './handlers/item.js';
import { productHandlers } from './handlers/product.js';
import { type AppConfig, AppConfigService } from './services/appConfig/interface/index.js';

/**
 * Top-level application Effect that wires configuration, schema, and server startup.
 * @since 1.0.0
 */
export const app: Effect.Effect<never, unknown, AppServices>
  = Effect.scoped(Effect.gen(function * () {
    const appConfig = yield * getAppConfig();
    const handlers = selectHandlers(appConfig);
    const resolvers = makeResolvers(handlers);
    const schema = yield * makeGraphQLSchema(resolvers);
    const yoga = yield * makeYogaServer(schema);
    yield * runYogaServer(yoga, appConfig);
    return yield * Effect.never;
  }));

/**
 * Loads configuration from the ConfigService.
 * @since 1.0.0
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
 */
export const makeGraphQLSchema = (resolvers: readonly GraphQLResolver[]): Effect.Effect<GraphQLSchema> => Effect.gen(function * () {
  yield * Effect.logDebug('making graphql schema...');
  const schema = makeSchema(resolvers);
  yield * Effect.logDebug('logging graphql schema...');
  yield * logSchema(schema);
  return schema;
});

/**
 * Constructs the Yoga server instance with the provided schema.
 * @since 1.0.0
 */
export const makeYogaServer = (schema: GraphQLSchema): Effect.Effect<Yoga<AppServices>, never, AppServices> => Effect.gen(function * () {
  yield * Effect.logDebug('making yoga server instance...');
  const yoga = yield * makeYoga<AppServices>(schema);
  return yoga;
});

const runYogaServer = <R>(yoga: Yoga<R>, appConfig: AppConfig): Effect.Effect<void, ServerStartError, Scope> => Effect.gen(function * () {
  yield * Effect.logDebug('starting graphql server...');
  yield * server.listen<R>(yoga, appConfig.port);
  yield * Effect.logInfo(`graphql server is running on http://localhost:${appConfig.port}/graphql`);
  return yield * Effect.never;
});

const selectHandlers = (_appConfig: AppConfig): readonly AnyHandler[] => ([
  ...helloHandlers,
  ...itemHandlers,
  ...productHandlers,
]);

const makeResolvers = (handlers: readonly AnyHandler[]): readonly GraphQLResolver[] =>
  handlersToResolvers(handlers) as readonly GraphQLResolver[];
