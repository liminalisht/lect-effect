import { Effect} from 'effect';
import { type YogaServerInstance } from 'graphql-yoga';
import { createServer, type Server } from 'node:http';
import type { GraphQLContext } from './context';
import { ServerStartError } from './errors';

// todo: grok Effect acquireRelease and Effect.async better
export const listen = (
  yoga: YogaServerInstance<GraphQLContext, Record<string, any>>,
  port: number,
) =>
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
