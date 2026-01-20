import {
  Config, type ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '../../../src/services/config/interface.js';
import { environmentSchema } from '../../../src/services/appConfig/interface/environment.js';
import { portSchema } from '../../../src/services/appConfig/interface/port.js';
import { AppConfigService } from '../../../src/services/appConfig/interface/index.js';
import { MasterdataDbService } from '../../../src/services/masterdataDb/interface.js';
import { MasterdataDbConfigService } from '../../../src/services/masterdataDbConfig/interface.js';
import { testMasterdataDbConfigServiceImplementation } from './implementation.js';

export const testMasterdataDbConfigLayer: Layer.Layer<MasterdataDbConfigService, ConfigError.ConfigError, never>
  = Layer.effect(
    MasterdataDbConfigService,
    testMasterdataDbConfigServiceImplementation,
  );
