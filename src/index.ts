/**
 * Application entrypoint wiring runtime and top-level effects.
 * @since 1.0.0
 */
import 'dotenv/config';
import { Cause, Effect } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { app } from './app';
import { appLayer } from './layers/app';

/**
 * Logs an exhaustive failure cause in a human-readable format.
 * @since 1.0.0
 */
export const logFailure = (cause: Cause.Cause<unknown>) =>
  Effect.all([
    Effect.logError('application failed'),
    Effect.logError(Cause.pretty(cause)),
  ]);

/**
 * Main Effect wiring the app with its layer and exit logging.
 * @since 1.0.0
 */
export const main: Effect.Effect<never, unknown> = app.pipe(
  Effect.provide(appLayer),
  Effect.onExit(exit =>
    exit._tag === 'Failure'
      ? logFailure(exit.cause)
      : Effect.void),
);

NodeRuntime.runMain(main);

