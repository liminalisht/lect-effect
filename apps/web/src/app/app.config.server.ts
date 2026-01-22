/**
 * Server-only application configuration used for SSR.
 * @since 1.0.0
 */
import { mergeApplicationConfig, type ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config.js';
import { serverRoutes } from './app.routes.server.js';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

/**
 * Merged application configuration for server bootstrap.
 * @since 1.0.0
 */
export const config: ApplicationConfig = mergeApplicationConfig(appConfig, serverConfig);
