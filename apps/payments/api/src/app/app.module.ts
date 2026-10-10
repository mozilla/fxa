import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfigModule } from '../config/config.module';
import { MeteringSweepProviders } from './metering-sweep.providers';
import {
  BillingAndSubscriptionsController,
  BillingAndSubscriptionsService,
} from '@fxa/payments/api-server';
import { AuthModule, FxaOAuthAuthGuard } from '@fxa/payments/auth';
import {
  MeteringAuthGuard,
  MeteringConsumerService,
  MeteringDedupeManager,
  MeteringDedupeRedisClientProvider,
  MeteringEventsManager,
  MeteringEventsRepository,
  MeteringExceptionFilter,
  MeteringPubSubClientProvider,
  MeteringPublisherManager,
  UsageController,
  UsageService,
  UsageGrantsController,
  UsageGrantsService,
} from '@fxa/entitlements/metering';
import {
  CmsWebhooksController,
  CmsWebhookService,
  FxaWebhooksController,
  FxaWebhookService,
  StripeEventManager,
  StripeWebhooksController,
  StripeWebhookService,
  SubscriptionEventsService,
} from '@fxa/payments/webhooks';
import {
  FreeAccessProgramService,
  FreeAccessProgramWebhooksController,
  FreeAccessProgramWebhooksService,
} from '@fxa/free-access-program';
import { FirestoreProvider } from '@fxa/shared/db/firestore';
import { AccountCustomerManager, StripeClient } from '@fxa/payments/stripe';
import { StatsDProvider } from '@fxa/shared/metrics/statsd';
import { CapabilityManager } from '@fxa/payments/capability';
import {
  CustomerManager,
  InvoiceManager,
  PaymentMethodManager,
  PriceManager,
  ProductManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
} from '@fxa/payments/iap';
import {
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalClientConfig,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import { CurrencyManager } from '@fxa/payments/currency';
import { StatsDRouteMiddleware } from '@fxa/shared/metrics/statsd';
import { AccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { AccountManager } from '@fxa/shared/account/account';
import { CartManager } from '@fxa/payments/cart';
import {
  CmsContentValidationManager,
  FreeAccessProgramConfigurationManager,
  MeteringConfigurationManager,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { PaymentsGleanManager } from '@fxa/payments/metrics';
import { PaymentsGleanFactory } from '@fxa/payments/metrics/provider';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { NimbusManager, NimbusManagerConfig } from '@fxa/payments/experiments';
import { NimbusClient, NimbusClientConfig } from '@fxa/shared/experiments';
import { PaymentsMetricsAggregatorService } from '@fxa/payments/metrics-aggregator';

@Module({
  imports: [SentryModule.forRoot(), AuthModule, RootConfigModule],
  controllers: [
    AppController,
    BillingAndSubscriptionsController,
    CmsWebhooksController,
    FreeAccessProgramWebhooksController,
    FxaWebhooksController,
    StripeWebhooksController,
    UsageController,
    UsageGrantsController,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    Logger,
    FxaOAuthAuthGuard,
    AccountCustomerManager,
    AccountDatabaseNestFactory,
    AccountManager,
    AppleIapClient,
    AppleIapPurchaseManager,
    AppService,
    BillingAndSubscriptionsService,
    CapabilityManager,
    ProductConfigurationManager,
    FreeAccessProgramConfigurationManager,
    CartManager,
    SubscriptionEventsService,
    PaymentsGleanFactory,
    PaymentsGleanManager,
    PaymentsMetricsAggregatorService,
    PaymentsEmitterService,
    PriceManager,
    ProductManager,
    FirestoreProvider,
    GoogleIapClient,
    GoogleIapPurchaseManager,
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
    CmsContentValidationManager,
    MeteringConfigurationManager,
    CmsWebhookService,
    FreeAccessProgramService,
    FreeAccessProgramWebhooksService,
    FxaWebhookService,
    NimbusManager,
    NimbusManagerConfig,
    NimbusClient,
    NimbusClientConfig,
    MeteringAuthGuard,
    MeteringExceptionFilter,
    MeteringPubSubClientProvider,
    MeteringPublisherManager,
    MeteringConsumerService,
    MeteringDedupeManager,
    MeteringDedupeRedisClientProvider,
    MeteringEventsManager,
    MeteringEventsRepository,
    ...MeteringSweepProviders,
    UsageService,
    UsageGrantsService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StatsDRouteMiddleware)
      .exclude(
        { path: '__heartbeat__', method: RequestMethod.GET },
        { path: '__lbheartbeat__', method: RequestMethod.GET },
        { path: '__version__', method: RequestMethod.GET }
      )
      .forRoutes('*');
  }
}
