import { Layer } from 'effect';
import { HelloApiService } from './hello.api.interface.js';
import { helloApiLive } from './hello.api.live.js';

export const HelloApiLayer = Layer.effect(HelloApiService, helloApiLive);
