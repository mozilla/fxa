/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';
import Stripe from 'stripe';

import { ConfigType } from '../../config';
import { reportSentryError } from '../sentry';
import { SentEmailParams, Plan } from 'fxa-shared/subscriptions/types';
import { StripeHelper, TimeSpanInS } from './stripe';
import { SentEmail } from 'fxa-shared/db/models/auth';

export const EMAIL_TYPE: string = 'subscriptionRenewalReminder';
const DAYS_IN_A_WEEK: number = 7;
const DAYS_IN_A_MONTH: number = 30;
const DAYS_IN_A_YEAR: number = 365;
export const MS_IN_A_DAY: number = 24 * 60 * 60 * 1000;

interface EligiblePlansByInterval {
  day(plan: Plan, planLength: number): Boolean;
  week(plan: Plan, planLength: number): Boolean;
  month(plan: Plan, planLength: number): Boolean;
  year(plan: Plan, planLength: number): Boolean;
}

const eligiblePlansByInterval: EligiblePlansByInterval = {
  day: (plan, planLength) => plan.interval_count >= planLength,
  week: (plan, planLength) =>
    plan.interval_count >= planLength / DAYS_IN_A_WEEK,
  month: (plan, planLength) =>
    plan.interval_count >= planLength / DAYS_IN_A_MONTH,
  year: (plan, planLength) =>
    plan.interval_count >= planLength / DAYS_IN_A_YEAR,
};

export class SubscriptionReminders {
  private db: any;
  private mailer: any;
  private stripeHelper: StripeHelper;

  constructor(
    private log: Logger,
    config: ConfigType,
    private planLength: number,
    private reminderLength: number,
    db: any,
    mailer: any,
    stripeHelper: StripeHelper
  ) {
    this.db = db;
    this.mailer = mailer;
    this.planLength = planLength;
    this.reminderLength = reminderLength;
    this.stripeHelper = stripeHelper;
  }

  /**
   * For all possible plan.intervals, determine if the plan is sufficiently
   * long based on planLength.
   */
  private isEligiblePlan(plan: Plan): Boolean {
    const { interval } = plan;
    if (eligiblePlansByInterval[interval]) {
      return eligiblePlansByInterval[interval](plan, this.planLength);
    }
    return false;
  }

  private async getEligiblePlans(): Promise<Plan[]> {
    const allPlans = await this.stripeHelper.allPlans();
    return allPlans.filter((plan) => this.isEligiblePlan(plan));
  }

  /**
   * Returns a window of time in seconds { startTimeS, endTimeS }
   * that is exactly one day, reminderLength days from now in UTC.
   */
  private getStartAndEndTimes(reminderLengthMs: number): TimeSpanInS {
    const reminderDay = new Date(Date.now() + reminderLengthMs);
    // Get hour 0, minute 0, second 0 for today's date
    const startingTimestamp = new Date(
      Date.UTC(
        reminderDay.getUTCFullYear(),
        reminderDay.getUTCMonth(),
        reminderDay.getUTCDate(),
        0,
        0,
        0
      )
    );
    // Get hour 0, minute, 0, second 0 for one day from today's date
    const endingTimestamp = new Date(startingTimestamp.getTime() + MS_IN_A_DAY);

    const startTimeS = Math.floor(startingTimestamp.getTime() / 1000);
    const endTimeS = Math.floor(endingTimestamp.getTime() / 1000);
    return {
      startTimeS,
      endTimeS,
    };
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

  private async updateSentEmail(uid: string, emailParams: SentEmailParams) {
    await SentEmail.createSentEmail(uid, EMAIL_TYPE, emailParams);
  }

  /**
   * Send out a renewal reminder email if we haven't already sent one.
   */
  async sendSubscriptionRenewalReminderEmail(
    subscription: Stripe.Subscription
  ): Promise<Boolean> {
    const customer: Stripe.Customer | Stripe.DeletedCustomer | string =
      subscription.customer;
    if (typeof customer === 'string' || customer?.deleted) {
      return false;
    }
    const uid = customer.metadata.userid;
    if (!uid) {
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
      await this.mailer.sendSubscriptionRenewalReminderEmail(
        account.emails,
        account,
        {
          acceptLanguage: account.locale,
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
    const timePeriod = this.getStartAndEndTimes(
      this.reminderLength * MS_IN_A_DAY
    );
    for (const { plan_id } of plans) {
      // 3
      for await (const subscription of this.stripeHelper.findActiveSubscriptionsByPlanId(
        plan_id,
        timePeriod
      )) {
        try {
          await this.sendSubscriptionRenewalReminderEmail(subscription);
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
