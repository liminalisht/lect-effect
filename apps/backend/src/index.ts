/**
 * Application entrypoint wiring runtime and top-level effects.
 * @since 1.0.0
 */
import 'dotenv/config'; // eslint-disable-line import-x/no-unassigned-import
import { Cause, Effect, Layer } from 'effect';
import { NodeRuntime } from '@effect/platform-node';
import { app } from './app.js';
import { appLayer } from './services/app/layer.js';

/**
 * Logs an exhaustive failure cause in a human-readable format.
 * @since 1.0.0
 * @category Application Setup
 */
export const logFailure = (cause: Cause.Cause<unknown>) =>
  Effect.all([
    Effect.logError('application failed'),
    Effect.logError(Cause.pretty(cause)),
  ]);

/**
 * Main Effect wiring the app with its layer and exit logging.
 * @since 1.0.0
 * @category Application Setup
 */
export const main = Effect.scoped(Effect.gen(function * () {
  const memoizedAppLayer = yield * Layer.memoize(appLayer);
  return yield * app.pipe(
    Effect.provide(memoizedAppLayer),
    Effect.onExit(exit =>
      exit._tag === 'Failure'
        ? logFailure(exit.cause)
        : Effect.void),
  );
}));

NodeRuntime.runMain(main);

