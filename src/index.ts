import 'dotenv/config';
import { Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { app } from './app';
import { appLayer } from './layers/app';

const main = app.pipe(
  Effect.provide(appLayer),
  Effect.onExit(exit =>
    (exit._tag === 'Failure'
      ? Effect.logError('application failed with cause:', exit.cause)
      : Effect.void)),
);

NodeRuntime.runMain(main);

