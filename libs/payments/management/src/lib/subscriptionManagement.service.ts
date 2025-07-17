/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import {
  CustomerManager,
  DefaultPaymentMethod,
  PaymentMethodManager,
  CustomerSessionManager,
  SetupIntentManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
} from '@fxa/payments/stripe';
import { SanitizeExceptions } from '@fxa/shared/error';
import { CurrencyManager } from '@fxa/payments/currency';
import {
  GetAccountCustomerMissingStripeId,
  CurrencyForCustomerNotFoundError,
  SetupIntentInvalidStatusError,
  SetupIntentMissingCustomerError,
  SetupIntentMissingPaymentMethodError,
  UpdateAccountCustomerMissingStripeId,
} from './subscriptionManagement.error';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { StatsD } from 'hot-shots';

@Injectable()
export class SubscriptionManagementService {
  constructor(
    @Inject(Logger) private log: LoggerService,
    @Inject(StatsDService) private statsd: StatsD,
    private accountCustomerManager: AccountCustomerManager,
    private customerManager: CustomerManager,
    private paymentMethodManager: PaymentMethodManager,
    private subscriptionManager: SubscriptionManager,
    private customerSessionManager: CustomerSessionManager,
    private setupIntentManager: SetupIntentManager,
    private currencyManager: CurrencyManager
  ) {}

  @SanitizeExceptions()
  async getPageContent(uid: string) {
    let defaultPaymentMethod: DefaultPaymentMethod | undefined;
    const accountCustomer = await this.accountCustomerManager
      .getAccountCustomerByUid(uid)
      .catch((error) => {
        if (!(error instanceof AccountCustomerNotFoundError)) {
          throw error;
        }
      });

    if (accountCustomer && accountCustomer.stripeCustomerId) {
      const [subs, customer] = await Promise.all([
        this.subscriptionManager.listForCustomer(
          accountCustomer.stripeCustomerId
        ),
        this.customerManager.retrieve(accountCustomer.stripeCustomerId),
      ]);

      defaultPaymentMethod =
        await this.paymentMethodManager.getDefaultPaymentMethod(
          customer,
          subs,
          uid
        );
    }

    return {
      defaultPaymentMethod,
    };
  }

  @SanitizeExceptions({ allowlist: [AccountCustomerNotFoundError] })
  async getStripePaymentManagementDetails(uid: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);

    if (!accountCustomer.stripeCustomerId) {
      throw new GetAccountCustomerMissingStripeId(uid);
    }

    const customerSessionPromise =
      this.customerSessionManager.createManagementSession(
        accountCustomer.stripeCustomerId
      );

    const defaultPaymentMethodPromise =
      this.customerManager.getDefaultPaymentMethod(
        accountCustomer.stripeCustomerId
      );

    const customerPromise = this.customerManager.retrieve(
      accountCustomer.stripeCustomerId
    );

    const [customerSession, customer, defaultPaymentMethod] = await Promise.all(
      [customerSessionPromise, customerPromise, defaultPaymentMethodPromise]
    );

    let currency = customer.currency;
    if (!currency && customer.shipping?.address?.country) {
      currency = this.currencyManager.getCurrencyForCountry(
        customer.shipping.address.country
      );
    }
    if (!currency && defaultPaymentMethod?.billing_details.address?.country) {
      currency = this.currencyManager.getCurrencyForCountry(
        defaultPaymentMethod.billing_details.address.country
      );
    }
    if (!currency) {
      throw new CurrencyForCustomerNotFoundError(customer.id);
    }

    return {
      clientSecret: customerSession.client_secret,
      customer: customerSession.customer,
      defaultPaymentMethodId: defaultPaymentMethod?.id,
      currency,
    };
  }

  @SanitizeExceptions()
  async updateStripePaymentDetails(uid: string, confirmationTokenId: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);

    if (!accountCustomer.stripeCustomerId) {
      throw new UpdateAccountCustomerMissingStripeId(uid);
    }

    const setupIntent = await this.setupIntentManager.createAndConfirm(
      accountCustomer.stripeCustomerId,
      confirmationTokenId
    );
    this.statsd.increment(
      'sub_management_update_stripe_payment_setupintent_status',
      { status: setupIntent.status }
    );

    if (setupIntent.status !== 'succeeded') {
      throw new SetupIntentInvalidStatusError(
        setupIntent.id,
        setupIntent.status
      );
    }

    if (!setupIntent.payment_method) {
      throw new SetupIntentMissingPaymentMethodError(
        setupIntent.id,
        setupIntent.status,
        setupIntent.customer
      );
    }

    if (!setupIntent.customer) {
      throw new SetupIntentMissingCustomerError(
        setupIntent.id,
        setupIntent.status
      );
    }

    const paymentMethod = await this.paymentMethodManager.retrieve(
      setupIntent.payment_method
    );

    await this.customerManager.update(setupIntent.customer, {
      invoice_settings: {
        default_payment_method: setupIntent.payment_method,
      },
      name: paymentMethod.billing_details.name ?? undefined,
    });

    return {
      id: setupIntent.id,
      clientSecret: setupIntent.client_secret,
    };
  }
}
