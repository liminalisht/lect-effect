import { Layer } from 'effect';
import { greetingLayer } from '../../src/layers/greeting';
import { testConfigLayer } from './config';
import { testLoggerLayer } from './logger';
import { MasterdataDb } from '../../src/services/masterdataDb';


// Test stub: not expected to be used; provides a dummy sql client
export const testMasterdataDbLayer = Layer.succeed(MasterdataDb, { sql: {} as any });

export const testAppLayer = Layer.mergeAll(testConfigLayer, testLoggerLayer, greetingLayer, testMasterdataDbLayer);
