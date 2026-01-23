/**
 * TCP port configuration bindings.
 * @since 1.0.0
 */
import { Schema } from 'effect';

/**
 * TCP port value object.
 * @since 1.0.0
 * @category Types
 */
export type Port = Schema.Schema.Type<typeof portSchema>;

/**
 * Schema for validating TCP ports.
 * @since 1.0.0
 * @category Schemas
 */
export const portSchema = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, 65_535),
  Schema.brand('Port'),
).annotations({ description: 'TCP port (1-65535)' });

