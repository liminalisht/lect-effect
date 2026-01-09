import { Effect } from 'effect';
import { logSchema, makeSchema } from './graphql/schema';
import * as server from './graphql/server';
import { makeYoga } from './graphql/yoga';
import { type AppServices, ConfigService } from './services';

export const app: Effect.Effect<never, unknown, AppServices>
  = Effect.scoped(Effect.gen(function * () {
    yield * Effect.logDebug('getting config...');
    const config = yield * ConfigService;
    yield * Effect.logDebug('app config:', config);
    yield * Effect.logDebug('making graphql schema...');
    const schema = makeSchema();
    yield * Effect.logDebug('logging graphql schema...');
    yield * logSchema(schema);
    yield * Effect.logDebug('making yoga server instance...');
    const yoga = yield * makeYoga(schema);
    yield * Effect.logDebug('starting graphql server...');
    yield * server.listen(yoga, config.port);
    yield * Effect.logInfo(`graphql server is running on http://localhost:${config.port}/graphql`);
    return yield * Effect.never;
  }));
