/**
 * Error mappers for configuration loading/validation.
 * @since 0.1.0
 */
import { type ConfigError } from 'effect';

/**
 * Error type raised when configuration loading or validation fails.
 * @since 0.1.0
 * @category Services Errors
 */
export type ConfigurationError = ConfigError.ConfigError;
