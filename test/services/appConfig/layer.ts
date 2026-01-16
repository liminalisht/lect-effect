import {
  Config, ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '../../../src/services/config/interface';
import { environmentSchema } from '../../../src/services/appConfig/interface/environment';
import { portSchema } from '../../../src/services/appConfig/interface/port';
import { AppConfigService } from '../../../src/services/appConfig/interface';
import { testAppConfigServiceImplementation } from './implementation';

export const testAppConfigLayer: Layer.Layer<AppConfigService, ConfigError.ConfigError>
  = Layer.effect(
    AppConfigService,
    testAppConfigServiceImplementation,
  );
