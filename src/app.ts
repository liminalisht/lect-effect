/**
 * Application bootstrap wiring for GraphQL server startup.
 * @since 1.0.0
 */
import { Effect } from 'effect';
import { type GraphQLSchema } from 'graphql';
import { type Scope } from 'effect/Scope';
import { logSchema, makeSchema, type GraphQLResolver } from './graphql/schema';
import * as server from './graphql/server';
import { type Yoga, makeYoga } from './graphql/yoga';
import { ConfigService, type ConfigServiceShape } from './services/config/interface';
import { type AppServices } from './services/app/interface';
import { type ServerStartError } from './graphql/errors';
import { handlersToResolvers, type AnyHandler } from './graphql/resolvers';
import { helloHandlers } from './handlers/hello';
import { itemHandlers } from './handlers/item';
import { productHandlers } from './handlers/product';

/**
 * Top-level application Effect that wires configuration, schema, and server startup.
 * @since 1.0.0
 */
export const app: Effect.Effect<never, unknown, AppServices>
  = Effect.scoped(Effect.gen(function * () {
    const config = yield * getConfig();
    const handlers = selectHandlers(config);
    const resolvers = makeResolvers(handlers);
    const schema = yield * makeGraphQLSchema(resolvers);
    const yoga = yield * makeYogaServer(schema);
    yield * runYogaServer(yoga, config);
    return yield * Effect.never;
  }));

/**
 * Loads configuration from the ConfigService.
 * @since 1.0.0
 */
export const getConfig = (): Effect.Effect<ConfigServiceShape, never, ConfigService> => Effect.gen(function * () {
  yield * Effect.logDebug('getting config...');
  const config = yield * ConfigService;
  yield * Effect.logDebug('config:', config);
  return config;
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

const runYogaServer = <R>(yoga: Yoga<R>, config: ConfigServiceShape): Effect.Effect<void, ServerStartError, Scope> => Effect.gen(function * () {
  yield * Effect.logDebug('starting graphql server...');
  yield * server.listen<R>(yoga, config.app.port);
  yield * Effect.logInfo(`graphql server is running on http://localhost:${config.app.port}/graphql`);
  return yield * Effect.never;
});

const selectHandlers = (_config: ConfigServiceShape): readonly AnyHandler[] => ([
  ...helloHandlers,
  ...itemHandlers,
  ...productHandlers,
]);

const makeResolvers = (handlers: readonly AnyHandler[]): readonly GraphQLResolver[] =>
  handlersToResolvers(handlers) as readonly GraphQLResolver[];
