import { Layer } from 'effect';
import { type FrontendConfig, FrontendConfigService } from '../config/frontend-config.js';
import { FrontendLoggerLayer } from '../logging/logging.layer.js';
import { GraphQLClientLive, type GraphQLClientService } from '../graphql/graphql-client.js';
import { HelloApiLayer } from '../../../api/hello/hello.api.layer.js';
import { type HelloApiService } from '../../../api/hello/hello.api.interface.js';
import { ProductApiLayer } from '../../../api/product/product.api.layer.js';
import { type ProductApiService } from '../../../api/product/product.api.interface.js';

export type AppEnv =
	| FrontendConfigService
	| GraphQLClientService
	| HelloApiService
	| ProductApiService;

export const makeAppLayer = (cfg: FrontendConfig): Layer.Layer<AppEnv> => {
  const configLayer = Layer.succeed(FrontendConfigService, cfg);

  const loggerLayer = FrontendLoggerLayer.pipe(Layer.provide(configLayer));

  const gqlLayer = GraphQLClientLive.pipe(Layer.provide(configLayer));

  const helloLayer = HelloApiLayer.pipe(Layer.provide(gqlLayer));
  const productLayer = ProductApiLayer.pipe(Layer.provide(gqlLayer));

  return Layer.mergeAll(configLayer, loggerLayer, gqlLayer, helloLayer, productLayer);
};
