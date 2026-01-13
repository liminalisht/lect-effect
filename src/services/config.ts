import { Context } from 'effect';
import { type AppConfig } from '../config/app';
import { type MasterdataDbConfig } from '../config/masterdataDb';

export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

export type ConfigServiceShape = {
  readonly app: AppConfig;
  readonly masterdataPg: MasterdataDbConfig;
};
