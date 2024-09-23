/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as jwt from '../../oauth/jwt';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';

export async function sendFinishSetupEmailForStubAccount({
  uid,
  account,
  subscription,
  stripeHelper,
  mailer,
  metricsContext,
  subscriptionAccountReminders,
}: {
  uid: string;
  account: any;
  subscription: any;
  stripeHelper: any;
  mailer: any;
  subscriptionAccountReminders: any;
  metricsContext?: any;
}) {
  // If this fxa user is a stub (no-password) this is where we
  // send the "create a password" email.
  //
  // However, a successful subscription creation does not imply a successful
  // payment. For a user creating an account and subscribing to a product at
  // the same time, we should not send this email until we truly have a
  // successful, active, subscription, OR, the payment method requires further
  // action (e.g. a 3D Secure card that requires authorization from the issuing
  // bank).  Otherwise, the user will see an error on the front end but also
  // receive the welcome email.
  if (
    account &&
    account.verifierSetAt <= 0 &&
    (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status) ||
      subscription.latest_invoice?.payment_intent?.status === 'requires_action')
  ) {
    const token = await jwt.sign(
      {
        uid,
      },
      { header: { typ: 'fin+JWT' } }
    );
    const invoiceDetails = await stripeHelper.extractInvoiceDetailsForEmail(
      subscription.latest_invoice
    );
    await mailer.sendSubscriptionAccountFinishSetupEmail([], account, {
      acceptLanguage: account.locale,
      ...invoiceDetails,
      ...metricsContext,
      token,
    });

    if (metricsContext && subscriptionAccountReminders) {
      await subscriptionAccountReminders.create(
        uid,
        metricsContext.flowId,
        metricsContext.flowBeginTime,
        metricsContext.deviceId,
        invoiceDetails.productId,
        invoiceDetails.productName
      );
    }
  }
}
