/**
 * Server bootstrap entrypoint for Angular SSR. This file is compiled into the
 * server bundle (`dist/frontend/server/main.server.mjs`) and is loaded automatically
 * by Angular's SSR runtime; it is not imported directly from `server.ts`.
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
