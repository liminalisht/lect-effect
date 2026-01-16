import { Effect, Layer, Logger } from 'effect';
import { type AppError } from '../src/errors';
import { type AppServices } from '../src/services/app/interface';
import { AppConfigService } from '../src/services/appConfig/interface';
import { testAppLayer } from './services/app';

// Memoize the test app layer once and share across tests.
const memoizedTestAppLayer = Layer.memoize(testAppLayer);

/**
 * Provides the memoized test app layer to an effect, scoped to manage resources.
 */
export const withTestAppLayer = <A, E>(eff: Effect.Effect<A, E, AppServices>): Effect.Effect<A, E | AppError> =>
  Effect.scoped(
    Effect.flatMap(memoizedTestAppLayer, layer =>
      AppConfigService.pipe(
        Effect.provide(layer),
        Effect.flatMap(config => eff.pipe(
          Effect.provide(layer),
          Effect.provide(Logger.minimumLogLevel(config.logLevel)),
        )),
      )
    ),
  );

/**
 * Run an effect using the memoized test app layer, returning a promise for convenience.
 */
export const runWithTestAppLayer = <A, E>(eff: Effect.Effect<A, E, AppServices>) =>
  Effect.runPromise(withTestAppLayer(eff));
