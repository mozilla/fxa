/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { dotenvLoader, fileLoader, TypedConfigModule } from 'nest-typed-config';

import { CartManager, CartService } from '@fxa/payments/cart';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { Module } from '@nestjs/common';

import { RootConfig } from './config';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: RootConfig,
      load: [
        fileLoader(),
        dotenvLoader({
          separator: '__',
          ignoreEnvFile: true,
        }),
      ],
      normalize(config) {
        config.mysqlConfig.port = parseInt(config.mysqlConfig.port, 10);
        config.mysqlConfig.connectionLimitMax = parseInt(
          config.mysqlConfig.connectionLimitMax,
          10
        );
        return config;
      },
    }),
  ],
  controllers: [],
  providers: [AccountDatabaseNestFactory, CartService, CartManager],
})
export class AppModule {}
