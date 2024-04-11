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

export const EMAIL_TYPE = 'subscriptionRenewalReminder';

// Translate dict from Stripe.Plan.interval to corresponding Duration properties
const planIntervalsToDuration = {
  day: 'days',
  week: 'weeks',
  month: 'months',
  year: 'years',
};

export class SubscriptionReminders {
  private db: any;
  private mailer: any;
  private planDuration: Duration;
  private reminderDuration: Duration;
  private stripeHelper: StripeHelper;

  constructor(
    private log: Logger,
    planLength: number,
    reminderLength: number,
    db: any,
    mailer: any,
    stripeHelper: StripeHelper
  ) {
    this.db = db;
    this.mailer = mailer;
    this.planDuration = Duration.fromObject({ days: planLength });
    this.reminderDuration = Duration.fromObject({ days: reminderLength });
    this.stripeHelper = stripeHelper;
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
  private getStartAndEndTimes() {
    const reminderDate = DateTime.utc()
      .plus(this.reminderDuration)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const duration = Duration.fromObject({ days: 1 });
    const interval = Interval.after(reminderDate, duration);
    assert(interval.isValid, 'Unexpected invalid interval.');
    return interval;
  }

  private async alreadySentEmail(
    uid: string,
    currentPeriodStartMs: number,
    emailParams: SentEmailParams
  ) {
    const emailRecord = await SentEmail.findLatestSentEmailByType(
      uid,
      EMAIL_TYPE,
      emailParams
    );
    // This could be the first email for a given subscription or a subsequent one.
    return !!emailRecord && emailRecord.sentAt > currentPeriodStartMs;
  }

  private updateSentEmail(uid: string, emailParams: SentEmailParams) {
    return SentEmail.createSentEmail(uid, EMAIL_TYPE, emailParams);
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
        emailParams
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
      await this.updateSentEmail(uid, emailParams);
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

  /**
   * Sends a reminder email for all active subscriptions for all plans
   * as long or longer than `planLength`:
   *   1. Get a list of all plans of sufficient `planLength`
   *   2. For each plan get active subscriptions with `current_period_end`
   *      dates `reminderLength` away from now.
   *   3. Send a reminder email if one hasn't already been sent.
   */
  public async sendReminders() {
    let success = true;

    // 1
    const plans = await this.getEligiblePlans();

    // 2
    const timePeriod = this.getStartAndEndTimes();
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
    return success;
  }
}
