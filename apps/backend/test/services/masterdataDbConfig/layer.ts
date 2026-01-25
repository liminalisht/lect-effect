import {
  Config, type ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '@lect-effect/services/config';
import { environmentSchema } from '@lect-effect/services/appConfig/interface/environment';
import { portSchema } from '@lect-effect/services/appConfig/interface/port';
import { AppConfigService } from '@lect-effect/services/appConfig';
import { MasterdataDbService } from '@lect-effect/services/masterdataDb';
import { MasterdataDbConfigService } from '@lect-effect/services/masterdataDbConfig';
import { testMasterdataDbConfigServiceImplementation } from './implementation.js';

export const testMasterdataDbConfigLayer: Layer.Layer<MasterdataDbConfigService, ConfigError.ConfigError>
  = Layer.effect(
    MasterdataDbConfigService,
    testMasterdataDbConfigServiceImplementation,
  );
