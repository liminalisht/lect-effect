import {
  Config, type ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '../../../src/services/config/interface';
import { environmentSchema } from '../../../src/services/appConfig/interface/environment';
import { portSchema } from '../../../src/services/appConfig/interface/port';
import { AppConfigService } from '../../../src/services/appConfig/interface';
import { MasterdataDbService } from '../../../src/services/masterdataDb/interface';
import { MasterdataDbConfigService } from '../../../src/services/masterdataDbConfig/interface';
import { testMasterdataDbConfigServiceImplementation } from './implementation';

export const testMasterdataDbConfigLayer: Layer.Layer<MasterdataDbConfigService, ConfigError.ConfigError, never>
  = Layer.effect(
    MasterdataDbConfigService,
    testMasterdataDbConfigServiceImplementation,
  );
