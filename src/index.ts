import 'dotenv/config';
import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { AppLayer } from './layers/app';
import { listen, logSchema } from './graphql/server';
import { schema } from './graphql/schema';
import { ConfigService } from './services';
import { makeYoga } from './graphql/yoga';

// todo: grok Effect.scoped and Effect.gen interaction better
const program: Effect.Effect<never, unknown, ConfigService>
  = Effect.scoped(Effect.gen(function * () {
    const config = yield * ConfigService;
    // const runtime = yield * Effect.runtime<ConfigService>();

    // todo: maybe have some service that provides the schema? and logging and serving mechanisms?
    yield * logSchema(schema);
    const yoga = yield * makeYoga;
    yield * listen(yoga, config.port);
    const url = `http://localhost:${config.port}/graphql`;
    yield * Effect.logInfo(`Server is running on ${url}`);

    return yield * Effect.never;
  }));

const programWithAppLayer: Effect.Effect<never, unknown>
  = program.pipe(Effect.provide(AppLayer));

NodeRuntime.runMain(
  programWithAppLayer,
  {
    teardown: function customTeardown(exit, onExit) {
      if (exit._tag === 'Failure') {
        console.error('Program ended with an error.', exit.cause);
        onExit(1);
      } else {
        onExit(0);
      }
    },
  },
);

