/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TypedConfigModule } from 'nest-typed-config';

import { CartManager, CartService } from '@fxa/payments/cart';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { Module } from '@nestjs/common';

import { RootConfig } from './config';
import { LocalizerRscFactoryProvider } from '@fxa/shared/l10n/server';
import {
  AccountCustomerManager,
  StripeClient,
  StripeManager,
} from '@fxa/payments/stripe';
import { NextJSActionsService } from './nextjs-actions.service';
import { GeoDBManager, GeoDBNestFactory } from '@fxa/shared/geodb';
import { validate } from '../config.utils';
import {
  EligibilityManager,
  EligibilityService,
} from '@fxa/payments/eligibility';
import { CheckoutService } from 'libs/payments/cart/src/lib/checkout.service';
import { ContentfulClient, ContentfulManager } from '@fxa/shared/contentful';
import {
  PayPalClient,
  PayPalManager,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { StatsDService } from '@fxa/shared/metrics/statsd';

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
    {
      provide: FirestoreService,
      useValue: {}, //Temporary value to resolve Payments Next startup issues
    },
    {
      provide: StatsDService,
      useValue: {}, //Temporary value to resolve Payments Next startup issues
    },
    LocalizerRscFactoryProvider,
    NextJSActionsService,
    AccountDatabaseNestFactory,
    AccountCustomerManager,
    CartService,
    CartManager,
    GeoDBNestFactory,
    GeoDBManager,
    EligibilityService,
    EligibilityManager,
    CheckoutService,
    ContentfulClient,
    ContentfulManager,
    StripeManager,
    StripeClient,
    PayPalClient,
    PaypalCustomerManager,
    PayPalManager,
  ],
})
export class AppModule {}
