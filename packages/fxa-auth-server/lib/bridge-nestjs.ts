/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Container } from 'typedi';
import { MozLoggerService } from '@fxa/shared/mozlog';
import {
  LegacyStatsDProvider,
  StatsD,
  StatsDService,
} from '@fxa/shared/metrics/statsd';
import { NotifierService, NotifierSnsFactory } from '@fxa/shared/notifier';

import config, { ConfigType } from '../config';
import { AppConfig } from './types';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [(): ConfigType => config.getProperties()],
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    MozLoggerService,
    NotifierSnsFactory,
    NotifierService,
    LegacyStatsDProvider,
  ],
})
export class AppModule {}

export async function getAppModuleInstance() {
  return await NestFactory.createApplicationContext(AppModule);
}

export async function bridgeTypeDi() {
  const appInstance = await getAppModuleInstance();

  // Setup type di container for backwards compatibility
  Container.set(AppConfig, config.getProperties());
  Container.set(StatsD, appInstance.get(StatsDService));
  Container.set(MozLoggerService, appInstance.resolve(MozLoggerService));
  Container.set(NotifierService, appInstance.get(NotifierService));
}
