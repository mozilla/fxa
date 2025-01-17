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
const fiftyThreeDaysInMs = 53 * aDayInMs;
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

  async handleFirstNotificationTask(taskPayload: SendEmailTaskPayload) {
    // due to the potential delay between when the task was queued and when
    // this handler is excuted, it is possible the account is no longer
    // inactive
    if (await this.isActive(taskPayload.uid)) {
      this.statsd.increment('account.inactive.first-email.skipped.active');
      await this.glean.inactiveAccountDeletion.firstEmailSkipped(
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
      'inactiveAccountFirstWarning',
      now - sixtyDaysInMs, // 60 days ago
      now
    );

    if (sentEmailEvents?.length > 0) {
      this.statsd.increment('account.inactive.first-email.skipped.duplicate');
      await this.glean.inactiveAccountDeletion.firstEmailSkipped(
        requestForGlean,
        {
          uid: taskPayload.uid,
          reason: 'already_sent',
        }
      );

      // it's possible that the first email was sent but without the second
      // successfully enqueued.  we'll rely on the handler of the second email
      // to not send a duplicate email
      await this.scheduleSecondEmail(taskPayload.uid);
      return;
    }

    const account = await this.fxaDb.account(taskPayload.uid);
    const message = {
      acceptLanguage: account.locale,
      inactiveDeletionEta: now + sixtyDaysInMs,
    };
    await this.mailer.sendInactiveAccountFirstWarningEmail(
      account.emails,
      account,
      message
    );
    this.statsd.increment('account.inactive.first-email.sent');

    await this.scheduleSecondEmail(taskPayload.uid);
  }

  async scheduleSecondEmail(uid: string) {
    const taskPayload: SendEmailTaskPayload = {
      uid,
      emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
    };
    const taskId = `${uid}-inactive-delete-second-email`;
    const taskOptions: CloudTaskOptions = {
      taskId,
    };

    try {
      await this.glean.inactiveAccountDeletion.secondEmailTaskRequest(
        requestForGlean,
        {
          uid,
        }
      );
      await this.emailCloudTasks.sendEmail({
        payload: taskPayload,
        emailOptions: { deliveryTime: Date.now() + fiftyThreeDaysInMs },
        taskOptions: taskOptions,
      });
      await this.glean.inactiveAccountDeletion.secondEmailTaskEnqueued(
        requestForGlean,
        {
          uid,
        }
      );
    } catch (cloudTaskQueueError) {
      this.statsd.increment('cloud-tasks.send-email.enqueue.error-code', [
        cloudTaskQueueError.code as unknown as string,
      ]);
      await this.glean.inactiveAccountDeletion.secondEmailTaskRejected(
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
}
