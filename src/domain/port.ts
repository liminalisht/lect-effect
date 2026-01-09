import { Schema } from 'effect';

export type Port = Schema.Schema.Type<typeof portSchema>;

export const portSchema = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, 65_535),
  Schema.brand('Port'),
).annotations({ description: 'TCP port (1-65535)' });

