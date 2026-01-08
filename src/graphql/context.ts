import type { Runtime } from 'effect';
import type { YogaInitialContext } from 'graphql-yoga';
import type { AppEnv } from '../services';

// Each handler can still demand only what it needs: Effect<A, E, DbService | ConfigService>.
// A runtime for AppEnv can run any computation whose requirements are a sub-union of AppEnv
// (categorically: you have a canonical inclusion R ↪ AppEnv, and Effect is covariant in R in the way you want operationally).
export type GraphQLContext = YogaInitialContext & {
  readonly runtime: Runtime.Runtime<AppEnv>;
};
