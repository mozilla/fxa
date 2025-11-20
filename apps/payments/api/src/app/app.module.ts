import { Logger, Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfig } from '../config';
import {
  StripeEventManager,
  StripeWebhooksController,
  StripeWebhookService,
  SubscriptionEventsService,
} from '@fxa/payments/webhooks';
import { FirestoreProvider } from '@fxa/shared/db/firestore';
import { StripeClient } from '@fxa/payments/stripe';
import { StatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  CustomerManager,
  InvoiceManager,
  PaymentMethodManager,
  PriceManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalClientConfig,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import { CurrencyManager } from '@fxa/payments/currency';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { CartManager } from '@fxa/payments/cart';
import { ProductConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import {
  MockPaymentsGleanFactory,
  PaymentsGleanManager,
} from '@fxa/payments/metrics';
import { PaymentsGleanFactory } from '@fxa/payments/metrics/provider';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { NimbusManager, NimbusManagerConfig } from '@fxa/payments/experiments';
import { NimbusClient, NimbusClientConfig } from '@fxa/shared/experiments';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: RootConfig,
      load: dotenvLoader({
        separator: '__',
        keyTransformer: (key) =>
          key
            .toLowerCase()
            .replace(/(?<!_)_([a-z])/g, (_, p1) => p1.toUpperCase()),
        envFilePath: ['.env.local', '.env'],
      }),
    }),
  ],
  controllers: [AppController, StripeWebhooksController],
  providers: [
    Logger,
    AccountDatabaseNestFactory,
    AccountManager,
    AppService,
    ProductConfigurationManager,
    CartManager,
    SubscriptionEventsService,
    PaymentsGleanFactory,
    PaymentsGleanManager,
    PaymentsEmitterService,
    PriceManager,
    FirestoreProvider,
    StatsDProvider,
    StripeClient,
    PayPalClient,
    PaypalClientConfig,
    SubscriptionManager,
    CustomerManager,
    InvoiceManager,
    PaymentMethodManager,
    CurrencyManager,
    StripeWebhookService,
    StripeEventManager,
    PaypalBillingAgreementManager,
    PaypalCustomerManager,
    StrapiClient,
    NimbusManager,
    NimbusManagerConfig,
    NimbusClient,
    NimbusClientConfig,
    MockPaymentsGleanFactory,
  ],
})
export class AppModule {}
