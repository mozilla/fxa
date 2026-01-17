/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import assert from 'assert';
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { DateTime, Duration, Interval } from 'luxon';

import { reportSentryError } from '../sentry';
import { SentEmailParams, Plan } from 'fxa-shared/subscriptions/types';
import { StripeHelper } from './stripe';
import { SentEmail } from 'fxa-shared/db/models/auth';
import {
  getSubplatIntervalFromSubscription,
  SubplatInterval,
  type CustomerManager,
  type SubscriptionManager,
} from '@fxa/payments/customer';
import type { StripeSubscription } from '@fxa/payments/stripe';
import type { ChurnInterventionService } from '@fxa/payments/management';
import type { ProductConfigurationManager } from '@fxa/shared/cms';
import type { StatsD } from 'hot-shots';

type EmailType = 'subscriptionRenewalReminder' | 'subscriptionEndingReminder';

// Translate dict from Stripe.Plan.interval to corresponding Duration properties
const planIntervalsToDuration = {
  day: 'days',
  week: 'weeks',
  month: 'months',
  year: 'years',
};

interface EndingRemindersOptions {
  enabled: boolean;
  paymentsNextUrl: string;
  dailyReminderDays?: number;
  monthlyReminderDays: number;
  yearlyReminderDays: number;
}

export class SubscriptionReminders {
  private db: any;
  private mailer: any;
  private statsd: StatsD;
  private planDuration: Duration;
  private reminderDuration: Duration;
  private endingReminderEnabled: boolean;
  private dailyEndingReminderDuration: Duration | undefined;
  private monthlyEndingReminderDuration: Duration;
  private yearlyEndingReminderDuration: Duration;
  private paymentsNextUrl: string;
  private stripeHelper: StripeHelper;
  private subscriptionManager: SubscriptionManager;
  private customerManager: CustomerManager;
  private churnInterventionService: ChurnInterventionService;
  private productConfigurationManager: ProductConfigurationManager;

  constructor(
    private log: Logger,
    planLength: number,
    reminderLength: number,
    endingReminderOptions: EndingRemindersOptions,
    db: any,
    mailer: any,
    statsd: StatsD,
    stripeHelper: StripeHelper,
    subscriptionManager: SubscriptionManager,
    customerManager: CustomerManager,
    churnInterventionService: ChurnInterventionService,
    productConfigurationManager: ProductConfigurationManager
  ) {
    this.db = db;
    this.mailer = mailer;
    this.statsd = statsd;
    this.planDuration = Duration.fromObject({ days: planLength });
    this.reminderDuration = Duration.fromObject({ days: reminderLength });
    this.endingReminderEnabled = endingReminderOptions.enabled;
    if (endingReminderOptions.dailyReminderDays) {
      this.dailyEndingReminderDuration = Duration.fromObject({
        days: endingReminderOptions.dailyReminderDays,
      });
    }
    this.monthlyEndingReminderDuration = Duration.fromObject({
      days: endingReminderOptions.monthlyReminderDays,
    });
    this.yearlyEndingReminderDuration = Duration.fromObject({
      days: endingReminderOptions.yearlyReminderDays,
    });
    this.paymentsNextUrl = endingReminderOptions.paymentsNextUrl;
    this.stripeHelper = stripeHelper;
    this.subscriptionManager = subscriptionManager;
    this.customerManager = customerManager;
    this.churnInterventionService = churnInterventionService;
    this.productConfigurationManager = productConfigurationManager;
  }

  /**
   * For all possible plan.intervals, determine if the plan is sufficiently
   * long based on planLength.
   */
  private isEligiblePlan(plan: Plan): boolean {
    const selectedPlanDuration = Duration.fromObject({
      [planIntervalsToDuration[plan.interval]]: plan.interval_count,
    });
    return selectedPlanDuration.as('days') >= this.planDuration.as('days');
  }

  private async getEligiblePlans(): Promise<Plan[]> {
    const allPlans = await this.stripeHelper.allAbbrevPlans();
    return allPlans.filter((plan) => this.isEligiblePlan(plan));
  }

  /**
   * Returns a window of time in seconds that is exactly one day, reminderLength
   * days from now in UTC.
   */
  private getStartAndEndTimes(reminderDuration: Duration) {
    const reminderDate = DateTime.utc()
      .plus(reminderDuration)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const duration = Duration.fromObject({ days: 1 });
    const interval = Interval.after(reminderDate, duration);
    assert(interval.isValid, 'Unexpected invalid interval.');
    return interval;
  }

  private async alreadySentEmail(
    uid: string,
    currentPeriodStartMs: number,
    emailParams: SentEmailParams,
    emailType: EmailType
  ) {
    const emailRecord = await SentEmail.findLatestSentEmailByType(
      uid,
      emailType,
      emailParams
    );
    // This could be the first email for a given subscription or a subsequent one.
    return !!emailRecord && emailRecord.sentAt > currentPeriodStartMs;
  }

  private updateSentEmail(
    uid: string,
    emailParams: SentEmailParams,
    emailType: EmailType
  ) {
    return SentEmail.createSentEmail(uid, emailType, emailParams);
  }

  /**
   * Send out a renewal reminder email if we haven't already sent one.
   */
  async sendSubscriptionEndingReminderEmail(
    subscription: StripeSubscription
  ): Promise<boolean> {
    const customer = await this.customerManager.retrieve(subscription.customer);
    const uid = customer.metadata?.userid;
    if (!uid) {
      this.log.error('sendSubscriptionEndingReminderEmail', {
        customer,
        subscriptionId: subscription.id,
      });
      reportSentryError(
        new Error(
          `No uid found for the customer for subscription: ${subscription.id}.`
        )
      );
      return false;
    }
    const emailParams = { subscriptionId: subscription.id };
    if (
      await this.alreadySentEmail(
        uid,
        Math.floor(subscription.current_period_start * 1000),
        emailParams,
        'subscriptionEndingReminder'
      )
    ) {
      return false;
    }
    try {
      const account = await this.db.account(uid);
      this.log.info('sendSubscriptionEndingReminderEmail', {
        message: 'Sending a stay subscribed reminder email.',
        subscriptionId: subscription.id,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        currentDateMs: Date.now(),
      });
      const { email } = account;
      const formattedSubscription =
        await this.stripeHelper.formatSubscriptionForEmail(subscription);
      const cmsPageContent =
        await this.productConfigurationManager.getPageContentByPriceIds(
          [formattedSubscription.planId],
          account.locale
        );
      const purchase = cmsPageContent.purchaseForPriceId(
        formattedSubscription.planId
      );
      const { isEligible, cmsChurnInterventionEntry } =
        await this.churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscription.id,
          account.locale
        );
      const priceSubplatInterval =
        getSubplatIntervalFromSubscription(subscription);
      const offeringId = purchase.offering.apiIdentifier;
      await this.mailer.sendSubscriptionEndingReminderEmail(
        account.emails,
        account,
        {
          uid,
          email,
          acceptLanguage: account.locale,
          subscription: formattedSubscription,
          reminderLength: this.reminderDuration.as('days'),
          productMetadata: formattedSubscription.productMetadata,
          planConfig: formattedSubscription.planConfig,
          serviceLastActiveDate: new Date(
            subscription.current_period_end * 1000
          ),
          subscriptionSupportUrl:
            purchase.offering.commonContent.localizations.at(0)?.supportUrl ||
            purchase.offering.commonContent.supportUrl,
          productIconURLNew:
            purchase.purchaseDetails.localizations.at(0)?.webIcon ||
            purchase.purchaseDetails.webIcon,
          churnTermsUrl: new URL(
            `${this.paymentsNextUrl}/${offeringId}/${priceSubplatInterval}/stay-subscribed/loyalty-discount/terms`
          ).toString(),
          ctaButtonLabel: cmsChurnInterventionEntry?.ctaMessage,
          ctaButtonUrl: cmsChurnInterventionEntry?.productPageUrl,
          showChurn: isEligible,
        }
      );
      await this.updateSentEmail(
        uid,
        emailParams,
        'subscriptionEndingReminder'
      );
      return true;
    } catch (err) {
      this.log.error('sendSubscriptionEndingReminderEmail', {
        err,
        subscriptionId: subscription.id,
      });
      reportSentryError(err);
      return false;
    }
  }

  /**
   * Send out a renewal reminder email if we haven't already sent one.
   */
  async sendSubscriptionRenewalReminderEmail(
    subscription: Stripe.Subscription,
    planId: string
  ): Promise<boolean> {
    const { customer } = subscription;
    if (typeof customer === 'string' || customer?.deleted) {
      return false;
    }
    const uid = customer.metadata.userid;
    if (!uid) {
      this.log.error('sendSubscriptionRenewalReminderEmail', {
        customer,
        subscriptionId: subscription.id,
      });
      reportSentryError(
        new Error(
          `No uid found for the customer for subscription: ${subscription.id}.`
        )
      );
      return false;
    }
    const emailParams = { subscriptionId: subscription.id };
    if (
      await this.alreadySentEmail(
        uid,
        Math.floor(subscription.current_period_start * 1000),
        emailParams,
        'subscriptionRenewalReminder'
      )
    ) {
      return false;
    }
    try {
      const account = await this.db.account(uid);
      this.log.info('sendSubscriptionRenewalReminderEmail', {
        message: 'Sending a renewal reminder email.',
        subscriptionId: subscription.id,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        currentDateMs: Date.now(),
      });
      const { email } = account;
      const formattedSubscription =
        await this.stripeHelper.formatSubscriptionForEmail(subscription);
      const { interval_count, interval } =
        await this.stripeHelper.findAbbrevPlanById(planId);
      const invoicePreview =
        await this.stripeHelper.previewInvoiceBySubscriptionId({
          subscriptionId: subscription.id,
        });
      await this.mailer.sendSubscriptionRenewalReminderEmail(
        account.emails,
        account,
        {
          uid,
          email,
          acceptLanguage: account.locale,
          subscription: formattedSubscription,
          reminderLength: this.reminderDuration.as('days'),
          planIntervalCount: interval_count,
          planInterval: interval,
          // Using invoice prefix instead of plan to accommodate `yarn write-emails`.
          invoiceTotalInCents: invoicePreview.total,
          invoiceTotalCurrency: invoicePreview.currency,
          productMetadata: formattedSubscription.productMetadata,
          planConfig: formattedSubscription.planConfig,
        }
      );
      await this.updateSentEmail(
        uid,
        emailParams,
        'subscriptionRenewalReminder'
      );
      return true;
    } catch (err) {
      this.log.error('sendSubscriptionRenewalReminderEmail', {
        err,
        subscriptionId: subscription.id,
      });
      reportSentryError(err);
      return false;
    }
  }

  async sendEndingReminders(
    duration: Duration,
    subplatInterval: SubplatInterval
  ) {
    this.log.info(
      'sendSubscriptionEndingReminderEmail.sendEndingReminders.start',
      { reminderLengthDays: duration.days, subplatInterval }
    );
    this.statsd.increment(
      `subscription-reminders.endingReminders.${subplatInterval}`
    );
    let sendCount = 0;
    const timePeriod = this.getStartAndEndTimes(duration);
    for await (const subscription of this.subscriptionManager.listCancelOnDateGenerator(
      {
        gte: timePeriod.start.toSeconds(),
        lt: timePeriod.end.toSeconds(),
      }
    )) {
      const priceSubplatInterval =
        getSubplatIntervalFromSubscription(subscription);
      if (subplatInterval !== priceSubplatInterval) {
        continue;
      }

      const emailSent =
        await this.sendSubscriptionEndingReminderEmail(subscription);
      if (emailSent) {
        sendCount++;
      }
    }
    this.log.info(
      'sendSubscriptionEndingReminderEmail.sendEndingReminders.end',
      { reminderLengthDays: duration.days, subplatInterval, sendCount }
    );
  }

  /**
   * Sends a reminder email for all active subscriptions for all plans
   * as long or longer than `planLength`:
   *   1. Get a list of all plans of sufficient `planLength`
   *   2. For each plan get active subscriptions with `current_period_end`
   *      dates `reminderLength` away from now.
   *   3. Send a reminder email if one hasn't already been sent.
   *   4. If enabled, send subscription ending reminder emails if one
   *      hasn't already been sent.
   */
  public async sendReminders() {
    let success = true;

    // 1
    const plans = await this.getEligiblePlans();

    // 2
    const timePeriod = this.getStartAndEndTimes(this.reminderDuration);
    for (const { plan_id } of plans) {
      // 3
      for await (const subscription of this.stripeHelper.findActiveSubscriptionsByPlanId(
        plan_id,
        {
          gte: timePeriod.start.toSeconds(),
          lt: timePeriod.end.toSeconds(),
        }
      )) {
        try {
          await this.sendSubscriptionRenewalReminderEmail(
            subscription,
            plan_id
          );
        } catch (err) {
          this.log.error('sendSubscriptionRenewalReminderEmail', {
            err,
            subscriptionId: subscription.id,
          });
          reportSentryError(err);
          success = false;
        }
      }
    }

    // 4
    if (this.endingReminderEnabled) {
      // Daily
      if (this.dailyEndingReminderDuration) {
        await this.sendEndingReminders(
          this.dailyEndingReminderDuration,
          SubplatInterval.Daily
        );
      }
      // Monthly
      await this.sendEndingReminders(
        this.monthlyEndingReminderDuration,
        SubplatInterval.Monthly
      );
      // Yearly
      await this.sendEndingReminders(
        this.yearlyEndingReminderDuration,
        SubplatInterval.Yearly
      );
    }

    return success;
  }
}
