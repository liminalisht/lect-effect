/**
 * Minimal JSON value shape for GraphQL responses.
 * @since 1.0.0
 */
export type Json =
  | null
  | boolean
  | number
  | string
  | readonly Json[]
  | {[key: string]: Json};
