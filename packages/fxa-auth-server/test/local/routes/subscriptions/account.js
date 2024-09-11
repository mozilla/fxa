/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const token = 'a.test.jwt';
const { sendFinishSetupEmailForStubAccount } = proxyquire(
  '../../../../lib/routes/subscriptions/account',
  {
    '../../oauth/jwt': {
      sign: sinon.stub().returns(token),
    },
  }
);
import invoice from '../../payments/fixtures/stripe/invoice_open';

describe('routes/subscriptions/account', () => {
  describe('sendFinishSetupEmailForStubAccount', () => {
    const email = 'testo@moz.gg';
    const uid = 'quux';
    const account = { email, verifierSetAt: 0, locale: 'gd' };
    const plan = {
      id: 'testo',
      product: 'wedabest',
      product_name: 'wedabest',
      plan_metadata: { emailIconURL: 'gopher://xyz.gg/' },
    };
    const subscription = {
      current_period_end: '2001',
      latest_invoice: invoice,
      plan,
      status: 'active',
    };
    const invoiceDetails = {
      email,
      uid,
      productId: subscription.plan.product,
      productName: plan.product_name,
      invoiceNumber: invoice.number,
      invoiceTotalInCents: invoice.total,
      invoiceTotalCurrency: invoice.currency,
      planEmailIconURL: subscription.plan.plan_metadata.emailIconURL,
      invoiceDate: invoice.created,
      nextInvoiceDate: subscription.current_period_end,
    };

    let stripeHelper, mailer;

    beforeEach(() => {
      stripeHelper = {
        findAbbrevPlanById: sinon.stub().resolves(plan),
        extractInvoiceDetailsForEmail: sinon.stub().resolves(invoiceDetails),
      };
      mailer = { sendSubscriptionAccountFinishSetupEmail: sinon.stub() };
    });

    it('does not send an email when the account is not a stub', async () => {
      await sendFinishSetupEmailForStubAccount({ email, uid, account: null });
      sinon.assert.notCalled(stripeHelper.findAbbrevPlanById);
      sinon.assert.notCalled(mailer.sendSubscriptionAccountFinishSetupEmail);
    });

    it('does not send an email when the subscription is not active', async () => {
      await sendFinishSetupEmailForStubAccount({
        uid,
        account,
        subscription: { ...subscription, status: 'incomplete' },
        stripeHelper,
        mailer,
      });
      sinon.assert.notCalled(stripeHelper.findAbbrevPlanById);
      sinon.assert.notCalled(mailer.sendSubscriptionAccountFinishSetupEmail);
    });

    it('sends an email for subscription with a payment intent that "requires_action"', async () => {
      const sub = {
        ...subscription,
        latest_invoice: {
          ...subscription.latest_invoice,
          payment_intent: { status: 'requires_action' },
        },
      };
      await sendFinishSetupEmailForStubAccount({
        uid,
        account,
        subscription: sub,
        stripeHelper,
        mailer,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.extractInvoiceDetailsForEmail,
        sub.latest_invoice
      );
      sinon.assert.calledOnceWithExactly(
        mailer.sendSubscriptionAccountFinishSetupEmail,
        [],
        account,
        {
          acceptLanguage: account.locale,
          ...invoiceDetails,
          token,
        }
      );
    });

    it('sends an email to the stub account', async () => {
      await sendFinishSetupEmailForStubAccount({
        uid,
        account,
        subscription,
        stripeHelper,
        mailer,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.extractInvoiceDetailsForEmail,
        invoice
      );
      sinon.assert.calledOnceWithExactly(
        mailer.sendSubscriptionAccountFinishSetupEmail,
        [],
        account,
        {
          acceptLanguage: account.locale,
          ...invoiceDetails,
          token,
        }
      );
    });
  });
});
