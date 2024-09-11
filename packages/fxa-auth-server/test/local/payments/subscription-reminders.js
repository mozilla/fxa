/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import sinon from 'sinon';
import { Container } from 'typedi';
import { DateTime, Duration, Interval } from 'luxon';
import { mockLog } from '../../mocks';
import { CurrencyHelper } from '../../../lib/payments/currencies';
import { StripeHelper } from '../../../lib/payments/stripe';
import { SentEmail } from 'fxa-shared/db/models/auth/sent-email';
import { EMAIL_TYPE, SubscriptionReminders } from '../../../lib/payments/subscription-reminders';
import invoicePreview from './fixtures/stripe/invoice_preview_tax.json';
import longPlan1 from './fixtures/stripe/plan1.json';
import longPlan2 from './fixtures/stripe/plan2.json';
import shortPlan1 from './fixtures/stripe/plan3.json';
import longSubscription1 from './fixtures/stripe/subscription1.json'; // sub to plan 1
import longSubscription2 from './fixtures/stripe/subscription2.json'; // sub to plan 2
const planLength = 30; // days
const planDuration = Duration.fromObject({ days: planLength });
const reminderLength = 14; // days
const reminderDuration = Duration.fromObject({ days: reminderLength });

const sandbox = sinon.createSandbox();

const MOCK_INTERVAL = Interval.fromDateTimes(
  DateTime.fromMillis(1622073600000),
  DateTime.fromMillis(1622160000000)
);
const MOCK_DATETIME_MS = 1620864742024;
const S_IN_A_DAY = 24 * 60 * 60;

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

describe('SubscriptionReminders', () => {
  let mockStripeHelper;
  let reminder;
  let mockConfig;
  let realDateNow;

  beforeEach(() => {
    mockConfig = {
      currenciesToCountries: { ZAR: ['AS', 'CA'] },
    };
    mockStripeHelper = {
      findActiveSubscriptionsByPlanId: () => {},
    };
    const currencyHelper = new CurrencyHelper(mockConfig);
    Container.set(CurrencyHelper, currencyHelper);
    Container.set(StripeHelper, mockStripeHelper);
    reminder = new SubscriptionReminders(
      mockLog,
      planLength,
      reminderLength,
      {},
      {},
      mockStripeHelper
    );
    realDateNow = Date.now.bind(global.Date);
  });

  afterEach(() => {
    Date.now = realDateNow;
    Container.reset();
    sandbox.reset();
  });

  describe('constructor', () => {
    it('sets log, planDuration, reminderDuration and Stripe helper', () => {
      assert.strictEqual(reminder.log, mockLog);
      assert.equal(reminder.planDuration.as('days'), planDuration.as('days'));
      assert.equal(
        reminder.reminderDuration.as('days'),
        reminderDuration.as('days')
      );
      assert.strictEqual(reminder.stripeHelper, mockStripeHelper);
    });
  });

  describe('isEligiblePlan', () => {
    it('returns true with eligible (i.e. sufficently long) plan', () => {
      const result = reminder.isEligiblePlan(longPlan1);
      assert.isTrue(result);
    });

    it('returns false with ineligible (i.e. insufficiently long) plan', () => {
      const result = reminder.isEligiblePlan(shortPlan1);
      assert.isFalse(result);
    });
  });

  describe('getEligiblePlans', () => {
    it('returns [] when no plans are eligible', async () => {
      const shortPlan2 = deepCopy(shortPlan1);
      shortPlan2.interval = 'week';
      mockStripeHelper.allAbbrevPlans = sandbox.fake.resolves([
        shortPlan1,
        shortPlan2,
      ]);
      const result = await reminder.getEligiblePlans();
      assert.isEmpty(result);
    });
    it('returns a partial list when some plans are eligible', async () => {
      mockStripeHelper.allAbbrevPlans = sandbox.fake.resolves([
        shortPlan1,
        longPlan1,
        longPlan2,
      ]);
      const expected = [longPlan1, longPlan2];
      const actual = await reminder.getEligiblePlans();
      assert.deepEqual(actual, expected);
    });
    it('returns all when all plans are eligible', async () => {
      mockStripeHelper.allAbbrevPlans = sandbox.fake.resolves([
        longPlan1,
        longPlan2,
      ]);
      const expected = [longPlan1, longPlan2];
      const actual = await reminder.getEligiblePlans();
      assert.deepEqual(actual, expected);
    });
  });

  describe('getStartAndEndTimes', () => {
    it('returns a time period of 1 day reminderLength days from "now" in UTC', () => {
      const realDateTimeUtc = DateTime.utc.bind(DateTime);
      DateTime.utc = sinon.fake(() =>
        DateTime.fromMillis(MOCK_DATETIME_MS, { zone: 'utc' })
      );
      const expected = MOCK_INTERVAL;
      const actual = reminder.getStartAndEndTimes();
      const actualStartS = actual.start.toSeconds();
      const actualEndS = actual.end.toSeconds();
      assert.equal(actualStartS, expected.start.toSeconds());
      assert.equal(actualEndS, expected.end.toSeconds());
      assert.equal(actualEndS - actualStartS, S_IN_A_DAY);
      DateTime.utc = realDateTimeUtc;
    });
  });

  describe('alreadySentEmail', () => {
    const args = ['uid', 12345, { subscriptionId: 'sub_123' }];
    const sentEmailArgs = ['uid', EMAIL_TYPE, { subscriptionId: 'sub_123' }];
    it('returns true for email already sent for this cycle', async () => {
      SentEmail.findLatestSentEmailByType = sandbox.fake.resolves({
        sentAt: 12346,
      });
      const result = await reminder.alreadySentEmail(...args);
      assert.isTrue(result);
      sinon.assert.calledOnceWithExactly(
        SentEmail.findLatestSentEmailByType,
        ...sentEmailArgs
      );
    });
    it('returns false for email that has not been sent during this billing cycle', async () => {
      SentEmail.findLatestSentEmailByType = sandbox.fake.resolves({
        sentAt: 12344,
      });
      const result = await reminder.alreadySentEmail(...args);
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        SentEmail.findLatestSentEmailByType,
        ...sentEmailArgs
      );
    });
    it('returns false for email that has never been sent', async () => {
      SentEmail.findLatestSentEmailByType = sandbox.fake.resolves(undefined);
      const result = await reminder.alreadySentEmail(...args);
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        SentEmail.findLatestSentEmailByType,
        ...sentEmailArgs
      );
    });
  });

  describe('updateSentEmail', () => {
    it('creates a record in the SentEmails table', async () => {
      const sentEmailArgs = ['uid', EMAIL_TYPE, { subscriptionId: 'sub_123' }];
      SentEmail.createSentEmail = sandbox.fake.resolves({});
      await reminder.updateSentEmail('uid', { subscriptionId: 'sub_123' });
      sinon.assert.calledOnceWithExactly(
        SentEmail.createSentEmail,
        ...sentEmailArgs
      );
    });
  });

  describe('sendSubscriptionRenewalReminderEmail', () => {
    it('logs an error and returns false if customer uid is not provided', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        metadata: {
          userid: null,
        },
      };
      mockLog.error = sandbox.fake.returns({});
      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription
      );
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
        'sendSubscriptionRenewalReminderEmail',
        {
          customer: subscription.customer,
          subscriptionId: subscription.id,
        }
      );
    });

    it('returns false if email already sent', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      reminder.alreadySentEmail = sandbox.fake.resolves(true);
      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        reminder.alreadySentEmail,
        subscription.customer.metadata.userid,
        Math.floor(subscription.current_period_start * 1000),
        {
          subscriptionId: subscription.id,
        }
      );
    });

    it('returns true if it sends a reminder email', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      reminder.alreadySentEmail = sandbox.fake.resolves(false);
      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };
      reminder.db.account = sandbox.fake.resolves(account);
      mockLog.info = sandbox.fake.returns({});
      mockStripeHelper.findAbbrevPlanById = sandbox.fake.resolves({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.previewInvoiceBySubscriptionId = sandbox.fake.resolves({
        total: invoicePreview.total,
        currency: invoicePreview.currency,
      });
      const planConfig = {
        wibble: 'quux',
      };
      const formattedSubscription = {
        id: 'subscriptionId',
        productMetadata: {
          privacyUrl: 'http://privacy',
          termsOfServiceUrl: 'http://tos',
        },
        planConfig,
      };
      mockStripeHelper.formatSubscriptionForEmail = sandbox.fake.resolves(
        formattedSubscription
      );
      mockStripeHelper.findPlanById = sandbox.fake.resolves({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      reminder.mailer.sendSubscriptionRenewalReminderEmail =
        sandbox.fake.resolves(true);
      reminder.updateSentEmail = sandbox.fake.resolves({});
      Date.now = sinon.fake(() => MOCK_DATETIME_MS);
      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );
      assert.isTrue(result);
      sinon.assert.calledOnceWithExactly(
        reminder.db.account,
        subscription.customer.metadata.userid
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.formatSubscriptionForEmail,
        subscription
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.findAbbrevPlanById,
        longPlan1.id
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.previewInvoiceBySubscriptionId,
        {
          subscriptionId: subscription.id,
        }
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.info,
        'sendSubscriptionRenewalReminderEmail',
        {
          message: 'Sending a renewal reminder email.',
          subscriptionId: subscription.id,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          currentDateMs: Date.now(),
        }
      );
      sinon.assert.calledOnceWithExactly(
        reminder.mailer.sendSubscriptionRenewalReminderEmail,
        account.emails,
        account,
        {
          acceptLanguage: account.locale,
          uid: 'uid',
          email: 'testo@test.test',
          subscription: formattedSubscription,
          reminderLength: 14,
          planIntervalCount: 1,
          planInterval: 'month',
          invoiceTotalInCents: invoicePreview.total,
          invoiceTotalCurrency: invoicePreview.currency,
          productMetadata: formattedSubscription.productMetadata,
          planConfig,
        }
      );
      sinon.assert.calledOnceWithExactly(
        reminder.updateSentEmail,
        subscription.customer.metadata.userid,
        { subscriptionId: subscription.id }
      );
    });

    it('returns false if an error is caught when trying to send a reminder email', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      reminder.alreadySentEmail = sandbox.fake.resolves(false);
      reminder.db.account = sandbox.fake.resolves({});
      reminder.updateSentEmail = sandbox.fake.resolves({});
      mockStripeHelper.formatSubscriptionForEmail = sandbox.fake.resolves({});
      mockStripeHelper.findAbbrevPlanById = sandbox.fake.resolves({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.previewInvoiceBySubscriptionId = sandbox.fake.resolves({
        total: invoicePreview.total,
        currency: invoicePreview.currency,
      });
      mockLog.info = sandbox.fake.returns({});
      mockLog.error = sandbox.fake.returns({});
      const errMessage = 'Something went wrong.';
      const throwErr = new Error(errMessage);
      reminder.mailer.sendSubscriptionRenewalReminderEmail =
        sandbox.fake.rejects(throwErr);
      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        reminder.db.account,
        subscription.customer.metadata.userid
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.formatSubscriptionForEmail,
        subscription
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.findAbbrevPlanById,
        longPlan1.id
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.previewInvoiceBySubscriptionId,
        {
          subscriptionId: subscription.id,
        }
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
        'sendSubscriptionRenewalReminderEmail',
        {
          err: throwErr,
          subscriptionId: subscription.id,
        }
      );
      sinon.assert.notCalled(reminder.updateSentEmail);
    });
  });

  describe('sendReminders', () => {
    beforeEach(() => {
      reminder.getEligiblePlans = sandbox.fake.resolves([longPlan1, longPlan2]);
      reminder.getStartAndEndTimes = sandbox.fake.returns(MOCK_INTERVAL);
      async function* genSubscriptionForPlan1() {
        yield longSubscription1;
      }
      async function* genSubscriptionForPlan2() {
        yield longSubscription2;
      }
      const stub = sandbox.stub(
        mockStripeHelper,
        'findActiveSubscriptionsByPlanId'
      );
      stub.onFirstCall().callsFake(genSubscriptionForPlan1);
      stub.onSecondCall().callsFake(genSubscriptionForPlan2);
    });
    it('returns true if it can process all eligible subscriptions', async () => {
      reminder.sendSubscriptionRenewalReminderEmail = sandbox.fake.resolves({});
      const result = await reminder.sendReminders();
      assert.isTrue(result);
      sinon.assert.calledOnce(reminder.getEligiblePlans);
      sinon.assert.calledOnceWithExactly(reminder.getStartAndEndTimes);
      // We iterate through each plan, longPlan1 and longPlan2, and there is one
      // subscription, longSubscription1 and longSubscription2 respectively,
      // returned for each plan.
      sinon.assert.calledTwice(
        mockStripeHelper.findActiveSubscriptionsByPlanId
      );
      sinon.assert.calledTwice(reminder.sendSubscriptionRenewalReminderEmail);
    });
    it('returns false and logs an error for any eligible subscription that it fails to process', async () => {
      mockLog.error = sandbox.fake.returns({});
      const errMessage = 'Something went wrong.';
      const throwErr = new Error(errMessage);
      const stub = sandbox.stub(
        reminder,
        'sendSubscriptionRenewalReminderEmail'
      );
      stub.onFirstCall().rejects(throwErr);
      stub.onSecondCall().resolves({});
      const result = await reminder.sendReminders();
      assert.isFalse(result);
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
        'sendSubscriptionRenewalReminderEmail',
        {
          err: throwErr,
          subscriptionId: longSubscription1.id,
        }
      );
      stub.firstCall.calledWithExactly(longSubscription1);
      stub.secondCall.calledWithExactly(longSubscription2);
      sinon.assert.calledTwice(stub);
    });
  });
});
