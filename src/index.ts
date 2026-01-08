// todo: where to put this import? it is needed for its side effects
import 'dotenv/config';
import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { app } from './app';
import { appLayer } from './layers/app';

// todo: i would have thought that there was some way to actually catch and log all unhandled errors globally, rather
// than using console.log .... i mean clearly we want the error cause to be Effect.logError'ed properly...
NodeRuntime.runMain(
  app.pipe(Effect.provide(appLayer)),
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

