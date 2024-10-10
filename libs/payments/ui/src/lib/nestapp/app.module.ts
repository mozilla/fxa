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
import { PaymentsGleanManager } from '@fxa/payments/metrics';
import { PaymentsGleanFactory } from '@fxa/payments/metrics/provider';
import { AccountCustomerManager, StripeClient } from '@fxa/payments/stripe';
import { ProfileClient } from '@fxa/profile/client';
import { AccountManager } from '@fxa/shared/account/account';
import { ProductConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import { FirestoreProvider } from '@fxa/shared/db/firestore';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { GeoDBManager, GeoDBNestFactory } from '@fxa/shared/geodb';
import { LocalizerRscFactoryProvider } from '@fxa/shared/l10n/server';
import { logger, LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDProvider } from '@fxa/shared/metrics/statsd';
import { NotifierService, NotifierSnsProvider } from '@fxa/shared/notifier';

import { RootConfig } from './config';
import { NextJSActionsService } from './nextjs-actions.service';
import { validate } from '../config.utils';
import { CurrencyManager } from '@fxa/payments/currency';
import { PaymentsEmitterService } from '../emitter/emitter.service';

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
    CurrencyManager,
    CheckoutService,
    EligibilityManager,
    EligibilityService,
    FirestoreProvider,
    GeoDBManager,
    GeoDBNestFactory,
    InvoiceManager,
    LocalizerRscFactoryProvider,
    NextJSActionsService,
    NotifierService,
    NotifierSnsProvider,
    PaymentMethodManager,
    PaypalBillingAgreementManager,
    PayPalClient,
    PaypalCustomerManager,
    PriceManager,
    ProductConfigurationManager,
    ProductManager,
    ProfileClient,
    PromotionCodeManager,
    StatsDProvider,
    StrapiClient,
    StripeClient,
    SubscriptionManager,
    PaymentsGleanFactory,
    PaymentsGleanManager,
    PaymentsEmitterService,
    { provide: LOGGER_PROVIDER, useValue: logger },
  ],
})
export class AppModule {}
