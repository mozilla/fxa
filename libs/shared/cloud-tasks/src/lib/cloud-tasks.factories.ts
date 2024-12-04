/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CloudTasksClient } from '@google-cloud/tasks';
import { CloudTasksConfig } from './cloud-tasks.types';
import { credentials } from '@grpc/grpc-js';

/**
 * Produces configuration required for running cloud tasks
 * @param prefix - An optional prefix to target different environment variable sets
 * @returns
 */
export function CloudTasksConvictConfigFactory() {
  return {
    useLocalEmulator: {
      default: false,
      doc: 'Targets a local cloud task emulator instead of a GCP instance.',
      env: `AUTH_CLOUDTASKS_USE_LOCAL_EMULATOR`,
      format: Boolean,
    },
    projectId: {
      default: 'test',
      doc: 'The GCP project id.  Optional when in an environment with Application Default Credentials.',
      env: `AUTH_CLOUDTASKS_PROJECT_ID`,
      format: String,
    },
    locationId: {
      default: 'test',
      doc: 'Google cloud location id, e.g. us-west1',
      env: `AUTH_CLOUDTASKS_LOCATION_ID`,
      format: String,
    },
    credentials: {
      keyFilename: {
        default: '',
        doc: 'Path to service account key.  Optional when in an environment where authentication with services is automatic.',
        env: `AUTH_CLOUDTASKS_KEY_FILE`,
        format: String,
      },
    },
    oidc: {
      aud: {
        default: '',
        doc: 'The audience value of the id token payload.',
        env: `AUTH_CLOUDTASKS_OIDC_AUD`,
        format: String,
      },
      serviceAccountEmail: {
        default: '',
        doc: 'The GCP service account email address.',
        env: `AUTH_CLOUDTASKS_OIDC_EMAIL`,
        format: String,
      },
    },
    deleteAccounts: {
      taskUrl: {
        default: '',
        doc: 'URL that handles deletion tasks',
        env: 'AUTH_CLOUDTASKS_DEL_ACCT_TASK_URL',
        format: String,
      },
      queueName: {
        default: 'delete-accounts-queue',
        doc: 'The name of the queue.  It should match the x-cloudtasks-queuename header value sent to the target.',
        env: `AUTH_CLOUDTASKS_DEL_ACCT_QUEUENAME`,
        format: String,
      },
    },
    sendEmails: {
      taskUrl: {
        default: '',
        doc: 'URL that sends the email',
        env: 'AUTH_CLOUDTASKS_NOTIFICATION_EMAILS_TASK_URL',
        format: String,
      },
      queueName: {
        default: 'notification-emails-queue',
        doc: 'The name of the queue.  It should match the x-cloudtasks-queuename header value sent to the target.',
        env: `AUTH_CLOUDTASKS_NOTIFICATION_EMAILS_QUEUENAME`,
        format: String,
      },
    },
  };
}

/** Produces cloud task client. */
export function CloudTaskClientFactory(config: CloudTasksConfig) {
  // For dev purposes only!
  if (config.cloudTasks.useLocalEmulator) {
    const client = new CloudTasksClient({
      port: 8123,
      servicePath: 'localhost',
      sslCreds: credentials.createInsecure(),
    });

    return client;
  }

  const cloudTasksClient = new CloudTasksClient({
    projectId: config.cloudTasks.projectId,
    keyFilename: config.cloudTasks.credentials.keyFilename ?? undefined,
    fallback: true,
  });

  return cloudTasksClient;
}
