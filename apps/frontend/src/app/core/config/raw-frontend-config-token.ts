import { InjectionToken } from '@angular/core';
import type { RawFrontendConfig } from './frontend-config.js';

export const RAW_FRONTEND_CONFIG = new InjectionToken<RawFrontendConfig>(
  'RAW_FRONTEND_CONFIG',
);
