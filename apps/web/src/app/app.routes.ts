/**
 * Application client routes.
 * @since 1.0.0
 */
import {type Routes} from '@angular/router';
import {ToyPage} from './features/toy/toy.page.js';

/**
 * Client-side route configuration for the app shell.
 * @since 1.0.0
 */
export const routes: Routes = [
  {path: '', component: ToyPage},
];
