/**
 * Application client routes.
 * @since 1.0.0
 */
import {type Routes} from '@angular/router';
import { HelloPage } from './features/hello/hello.page.js';
import {ToyPage} from './features/toy/toy.page.js';
import {CreateProductPage} from './features/products/create-product.page.js';

/**
 * Client-side route configuration for the app shell.
 * @since 1.0.0
 * @category Routes
 */
export const routes: Routes = [
  { path: '', component: HelloPage },
  { path: 'products/create', component: CreateProductPage },
  { path: 'toy', component: ToyPage },
  { path: '**', redirectTo: '' },
];
