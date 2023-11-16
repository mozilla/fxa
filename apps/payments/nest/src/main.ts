import next from 'next';

import { CartService } from '@fxa/payments/cart';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

type BootstrapOptions = {
  name: string;
  appDir: string;
  port?: number;
};

const nestPathPrefixes = [
  'testapi',
  '__lbheartbeat__',
  '__heartbeat__',
  '__version__',
  '__exception__',
];

const getNextConfig = async (appDir: string, dev: boolean) => {
  const dir = process.env.NX_NEXT_DIR || __dirname;
  console.log(dir);
  return { dev, dir };
};

const setupNextAppMiddleware = async (appDir: string) => {
  const nextConfig = await getNextConfig(
    appDir,
    process.env.NODE_ENV !== 'production'
  );
  const nextApp = next(nextConfig);
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();
  return async (req: any, res: any, next: any) => {
    const pathPrefix = req.url.split('/')[1];
    if (nestPathPrefixes.includes(pathPrefix)) return next();
    handle(req, res as never);
  };
};

export const bootstrap = async (options: BootstrapOptions) => {
  const app = await NestFactory.create(AppModule);
  (global as any).appServices = {
    cartService: app.get<CartService>(CartService),
  };
  app.use(await setupNextAppMiddleware(options.appDir));
  const port = options.port ?? process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
  process.chdir('apps/payments/next');
};
