/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TypedConfigModule } from 'nest-typed-config';

import { CartManager, CartService } from '@fxa/payments/cart';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { Module } from '@nestjs/common';

import { RootConfig } from './config';
import { LocalizerRscFactoryProvider } from '@fxa/shared/l10n/server';
import { AccountCustomerManager } from '@fxa/payments/stripe';
import { NextJSActionsService } from './nextjs-actions.service';
import { GeoDBManager, GeoDBNestFactory } from '@fxa/shared/geodb';
import { validate } from '../config.utils';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: RootConfig,
      // Use the same validate function as apps/payments-next/config
      // to ensure the same environment variables are loaded following
      // the same process.
      load: () => validate(process.env, RootConfig),
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
    GeoDBNestFactory,
    GeoDBManager,
  ],
})
export class AppModule {}
