/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'server-only';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>;

export async function getApp() {
  if (app) return app;
  app = await NestFactory.createApplicationContext(AppModule);
  return app;
}
