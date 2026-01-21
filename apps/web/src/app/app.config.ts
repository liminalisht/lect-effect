/**
 * Browser application configuration providers.
 * @since 1.0.0
 */
import { type ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes.js';

/**
 * Application configuration used when bootstrapping in the browser.
 * @since 1.0.0
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
    provideZonelessChangeDetection(),
  ],
};
