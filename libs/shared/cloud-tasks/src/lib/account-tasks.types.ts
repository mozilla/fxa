/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CloudTasksConfig } from './cloud-tasks.types';
import { CloudTaskEmailType } from './inactive-account-email-tasks';

export type FxACloudTaskHeaders = {
  'fxa-cloud-task-delivery-time'?: string;
};

/** Represents config specific for running cloud tasks */
export type DeleteAccountCloudTaskConfig = CloudTasksConfig & {
  cloudTasks: {
    deleteAccounts: {
      taskUrl: string;
      queueName: string;
    };
  };
};

/** Reasons an account can be deleted. */
export enum ReasonForDeletion {
  UserRequested = 'fxa_user_requested_account_delete',
  Unverified = 'fxa_unverified_account_delete',
  Cleanup = 'fxa_cleanup_account_delete',
  InactiveAccountScheduled = 'fxa_inactive_account_scheduled_delete',
  InactiveAccountEmailBounced = 'fxa_inactive_account_email_bounced_delete',
  AdminRequested = 'fxa_admin_requested_account_delete',
}

/** Task payload requesting an account deletion */
export type DeleteAccountTask = {
  /** The account id */
  uid: string;
  /** The customer id, i.e. a stripe customer id if applicable */
  customerId?: string;
  /** Reason for deletion */
  reason: ReasonForDeletion;
};

export type InactiveAccountEmailCloudTaskConfig = CloudTasksConfig & {
  cloudTasks: {
    inactiveAccountEmails: {
      taskUrl: string;
      firstEmailQueueName: string;
      secondEmailQueueName: string;
      thirdEmailQueueName: string;
      firstToSecondEmailIntervalMs: number;
      secondToThirdEmailIntervalMs: number;
    };
  };
};

export type SendEmailTaskPayload = {
  uid: string;
  emailType: CloudTaskEmailType;
};
export type InactiveAccountEmailTaskPayloadParam = Omit<
  SendEmailTaskPayload,
  'emailType'
>;
