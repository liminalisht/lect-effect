/**
 * Deployment environment configuration bindings.
 * @since 0.1.0
 */
import { Schema } from 'effect';

/**
 * Schema for allowed deployment environments.
 * @since 0.1.0
 * @category Schemas
 */
export const environmentSchema = Schema.Literal('dev', 'test', 'staging', 'prod');

/**
 * Deployment environment discriminator.
 * @since 0.1.0
 * @category Types
 */
export type Environment = Schema.Schema.Type<typeof environmentSchema>;
