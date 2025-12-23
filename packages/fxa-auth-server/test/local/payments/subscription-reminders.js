/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const { Container } = require('typedi');
const { DateTime, Duration, Interval } = require('luxon');

const { mockLog } = require('../../mocks');
const { CurrencyHelper } = require('../../../lib/payments/currencies');
const { StripeHelper } = require('../../../lib/payments/stripe');
const { SentEmail } = require('fxa-shared/db/models/auth/sent-email');
const {
  EMAIL_TYPE,
  SubscriptionReminders,
} = require('../../../lib/payments/subscription-reminders');
const invoicePreview = require('./fixtures/stripe/invoice_preview_tax.json');
const longPlan1 = require('./fixtures/stripe/plan1.json');
const longPlan2 = require('./fixtures/stripe/plan2.json');
const shortPlan1 = require('./fixtures/stripe/plan3.json');
const longSubscription1 = require('./fixtures/stripe/subscription1.json'); // sub to plan 1
const longSubscription2 = require('./fixtures/stripe/subscription2.json'); // sub to plan 2
const sentry = require('../../../lib/sentry');
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
  let mockSubscriptionManager;
  let mockCustomerManager;
  let mockChurnInterventionService;
  let mockProductConfigurationManager;
  let mockPurchaseForPriceId;
  let mockStatsD;
  let reminder;
  let mockConfig;
  let realDateNow;

  const mockDailyReminderDuration = undefined;
  const mockMonthlyReminderDuration = 7;
  const mockYearlyReminderDuration = 14;

  beforeEach(() => {
    mockConfig = {
      currenciesToCountries: { ZAR: ['AS', 'CA'] },
    };
    mockStripeHelper = {
      formatSubscriptionForEmail: () => {},
      findActiveSubscriptionsByPlanId: () => {},
    };
    mockSubscriptionManager = {
      listCancelOnDateGenerator: () => {},
    };
    mockCustomerManager = {
      retrieve: () => {},
    };
    mockChurnInterventionService = {
      determineStaySubscribedEligibility: () => {},
    };
    mockPurchaseForPriceId = () => {};
    mockProductConfigurationManager = {
      getPageContentByPriceIds: () => {},
    };
    mockStatsD = {
      increment: () => {},
    };
    const currencyHelper = new CurrencyHelper(mockConfig);
    Container.set(CurrencyHelper, currencyHelper);
    Container.set(StripeHelper, mockStripeHelper);
    reminder = new SubscriptionReminders(
      mockLog,
      planLength,
      reminderLength,
      {
        enabled: false,
        paymentsNextUrl: 'http://localhost:3035',
        dailyReminderDays: mockDailyReminderDuration,
        monthlyReminderDays: mockMonthlyReminderDuration,
        yearlyReminderDays: mockYearlyReminderDuration,
      },
      {},
      {},
      mockStatsD,
      mockStripeHelper,
      mockSubscriptionManager,
      mockCustomerManager,
      mockChurnInterventionService,
      mockProductConfigurationManager
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
      const actual = reminder.getStartAndEndTimes(
        Duration.fromObject({ days: 14 })
      );
      const actualStartS = actual.start.toSeconds();
      const actualEndS = actual.end.toSeconds();
      assert.equal(actualStartS, expected.start.toSeconds());
      assert.equal(actualEndS, expected.end.toSeconds());
      assert.equal(actualEndS - actualStartS, S_IN_A_DAY);
      DateTime.utc = realDateTimeUtc;
    });
  });

  describe('alreadySentEmail', () => {
    const args = ['uid', 12345, { subscriptionId: 'sub_123' }, EMAIL_TYPE];
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
      await reminder.updateSentEmail(
        'uid',
        { subscriptionId: 'sub_123' },
        EMAIL_TYPE
      );
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
      const result =
        await reminder.sendSubscriptionRenewalReminderEmail(subscription);
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
        },
        'subscriptionRenewalReminder'
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
        { subscriptionId: subscription.id },
        'subscriptionRenewalReminder'
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

  describe('sendSubscriptionEndingReminderEmail', () => {
    const mockSubscriptionId = 'sub_12345';
    const mockCustomerId = 'cus_12345';
    const mockPlanId = 'plan_12345';
    const mockUid = 'uid_12345';
    const mockSubCurrentPeriodStart = 1622073600;
    const mockSubCurrentPeriodEnd = 1624751600;
    const mockCustomer = {
      id: mockCustomerId,
      metadata: {
        userid: mockUid,
      },
    };
    const mockSubscription = {
      id: mockSubscriptionId,
      customer: mockCustomer,
      current_period_start: mockSubCurrentPeriodStart,
      current_period_end: mockSubCurrentPeriodEnd,
      items: {
        data: [
          {
            price: {
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
          },
        ],
      },
    };
    const mockSupportUrl = 'http://localhost:3035/support';
    const mockWebIcon = 'http://localhost:3035/webicon';
    const mockCtaMessage = 'Stay with us';
    const mockProductPageUrl = 'http://localhost:3035/product';
    const mockAccount = {
      emails: [],
      email: 'testo@test.test',
      locale: 'NZ',
    };
    const mockPlanConfig = {
      wibble: 'quux',
    };
    const mockFormattedSubscription = {
      id: mockSubscriptionId,
      planId: mockPlanId,
      productMetadata: {
        privacyUrl: 'http://privacy',
        termsOfServiceUrl: 'http://tos',
      },
      planConfig: mockPlanConfig,
    };
    let spyReportSentryError;
    beforeEach(() => {
      spyReportSentryError = sinon.spy(sentry, 'reportSentryError');
      reminder.db.account = sandbox.fake.resolves(mockAccount);
      reminder.alreadySentEmail = sandbox.fake.resolves(false);
      reminder.mailer.sendSubscriptionEndingReminderEmail =
        sandbox.fake.resolves(true);
      reminder.updateSentEmail = sandbox.fake.resolves();
      mockCustomerManager.retrieve = sandbox.fake.resolves(mockCustomer);
      mockStripeHelper.formatSubscriptionForEmail = sandbox.fake.resolves(
        mockFormattedSubscription
      );
      mockPurchaseForPriceId = sandbox.fake.returns({
        offering: {
          commonContent: {
            supportUrl: mockSupportUrl,
            localizations: [
              {
                supportUrl: mockSupportUrl,
              },
            ],
          },
        },
        purchaseDetails: {
          webIcon: mockWebIcon,
          localizations: [
            {
              webIcon: mockWebIcon,
            },
          ],
        },
        apiIdentifier: 'vpn',
      });
      mockProductConfigurationManager.getPageContentByPriceIds =
        sandbox.fake.resolves({
          purchaseForPriceId: mockPurchaseForPriceId,
        });
      mockChurnInterventionService.determineStaySubscribedEligibility =
        sandbox.fake.resolves({
          isEligibile: true,
          cmsChurnInterventionEntry: {
            ctaMessage: mockCtaMessage,
            ctaButtonUrl: mockProductPageUrl,
          },
        });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return true if the email was sent successfully', async () => {
      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);

      assert.isTrue(actual);
      sinon.assert.calledOnceWithExactly(
        mockCustomerManager.retrieve,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        reminder.alreadySentEmail,
        mockCustomer.metadata.userid,
        mockSubCurrentPeriodStart * 1000,
        { subscriptionId: mockSubscriptionId },
        'subscriptionEndingReminder'
      );
      sinon.assert.calledOnceWithExactly(reminder.db.account, mockUid);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.formatSubscriptionForEmail,
        mockSubscription
      );
      sinon.assert.calledOnceWithExactly(
        mockProductConfigurationManager.getPageContentByPriceIds,
        [mockPlanId],
        mockAccount.locale
      );
      sinon.assert.calledOnceWithExactly(mockPurchaseForPriceId, mockPlanId);
      sinon.assert.calledOnceWithExactly(
        mockChurnInterventionService.determineStaySubscribedEligibility,
        mockUid,
        mockSubscriptionId,
        mockAccount.locale
      );
      sinon.assert.calledOnce(
        reminder.mailer.sendSubscriptionEndingReminderEmail
      );
      sinon.assert.calledOnceWithExactly(
        reminder.updateSentEmail,
        mockUid,
        { subscriptionId: mockSubscriptionId },
        'subscriptionEndingReminder'
      );
    });

    it('should return false if customer uid is not provided', async () => {
      mockCustomerManager.retrieve = sandbox.fake.resolves({
        metadata: {},
      });

      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);
      assert.isFalse(actual);
      sinon.assert.calledOnce(mockCustomerManager.retrieve);
      sinon.assert.notCalled(
        reminder.mailer.sendSubscriptionEndingReminderEmail
      );
      sinon.assert.calledOnce(spyReportSentryError);
    });

    it('should return false if email already sent', async () => {
      reminder.alreadySentEmail = sandbox.fake.resolves(true);

      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);
      assert.isFalse(actual);
      sinon.assert.calledOnce(reminder.alreadySentEmail);
      sinon.assert.notCalled(spyReportSentryError);
      sinon.assert.notCalled(
        reminder.mailer.sendSubscriptionEndingReminderEmail
      );
    });

    it('should return false if an error occurs when sending the email', async () => {
      const mockError = new Error('Failed to send email');
      mockStripeHelper.formatSubscriptionForEmail =
        sandbox.fake.rejects(mockError);

      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);
      assert.isFalse(actual);
      sinon.assert.calledOnceWithExactly(spyReportSentryError, mockError);
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
      sinon.assert.calledOnceWithExactly(
        reminder.getStartAndEndTimes,
        Duration.fromObject({ days: 14 })
      );
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

    it('calls sendEndingReminders if enabled in config', async () => {
      reminder.sendEndingReminders = sandbox.fake.resolves({});
      reminder.endingReminderEnabled = true;
      await reminder.sendReminders();

      sinon.assert.calledWith(
        reminder.sendEndingReminders,
        Duration.fromObject({ days: mockMonthlyReminderDuration }),
        'monthly'
      );
      sinon.assert.calledWith(
        reminder.sendEndingReminders,
        Duration.fromObject({ days: mockYearlyReminderDuration }),
        'yearly'
      );
    });

    it('calls sendEndingReminders for daily if dailyEndingReminderDuration is provided', async () => {
      const mockDailyReminderDays = 3;
      reminder.sendEndingReminders = sandbox.fake.resolves({});
      reminder.endingReminderEnabled = true;
      reminder.dailyEndingReminderDuration = Duration.fromObject({
        days: mockDailyReminderDays,
      });
      await reminder.sendReminders();

      sinon.assert.calledWith(
        reminder.sendEndingReminders,
        Duration.fromObject({ days: mockDailyReminderDays }),
        'daily'
      );
      sinon.assert.calledWith(
        reminder.sendEndingReminders,
        Duration.fromObject({ days: mockMonthlyReminderDuration }),
        'monthly'
      );
      sinon.assert.calledWith(
        reminder.sendEndingReminders,
        Duration.fromObject({ days: mockYearlyReminderDuration }),
        'yearly'
      );
    });
  });

  describe('sendEndingReminders', () => {
    const mockDuration = Duration.fromObject({ days: 14 });
    const mockSubplatInterval = 'monthly';
    const mockPriceMonthly = {
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    };
    const mockPriceYearly = {
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
    };
    const mockSubscriptionMonthly = {
      items: {
        data: [{ price: mockPriceMonthly }],
      },
    };
    const mockSubscriptionYearly = {
      items: {
        data: [{ price: mockPriceYearly }],
      },
    };

    beforeEach(() => {
      mockStatsD.increment = sandbox.fake.returns({});
      mockSubscriptionManager.listCancelOnDateGenerator = sandbox
        .stub()
        .callsFake(function* () {
          yield mockSubscriptionMonthly;
          yield mockSubscriptionYearly;
        });
      reminder.sendSubscriptionEndingReminderEmail =
        sandbox.fake.resolves(true);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('successfully sends an email for monthly subscriptions and increments sendCount', async () => {
      await reminder.sendEndingReminders(mockDuration, mockSubplatInterval);
      sinon.assert.calledOnceWithExactly(
        mockStatsD.increment,
        'subscription-reminders.endingReminders.monthly'
      );
      sinon.assert.calledOnceWithExactly(
        reminder.sendSubscriptionEndingReminderEmail,
        mockSubscriptionMonthly
      );
      sinon.assert.callCount(reminder.log.info, 2);
      sinon.assert.calledWithExactly(
        reminder.log.info,
        'sendSubscriptionEndingReminderEmail.sendEndingReminders.end',
        {
          reminderLengthDays: 14,
          subplatInterval: mockSubplatInterval,
          sendCount: 1,
        }
      );
    });

    it('successfully sends an email for yearly subscriptions and increments sendCount', async () => {
      await reminder.sendEndingReminders(mockDuration, 'yearly');
      sinon.assert.calledOnceWithExactly(
        mockStatsD.increment,
        'subscription-reminders.endingReminders.yearly'
      );
      sinon.assert.calledOnceWithExactly(
        reminder.sendSubscriptionEndingReminderEmail,
        mockSubscriptionYearly
      );
      sinon.assert.callCount(reminder.log.info, 2);
      sinon.assert.calledWithExactly(
        reminder.log.info,
        'sendSubscriptionEndingReminderEmail.sendEndingReminders.end',
        {
          reminderLengthDays: 14,
          subplatInterval: 'yearly',
          sendCount: 1,
        }
      );
    });

    it('sends no emails if no subscriptions match subplat interval', async () => {
      await reminder.sendEndingReminders(mockDuration, 'weekly');
      sinon.assert.calledOnceWithExactly(
        mockStatsD.increment,
        'subscription-reminders.endingReminders.weekly'
      );
      sinon.assert.notCalled(reminder.sendSubscriptionEndingReminderEmail);
      sinon.assert.calledWithExactly(
        reminder.log.info,
        'sendSubscriptionEndingReminderEmail.sendEndingReminders.end',
        {
          reminderLengthDays: 14,
          subplatInterval: 'weekly',
          sendCount: 0,
        }
      );
    });

    it('it does not increment sendCount if no email is sent', async () => {
      reminder.sendSubscriptionEndingReminderEmail =
        sandbox.fake.resolves(false);

      await reminder.sendEndingReminders(mockDuration, mockSubplatInterval);
      sinon.assert.calledOnceWithExactly(
        mockStatsD.increment,
        'subscription-reminders.endingReminders.monthly'
      );
      sinon.assert.calledOnceWithExactly(
        reminder.sendSubscriptionEndingReminderEmail,
        mockSubscriptionMonthly
      );
      sinon.assert.calledWithExactly(
        reminder.log.info,
        'sendSubscriptionEndingReminderEmail.sendEndingReminders.end',
        {
          reminderLengthDays: 14,
          subplatInterval: mockSubplatInterval,
          sendCount: 0,
        }
      );
    });

    it('errors if price is not recurring', async () => {
      const mockPriceId = 'price_12345';
      const mockSubscription = {
        items: {
          data: [
            {
              price: {
                id: mockPriceId,
                recurring: null,
              },
            },
          ],
        },
      };
      mockSubscriptionManager.listCancelOnDateGenerator = sandbox
        .stub()
        .callsFake(function* () {
          yield mockSubscription;
        });
      try {
        await reminder.sendEndingReminders(mockDuration, mockSubplatInterval);
        assert.fail('should have thrown an error');
      } catch (error) {
        assert.isTrue(error instanceof Error);
        assert.equal(error.info.priceId, mockPriceId);
        sinon.assert.notCalled(reminder.sendSubscriptionEndingReminderEmail);
      }
    });
  });
});
