/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { StatsD } from 'hot-shots';

import {
  CloudTaskOptions,
  EmailTypes,
  SendEmailTaskPayload,
  SendEmailTasks,
  SendEmailTasksFactory,
} from '@fxa/shared/cloud-tasks';
import { ConnectedServicesDb } from 'fxa-shared/connected-services';

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

const aDayInMs = 24 * 60 * 60 * 1000;

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

export type NotificationAttempt = 'first' | 'second' | 'final';

export class InactiveAccountsManager {
  fxaDb: DB;
  oauthDb: ConnectedServicesDb;
  accountEventsManager: AccountEventsManager;
  mailer: any;
  emailCloudTasks: SendEmailTasks;
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
    oauthDb: ConnectedServicesDb;
    mailer: any;
    config: ConfigType;
    statsd: StatsD;
    glean: GleanMetricsType;
    log: Logger;
  }) {
    this.fxaDb = fxaDb;
    this.oauthDb = oauthDb;
    this.accountEventsManager = Container.get(AccountEventsManager);
    this.mailer = mailer;
    this.emailCloudTasks = SendEmailTasksFactory(config, statsd);
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

  async handleNotificationTask(
    notificationAttempt: NotificationAttempt,
    taskPayload: SendEmailTaskPayload
  ) {
    // due to the potential delay between when the task was queued and when
    // this handler is executed, it is possible the account is no longer
    // inactive
    if (await this.isActive(taskPayload.uid)) {
      this.statsd.increment(
        `account.inactive.${notificationAttempt}-email.skipped.active`
      );
      await this.resolveGleanEventEmailSkipped(notificationAttempt)(
        requestForGlean,
        {
          uid: taskPayload.uid,
          reason: 'active_account',
        }
      );
      return;
    }

    // Check to see if we have sent this email before in the current
    // notify-and-delete cycle
    const now = Date.now();
    const sentEmailEvents = await this.accountEventsManager.findEmailEvents(
      taskPayload.uid,
      'emailSent',
      this.resolveEmailSentName(notificationAttempt),
      this.resolveStartDate(notificationAttempt, now),
      now
    );

    if (sentEmailEvents?.length > 0) {
      this.statsd.increment(
        `account.inactive.${notificationAttempt}-email.skipped.duplicate`
      );

      await this.resolveGleanEventEmailSkipped(notificationAttempt)(
        requestForGlean,
        {
          uid: taskPayload.uid,
          reason: 'already_sent',
        }
      );

      // It's possible that the first email was sent but without the second
      // successfully enqueued. Or it's possible that the second email was sent
      // but without the final successfully enqueued. We'll rely on the event
      // handler logic above to prevent duplicates from being sent.
      await this.scheduleNextEmail(notificationAttempt, taskPayload.uid);
      return;
    }

    const account = await this.fxaDb.account(taskPayload.uid);
    const message = {
      acceptLanguage: account.locale,
      inactiveDeletionEta: this.resolveInactiveDeletionEta(
        notificationAttempt,
        now
      ),
    };

    await this.resolveSendInactiveAccountWarningEmail(notificationAttempt)(
      account.emails,
      account,
      message
    );
    this.statsd.increment(`account.inactive.${notificationAttempt}-email.sent`);

    await this.scheduleNextEmail(notificationAttempt, taskPayload.uid);
  }

  async scheduleNextEmail(
    notificationAttempt: 'first' | 'second' | 'final',
    uid: string
  ) {
    if (notificationAttempt === 'final') {
      // In this case, there are no more emails to schedule.
      return;
    }

    // Determine the next notification to send out.
    const nextNotificationAttempt =
      this.resolveNextNotificationAttempt(notificationAttempt);

    const taskPayload: SendEmailTaskPayload = {
      uid,
      emailType: this.resolveEmailType(nextNotificationAttempt),
    };

    const taskOptions: CloudTaskOptions = {
      taskId: `${uid}-inactive-delete-${nextNotificationAttempt}-email`,
    };

    try {
      await this.resolveGleanEventEmailTaskRequest(nextNotificationAttempt)(
        requestForGlean,
        {
          uid,
        }
      );

      await this.emailCloudTasks.sendEmail({
        payload: taskPayload,
        emailOptions: {
          deliveryTime: this.resolveDeliveryTime(nextNotificationAttempt),
        },
        taskOptions: taskOptions,
      });

      await this.resolveEmailTaskEnqueued(nextNotificationAttempt)(
        requestForGlean,
        {
          uid,
        }
      );
    } catch (cloudTaskQueueError) {
      this.statsd.increment('cloud-tasks.send-email.enqueue.error-code', [
        cloudTaskQueueError.code as unknown as string,
      ]);
      await this.resolveGleanEventEmailTaskRejected(nextNotificationAttempt)(
        requestForGlean,
        {
          uid,
        }
      );
      this.log.error('accounts.inactive.emailEnqueueError', {
        cloudTaskQueueError,
        uid,
      });

      if (!isCloudTaskAlreadyExistsError(cloudTaskQueueError)) {
        throw cloudTaskQueueError;
      }
    }
  }

  private resolveNextNotificationAttempt(
    notificationAttempt: NotificationAttempt
  ) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return 'second';
        case 'second':
          return 'final';
        case 'final':
          return undefined;
      }
    })();
    if (!result) {
      throw new Error('Could not resolveEmailType for ' + notificationAttempt);
    }
    return result;
  }

  private resolveDeliveryTime(notificationAttempt: NotificationAttempt) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return Date.now();
        case 'second':
          return Date.now() + 53 * aDayInMs;
        case 'final':
          return Date.now() + 6 * aDayInMs;
      }
    })();
    if (!result) {
      throw new Error('Could not resolveEmailType for ' + notificationAttempt);
    }
    return result;
  }

  private resolveEmailSentName(notificationAttempt: NotificationAttempt) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return `inactiveAccountFirstWarning`;
        case 'second':
          return `inactiveAccountSecondWarning`;
        case 'final':
          return `inactiveAccountFinalWarning`;
      }
    })();
    if (!result) {
      throw new Error('Could not resolveEmailType for ' + notificationAttempt);
    }
    return result;
  }

  private resolveEmailType(notificationAttempt: NotificationAttempt) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION;
        case 'second':
          return EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION;
        case 'final':
          return EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION;
      }
    })();
    if (!result) {
      throw new Error('Could not resolveEmailType for ' + notificationAttempt);
    }
    return result;
  }

  private resolveGleanEventEmailSkipped(
    notificationAttempt: NotificationAttempt
  ) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return this.glean.inactiveAccountDeletion.firstEmailSkipped;
        case 'second':
          return this.glean.inactiveAccountDeletion.secondEmailSkipped;
        case 'final':
          return this.glean.inactiveAccountDeletion.finalEmailSkipped;
      }
    })();
    if (!result) {
      throw new Error(
        'Could not resolveGleanEventEmailSkipped for ' + notificationAttempt
      );
    }
    return result;
  }

  private resolveGleanEventEmailTaskRejected(
    notificationAttempt: NotificationAttempt
  ) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return this.glean.inactiveAccountDeletion.firstEmailTaskRejected;
        case 'second':
          return this.glean.inactiveAccountDeletion.secondEmailTaskRejected;
        case 'final':
          return this.glean.inactiveAccountDeletion.finalEmailTaskRejected;
      }
    })();

    if (!result) {
      throw new Error(
        'Could not resolveEmailTaskRejected for ' + notificationAttempt
      );
    }
    return result;
  }

  private resolveGleanEventEmailTaskRequest(
    notificationAttempt: NotificationAttempt
  ) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return this.glean.inactiveAccountDeletion.firstEmailTaskRequest;
        case 'second':
          return this.glean.inactiveAccountDeletion.secondEmailTaskRequest;
        case 'final':
          return this.glean.inactiveAccountDeletion.finalEmailTaskRequest;
      }
    })();
    if (!result) {
      throw new Error(
        'Could not resolveGleanEventEmailTaskRequest for ' + notificationAttempt
      );
    }
    return result;
  }

  private resolveInactiveDeletionEta(
    notificationAttempt: NotificationAttempt,
    now: number
  ) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return now + 60 * aDayInMs;
        case 'second':
          return now + 7 * aDayInMs;
        case 'final':
          return now + aDayInMs;
      }
    })();
    if (!result) {
      throw new Error(
        'Could not resolveInactiveDeletionEta for ' + notificationAttempt
      );
    }
    return result;
  }

  private resolveSendInactiveAccountWarningEmail(
    notificationAttempt: NotificationAttempt
  ) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return this.mailer.sendInactiveAccountFirstWarningEmail;
        case 'second':
          return this.mailer.sendInactiveAccountSecondWarningEmail;
        case 'final':
          return this.mailer.sendInactiveAccountFinalWarningEmail;
      }
    })();
    if (!result) {
      throw new Error(
        'Could not resolveSendInactiveAccountWarningEmail for ' +
          notificationAttempt
      );
    }
    return result;
  }

  private resolveStartDate(
    notificationAttempt: NotificationAttempt,
    now: number
  ) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return now - 53 * aDayInMs;
        case 'second':
          return now - 6 * aDayInMs;
        case 'final':
          return now - aDayInMs;
      }
    })();

    if (!result) {
      throw new Error('Could not resolveStartDate for ' + notificationAttempt);
    }
    return result;
  }

  private resolveEmailTaskEnqueued(notificationAttempt: NotificationAttempt) {
    const result = (() => {
      switch (notificationAttempt) {
        case 'first':
          return this.glean.inactiveAccountDeletion.firstEmailTaskEnqueued;
        case 'second':
          return this.glean.inactiveAccountDeletion.secondEmailTaskEnqueued;
        case 'final':
          return this.glean.inactiveAccountDeletion.finalEmailTaskEnqueued;
      }
    })();

    if (!result) {
      throw new Error(
        'Could not resolveEmailTaskEnqueued for ' + notificationAttempt
      );
    }
    return result;
  }
}
