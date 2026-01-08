import 'dotenv/config';
import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { logSchema, schema } from './graphql/schema';
import { listen } from './graphql/server';
import { makeYoga } from './graphql/yoga';
import { AppLayer } from './layers/app';
import { AppEnv, ConfigService } from './services';

// todo: grok Effect.scoped and Effect.gen interaction better
const program: Effect.Effect<never, unknown, AppEnv>
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

const programWithAppLayer: Effect.Effect<never, unknown>
  = program.pipe(Effect.provide(AppLayer));

// todo: i would have thought that there was some way to actually catch and log all unhandled errors globally, rather
// than using console.log .... i mean clearly we want the error cause to be Effect.logError'ed properly...
NodeRuntime.runMain(
  programWithAppLayer,
  {
    teardown(exit, onExit) {
      if (exit._tag === 'Failure') {
        console.error('program ended with an error', exit.cause);
        onExit(1);
      } else {
        onExit(0);
      }
    },
  },
);

