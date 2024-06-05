/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from '@nestjs/common';
import { TypedConfigModule } from 'nest-typed-config';

import { CartManager, CartService } from '@fxa/payments/cart';
import {
  EligibilityManager,
  EligibilityService,
} from '@fxa/payments/eligibility';
import {
  PayPalClient,
  PayPalManager,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  AccountCustomerManager,
  StripeClient,
  CustomerManager,
  InvoiceManager,
  ProductManager,
  PriceManager,
  SubscriptionManager,
  PromotionCodeManager,
} from '@fxa/payments/stripe';
import {
  ContentfulClient,
  ContentfulManager,
  ContentfulService,
} from '@fxa/shared/contentful';
import { FirestoreProvider } from '@fxa/shared/db/firestore';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { GeoDBManager, GeoDBNestFactory } from '@fxa/shared/geodb';
import { LocalizerRscFactoryProvider } from '@fxa/shared/l10n/server';
import { StatsDProvider } from '@fxa/shared/metrics/statsd';

import { RootConfig } from './config';
import { NextJSActionsService } from './nextjs-actions.service';
import { validate } from '../config.utils';
import { CheckoutService } from 'libs/payments/cart/src/lib/checkout.service';
import { AccountManager } from '@fxa/shared/account/account';

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
    FirestoreProvider,
    StatsDProvider,
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
    ContentfulService,
    CustomerManager,
    InvoiceManager,
    ProductManager,
    PriceManager,
    SubscriptionManager,
    PromotionCodeManager,
    StripeClient,
    PayPalClient,
    PaypalCustomerManager,
    PayPalManager,
    AccountManager,
  ],
})
export class AppModule {}
