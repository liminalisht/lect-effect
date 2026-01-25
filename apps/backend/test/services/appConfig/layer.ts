import {
  Config, type ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '@lect-effect/services/config';
import { environmentSchema } from '@lect-effect/services/appConfig/interface/environment';
import { portSchema } from '@lect-effect/services/appConfig/interface/port';
import { AppConfigService } from '@lect-effect/services/appConfig';
import { testAppConfigServiceImplementation } from './implementation.js';

export const testAppConfigLayer: Layer.Layer<AppConfigService, ConfigError.ConfigError>
  = Layer.effect(
    AppConfigService,
    testAppConfigServiceImplementation,
  );
