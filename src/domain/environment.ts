/**
 * Deployment environment discriminator literal.
 * @since 1.0.0
 */
import { Schema } from 'effect';

/**
 * Schema for allowed deployment environments.
 * @since 1.0.0
 */
export const environmentSchema = Schema.Literal('dev', 'test', 'staging', 'prod');

/**
 * Deployment environment discriminator.
 * @since 1.0.0
 */
export type Environment = Schema.Schema.Type<typeof environmentSchema>;
