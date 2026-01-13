import { Effect } from 'effect';
import { type GraphQLSchema } from 'graphql';
import { type Scope } from 'effect/Scope';
import { logSchema, makeSchema } from './graphql/schema';
import * as server from './graphql/server';
import { type Yoga, makeYoga } from './graphql/yoga';
import { ConfigService, type ConfigServiceShape } from './services/config';
import { type AppServices } from './services/app';
import { type ServerStartError } from './graphql/errors';

export const app: Effect.Effect<never, unknown, AppServices>
  = Effect.scoped(Effect.gen(function * () {
    const config = yield * getConfig();
    const schema = yield * makeGraphQLSchema();
    const yoga = yield * makeYogaServer(schema);
    yield * runYogaServer(yoga, config);
    return yield * Effect.never;
  }));

const getConfig = (): Effect.Effect<ConfigServiceShape, never, ConfigService> => Effect.gen(function * () {
  yield * Effect.logDebug('getting config...');
  const config = yield * ConfigService;
  yield * Effect.logDebug('config:', config);
  return config;
});

const makeGraphQLSchema = (): Effect.Effect<GraphQLSchema> => Effect.gen(function * () {
  yield * Effect.logDebug('making graphql schema...');
  const schema = makeSchema();
  yield * Effect.logDebug('logging graphql schema...');
  yield * logSchema(schema);
  return schema;
});

const makeYogaServer = (schema: GraphQLSchema): Effect.Effect<Yoga, never, AppServices> => Effect.gen(function * () {
  yield * Effect.logDebug('making yoga server instance...');
  const yoga = yield * makeYoga(schema);
  return yoga;
});

const runYogaServer = (yoga: Yoga, config: ConfigServiceShape): Effect.Effect<void, ServerStartError, Scope> => Effect.gen(function * () {
  yield * Effect.logDebug('starting graphql server...');
  yield * server.listen(yoga, config.app.port);
  yield * Effect.logInfo(`graphql server is running on http://localhost:${config.app.port}/graphql`);
  return yield * Effect.never;
});
