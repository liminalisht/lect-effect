import 'dotenv/config';
import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { AppLayer } from './layers/app';
import { app } from './app';

// todo: i would have thought that there was some way to actually catch and log all unhandled errors globally, rather
// than using console.log .... i mean clearly we want the error cause to be Effect.logError'ed properly...
NodeRuntime.runMain(
  app.pipe(Effect.provide(AppLayer)),
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

