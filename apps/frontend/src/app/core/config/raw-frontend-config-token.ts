/**
 * Angular token for supplying the raw frontend configuration object.
 * @since 0.1.0
 */
import { InjectionToken } from '@angular/core';
import type { RawFrontendConfig } from './frontend-config.js';

/**
 * Injection token bound to the raw (decoded later) frontend config.
 * This is just an identifier for dependency injection; it has no logic or data itself.
 * The actual config object is provided separately, typically at the app bootstrap, and can be sourced from environment variables, server-provided data, etc.
 * The token is a safe abstraction that allows the rest of the app to depend on configuration without coupling to how or where that configuration is sourced.
 * It doesn’t embed or expose config values or secrets. The token is safe; only the provider bound to it could carry sensitive data, so ensure that provider is sourced securely (env, server-provided, etc.).
 * @since 0.1.0
 * @category Injection Tokens
 */
export const RAW_FRONTEND_CONFIG = new InjectionToken<RawFrontendConfig>('RAW_FRONTEND_CONFIG');
