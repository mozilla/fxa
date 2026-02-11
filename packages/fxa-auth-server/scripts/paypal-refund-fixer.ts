/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthLogger } from '../lib/types';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import { StatsD } from 'hot-shots';
import stripe from 'stripe';
import Container from 'typedi';

import { CurrencyHelper } from '../lib/payments/currencies';
import { PayPalClient, RefundType } from '@fxa/payments/paypal';
import { PayPalHelper } from '../lib/payments/paypal/helper';
import { STRIPE_INVOICE_METADATA, StripeHelper } from '../lib/payments/stripe';
import { configureSentry } from '../lib/sentry';

const config = require('../config').default.getProperties();

class PayPalFixer {
  private stripe: stripe;

  constructor(
    private log: AuthLogger,
    private stripeHelper: StripeHelper,
    private paypalHelper: PayPalHelper
  ) {
    this.stripe = (this.stripeHelper as any).stripe as stripe;
  }

  private activeSubscriptions(
    subscriptions: stripe.Subscription[] | undefined
  ) {
    if (!subscriptions) {
      return [];
    }
    return subscriptions.filter((sub) =>
      ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
    );
  }

  private async *nonRefundedPaypalInvoices(limit?: number) {
    const startDate = new Date(2021, 3, 20).getTime() / 1000;
    let count = 0;
    for await (const invoice of this.stripe.invoices.list({
      limit: 100,
      status: 'paid',
      collection_method: 'send_invoice',
      created: { gt: startDate },
    })) {
      if (
        !invoice.metadata?.[STRIPE_INVOICE_METADATA.PAYPAL_TRANSACTION_ID] ||
        invoice.metadata?.[
          STRIPE_INVOICE_METADATA.PAYPAL_REFUND_TRANSACTION_ID
        ] ||
        invoice.post_payment_credit_notes_amount === 0
      ) {
        continue;
      }
      yield invoice;
      count++;
      if (limit && count >= limit) {
        break;
      }
    }
  }

  async zeroAccountBalance(customer: stripe.Customer) {
    if (customer.balance >= 0) {
      return;
    }
    const zeroAmount = Math.abs(customer.balance);
    await this.stripe.customers.createBalanceTransaction(customer.id, {
      amount: zeroAmount,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      currency: customer.currency!,
    });
  }

  async issueRefund(invoice: stripe.Invoice) {
    const transactionId =
      this.stripeHelper.getInvoicePaypalTransactionId(invoice);
    if (!transactionId) {
      return;
    }
    const refundResponse = await this.paypalHelper.refundTransaction({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      idempotencyKey: invoice.id!,
      transactionId: transactionId,
      refundType: RefundType.Full,
    });
    const success = ['instant', 'delayed'];
    if (success.includes(refundResponse.refundStatus.toLowerCase())) {
      await this.stripeHelper.updateInvoiceWithPaypalRefundTransactionId(
        invoice,
        refundResponse.refundTransactionId
      );
    } else {
      this.log.error('issueRefund', {
        message: 'PayPal refund transaction unsuccessful',
        invoiceId: invoice.id,
        transactionId,
        refundResponse,
      });
    }
  }

  async fixAffectedCustomers() {
    let i = 0;
    for await (const invoice of this.nonRefundedPaypalInvoices()) {
      const customer = await this.stripe.customers.retrieve(
        invoice.customer as string,
        { expand: ['subscriptions'] }
      );
      const subs = customer.deleted
        ? []
        : this.activeSubscriptions(customer.subscriptions?.data);
      this.log.info('Invoice found', {
        invoiceId: invoice.id,
        customerId: customer.id,
        balance: customer.deleted ? 0 : customer.balance,
        subs: subs.length,
        deleted: !!customer.deleted,
      });
      i++;

      if (!customer.deleted) {
        await this.zeroAccountBalance(customer);
      }
      if (subs.length === 1) {
        const sub = subs[0];
        if (sub.id === invoice.subscription) {
          await this.stripeHelper.cancelSubscription(sub.id);
        } else {
          this.log.info('Skipping cancellation of unrelated subscription.', {});
        }
      }
      // Issue the refund
      try {
        await this.issueRefund(invoice);
      } catch (err) {
        this.log.error('Error handling invoice.', {
          err,
          invoiceId: invoice.id,
        });
      }
    }
    this.log.info('Total non-refunded paypal transactions', { total: i });
  }
}

export async function init() {
  configureSentry(undefined, config);
  const statsd = config.statsd.enabled
    ? new StatsD({
        ...config.statsd,
        errorHandler: (err) => {
          // eslint-disable-next-line no-use-before-define
          log.error('statsd.error', err);
        },
      })
    : ({
        increment: () => {},
        timing: () => {},
        close: () => {},
      } as unknown as StatsD);
  Container.set(StatsD, statsd);

  const log = require('../lib/log')({ ...config.log, statsd });
  const currencyHelper = new CurrencyHelper(config);
  Container.set(CurrencyHelper, currencyHelper);
  const stripeHelper = new StripeHelper(log, config, statsd);
  Container.set(StripeHelper, stripeHelper);
  const paypalClient = new PayPalClient(
    config.subscriptions.paypalNvpSigCredentials,
    statsd
  );
  Container.set(PayPalClient, paypalClient);
  const paypalHelper = new PayPalHelper({ log });
  Container.set(PayPalHelper, paypalHelper);

  const fixer = new PayPalFixer(log, stripeHelper, paypalHelper);
  await fixer.fixAffectedCustomers();
  return 0;
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
