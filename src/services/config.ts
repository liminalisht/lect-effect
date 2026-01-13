import { Context } from 'effect';
import { AppConfig } from '../config/app';
import { MasterdataDbConfig } from '../config/masterdataDb';

export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

type ConfigServiceShape = {
  readonly app: AppConfig;
  readonly masterdataPg: MasterdataDbConfig;
};
