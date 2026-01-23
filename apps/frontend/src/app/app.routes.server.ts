/**
 * Server-only route configuration.
 * @since 1.0.0
 */
import { RenderMode, type ServerRoute } from '@angular/ssr';

/**
 * Server routes instructing Angular SSR to prerender all paths.
 * @since 1.0.0
 * @category Server Routes
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
