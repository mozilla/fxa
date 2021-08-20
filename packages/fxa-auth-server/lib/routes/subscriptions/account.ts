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
}: {
  email: string;
  uid: string;
  account: any;
  subscription: any;
  stripeHelper: any;
  mailer: any;
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
      invoiceDate: new Date(invoice.created * 1000),
      nextInvoiceDate: new Date(subscription.current_period_end * 1000),
      token,
    });
  }
}
