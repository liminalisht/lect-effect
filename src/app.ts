// todo: where to put this import? it is needed for its side effects
import 'dotenv/config';
import { Effect } from 'effect';
import { logSchema, schema } from './graphql/schema';
import { listen } from './graphql/server';
import { makeYoga } from './graphql/yoga';
import { type AppEnv, ConfigService } from './services';

// todo: grok Effect.scoped and Effect.gen interaction better
export const app: Effect.Effect<never, unknown, AppEnv>
  = Effect.scoped(Effect.gen(function * () {
    yield * Effect.logDebug('getting config...');
    const config = yield * ConfigService;

    // todo: maybe have some service that provides the schema? and logging and serving mechanisms?
    yield * Effect.logDebug('logging graphql schema...');
    yield * logSchema(schema);

    yield * Effect.logDebug('making yoga server instance...');
    const yoga = yield * makeYoga;

    yield * Effect.logDebug('starting server listener...');
    yield * listen(yoga, config.port);
    yield * Effect.logInfo(`server is running on http://localhost:${config.port}/graphql`);

    return yield * Effect.never;
  }));
