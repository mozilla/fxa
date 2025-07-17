/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import { SanitizeExceptions } from '@fxa/shared/error';
import { AccountCustomerManager } from '@fxa/payments/stripe';
import {
  CustomerManager,
  CustomerSessionManager,
  SetupIntentManager,
} from '@fxa/payments/customer';
import {
  AccountCustomerMissingStripeId,
  SetupIntentInvalidStatusError,
} from './subscriptionManagement.error';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { StatsD } from 'hot-shots';

@Injectable()
export class SubscriptionManagementService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private customerSessionManager: CustomerSessionManager,
    private setupIntentManager: SetupIntentManager,
    private customerManager: CustomerManager,
    @Inject(Logger) private log: LoggerService,
    @Inject(StatsDService) private statsd: StatsD
  ) {}

  // TODO: Remove when developing this class, along with the associated tests.
  // This method is for testing purposes only
  @SanitizeExceptions()
  checkInitialization() {
    this.log.log('SubscriptionManagementService is initialized');
    return { initialized: true };
  }

  @SanitizeExceptions()
  async getStripeClientSession(uid: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);
    if (!accountCustomer.stripeCustomerId) {
      throw new AccountCustomerMissingStripeId(uid);
    }

    const clientSession = await this.customerSessionManager.createManagementSession(
      accountCustomer.stripeCustomerId
    );

    return {
      clientSecret: clientSession.client_secret,
      customer: clientSession.customer,
    };
  }

  @SanitizeExceptions({ allowlist: [SetupIntentInvalidStatusError] })
  async updateStripePaymentMethods(uid: string, confirmationTokenId: string) {
    const accountCustomer =
      await this.accountCustomerManager.getAccountCustomerByUid(uid);
    const setupIntent = await this.setupIntentManager.createAndConfirm(
      accountCustomer.stripeCustomerId ?? '',
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
      throw new Error();
    }

    if (!setupIntent.customer) {
      throw new Error();
    }

    await this.customerManager.update(setupIntent.customer, {
      invoice_settings: { default_payment_method: setupIntent.payment_method },
    });

    return {
      id: setupIntent.id,
      clientSecret: setupIntent.client_secret,
    };
  }
}
