import type { Runtime } from 'effect';
import type { YogaInitialContext } from 'graphql-yoga';
import type { AppServices } from '../services';

// Each handler can still demand only what it needs: Effect<A, E, DbService | ConfigService>.
// A runtime for AppServices can run any computation whose requirements are a sub-union of AppServices
// (categorically: you have a canonical inclusion R ↪ AppServices, and Effect is covariant in R in the way you want operationally).
export type GraphQLContext = YogaInitialContext & {
  readonly runtime: Runtime.Runtime<AppServices>;
};
