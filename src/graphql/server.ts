import { createServer, type Server } from 'node:http';
import { Effect, type Runtime } from 'effect';
import { type GraphQLSchema, lexicographicSortSchema, printSchema } from 'graphql';
import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import type { ConfigService } from '../services';
import type { GraphQLContext } from './context';
import { ServerStartError } from './errors';

export const logSchema = (schema: GraphQLSchema) => Effect.gen(function * () {
  const schemaString = printSchema(lexicographicSortSchema(schema));
  yield * Effect.logDebug('generating graphql schema...');
  yield * Effect.logDebug(`\n${schemaString}`);
});

// // src/graphql/server.ts
// import { Effect } from "effect"
// import { createServer, type Server } from "node:http"
// import type { YogaServerInstance } from "graphql-yoga"
// import { ServerStartError } from "./errors"
// import type { GraphQLContext } from "./context"

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

      // Interrupt safety: if the fiber is interrupted, close the server.
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

// // todo: grok Effect acquireRelease and Effect.async better to see if this can be simplified
// export const listen = (schema: GraphQLSchema, runtime: Runtime.Runtime<ConfigService>, port: number) =>
// // todo: why do we use acquireRelease here?
//   Effect.acquireRelease(
//     // todo: why do we use async here? is this safe
//     Effect.async<Server, unknown>((resume, signal) => {
//       // why are we specializing the context here with runtime?
//       const yoga = createYoga<GraphQLContext>({
//         schema,
//         context: initial => ({ ...initial, runtime }),
//       });

//       const server = createServer(yoga);

//       const onError = (error: unknown) => {
//         resume(Effect.fail(error));
//       };

//       server.on('error', onError);

//       server.listen(port, () => {
//         resume(Effect.succeed(server));
//       });

//       if (signal.aborted) {
//         return Effect.sync(() => {
//           server.off('error', onError);
//           server.close(() => undefined);
//         });
//       }

//       const onAbort = () => {
//         server.off('error', onError);
//         server.close(() => undefined);
//       };

//       signal.addEventListener('abort', onAbort);

//       // todo: how do we know this can't fail? doesn't sync assume that?
//       return Effect.sync(() => {
//         signal.removeEventListener('abort', onAbort);
//         server.off('error', onError);
//         server.close(() => undefined);
//       });
//     }),
//     server =>
//       Effect.async<void>(resume => {
//         server.close(() => {
//           resume(Effect.succeed(undefined));
//         });
//       }),
//   );
