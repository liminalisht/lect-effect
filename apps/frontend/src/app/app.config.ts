/**
 * Browser application configuration providers.
 * @since 1.0.0
 */
import { type ApplicationConfig, EnvironmentProviders, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes.js';
import { RAW_FRONTEND_CONFIG } from './core/config/raw-frontend-config-token.js';

// todo: is this right? what's the type?
const provideFrontendConfig = () => {
  return {
    provide: RAW_FRONTEND_CONFIG,
    useValue: {
      graphqlEndpoint: '/graphql',
      logLevel: 'Info',
    },
  };
}

/**
 * Application configuration used when bootstrapping in the browser.
 * @since 1.0.0
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideFrontendConfig(),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
    provideZonelessChangeDetection(),
  ],
};
