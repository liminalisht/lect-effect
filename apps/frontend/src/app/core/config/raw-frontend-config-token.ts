/**
 * Angular token for supplying the raw frontend configuration object.
 * @since 1.0.0
 */
import { InjectionToken } from '@angular/core';
import type { RawFrontendConfig } from './frontend-config.js';

/**
 * Injection token bound to the raw (decoded later) frontend config.
 * @since 1.0.0
 */
export const RAW_FRONTEND_CONFIG = new InjectionToken<RawFrontendConfig>('RAW_FRONTEND_CONFIG');
