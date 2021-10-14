/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import jwt from '../../oauth/jwt';

export async function sendFinishSetupEmailForStubAccount({
  email,
  uid,
  account,
  subscription,
  stripeHelper,
  mailer,
  metricsContext,
  subscriptionAccountReminders,
}: {
  email: string;
  uid: string;
  account: any;
  subscription: any;
  stripeHelper: any;
  mailer: any;
  subscriptionAccountReminders: any;
  metricsContext?: any;
}) {
  // If this fxa user is a stub (no-password) this is where we
  // send the "create a password" email
  if (account && account.verifierSetAt <= 0) {
    const token = await jwt.sign(
      { uid },
      {
        header: {
          typ: 'fin+JWT',
        },
      }
    );
    const plan = await stripeHelper.findPlanById(subscription.plan!.id);
    const meta = metadataFromPlan(plan);
    const invoiceDetails = await stripeHelper.extractInvoiceDetailsForEmail(
      subscription.latest_invoice
    );
    await mailer.sendSubscriptionAccountFinishSetupEmail([], account, {
      ...invoiceDetails,
      ...metricsContext,
      token,
    });

    if (metricsContext && subscriptionAccountReminders) {
      await subscriptionAccountReminders.create(
        uid,
        metricsContext.flowId,
        metricsContext.flowBeginTime,
        invoiceDetails.productId,
        invoiceDetails.productName
      );
    }
  }
}
