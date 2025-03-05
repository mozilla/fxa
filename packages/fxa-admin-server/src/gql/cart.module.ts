/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module, Provider } from '@nestjs/common';
import { CartManager } from '@fxa/payments/cart';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { AppConfig } from '../config';
import { MySQLConfig } from '@fxa/shared/db/mysql/core';
import { ConfigService } from '@nestjs/config';

export const MySQLConfigFactory: Provider<MySQLConfig> = {
  provide: MySQLConfig,
  useFactory: (configService: ConfigService<AppConfig>) => {
    const dbConfig = configService.get('database') as AppConfig['database'];
    return dbConfig.fxa;
  },
  inject: [ConfigService<AppConfig>],
};

@Module({
  providers: [MySQLConfigFactory, AccountDatabaseNestFactory, CartManager],
  exports: [CartManager],
})
export class CartModule {}
