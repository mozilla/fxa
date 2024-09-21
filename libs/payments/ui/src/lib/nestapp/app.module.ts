/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from '@nestjs/common';
import { TypedConfigModule } from 'nest-typed-config';

import { CartManager, CartService, CheckoutService } from '@fxa/payments/cart';
import {
  EligibilityManager,
  EligibilityService,
} from '@fxa/payments/eligibility';
import {
  CheckoutTokenManager,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  CustomerManager,
  InvoiceManager,
  PaymentMethodManager,
  PriceManager,
  ProductManager,
  PromotionCodeManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { AccountCustomerManager, StripeClient } from '@fxa/payments/stripe';
import { AccountManager } from '@fxa/shared/account/account';
import { ProductConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import { FirestoreProvider } from '@fxa/shared/db/firestore';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { GeoDBManager, GeoDBNestFactory } from '@fxa/shared/geodb';
import { LocalizerRscFactoryProvider } from '@fxa/shared/l10n/server';
import { StatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  PaymentsGleanManager,
  PaymentsGleanFactory,
  PaymentsGleanService,
} from '@fxa/payments/metrics';

import { RootConfig } from './config';
import { NextJSActionsService } from './nextjs-actions.service';
import { validate } from '../config.utils';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: RootConfig,
      // Use the same validate function as apps/payments-next/config
      // to ensure the same environment variables are loaded following
      // the same process.
      // Note: If just passing in process.env, GLEAN_CONFIG__VERSION
      // seems to not be available in validate function.
      load: () =>
        validate(
          {
            ...process.env,
            GLEAN_CONFIG__VERSION: process.env['GLEAN_CONFIG__VERSION'],
          },
          RootConfig
        ),
    }),
  ],
  controllers: [],
  providers: [
    AccountCustomerManager,
    AccountDatabaseNestFactory,
    AccountManager,
    CartManager,
    CartService,
    CheckoutTokenManager,
    CustomerManager,
    CheckoutService,
    EligibilityManager,
    EligibilityService,
    FirestoreProvider,
    GeoDBManager,
    GeoDBNestFactory,
    InvoiceManager,
    LocalizerRscFactoryProvider,
    NextJSActionsService,
    PaymentMethodManager,
    PaypalBillingAgreementManager,
    PayPalClient,
    PaypalCustomerManager,
    PriceManager,
    ProductConfigurationManager,
    ProductManager,
    PromotionCodeManager,
    StatsDProvider,
    StrapiClient,
    StripeClient,
    SubscriptionManager,
    PaymentsGleanFactory,
    PaymentsGleanManager,
    PaymentsGleanService,
  ],
})
export class AppModule {}
