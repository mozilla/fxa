import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfig } from '../config';
import {
  BillingAndSubscriptionsController,
  BillingAndSubscriptionsService,
} from '@fxa/payments/api-server';
import { AuthModule, FxaOAuthAuthGuard } from '@fxa/payments/auth';
import {
  MeteringAuthGuard,
  MeteringCloudTasksGuard,
  MeteringCloudTasksClientProvider,
  MeteringCloudTasksController,
  MeteringIngestManager,
  MeteringQueryManager,
  MeteringExceptionFilter,
  MeteringThresholdService,
  MeteringThresholdTasksManager,
  MeteringWebhookManager,
  OpenMeterClient,
  UsageController,
  UsageService,
  UsageGrantsController,
  UsageGrantsManager,
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
  imports: [
    SentryModule.forRoot(),
    AuthModule,
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
  controllers: [
    AppController,
    BillingAndSubscriptionsController,
    CmsWebhooksController,
    FxaWebhooksController,
    StripeWebhooksController,
    UsageController,
    UsageGrantsController,
    MeteringCloudTasksController,
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
    FxaWebhookService,
    NimbusManager,
    NimbusManagerConfig,
    NimbusClient,
    NimbusClientConfig,
    MeteringAuthGuard,
    MeteringCloudTasksGuard,
    MeteringCloudTasksClientProvider,
    MeteringExceptionFilter,
    MeteringThresholdService,
    MeteringIngestManager,
    MeteringQueryManager,
    MeteringThresholdTasksManager,
    MeteringWebhookManager,
    OpenMeterClient,
    UsageService,
    UsageGrantsManager,
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
