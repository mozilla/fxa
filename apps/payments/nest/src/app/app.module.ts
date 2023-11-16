/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { dotenvLoader, fileLoader, TypedConfigModule } from 'nest-typed-config';

import { CartManager, CartService } from '@fxa/payments/cart';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { getVersionInfo, HealthModule } from '@fxa/shared/nestjs/health';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfig } from './config';

const version = getVersionInfo(__dirname);

@Module({
  imports: [
    HealthModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: async () => ({
        version,
      }),
    }),
    TypedConfigModule.forRoot({
      schema: RootConfig,
      load: [
        fileLoader({ searchFrom: 'apps/payments/next' }),
        dotenvLoader({
          separator: '__',
          keyTransformer: (key) =>
            key
              .toLowerCase()
              .replace(/(?<!_)_([a-z])/g, (_, p1) => p1.toUpperCase()),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AccountDatabaseNestFactory, CartService, CartManager],
})
export class AppModule {}
