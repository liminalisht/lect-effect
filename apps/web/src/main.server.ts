import { type BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.js';
import { config } from './app/app.config.server.js';

const bootstrap = async (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);

export default bootstrap;
