/**
 * Server bootstrap entrypoint for Angular SSR.
 * @since 1.0.0
 */
import { type BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.js';
import { config } from './app/app.config.server.js';

/**
 * Bootstraps the Angular app with server configuration.
 * @since 1.0.0
 */
const bootstrap = async (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);

export default bootstrap;
