/**
 * Hello API layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { HelloApiService } from './hello.api.interface.js';
import { helloApiLive } from './hello.api.live.js';

/**
 * Layer providing the live hello API implementation.
 * @since 1.0.0
 */
export const HelloApiLayer = Layer.effect(HelloApiService, helloApiLive);
