/**
 * Decoding helpers for Effect schemas.
 * @since 0.1.0
 */
import { Effect, Schema } from 'effect';

/**
 * Decodes a single unknown value with the provided schema.
 * @since 0.1.0
 * @category Decoding Helpers
 */
export const decodeOne = <A>(schema: Schema.Schema<A>) => (u: unknown) =>
  Schema.decodeUnknown(schema)(u);

/**
 * Decodes an array of unknown values with the provided schema.
 * @since 0.1.0
 * @category Decoding Helpers
 */
export const decodeMany = <A>(schema: Schema.Schema<A>) => (rows: readonly unknown[]) =>
  Effect.all(rows.map(row => Schema.decodeUnknown(schema)(row)));
