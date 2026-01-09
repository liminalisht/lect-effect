import 'dotenv/config';
import { Cause, Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { app } from './app';
import { appLayer } from './layers/app';

const logFailure = (cause: Cause.Cause<unknown>) =>
  Effect.all([
    Effect.logError('application failed'),
    Effect.logError(Cause.pretty(cause)),
  ]);

const main: Effect.Effect<never, unknown> = app.pipe(
  Effect.provide(appLayer),
  Effect.onExit(exit =>
    exit._tag === 'Failure'
      ? logFailure(exit.cause)
      : Effect.void),
);

NodeRuntime.runMain(main);

