import {
  Config, type ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '../../../src/services/config/interface.js';
import { environmentSchema } from '../../../src/services/appConfig/interface/environment.js';
import { portSchema } from '../../../src/services/appConfig/interface/port.js';
import { AppConfigService } from '../../../src/services/appConfig/interface/index.js';
import { testAppConfigServiceImplementation } from './implementation.js';

export const testAppConfigLayer: Layer.Layer<AppConfigService, ConfigError.ConfigError>
  = Layer.effect(
    AppConfigService,
    testAppConfigServiceImplementation,
  );
