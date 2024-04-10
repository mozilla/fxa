/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { dotenvLoader, fileLoader, TypedConfigModule } from 'nest-typed-config';

import { CartManager, CartService } from '@fxa/payments/cart';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { Module } from '@nestjs/common';

import { RootConfig } from './config';
import { LocalizerRscFactoryProvider } from '@fxa/shared/l10n/server';
import { AccountCustomerManager } from '@fxa/payments/stripe';
import { NextJSActionsService } from './nextjs-actions.service';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: RootConfig,
      load: [
        fileLoader(),
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
  controllers: [],
  providers: [
    AccountDatabaseNestFactory,
    NextJSActionsService,
    AccountCustomerManager,
    CartService,
    CartManager,
    LocalizerRscFactoryProvider,
  ],
})
export class AppModule {}
