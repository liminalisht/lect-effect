/**
 * Hello API layer wiring.
 * @since 0.1.0
 */
import { Layer } from 'effect';
import { HelloApiService } from './hello.api.interface.js';
import { helloApiLive } from './hello.api.live.js';

/**
 * Layer providing the live hello API implementation.
 * @since 0.1.0
 * @category Layers
 */
export const HelloApiLayer = Layer.effect(HelloApiService, helloApiLive);
