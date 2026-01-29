/**
 * Browser application configuration providers.
 * @since 0.1.0
 */
import { type ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes.js';
import { RAW_FRONTEND_CONFIG } from './core/config/raw-frontend-config-token.js';
import type { RawFrontendConfig } from './core/config/frontend-config.js';

const rawFrontendConfig: RawFrontendConfig = {
  graphqlEndpoint: '/graphql',
  logLevel: 'Info',
};

/**
 * Application configuration used when bootstrapping in the browser.
 * @since 0.1.0
 * @category Application Configuration
 */
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RAW_FRONTEND_CONFIG, useValue: rawFrontendConfig },
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
    provideZonelessChangeDetection(),
  ],
};
