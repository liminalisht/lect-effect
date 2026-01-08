import 'dotenv/config';
import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { schema } from './graphql/schema';
import { listen, logSchema } from './graphql/server';
import { makeYoga } from './graphql/yoga';
import { AppLayer } from './layers/app';
import { ConfigService } from './services';

// todo: grok Effect.scoped and Effect.gen interaction better
const program: Effect.Effect<never, unknown, ConfigService>
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

NodeRuntime.runMain(
  programWithAppLayer,
  {
    teardown(exit, onExit) {
      if (exit._tag === 'Failure') {
        console.error('Program ended with an error.', exit.cause);
        onExit(1);
      } else {
        onExit(0);
      }
    },
  },
);

