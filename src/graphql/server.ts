/**
 * HTTP server lifecycle helpers for GraphQL Yoga.
 * @since 1.0.0
 */
import { createServer, type Server } from 'node:http';
import { Effect} from 'effect';
import { type YogaServerInstance } from 'graphql-yoga';
import { type Scope } from 'effect/Scope';
import type { GraphQLContext } from './context';
import { ServerStartError } from './errors';
import { AppServices } from '../services/app';
import { Yoga } from './yoga';

// todo: grok Effect acquireRelease and Effect.async better
/**
 * Starts an HTTP server for the provided Yoga instance.
 * @since 1.0.0
 */
export const listen = <R>(
  yoga: Yoga<R>,
  port: number,
): Effect.Effect<Server, ServerStartError, Scope> =>
  Effect.acquireRelease(
    Effect.async<Server, ServerStartError>((resume, signal) => {
      const server = createServer(yoga);

      const onError = (error: unknown) => {
        resume(Effect.fail(new ServerStartError({ error })));
      };

      server.once('error', onError);
      server.listen(port, () => {
        server.off('error', onError);
        resume(Effect.succeed(server));
      });

      // if the fiber is interrupted, close the server.
      const onAbort = () => server.close(() => undefined);
      if (signal.aborted) {
        onAbort();
      }

      signal.addEventListener('abort', onAbort);

      return Effect.sync(() => {
        signal.removeEventListener('abort', onAbort);
        server.off('error', onError);
        server.close(() => undefined);
      });
    }),
    server =>
      Effect.async<void>(resume => {
        server.close(() => {
          resume(Effect.void);
        });
      }),
  );
