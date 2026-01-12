import { Effect, Schema } from 'effect';

export const decodeOne = <A>(schema: Schema.Schema<A>) => (u: unknown) =>
  Schema.decodeUnknown(schema)(u);

export const decodeMany = <A>(schema: Schema.Schema<A>) => (rows: readonly unknown[]) =>
  Effect.all(rows.map(row => Schema.decodeUnknown(schema)(row)));
