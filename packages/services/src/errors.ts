/**
 * Error mappers for configuration loading/validation.
 * @since 1.0.0
 */
import { type ConfigError } from 'effect';

/**
 * Error type raised when configuration loading or validation fails.
 * @since 1.0.0
 * @category Services Errors
 */
export type ConfigurationError = ConfigError.ConfigError;
