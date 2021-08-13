/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';

export async function sendFinishSetupEmailForStubAccount({
  email,
  uid,
  account,
  subscription,
  db,
  stripeHelper,
  mailer,
}: {
  email: string;
  uid: string;
  account: any;
  subscription: any;
  db: any;
  stripeHelper: any;
  mailer: any;
}) {
  // If this fxa user is a stub (no-password) this is where we
  // send the "create a password" email
  if (account && account.verifierSetAt <= 0) {
    const token = await db.createPasswordForgotToken(account);
    const invoice: Stripe.Invoice =
      subscription.latest_invoice as Stripe.Invoice;
    const plan = await stripeHelper.findPlanById(subscription.plan!.id);
    const meta = metadataFromPlan(plan);
    await mailer.sendSubscriptionAccountFinishSetupEmail([], account, {
      email,
      uid,
      productId: subscription.plan!.product,
      productName: plan.product_name,
      invoiceNumber: invoice.number,
      invoiceTotalInCents: invoice.total,
      invoiceTotalCurrency: invoice.currency,
      planEmailIconURL: meta.emailIconURL,
      invoiceDate: invoice.created,
      nextInvoiceDate: subscription.current_period_end,
      token: token.data,
      code: token.passCode,
    });
  }
}
