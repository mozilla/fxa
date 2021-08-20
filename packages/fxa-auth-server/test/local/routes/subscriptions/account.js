/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const proxyquire = require('proxyquire');

const token = 'a.test.jwt';
const { sendFinishSetupEmailForStubAccount } = proxyquire(
  '../../../../lib/routes/subscriptions/account',
  {
    '../../oauth/jwt': {
      sign: sinon.stub().returns(token),
    },
  }
);
const invoice = require('../../payments/fixtures/stripe/invoice_open');

describe('routes/subscriptions/account', () => {
  describe('sendFinishSetupEmailForStubAccount', () => {
    const email = 'testo@moz.gg';
    const uid = 'quux';
    const account = { email, verifierSetAt: 0 };
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
    };

    let stripeHelper, mailer;

    beforeEach(() => {
      stripeHelper = { findPlanById: sinon.stub().resolves(plan) };
      mailer = { sendSubscriptionAccountFinishSetupEmail: sinon.stub() };
    });

    it('does not send an email when the account is not a stub', async () => {
      await sendFinishSetupEmailForStubAccount({ email, uid, account: null });
      sinon.assert.notCalled(stripeHelper.findPlanById);
      sinon.assert.notCalled(mailer.sendSubscriptionAccountFinishSetupEmail);
    });

    it('does not send an email when fails get the plan', async () => {
      stripeHelper.findPlanById.rejects();
      try {
        await sendFinishSetupEmailForStubAccount({
          email,
          uid,
          account,
          subscription,
          stripeHelper,
          mailer,
        });
        assert.fail('should have thrown');
      } catch (e) {
        sinon.assert.calledOnceWithExactly(
          stripeHelper.findPlanById,
          subscription.plan.id
        );
        sinon.assert.notCalled(mailer.sendSubscriptionAccountFinishSetupEmail);
      }
    });

    it('sends an email to the stub account', async () => {
      await sendFinishSetupEmailForStubAccount({
        email,
        uid,
        account,
        subscription,
        stripeHelper,
        mailer,
      });
      sinon.assert.calledOnceWithExactly(
        stripeHelper.findPlanById,
        subscription.plan.id
      );
      sinon.assert.calledOnceWithExactly(
        mailer.sendSubscriptionAccountFinishSetupEmail,
        [],
        account,
        {
          email,
          uid,
          productId: subscription.plan.product,
          productName: plan.product_name,
          invoiceNumber: invoice.number,
          invoiceTotalInCents: invoice.total,
          invoiceTotalCurrency: invoice.currency,
          planEmailIconURL: subscription.plan.plan_metadata.emailIconURL,
          invoiceDate: new Date(invoice.created * 1000),
          nextInvoiceDate: new Date(subscription.current_period_end * 1000),
          token,
        }
      );
    });
  });
});
