/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import { Account, getPayPalBAByBAId } from 'fxa-shared/db/models/auth';

import { ConfigType } from '../../../config';
import error from '../../error';
import { IpnMerchPmtType, isIpnMerchPmt } from '../../payments/paypal/client';
import { StripeHelper } from '../../payments/stripe';
import { reportSentryError } from '../../sentry';
import { AuthLogger, AuthRequest } from '../../types';
import { PayPalHandler } from './paypal';

const IPN_EXCLUDED = ['mp_signup'];

export class PayPalNotificationHandler extends PayPalHandler {
  /**
   * Handle merchant payment notification from PayPal
   * and update Stripe invoice according to the payment_status
   *
   * @param message
   */
  private async handleMerchPayment(message: IpnMerchPmtType) {
    const invoice = await this.stripeHelper.getInvoice(message.invoice);
    if (!invoice) {
      this.log.error('handleMerchPayment', {
        message: 'Invoice not found',
        ipnMessage: message,
      });
      throw error.internalValidationError('handleMerchPayment', {
        message: 'Invoice not found',
      });
    }

    if (invoice.status == null || !['draft', 'open'].includes(invoice.status)) {
      if (
        invoice.status == 'uncollectible' &&
        ['Completed', 'Processed'].includes(message.payment_status)
      ) {
        // we need to refund the user since the invoice was cancelled
        // but payment was processed
        this.paypalHelper.issueRefund(invoice, message.txn_id);
      }
      // nothing to do since the invoice is already at its final status
      return;
    }

    switch (message.payment_status) {
      case 'Completed':
      case 'Processed':
        return this.stripeHelper.payInvoiceOutOfBand(invoice);
      case 'Pending':
      case 'In-Progress':
        return;
      case 'Denied':
      case 'Failed':
      case 'Voided':
      case 'Expired':
        if (message.custom.length == 0) {
          this.log.error('handleMerchPayment', {
            message: 'No idempotency key on PayPal transaction',
            ipnMessage: message,
          });
          throw error.internalValidationError('handleMerchPayment', {
            message: 'No idempotency key on PayPal transaction',
          });
        }
        return;
      default:
        // Unexpected response here, log details and throw validation error.
        this.log.error('handleMerchPayment', {
          message: 'Unexpected PayPal payment status',
          ipnMessage: message,
        });
        throw error.internalValidationError('handleMerchPayment', {
          message: 'Unexpected PayPal payment status',
          transactionResponse: message.payment_status,
        });
    }
  }

  /**
   * Handle merchant payment cancelled notification from PayPal
   * and update PayPalBillingAgreements to "Cancelled" status
   * and removes the billing agreement from Stripe Customer
   *
   * @param message
   */
  private async handleMpCancel(message: IpnMerchPmtType) {
    const billingAgreement = await getPayPalBAByBAId(message.mp_id);
    if (!billingAgreement) {
      this.log.error('handleMpCancel', {
        message: 'Billing agreement not found',
        ipnMessage: message,
      });
      return;
    }
    if (billingAgreement.status === 'Cancelled') {
      return;
    }
    const account = await Account.findByUid(billingAgreement.uid, {
      include: ['emails'],
    });
    if (!account) {
      this.log.error('handleMpCancel', {
        message: 'User account not found',
        ipnMessage: message,
        customerUid: billingAgreement.uid,
      });
      return;
    }
    const customer = await this.stripeHelper.fetchCustomer(account.uid, [
      'subscriptions',
    ]);
    if (!customer) {
      this.log.error('handleMpCancel', {
        message: 'Stripe customer not found',
        ipnMessage: message,
        customerUid: billingAgreement.uid,
      });
      return;
    }
    this.stripeHelper.removeCustomerPaypalAgreement(
      account.uid,
      customer.id,
      billingAgreement.billingAgreementId
    );

    const nextPeriodValidSubscription = customer.subscriptions?.data.find(
      (sub) =>
        !sub.cancel_at_period_end && ['active', 'past_due'].includes(sub.status)
    );
    if (
      this.stripeHelper.getPaymentProvider(customer) === 'paypal' &&
      nextPeriodValidSubscription
    ) {
      const { uid, email } = account;
      const subscriptions =
        await this.stripeHelper.formatSubscriptionsForEmails(customer);
      await this.mailer.sendSubscriptionPaymentProviderCancelledEmail(
        account.emails,
        account,
        {
          uid,
          email,
          acceptLanguage: account.locale,
          subscriptions,
        }
      );
    }
  }

  /**
   * Verify and dispatch IPN events from PayPal
   *
   * Run as a fire-and-forget so the execution is wrapped to capture
   * any errors with the original request context.
   *
   * @param request
   */
  private async verifyAndDispatchEvent(request: AuthRequest) {
    try {
      const verified = await this.paypalHelper.verifyIpnMessage(
        request.payload.toString()
      );
      if (!verified) {
        throw new Error('Invalid payload on PayPal IPN Handler.');
      }
      const payload = this.paypalHelper.extractIpnMessage(
        request.payload.toString()
      );
      if (isIpnMerchPmt(payload)) {
        this.log.debug('Handling Ipn message', { payload });
        if (payload.txn_type === 'merch_pmt') {
          return this.handleMerchPayment(payload);
        } else {
          return this.handleMpCancel(payload);
        }
      }
      if (!IPN_EXCLUDED.includes(payload.txn_type)) {
        this.log.info('Unhandled Ipn message', { payload });
      }
    } catch (err) {
      reportSentryError(err, request);
      this.log.error('verifyAndDispatchEvent', {
        payload: request.payload,
        err,
      });
    }
    return false;
  }

  /**
   * Hand the request off to be verified and dispatched so that we can
   * return immediately to PayPal.
   *
   * @param request
   */
  public handleIpnEvent(request: AuthRequest) {
    // Note we intentionally do not wait before returning a 200 per
    // PayPal recommended IPN handling.
    this.verifyAndDispatchEvent(request);
    return {};
  }
}

export const paypalNotificationRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
): ServerRoute[] => {
  const paypalNotificationHandler = new PayPalNotificationHandler(
    log,
    db,
    config,
    customs,
    push,
    mailer,
    profile,
    stripeHelper
  );

  return [
    {
      method: 'POST',
      path: '/oauth/subscriptions/paypal/event',
      options: {
        // We'll use the PayPals verification to authenticate.
        auth: false,
        // The raw payload is needed for authentication.
        payload: {
          output: 'data',
          parse: false,
        },
      },
      handler: (request: AuthRequest) =>
        paypalNotificationHandler.handleIpnEvent(request),
    },
  ];
};
