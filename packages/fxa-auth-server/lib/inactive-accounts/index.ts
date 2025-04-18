/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { StatsD } from 'hot-shots';
import isEqual from 'lodash/isEqual';

import {
  CloudTaskOptions,
  EmailTypes,
  SendEmailTaskPayload,
  InactiveAccountEmailTasks,
  InactiveAccountEmailTasksFactory,
  ReasonForDeletion,
  DeleteAccountTasks,
} from '@fxa/shared/cloud-tasks';
import OAuthDb from '../oauth/db';

import { ConfigType } from '../../config';
import { AccountEventsManager } from '../account-events';
import { DB } from '../db';
import { AuthRequest } from '../types';
import {
  emailVerificationQuery,
  hasAccessToken,
  hasActiveRefreshToken,
  hasActiveSessionToken,
  securityEventsQuery,
} from './active-status';
import { GleanMetricsType } from '../metrics/glean';
import { Logger } from 'mozlog';
import {
  EmailBounce,
  getAccountCustomerByUid,
} from 'fxa-shared/db/models/auth';
import { BOUNCE_TYPES } from 'fxa-shared/db/models/auth/email-bounce';

const aDayInMs = 24 * 60 * 60 * 1000;
const sixtyDaysInMs = 60 * aDayInMs;

/**
 * The backend Glean integration was built for the auth-server API endpoints so
 * it presumes the presence of a client/user request.  We need to adapt it for
 * use in a cloud task / scripting environment.
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !  Note that this is for operational metrics so we are not checking for    !
 * !  the metrics enabled account pref.                                       !
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
export const requestForGlean = {
  app: {
    clientAddress: '',
    isMetricsEnabled: () => true,
    metricsContext: () => ({}),
    ua: {},
  },
  auth: {},
  headers: {
    'user-agent': '',
  },
} as unknown as AuthRequest;

export const isCloudTaskAlreadyExistsError = (error) =>
  error.code === 10 && error.message.includes('entity already exists');

export type InactiveStatusOAuthDb = Pick<
  typeof OAuthDb,
  'getAccessTokensByUid' | 'getRefreshTokensByUid'
>;
export type NotificationAttempt = 'first' | 'second' | 'final';
export type GleanEmailSkippedEvent = `${NotificationAttempt}EmailSkipped`;
export type GleanEmailTaskRequestEvent =
  `${NotificationAttempt}EmailTaskRequest`;
export type GleanEmailTaskEnqueuedEvent =
  `${NotificationAttempt}EmailTaskEnqueued`;
export type GleanEmailTaskRejectedEvent =
  `${NotificationAttempt}EmailTaskRejected`;
export type InactiveAccountEmailTemplate =
  `inactiveAccount${Capitalize<NotificationAttempt>}Warning`;
export type EmailSenderFn =
  `send${Capitalize<InactiveAccountEmailTemplate>}Email`;
export type TaskScheduler = `schedule${Capitalize<NotificationAttempt>}Email`;
export type InactiveAccountNotificationHandlerValues = {
  attempt: NotificationAttempt;
  nextEmailType?: Omit<
    EmailTypes,
    EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION
  >;
  gleanEmailSkippedEvent: GleanEmailSkippedEvent;
  gleanEmailTaskRequestEvent: GleanEmailTaskRequestEvent;
  gleanEmailTaskEnqueuedEvent: GleanEmailTaskEnqueuedEvent;
  gleanEmailTaskRejectedEvent: GleanEmailTaskRejectedEvent;
  emailSender: EmailSenderFn;
  emailTemplate: InactiveAccountEmailTemplate;
  taskScheduler: TaskScheduler;
  timeToDeletion: number;
};
export const emailTypeToHandlerVals: Record<
  EmailTypes,
  InactiveAccountNotificationHandlerValues
> = {
  [EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION]: {
    attempt: 'first',
    nextEmailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
    gleanEmailSkippedEvent: 'firstEmailSkipped',
    gleanEmailTaskRequestEvent: 'firstEmailTaskRequest',
    gleanEmailTaskEnqueuedEvent: 'firstEmailTaskEnqueued',
    gleanEmailTaskRejectedEvent: 'firstEmailTaskRejected',
    emailSender: 'sendInactiveAccountFirstWarningEmail',
    emailTemplate: 'inactiveAccountFirstWarning',
    timeToDeletion: sixtyDaysInMs,
    taskScheduler: 'scheduleFirstEmail',
  },
  [EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION]: {
    attempt: 'second',
    nextEmailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
    gleanEmailSkippedEvent: 'secondEmailSkipped',
    gleanEmailTaskRequestEvent: 'secondEmailTaskRequest',
    gleanEmailTaskEnqueuedEvent: 'secondEmailTaskEnqueued',
    gleanEmailTaskRejectedEvent: 'secondEmailTaskRejected',
    emailSender: 'sendInactiveAccountSecondWarningEmail',
    emailTemplate: 'inactiveAccountSecondWarning',
    timeToDeletion: 7 * aDayInMs,
    taskScheduler: 'scheduleSecondEmail',
  },
  [EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION]: {
    attempt: 'final',
    gleanEmailSkippedEvent: 'finalEmailSkipped',
    gleanEmailTaskRequestEvent: 'finalEmailTaskRequest',
    gleanEmailTaskEnqueuedEvent: 'finalEmailTaskEnqueued',
    gleanEmailTaskRejectedEvent: 'finalEmailTaskRejected',
    emailSender: 'sendInactiveAccountFinalWarningEmail',
    emailTemplate: 'inactiveAccountFinalWarning',
    timeToDeletion: aDayInMs,
    taskScheduler: 'scheduleFinalEmail',
  },
};

export class InactiveAccountsManager {
  fxaDb: DB;
  oauthDb: InactiveStatusOAuthDb;
  accountEventsManager: AccountEventsManager;
  accountTasks: DeleteAccountTasks;
  mailer: any;
  emailCloudTasks: InactiveAccountEmailTasks;
  statsd: StatsD;
  glean: GleanMetricsType;
  log: Logger;

  constructor({
    fxaDb,
    oauthDb,
    mailer,
    config,
    statsd,
    glean,
    log,
  }: {
    fxaDb: DB;
    oauthDb: InactiveStatusOAuthDb;
    mailer: any;
    config: ConfigType;
    statsd: StatsD;
    glean: GleanMetricsType;
    log: Logger;
  }) {
    this.fxaDb = fxaDb;
    this.oauthDb = oauthDb;
    this.accountEventsManager = Container.get(AccountEventsManager);
    this.accountTasks = Container.get(DeleteAccountTasks);
    this.mailer = mailer;
    this.emailCloudTasks = InactiveAccountEmailTasksFactory(config, statsd);
    this.statsd = statsd;
    this.glean = glean;
    this.log = log;
  }

  async isActive(uid: string, activeByDateTimestamp?: number) {
    const activeBy =
      activeByDateTimestamp ??
      (() => {
        const rightAboutNow = new Date();
        const twoYearAgo = rightAboutNow.setFullYear(
          rightAboutNow.getFullYear() - 2
        );
        return twoYearAgo.valueOf();
      })();

    return (
      (await hasActiveSessionToken(
        this.fxaDb.sessions.bind(this.fxaDb),
        uid,
        activeBy
      )) ||
      (await hasActiveRefreshToken(
        this.oauthDb.getRefreshTokensByUid.bind(this.oauthDb),
        uid,
        activeBy
      )) ||
      (await hasAccessToken(
        this.oauthDb.getAccessTokensByUid.bind(this.oauthDb),
        uid
      )) ||
      !!(await securityEventsQuery(uid, activeBy)) ||
      !!(await emailVerificationQuery(uid, activeBy))
    );
  }

  // @TODO the first email is directly scheduled in the script; we should move
  // it here

  async handleNotificationTask(taskPayload: SendEmailTaskPayload) {
    const emailTypeSpecificVals = emailTypeToHandlerVals[taskPayload.emailType];

    // due to the potential delay between when the task was queued and when
    // this handler is executed, it is possible the account is no longer
    // inactive
    if (await this.isActive(taskPayload.uid)) {
      this.statsd.increment(
        `account.inactive.${emailTypeSpecificVals.attempt}-email.skipped.active`
      );
      await this.glean.inactiveAccountDeletion[
        emailTypeSpecificVals.gleanEmailSkippedEvent
      ](requestForGlean, {
        uid: taskPayload.uid,
        reason: 'active_account',
      });
      return;
    }

    const account = await this.fxaDb.account(taskPayload.uid);
    const now = Date.now();

    // If the very first email hard bounced, we'll delete the account without
    // sending further emails.
    if (
      taskPayload.emailType ===
        EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION &&
      (await this.handleFirstEmailBounce(taskPayload, account, now))
    ) {
      return;
    }

    // Check to see if we have sent this email before in the current
    // notify-and-delete cycle
    const sentEmailEvents = await this.accountEventsManager.findEmailEvents(
      taskPayload.uid,
      'emailSent',
      emailTypeSpecificVals.emailTemplate,
      // this is the length of the emails-to-delete cycle; it does not vary
      // with the email type.  no email should be sent more than once in a
      // cycle regardless of the email type.
      // @TODO maybe make this configurable
      now - sixtyDaysInMs,
      now
    );

    if (sentEmailEvents?.length > 0) {
      this.statsd.increment(
        `account.inactive.${emailTypeSpecificVals.attempt}-email.skipped.duplicate`
      );

      await this.glean.inactiveAccountDeletion[
        emailTypeSpecificVals.gleanEmailSkippedEvent
      ](requestForGlean, {
        uid: taskPayload.uid,
        reason: 'already_sent',
      });

      // It's possible that the first email was sent but without the second
      // successfully enqueued. Or it's possible that the second email was sent
      // but without the final successfully enqueued. We'll rely on the event
      // handler logic above to prevent duplicates from being sent.
      await this.scheduleNextEmail(taskPayload);
      return;
    }

    const message = {
      acceptLanguage: account.locale,
      inactiveDeletionEta: now + emailTypeSpecificVals.timeToDeletion,
    };
    await this.mailer[emailTypeSpecificVals.emailSender](
      account.emails,
      account,
      message
    );
    this.statsd.increment(
      `account.inactive.${emailTypeSpecificVals.attempt}-email.sent`
    );

    await this.scheduleNextEmail(taskPayload);

    if (
      taskPayload.emailType === EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION
    ) {
      await this.accountTasks.deleteAccount(
        {
          uid: taskPayload.uid,
          customerId: (await getAccountCustomerByUid(taskPayload.uid))
            ?.stripeCustomerId,
          reason: ReasonForDeletion.InactiveAccountScheduled,
        },
        {
          taskId: `${taskPayload.uid}-inactive-account-delete`,
          scheduleTime: {
            seconds: (now + aDayInMs) / 1000,
          },
        }
      );
      await this.glean.inactiveAccountDeletion.deletionScheduled(
        requestForGlean,
        {
          uid: taskPayload.uid,
        }
      );
      this.statsd.increment('account.inactive.deletion.scheduled');
    }
  }

  async scheduleNextEmail(taskReqPayload: SendEmailTaskPayload) {
    if (
      taskReqPayload.emailType === EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION
    ) {
      // In this case, there are no more emails to schedule.
      return;
    }

    const uid = taskReqPayload.uid;
    const emailTypeSpecificVals =
      emailTypeToHandlerVals[taskReqPayload.emailType];
    const nextEmailTypeSpecificVals =
      emailTypeToHandlerVals[emailTypeSpecificVals.nextEmailType as EmailTypes];

    const taskPayload: SendEmailTaskPayload = {
      uid,
      // we know this is defined because of the early return above
      emailType: emailTypeSpecificVals.nextEmailType as EmailTypes,
    };

    const taskOptions: CloudTaskOptions = {
      taskId: `${uid}-inactive-delete-${nextEmailTypeSpecificVals.attempt}-email`,
    };

    try {
      await this.glean.inactiveAccountDeletion[
        nextEmailTypeSpecificVals.gleanEmailTaskRequestEvent
      ](requestForGlean, {
        uid,
      });

      await this.emailCloudTasks[
        nextEmailTypeSpecificVals.taskScheduler as TaskScheduler
      ]({
        payload: taskPayload,
        taskOptions,
      });

      await this.glean.inactiveAccountDeletion[
        nextEmailTypeSpecificVals.gleanEmailTaskEnqueuedEvent
      ](requestForGlean, {
        uid,
      });
    } catch (cloudTaskQueueError) {
      this.statsd.increment(
        'cloud-tasks.inactive-account-email.enqueue.error-code',
        [cloudTaskQueueError.code as unknown as string]
      );
      await this.glean.inactiveAccountDeletion[
        nextEmailTypeSpecificVals.gleanEmailTaskRejectedEvent
      ](requestForGlean, {
        uid,
      });
      this.log.error('accounts.inactive.emailEnqueueError', {
        cloudTaskQueueError,
        uid,
      });

      if (!isCloudTaskAlreadyExistsError(cloudTaskQueueError)) {
        throw cloudTaskQueueError;
      }
    }
  }

  async handleFirstEmailBounce(taskPayload, account, now) {
    const emails = account.emails.map((e) => e.email);

    const firstEmailBounces = await EmailBounce.query()
      .join('emailTypes', 'emailTypes.id', 'emailBounces.emailTypeId')
      .whereIn('emailBounces.email', emails)
      .where('emailBounces.bounceType', '=', BOUNCE_TYPES.Permanent)
      // some wiggle room to account for cloud task and email delays
      .where('emailBounces.createdAt', '>', now - 54 * aDayInMs)
      .where('emailBounces.createdAt', '<', now - 52 * aDayInMs)
      .where('emailTypes.emailType', '=', 'inactiveAccountFirstWarning')
      .select(['email']);

    if (
      firstEmailBounces.length === emails.length &&
      isEqual(
        firstEmailBounces.map((x) => x.email),
        emails
      )
    ) {
      await this.accountTasks.deleteAccount({
        uid: taskPayload.uid,
        customerId: (await getAccountCustomerByUid(taskPayload.uid))
          ?.stripeCustomerId,
        reason: ReasonForDeletion.InactiveAccountEmailBounced,
      });
      this.statsd.increment(`account.inactive.second-email.skipped.bounce`);
      await this.glean.inactiveAccountDeletion.secondEmailSkipped(
        requestForGlean,
        {
          uid: taskPayload.uid,
          reason: 'first_email_bounced',
        }
      );
      return true;
    }

    return false;
  }
}
