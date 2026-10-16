/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createHash } from 'crypto';
import { ConfigType } from '../../../config';
import { createServerDeletionRequestEvent } from './server_events';
import { version } from '../../../package.json';

export const sha256HashUid = (uid: string) =>
  createHash('sha256').update(uid).digest('hex');

/**
 * Returns a function that submits a Glean `server-deletion-request` ping for
 * an account. Data Warehouse uses these pings to delete the account's
 * telemetry data.
 */
export function createServerDeletionRequestPing(
  config: Pick<ConfigType, 'gleanMetrics'>
): (uid: string) => void {
  if (!config.gleanMetrics?.enabled) {
    return () => {};
  }

  const ping = createServerDeletionRequestEvent({
    applicationId: config.gleanMetrics.applicationId,
    appDisplayVersion: version,
    channel: config.gleanMetrics.channel,
    logger_options: { app: config.gleanMetrics.loggerAppName },
  });

  return (uid: string) =>
    ping.record({
      user_agent: '',
      ip_address: '',
      account_user_id: uid,
      account_user_id_sha256: sha256HashUid(uid),
    });
}
