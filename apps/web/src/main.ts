import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config.js';
import { App } from './app/app.js';

try {
  await bootstrapApplication(App, appConfig);
} catch (error) {
  console.error(error);
}
