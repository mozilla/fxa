/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { DateTime, Duration, Interval } from 'luxon';

const { mockLog } = require('../../test/mocks');
const { CurrencyHelper } = require('./currencies');
const { StripeHelper } = require('./stripe');
const { SentEmail } = require('fxa-shared/db/models/auth/sent-email');
const authDbModule = require('fxa-shared/db/models/auth');
const { SubscriptionReminders } = require('./subscription-reminders');
const invoicePreview = require('../../test/local/payments/fixtures/stripe/invoice_preview_tax.json');
const longPlan1 = require('../../test/local/payments/fixtures/stripe/plan1.json');
const longPlan2 = require('../../test/local/payments/fixtures/stripe/plan2.json');
const shortPlan1 = require('../../test/local/payments/fixtures/stripe/plan3.json');
const longSubscription1 = require('../../test/local/payments/fixtures/stripe/subscription1.json'); // sub to plan 1
const longSubscription2 = require('../../test/local/payments/fixtures/stripe/subscription2.json'); // sub to plan 2
const sentry = require('../sentry');

const EMAIL_TYPE = 'subscriptionRenewalReminder';

const planLength = 30; // days
const planDuration = Duration.fromObject({ days: planLength });
const reminderLength = 7; // days
const reminderDuration = Duration.fromObject({ days: reminderLength });

const MOCK_INTERVAL = Interval.fromDateTimes(
  DateTime.fromMillis(1622073600000),
  DateTime.fromMillis(1622160000000)
);
const MOCK_DATETIME_MS = 1620864742024;
const S_IN_A_DAY = 24 * 60 * 60;

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 */
function deepCopy(object: any): any {
  return JSON.parse(JSON.stringify(object));
}

describe('SubscriptionReminders', () => {
  let mockStripeHelper: any;
  let mockSubscriptionManager: any;
  let mockCustomerManager: any;
  let mockChurnInterventionService: any;
  let mockProductConfigurationManager: any;
  let mockPurchaseForPriceId: any;
  let mockStatsD: any;
  let reminder: any;
  let mockConfig: any;
  let realDateNow: any;

  const mockDailyReminderDuration = undefined;
  const mockMonthlyReminderDuration = 7;
  const mockYearlyReminderDuration = 15;

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
      {
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
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('sets log, planDuration, reminderDuration and Stripe helper', () => {
      expect(reminder.log).toBe(mockLog);
      expect(reminder.planDuration.as('days')).toEqual(planDuration.as('days'));
      expect(reminder.reminderDuration.as('days')).toEqual(
        reminderDuration.as('days')
      );
      expect(reminder.stripeHelper).toBe(mockStripeHelper);
    });
  });

  describe('isEligiblePlan', () => {
    it('returns true with eligible (i.e. sufficently long) plan', () => {
      const result = reminder.isEligiblePlan(longPlan1);
      expect(result).toBe(true);
    });

    it('returns false with ineligible (i.e. insufficiently long) plan', () => {
      const result = reminder.isEligiblePlan(shortPlan1);
      expect(result).toBe(false);
    });
  });

  describe('getEligiblePlans', () => {
    it('returns [] when no plans are eligible', async () => {
      const shortPlan2 = deepCopy(shortPlan1);
      shortPlan2.interval = 'week';
      mockStripeHelper.allAbbrevPlans = jest
        .fn()
        .mockResolvedValue([shortPlan1, shortPlan2]);
      const result = await reminder.getEligiblePlans();
      expect(result).toEqual([]);
    });
    it('returns a partial list when some plans are eligible', async () => {
      mockStripeHelper.allAbbrevPlans = jest
        .fn()
        .mockResolvedValue([shortPlan1, longPlan1, longPlan2]);
      const expected = [longPlan1, longPlan2];
      const actual = await reminder.getEligiblePlans();
      expect(actual).toEqual(expected);
    });
    it('returns all when all plans are eligible', async () => {
      mockStripeHelper.allAbbrevPlans = jest
        .fn()
        .mockResolvedValue([longPlan1, longPlan2]);
      const expected = [longPlan1, longPlan2];
      const actual = await reminder.getEligiblePlans();
      expect(actual).toEqual(expected);
    });
  });

  describe('getStartAndEndTimes', () => {
    it('returns a time period of 1 day reminderLength days from "now" in UTC', () => {
      const realDateTimeUtc = DateTime.utc.bind(DateTime);
      DateTime.utc = jest.fn(() =>
        DateTime.fromMillis(MOCK_DATETIME_MS, { zone: 'utc' })
      ) as any;
      const expected = MOCK_INTERVAL;
      const actual = reminder.getStartAndEndTimes(
        Duration.fromObject({ days: 14 })
      );
      const actualStartS = actual.start.toSeconds();
      const actualEndS = actual.end.toSeconds();
      expect(actualStartS).toEqual(expected.start.toSeconds());
      expect(actualEndS).toEqual(expected.end.toSeconds());
      expect(actualEndS - actualStartS).toEqual(S_IN_A_DAY);
      DateTime.utc = realDateTimeUtc;
    });
  });

  describe('alreadySentEmail', () => {
    const args: any[] = [
      'uid',
      12345,
      { subscriptionId: 'sub_123' },
      EMAIL_TYPE,
    ];
    const sentEmailArgs = ['uid', EMAIL_TYPE, { subscriptionId: 'sub_123' }];
    it('returns true for email already sent for this cycle', async () => {
      SentEmail.findLatestSentEmailByType = jest.fn().mockResolvedValue({
        sentAt: 12346,
      });
      const result = await reminder.alreadySentEmail(...args);
      expect(result).toBe(true);
      expect(SentEmail.findLatestSentEmailByType).toHaveBeenCalledTimes(1);
      expect(SentEmail.findLatestSentEmailByType).toHaveBeenCalledWith(
        ...sentEmailArgs
      );
    });
    it('returns false for email that has not been sent during this billing cycle', async () => {
      SentEmail.findLatestSentEmailByType = jest.fn().mockResolvedValue({
        sentAt: 12344,
      });
      const result = await reminder.alreadySentEmail(...args);
      expect(result).toBe(false);
      expect(SentEmail.findLatestSentEmailByType).toHaveBeenCalledTimes(1);
      expect(SentEmail.findLatestSentEmailByType).toHaveBeenCalledWith(
        ...sentEmailArgs
      );
    });
    it('returns false for email that has never been sent', async () => {
      SentEmail.findLatestSentEmailByType = jest
        .fn()
        .mockResolvedValue(undefined);
      const result = await reminder.alreadySentEmail(...args);
      expect(result).toBe(false);
      expect(SentEmail.findLatestSentEmailByType).toHaveBeenCalledTimes(1);
      expect(SentEmail.findLatestSentEmailByType).toHaveBeenCalledWith(
        ...sentEmailArgs
      );
    });
  });

  describe('updateSentEmail', () => {
    it('creates a record in the SentEmails table', async () => {
      const sentEmailArgs = ['uid', EMAIL_TYPE, { subscriptionId: 'sub_123' }];
      SentEmail.createSentEmail = jest.fn().mockResolvedValue({});
      await reminder.updateSentEmail(
        'uid',
        { subscriptionId: 'sub_123' },
        EMAIL_TYPE
      );
      expect(SentEmail.createSentEmail).toHaveBeenCalledTimes(1);
      expect(SentEmail.createSentEmail).toHaveBeenCalledWith(...sentEmailArgs);
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
      mockLog.error = jest.fn().mockReturnValue({});
      const result =
        await reminder.sendSubscriptionRenewalReminderEmail(subscription);
      expect(result).toBe(false);
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith(
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
      reminder.alreadySentEmail = jest.fn().mockResolvedValue(true);
      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );
      expect(result).toBe(false);
      expect(reminder.alreadySentEmail).toHaveBeenCalledTimes(1);
      expect(reminder.alreadySentEmail).toHaveBeenCalledWith(
        subscription.customer.metadata.userid,
        Math.floor(subscription.current_period_start * 1000),
        {
          subscriptionId: subscription.id,
          reminderDays: 7,
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
      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue({
          total_excluding_tax: invoicePreview.total_excluding_tax,
          tax: invoicePreview.tax,
          total: invoicePreview.total,
          currency: invoicePreview.currency,
          discount: null,
          discounts: [],
        });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue({
        id: subscription.latest_invoice,
        discount: { id: 'discount_ending' },
        discounts: [],
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
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue(formattedSubscription);
      mockStripeHelper.findPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);
      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );
      expect(result).toBe(true);
      expect(reminder.db.account).toHaveBeenCalledTimes(1);
      expect(reminder.db.account).toHaveBeenCalledWith(
        subscription.customer.metadata.userid
      );
      expect(mockStripeHelper.formatSubscriptionForEmail).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.formatSubscriptionForEmail).toHaveBeenCalledWith(
        subscription
      );
      expect(mockStripeHelper.findAbbrevPlanById).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.findAbbrevPlanById).toHaveBeenCalledWith(
        longPlan1.id
      );
      expect(
        mockStripeHelper.previewInvoiceBySubscriptionId
      ).toHaveBeenCalledTimes(1);
      expect(
        mockStripeHelper.previewInvoiceBySubscriptionId
      ).toHaveBeenCalledWith({
        subscriptionId: subscription.id,
      });
      expect(mockLog.info).toHaveBeenCalledTimes(1);
      expect(mockLog.info).toHaveBeenCalledWith(
        'sendSubscriptionRenewalReminderEmail',
        {
          message: 'Sending a renewal reminder email.',
          subscriptionId: subscription.id,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          currentDateMs: Date.now(),
          reminderLength: 7,
        }
      );
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).toHaveBeenCalledWith(account.emails, account, {
        acceptLanguage: account.locale,
        uid: 'uid',
        email: 'testo@test.test',
        subscription: formattedSubscription,
        reminderLength: 7,
        planInterval: 'month',
        showTax: false,
        invoiceTotalExcludingTaxInCents: invoicePreview.total_excluding_tax,
        invoiceTaxInCents: invoicePreview.tax,
        invoiceTotalInCents: invoicePreview.total,
        invoiceTotalCurrency: invoicePreview.currency,
        productMetadata: formattedSubscription.productMetadata,
        planConfig,
        discountEnding: true,
        hasDifferentDiscount: false,
      });
      expect(reminder.updateSentEmail).toHaveBeenCalledTimes(1);
      expect(reminder.updateSentEmail).toHaveBeenCalledWith(
        subscription.customer.metadata.userid,
        { subscriptionId: subscription.id, reminderDays: 7 },
        'subscriptionRenewalReminder'
      );
    });

    it('skips monthly reminder when no discount is ending', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue({
          total: invoicePreview.total,
          currency: invoicePreview.currency,
          discount: null,
          discounts: [],
        });
      // Monthly plan with no discount - should skip
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue({
        id: subscription.latest_invoice,
        discount: null,
        discounts: [],
      });
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(false);
      expect(mockLog.info).toHaveBeenCalledWith(
        'sendSubscriptionRenewalReminderEmail.skippingMonthlyNoDiscount',
        {
          subscriptionId: subscription.id,
          planId: longPlan1.id,
        }
      );
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).not.toHaveBeenCalled();
      expect(reminder.updateSentEmail).not.toHaveBeenCalled();
    });

    it('sends yearly reminder regardless of discount status', async () => {
      const yearlyPlan = require('../../test/local/payments/fixtures/stripe/plan_yearly.json');
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: yearlyPlan.amount,
        currency: yearlyPlan.currency,
        interval_count: yearlyPlan.interval_count,
        interval: yearlyPlan.interval,
      });
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue({
          total: invoicePreview.total,
          currency: invoicePreview.currency,
          discount: null,
          discounts: [],
        });
      // Yearly plan with no discount - should still send
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue({
        id: subscription.latest_invoice,
        discount: null,
        discounts: [],
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
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue(formattedSubscription);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        yearlyPlan.id
      );

      expect(result).toBe(true);
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).toHaveBeenCalledTimes(1);
      expect(reminder.updateSentEmail).toHaveBeenCalledTimes(1);
    });

    it('returns false if an error is caught when trying to send a reminder email', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue({});
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({});
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue({
          total_excluding_tax: invoicePreview.total_excluding_tax,
          tax: invoicePreview.tax,
          total: invoicePreview.total,
          currency: invoicePreview.currency,
          discount: null,
          discounts: [],
        });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue({
        id: subscription.latest_invoice,
        discount: { id: 'discount_ending' },
        discounts: [],
      });
      mockLog.info = jest.fn().mockReturnValue({});
      mockLog.error = jest.fn().mockReturnValue({});
      const errMessage = 'Something went wrong.';
      const throwErr = new Error(errMessage);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockRejectedValue(throwErr);
      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );
      expect(result).toBe(false);
      expect(reminder.db.account).toHaveBeenCalledTimes(1);
      expect(reminder.db.account).toHaveBeenCalledWith(
        subscription.customer.metadata.userid
      );
      expect(mockStripeHelper.formatSubscriptionForEmail).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.formatSubscriptionForEmail).toHaveBeenCalledWith(
        subscription
      );
      expect(mockStripeHelper.findAbbrevPlanById).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.findAbbrevPlanById).toHaveBeenCalledWith(
        longPlan1.id
      );
      expect(
        mockStripeHelper.previewInvoiceBySubscriptionId
      ).toHaveBeenCalledTimes(1);
      expect(
        mockStripeHelper.previewInvoiceBySubscriptionId
      ).toHaveBeenCalledWith({
        subscriptionId: subscription.id,
      });
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith(
        'sendSubscriptionRenewalReminderEmail',
        {
          err: throwErr,
          subscriptionId: subscription.id,
        }
      );
      expect(reminder.updateSentEmail).not.toHaveBeenCalled();
    });

    it('detects when discount on latest invoice is ending', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: { id: 'discount_123' },
        discounts: [],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: null,
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      expect(mockStripeHelper.getInvoice).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.getInvoice).toHaveBeenCalledWith('in_test123');

      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      expect(mailerCallArgs[2].discountEnding).toBe(true);
      expect(mailerCallArgs[2].hasDifferentDiscount).toBe(false);
    });

    it('detects when discount is ending with discounts array', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: null,
        discounts: [{ id: 'discount_123' }],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: null,
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      expect(mailerCallArgs[2].discountEnding).toBe(true);
      expect(mailerCallArgs[2].hasDifferentDiscount).toBe(false);
    });

    it('skips monthly plan reminders when discount changes but does not end', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: { id: 'discount_old' },
        discounts: [],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: { id: 'discount_new' },
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(false);
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).not.toHaveBeenCalled();
    });

    it('skips monthly plan reminders when discount remains the same', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: { id: 'di_same' },
        discounts: [],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: { id: 'di_same' },
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(false);
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).not.toHaveBeenCalled();
    });

    it('handles when latest_invoice is an expanded object with discount ending', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = {
        id: 'in_expanded',
        discount: { id: 'discount_456' },
        discounts: [],
      };

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: null,
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue({});
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      expect(mockStripeHelper.getInvoice).not.toHaveBeenCalled();

      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      expect(mailerCallArgs[2].discountEnding).toBe(true);
      expect(mailerCallArgs[2].hasDifferentDiscount).toBe(false);
    });

    it('skips monthly plan reminders when no discount on either invoice', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: null,
        discounts: [],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: null,
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(false);
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).not.toHaveBeenCalled();
    });

    it('skips monthly plan reminders when adding a discount to a full-price plan', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: null,
        discounts: [],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: { id: 'discount_new' },
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(false);
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).not.toHaveBeenCalled();
    });

    it('handles discount as string in discounts array', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: null,
        discounts: ['discount_string_id'],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: null,
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      expect(mailerCallArgs[2].discountEnding).toBe(true);
      expect(mailerCallArgs[2].hasDifferentDiscount).toBe(false);
    });

    it('skips monthly plan reminders with different discount in discounts arrays', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: null,
        discounts: [{ id: 'discount_old' }],
      };

      const mockUpcomingInvoice = {
        total: invoicePreview.total,
        currency: invoicePreview.currency,
        discount: null,
        discounts: [{ id: 'discount_new' }],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {
            privacyUrl: 'http://privacy',
            termsOfServiceUrl: 'http://tos',
          },
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoice);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(false);
      expect(
        reminder.mailer.sendSubscriptionRenewalReminderEmail
      ).not.toHaveBeenCalled();
    });

    it('includes tax information when invoice has tax', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: { id: 'discount_ending' },
        discounts: [],
      };

      const mockUpcomingInvoiceWithTax = {
        total_excluding_tax: 1000,
        tax: 200,
        total: 1200,
        currency: 'usd',
        discount: null,
        discounts: [],
        total_tax_amounts: [
          {
            amount: 200,
            inclusive: false,
            tax_rate: { display_name: 'Sales Tax' },
          },
        ],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {},
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoiceWithTax);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      const emailData = mailerCallArgs[2];
      expect(emailData.showTax).toBe(true);
      expect(emailData.invoiceTotalExcludingTaxInCents).toBe(1000);
      expect(emailData.invoiceTaxInCents).toBe(200);
      expect(emailData.invoiceTotalInCents).toBe(1200);
      expect(emailData.invoiceTotalCurrency).toBe('usd');
    });

    it('handles invoice when tax is 0', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: { id: 'discount_ending' },
        discounts: [],
      };

      const mockUpcomingInvoiceNoTax = {
        total_excluding_tax: 1000,
        tax: 0,
        total: 1000,
        currency: 'usd',
        discount: null,
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {},
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoiceNoTax);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      const emailData = mailerCallArgs[2];
      expect(emailData.showTax).toBe(false);
      expect(emailData.invoiceTotalExcludingTaxInCents).toBe(1000);
      expect(emailData.invoiceTaxInCents).toBe(0);
      expect(emailData.invoiceTotalInCents).toBe(1000);
      expect(emailData.invoiceTotalCurrency).toBe('usd');
    });

    it('handles invoice without tax', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'NZ',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: { id: 'discount_ending' },
        discounts: [],
      };

      const mockUpcomingInvoiceNullTax = {
        total_excluding_tax: 1000,
        tax: null,
        total: 1000,
        currency: 'usd',
        discount: null,
        discounts: [],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {},
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoiceNullTax);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      const emailData = mailerCallArgs[2];
      expect(emailData.showTax).toBe(false);
      expect(emailData.invoiceTotalExcludingTaxInCents).toBe(1000);
      expect(emailData.invoiceTaxInCents).toBeNull();
      expect(emailData.invoiceTotalInCents).toBe(1000);
      expect(emailData.invoiceTotalCurrency).toBe('usd');
    });

    it('handles invoice with inclusive tax (non-US)', async () => {
      const subscription = deepCopy(longSubscription1);
      subscription.customer = {
        email: 'abc@123.com',
        metadata: {
          userid: 'uid',
        },
      };
      subscription.latest_invoice = 'in_test123';

      const account = {
        emails: [],
        email: 'testo@test.test',
        locale: 'DE',
      };

      const mockInvoice = {
        id: 'in_test123',
        discount: { id: 'discount_ending' },
        discounts: [],
      };

      const mockUpcomingInvoiceWithInclusiveTax = {
        total_excluding_tax: 887,
        tax: 113,
        total: 1000,
        currency: 'eur',
        discount: null,
        discounts: [],
        total_tax_amounts: [
          { amount: 113, inclusive: true, tax_rate: { display_name: 'VAT' } },
        ],
      };

      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.db.account = jest.fn().mockResolvedValue(account);
      mockLog.info = jest.fn().mockReturnValue({});
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue({
          id: 'subscriptionId',
          productMetadata: {},
          planConfig: {},
        });
      mockStripeHelper.findAbbrevPlanById = jest.fn().mockResolvedValue({
        amount: longPlan1.amount,
        currency: longPlan1.currency,
        interval_count: longPlan1.interval_count,
        interval: longPlan1.interval,
      });
      mockStripeHelper.getInvoice = jest.fn().mockResolvedValue(mockInvoice);
      mockStripeHelper.previewInvoiceBySubscriptionId = jest
        .fn()
        .mockResolvedValue(mockUpcomingInvoiceWithInclusiveTax);
      reminder.mailer.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue({});
      Date.now = jest.fn(() => MOCK_DATETIME_MS);

      const result = await reminder.sendSubscriptionRenewalReminderEmail(
        subscription,
        longPlan1.id
      );

      expect(result).toBe(true);
      const mailerCallArgs =
        reminder.mailer.sendSubscriptionRenewalReminderEmail.mock.calls[0];
      const emailData = mailerCallArgs[2];
      expect(emailData.showTax).toBe(false);
      expect(emailData.invoiceTotalExcludingTaxInCents).toBe(887);
      expect(emailData.invoiceTaxInCents).toBe(113);
      expect(emailData.invoiceTotalInCents).toBe(1000);
      expect(emailData.invoiceTotalCurrency).toBe('eur');
    });
  });

  describe('sendSubscriptionEndingReminderEmail', () => {
    const mockSubscriptionId = 'sub_12345';
    const mockCustomerId = 'cus_12345';
    const mockPlanId = 'plan_12345';
    const mockUid = 'uid_12345';
    const mockSubCurrentPeriodStart = 1622073600;
    const mockSubCurrentPeriodEnd = 1624751600;
    const mockSubscription = {
      id: mockSubscriptionId,
      customer: mockCustomerId,
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
    let spyReportSentryError: any;
    let stubGetUidAndEmail: any;
    beforeEach(() => {
      spyReportSentryError = jest.spyOn(sentry, 'reportSentryError');
      stubGetUidAndEmail = jest
        .spyOn(authDbModule, 'getUidAndEmailByStripeCustomerId')
        .mockResolvedValue({ uid: mockUid, email: mockAccount.email });
      reminder.db.account = jest.fn().mockResolvedValue(mockAccount);
      reminder.alreadySentEmail = jest.fn().mockResolvedValue(false);
      reminder.mailer.sendSubscriptionEndingReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
      reminder.updateSentEmail = jest.fn().mockResolvedValue();
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockResolvedValue(mockFormattedSubscription);
      mockPurchaseForPriceId = jest.fn().mockReturnValue({
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
      mockProductConfigurationManager.getPageContentByPriceIds = jest
        .fn()
        .mockResolvedValue({
          purchaseForPriceId: mockPurchaseForPriceId,
        });
      mockChurnInterventionService.determineStaySubscribedEligibility = jest
        .fn()
        .mockResolvedValue({
          isEligibile: true,
          cmsChurnInterventionEntry: {
            ctaMessage: mockCtaMessage,
            ctaButtonUrl: mockProductPageUrl,
          },
        });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true if the email was sent successfully', async () => {
      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);

      expect(actual).toBe(true);
      expect(stubGetUidAndEmail).toHaveBeenCalledTimes(1);
      expect(stubGetUidAndEmail).toHaveBeenCalledWith(mockCustomerId);
      expect(reminder.alreadySentEmail).toHaveBeenCalledTimes(1);
      expect(reminder.alreadySentEmail).toHaveBeenCalledWith(
        mockUid,
        mockSubCurrentPeriodStart * 1000,
        { subscriptionId: mockSubscriptionId },
        'subscriptionEndingReminder'
      );
      expect(reminder.db.account).toHaveBeenCalledTimes(1);
      expect(reminder.db.account).toHaveBeenCalledWith(mockUid);
      expect(mockStripeHelper.formatSubscriptionForEmail).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.formatSubscriptionForEmail).toHaveBeenCalledWith(
        mockSubscription
      );
      expect(
        mockProductConfigurationManager.getPageContentByPriceIds
      ).toHaveBeenCalledTimes(1);
      expect(
        mockProductConfigurationManager.getPageContentByPriceIds
      ).toHaveBeenCalledWith([mockPlanId], mockAccount.locale);
      expect(mockPurchaseForPriceId).toHaveBeenCalledTimes(1);
      expect(mockPurchaseForPriceId).toHaveBeenCalledWith(mockPlanId);
      expect(
        mockChurnInterventionService.determineStaySubscribedEligibility
      ).toHaveBeenCalledTimes(1);
      expect(
        mockChurnInterventionService.determineStaySubscribedEligibility
      ).toHaveBeenCalledWith(mockUid, mockSubscriptionId, mockAccount.locale);
      expect(
        reminder.mailer.sendSubscriptionEndingReminderEmail
      ).toHaveBeenCalledTimes(1);
      expect(reminder.updateSentEmail).toHaveBeenCalledTimes(1);
      expect(reminder.updateSentEmail).toHaveBeenCalledWith(
        mockUid,
        { subscriptionId: mockSubscriptionId },
        'subscriptionEndingReminder'
      );
    });

    it('should return false if customer uid is not provided', async () => {
      stubGetUidAndEmail.mockResolvedValue({ uid: null, email: null });

      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);
      expect(actual).toBe(false);
      expect(stubGetUidAndEmail).toHaveBeenCalledTimes(1);
      expect(
        reminder.mailer.sendSubscriptionEndingReminderEmail
      ).not.toHaveBeenCalled();
      expect(spyReportSentryError).toHaveBeenCalledTimes(1);
    });

    it('should return false if email already sent', async () => {
      reminder.alreadySentEmail = jest.fn().mockResolvedValue(true);

      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);
      expect(actual).toBe(false);
      expect(reminder.alreadySentEmail).toHaveBeenCalledTimes(1);
      expect(spyReportSentryError).not.toHaveBeenCalled();
      expect(
        reminder.mailer.sendSubscriptionEndingReminderEmail
      ).not.toHaveBeenCalled();
    });

    it('should return false if an error occurs when sending the email', async () => {
      const mockError = new Error('Failed to send email');
      mockStripeHelper.formatSubscriptionForEmail = jest
        .fn()
        .mockRejectedValue(mockError);

      const actual =
        await reminder.sendSubscriptionEndingReminderEmail(mockSubscription);
      expect(actual).toBe(false);
      expect(spyReportSentryError).toHaveBeenCalledTimes(1);
      expect(spyReportSentryError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('sendReminders', () => {
    beforeEach(() => {
      reminder.getEligiblePlans = jest
        .fn()
        .mockResolvedValue([longPlan1, longPlan2]);
      reminder.getStartAndEndTimes = jest.fn().mockReturnValue(MOCK_INTERVAL);
      async function* genSubscriptionForPlan1() {
        yield longSubscription1;
      }
      async function* genSubscriptionForPlan2() {
        yield longSubscription2;
      }
      const stub = jest.spyOn(
        mockStripeHelper,
        'findActiveSubscriptionsByPlanId'
      );
      stub
        .mockImplementationOnce(genSubscriptionForPlan1)
        .mockImplementationOnce(genSubscriptionForPlan2);
    });
    it('returns true if it can process all eligible subscriptions', async () => {
      reminder.sendSubscriptionRenewalReminderEmail = jest
        .fn()
        .mockResolvedValue({});
      const result = await reminder.sendReminders();
      expect(result).toBe(true);
      expect(reminder.getEligiblePlans).toHaveBeenCalledTimes(1);
      expect(reminder.getStartAndEndTimes).toHaveBeenCalledTimes(2);
      expect(reminder.getStartAndEndTimes).toHaveBeenCalledWith(
        Duration.fromObject({ days: 15 })
      );
      expect(reminder.getStartAndEndTimes).toHaveBeenCalledWith(
        Duration.fromObject({ days: 7 })
      );
      // We iterate through each plan, longPlan1 and longPlan2, and there is one
      // subscription, longSubscription1 and longSubscription2 respectively,
      // returned for each plan.
      expect(
        mockStripeHelper.findActiveSubscriptionsByPlanId
      ).toHaveBeenCalledTimes(2);
      expect(
        reminder.sendSubscriptionRenewalReminderEmail
      ).toHaveBeenCalledTimes(2);
    });
    it('returns false and logs an error for any eligible subscription that it fails to process', async () => {
      mockLog.error = jest.fn().mockReturnValue({});
      const errMessage = 'Something went wrong.';
      const throwErr = new Error(errMessage);
      const stub = jest.spyOn(reminder, 'sendSubscriptionRenewalReminderEmail');
      stub.mockRejectedValueOnce(throwErr).mockResolvedValueOnce({});
      const result = await reminder.sendReminders();
      expect(result).toBe(false);
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith(
        'sendSubscriptionRenewalReminderEmail',
        {
          err: throwErr,
          subscriptionId: longSubscription1.id,
          reminderDuration: 7,
        }
      );
      expect(stub).toHaveBeenCalledTimes(2);
      expect(stub.mock.calls[0][0]).toEqual(longSubscription1);
      expect(stub.mock.calls[1][0]).toEqual(longSubscription2);
    });

    it('calls sendEndingReminders if enabled in config', async () => {
      reminder.sendEndingReminders = jest.fn().mockResolvedValue({});
      reminder.endingReminderEnabled = true;
      await reminder.sendReminders();

      expect(reminder.sendEndingReminders).toHaveBeenCalledWith(
        Duration.fromObject({ days: mockMonthlyReminderDuration }),
        'monthly'
      );
      expect(reminder.sendEndingReminders).toHaveBeenCalledWith(
        Duration.fromObject({ days: mockYearlyReminderDuration }),
        'yearly'
      );
    });

    it('calls sendEndingReminders for daily if dailyEndingReminderDuration is provided', async () => {
      const mockDailyReminderDays = 3;
      reminder.sendEndingReminders = jest.fn().mockResolvedValue({});
      reminder.endingReminderEnabled = true;
      reminder.dailyEndingReminderDuration = Duration.fromObject({
        days: mockDailyReminderDays,
      });
      await reminder.sendReminders();

      expect(reminder.sendEndingReminders).toHaveBeenCalledWith(
        Duration.fromObject({ days: mockDailyReminderDays }),
        'daily'
      );
      expect(reminder.sendEndingReminders).toHaveBeenCalledWith(
        Duration.fromObject({ days: mockMonthlyReminderDuration }),
        'monthly'
      );
      expect(reminder.sendEndingReminders).toHaveBeenCalledWith(
        Duration.fromObject({ days: mockYearlyReminderDuration }),
        'yearly'
      );
    });

    it('sends 15-day reminders only to yearly plans and 7-day reminders only to monthly plans', async () => {
      const yearlyPlan = require('../../test/local/payments/fixtures/stripe/plan_yearly.json');
      reminder.getEligiblePlans = jest.fn().mockResolvedValue([
        longPlan1, // monthly
        longPlan2, // monthly
        yearlyPlan, // yearly
      ]);
      reminder.getStartAndEndTimes = jest.fn().mockReturnValue(MOCK_INTERVAL);

      const sendRenewalStub = jest.spyOn(
        reminder,
        'sendRenewalRemindersForDuration'
      );
      sendRenewalStub.mockResolvedValue(true);

      await reminder.sendReminders();

      // Should be called twice: once for yearly plans, once for monthly plans
      expect(sendRenewalStub).toHaveBeenCalledTimes(2);

      // First call: yearly plans with 15-day duration
      const firstCallArgs = sendRenewalStub.mock.calls[0];
      expect(firstCallArgs[0].length).toEqual(1);
      expect(firstCallArgs[0][0].id).toEqual(yearlyPlan.id);
      expect(firstCallArgs[1].as('days')).toEqual(15);

      // Second call: monthly plans with 7-day duration
      const secondCallArgs = sendRenewalStub.mock.calls[1];
      expect(secondCallArgs[0].length).toEqual(2);
      expect(secondCallArgs[0][0].id).toEqual(longPlan1.id);
      expect(secondCallArgs[0][1].id).toEqual(longPlan2.id);
      expect(secondCallArgs[1].as('days')).toEqual(7);
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
      mockStatsD.increment = jest.fn().mockReturnValue({});
      mockSubscriptionManager.listCancelOnDateGenerator = jest
        .fn()
        .mockImplementation(function* () {
          yield mockSubscriptionMonthly;
          yield mockSubscriptionYearly;
        });
      reminder.sendSubscriptionEndingReminderEmail = jest
        .fn()
        .mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('successfully sends an email for monthly subscriptions and increments sendCount', async () => {
      await reminder.sendEndingReminders(mockDuration, mockSubplatInterval);
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'subscription-reminders.endingReminders.monthly'
      );
      expect(
        reminder.sendSubscriptionEndingReminderEmail
      ).toHaveBeenCalledTimes(1);
      expect(reminder.sendSubscriptionEndingReminderEmail).toHaveBeenCalledWith(
        mockSubscriptionMonthly
      );
      expect(reminder.log.info).toHaveBeenCalledTimes(2);
      expect(reminder.log.info).toHaveBeenCalledWith(
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
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'subscription-reminders.endingReminders.yearly'
      );
      expect(
        reminder.sendSubscriptionEndingReminderEmail
      ).toHaveBeenCalledTimes(1);
      expect(reminder.sendSubscriptionEndingReminderEmail).toHaveBeenCalledWith(
        mockSubscriptionYearly
      );
      expect(reminder.log.info).toHaveBeenCalledTimes(2);
      expect(reminder.log.info).toHaveBeenCalledWith(
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
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'subscription-reminders.endingReminders.weekly'
      );
      expect(
        reminder.sendSubscriptionEndingReminderEmail
      ).not.toHaveBeenCalled();
      expect(reminder.log.info).toHaveBeenCalledWith(
        'sendSubscriptionEndingReminderEmail.sendEndingReminders.end',
        {
          reminderLengthDays: 14,
          subplatInterval: 'weekly',
          sendCount: 0,
        }
      );
    });

    it('it does not increment sendCount if no email is sent', async () => {
      reminder.sendSubscriptionEndingReminderEmail = jest
        .fn()
        .mockResolvedValue(false);

      await reminder.sendEndingReminders(mockDuration, mockSubplatInterval);
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'subscription-reminders.endingReminders.monthly'
      );
      expect(
        reminder.sendSubscriptionEndingReminderEmail
      ).toHaveBeenCalledTimes(1);
      expect(reminder.sendSubscriptionEndingReminderEmail).toHaveBeenCalledWith(
        mockSubscriptionMonthly
      );
      expect(reminder.log.info).toHaveBeenCalledWith(
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
      const mockSubscriptionNoRecurring = {
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
      mockSubscriptionManager.listCancelOnDateGenerator = jest
        .fn()
        .mockImplementation(function* () {
          yield mockSubscriptionNoRecurring;
        });
      try {
        await reminder.sendEndingReminders(mockDuration, mockSubplatInterval);
        throw new Error('should have thrown an error');
      } catch (error: any) {
        expect(error instanceof Error).toBe(true);
        expect(error.info.priceId).toEqual(mockPriceId);
        expect(
          reminder.sendSubscriptionEndingReminderEmail
        ).not.toHaveBeenCalled();
      }
    });
  });
});
